import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = ({ imageHeight, imageWidth }) => {
  return (
    <div
      className="spinner-container"
      style={{
        height: imageHeight || "80vh",
        width: imageWidth || "100%",
        position: imageHeight ? "absolute" : "static",
        backgroundColor: imageHeight ? "rgba(0, 0, 0, 0.25)" : "transparent",
      }}
    >
      <div id="loading"></div>
    </div>
  );
};

export default LoadingSpinner;
