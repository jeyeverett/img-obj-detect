import React, { Component } from "react";
import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import SignIn from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";
import ImageLoader from "./components/ImageLoader/ImageLoader";
import Rank from "./components/Rank/Rank";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Modal from "./components/Modal/Modal";
import Profile from "./components/Profile/Profile";
import { Button, ButtonGroup } from "reactstrap";

const initialState = {
  input: "",
  imageURL: "",
  urlError: false,
  fileUpload: false,
  route: "signin",
  isSignedIn: false,
  isProfileOpen: false,
  isLoading: false,
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: "",
    bio: "",
  },
};
class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }
  componentDidMount() {
    const token = window.sessionStorage.getItem("token");
    if (token) {
      this.setState({ isLoading: true });
      fetch(`${process.env.REACT_APP_HOSTNAME}/signin`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.id) {
            return fetch(
              `${process.env.REACT_APP_HOSTNAME}/profile/${data.id}`,
              {
                method: "get",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + token,
                },
              }
            );
          }
        })
        .then((res) => res.json())
        .then((user) => {
          if (user && user.email) {
            this.loadUser(user);
            this.onRouteChange("home");
          }
        })
        .catch((err) => console.log(err));
    }
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
        bio: data.bio,
      },
      isLoading: false,
    });
  };

  onInputChange = async ({ target }) => {
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
      return;
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

  onDetectImage = (event) => {
    this.setState({ imageURL: this.state.input });
    return;

    const token = window.sessionStorage.getItem("token");
    fetch(`${process.env.REACT_APP_HOSTNAME}/imageurl`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        input: this.state.input,
        id: this.state.user.id,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res) {
          //If there is a response increment the entries field on the backend
          fetch(`${process.env.REACT_APP_HOSTNAME}/image`, {
            method: "put",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify({
              id: this.state.user.id,
            }),
          })
            .then((res) => res.json())
            .then((count) => {
              this.setState(Object.assign(this.state.user, { entries: count }));
            })
            .catch((err) => console.log(err));
          this.processFaceDetection(res.outputs[0].data.regions);
        }
      })
      .catch((err) => console.log("Face detection error."));
  };

  onRouteChange = (route) => {
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
    } = this.state;

    return (
      <div className="App">
        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}
          toggleModal={this.toggleModal}
          isLoading={isLoading}
        />
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
              <FaceRecognition imageURL={imageURL} faceBoxes={faceBoxes} />
            )}
            {urlError && (
              <div className="mb2 dark-red">
                Invalid URL - try a different one!
              </div>
            )}
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
          </div>
        ) : route === "signin" ? (
          <SignIn
            onRouteChange={this.onRouteChange}
            loadUser={this.loadUser}
            isLoading={isLoading}
          />
        ) : (
          <Register
            onRouteChange={this.onRouteChange}
            loadUser={this.loadUser}
          />
        )}
      </div>
    );
  }
}

export default App;
