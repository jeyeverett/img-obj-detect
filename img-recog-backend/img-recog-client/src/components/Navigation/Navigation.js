import React from "react";

import ProfileIcon from "../Profile/ProfileIcon";

const Navigation = ({ onRouteChange, isSignedIn, toggleModal, isLoading }) => {
  if (isSignedIn) {
    return (
      <nav
        className="pt3"
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        <ProfileIcon onRouteChange={onRouteChange} toggleModal={toggleModal} />
      </nav>
    );
  } else {
    return isLoading ? (
      ""
    ) : (
      <nav
        className="pt3"
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <p
          onClick={() => onRouteChange("signin")}
          className="f4 link dim grey ph4 pointer"
        >
          Sign In
        </p>
        <p
          onClick={() => onRouteChange("register")}
          className="f4 link dim grey pr4 pointer"
        >
          Register
        </p>
      </nav>
    );
  }
};

export default Navigation;
