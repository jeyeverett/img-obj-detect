import React, { Component } from "react";
import { initialState } from "./initialState";
import "./App.css";

import Navigation from "./components/Navigation/Navigation";
import SignIn from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";
import ImageLoader from "./components/ImageLoader/ImageLoader";
import Rank from "./components/Rank/Rank";
import Leaderboard from "./components/Leaderboard/Leaderboard";
import Detector from "./components/Detector/Detector";
import Modal from "./components/Modal/Modal";
import Profile from "./components/Profile/Profile";
import { Button, ButtonGroup } from "reactstrap";

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  async componentDidMount() {
    const token = window.sessionStorage.getItem("token");

    if (token) {
      this.setState({ isLoading: true });
      try {
        const signInRes = await fetch(
          `${process.env.REACT_APP_HOSTNAME}/signin`,
          {
            method: "post",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await signInRes.json();

        if (data && data.id) {
          const profileRes = await fetch(
            `${process.env.REACT_APP_HOSTNAME}/profile/${data.id}`,
            {
              method: "get",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );

          const { user, leaderboard, error } = await profileRes.json();

          if (user && user.email) {
            this.loadUser({ user, leaderboard, error });
            this.onRouteChange("home");
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  loadUser = ({ user, leaderboard, error }) => {
    if (!user) {
      this.setState({ serverError: error });
      return;
    }

    this.setState((state) => ({
      leaderboard: leaderboard || state.leaderboard,
      serverError: error ? error : "",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        entries: user.entries,
        joined: user.joined,
        bio: user.bio,
      },
      isLoading: false,
    }));
  };

  onInputChange = ({ target }) => {
    if (this.state.fileUpload && target.files.length) {
      const uploadedImageUrl = URL.createObjectURL(target.files[0]);
      this.setState({ input: uploadedImageUrl });
    } else if (target.value.length > 20) {
      this.isValidUrl(target.value).then((res) => {
        if (res) {
          this.setState({ input: target.value });
          this.setState({ urlError: false });
        } else {
          this.setState({ urlError: true });
        }
      });
    }
  };

  isValidUrl = async (url) => {
    try {
      const res = await fetch(url);
      const buff = await res.blob();
      return buff.type.startsWith("image/");
    } catch (err) {
      return false;
    }
  };

  toggleInput = ({ target }) => {
    if (target.name === "file") {
      this.setState({ fileUpload: true });
    } else {
      this.setState({ fileUpload: false });
    }
  };

  setDetectionResults = (results) => {
    this.setState({ detectionResults: results });
    this.onDetectionResults(results);
  };

  onDetectImage = (event) => {
    this.setState({ imageURL: this.state.input });
  };

  onDetectionResults = async (results) => {
    const token = window.sessionStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.REACT_APP_HOSTNAME}/image`, {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          id: this.state.user.id,
          results,
        }),
      });

      const { entries, leaderboard, error } = await res.json();

      if (error) {
        this.setState({ serverError: error });
        return;
      }

      this.setState(Object.assign(this.state.user, { entries }));
      this.setState({ leaderboard });
    } catch (err) {
      console.log(err);
    }
  };

  onRouteChange = (route) => {
    this.setState({ serverError: "" });
    const token = window.sessionStorage.getItem("token");
    if (route === "signout") {
      fetch(`${process.env.REACT_APP_HOSTNAME}/signout`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          id: this.state.user.id,
        }),
      })
        .then(() => {
          this.setState(initialState);
          window.sessionStorage.removeItem("token");
        })
        .catch((err) => console.log("Error signing out"));
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  toggleModal = () => {
    this.setState((state) => ({
      ...state,
      isProfileOpen: !state.isProfileOpen,
    }));
  };

  render() {
    const {
      isSignedIn,
      imageURL,
      urlError,
      faceBoxes,
      route,
      isProfileOpen,
      user,
      isLoading,
      serverError,
      leaderboard,
    } = this.state;

    return (
      <>
        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}
          toggleModal={this.toggleModal}
          isLoading={isLoading}
        />
        <div className="App w-80 w-60-ns center mb4 mt5 mt6-ns">
          {isProfileOpen && (
            <Modal>
              <Profile
                isProfileOpen={isProfileOpen}
                toggleModal={this.toggleModal}
                user={user}
                loadUser={this.loadUser}
              />
            </Modal>
          )}
          {route === "home" ? (
            <div className="w-min">
              <Rank
                name={this.state.user.name}
                entries={this.state.user.entries}
              />
              {imageURL && (
                <Detector
                  imageURL={imageURL}
                  faceBoxes={faceBoxes}
                  setDetectionResults={this.setDetectionResults}
                />
              )}
              {urlError && (
                <div className="mb2 dark-red">
                  Invalid URL - try a different one!
                </div>
              )}
              {serverError && <div className="mb2 dark-red">{serverError}</div>}
              <ImageLoader
                onInputChange={this.onInputChange}
                onDetectImage={this.onDetectImage}
                fileUpload={this.state.fileUpload}
              />
              <ButtonGroup className="mt3">
                <Button
                  color="secondary"
                  className="mr1"
                  name="url"
                  onClick={this.toggleInput}
                  active={!this.state.fileUpload}
                >
                  URL
                </Button>
                <Button
                  color="secondary"
                  name="file"
                  active={this.state.fileUpload}
                  onClick={this.toggleInput}
                >
                  File
                </Button>
              </ButtonGroup>
              <Leaderboard leaderboard={leaderboard} />
            </div>
          ) : route === "signin" ? (
            <SignIn
              onRouteChange={this.onRouteChange}
              loadUser={this.loadUser}
              isLoading={isLoading}
              serverError={serverError}
            />
          ) : (
            <Register
              onRouteChange={this.onRouteChange}
              loadUser={this.loadUser}
              serverError={serverError}
            />
          )}
        </div>
      </>
    );
  }
}

export default App;
