import React, { Component } from "react";
import "./App.css";

import Navigation from "./components/Navigation/Navigation";
import SignIn from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Modal from "./components/Modal/Modal";
import Profile from "./components/Profile/Profile";

const initialState = {
  input: "",
  imageURL: "",
  faceBoxes: [],
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
    console.log(token);
    if (token) {
      this.setState({ isLoading: true });
      fetch("http://localhost:8080/signin", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.id) {
            return fetch(`http://localhost:8080/profile/${data.id}`, {
              method: "get",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            });
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

  processFaceDetection = (boxRegions) => {
    for (let region of boxRegions) {
      const { bounding_box } = region.region_info;
      this.displayFaceBox(this.calcFaceBox(bounding_box));
    }
  };

  displayFaceBox = (calcBox) => {
    this.setState((state, props) => ({
      faceBoxes: [...state.faceBoxes, { ...calcBox }],
    }));
  };
  // {bottom_row, left_col, right_col, top_row}
  calcFaceBox = ({ bottom_row, left_col, right_col, top_row }) => {
    const image = document.getElementById("inputImage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      topRow: top_row * height,
      rightCol: width - right_col * width,
      bottomRow: height - bottom_row * height,
      leftCol: left_col * width,
    };
  };

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  onDetectImage = () => {
    this.setState({ imageURL: this.state.input, faceBoxes: [] });
    const token = window.sessionStorage.getItem("token");
    //Note that below we use this.state.input instead of this.state.imageURL because setState is asynchronous and therefore there is a delay when updating state (input was updated in a separate function so it is ok)
    fetch("http://localhost:8080/imageurl", {
      //send the image url to the backend for API processing
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
          fetch("http://localhost:8080/image", {
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
              //If backend successfully updates, increment the entries field on the front end
              //Below we use 'Object.assign' to update just the entries field of the user (if we just did { user: { entries: count }} we would overwrite the entire object
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
      fetch("http://localhost:8080/signout", {
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
          <div>
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />
            <FaceRecognition imageURL={imageURL} faceBoxes={faceBoxes} />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onDetectImage={this.onDetectImage}
            />
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
