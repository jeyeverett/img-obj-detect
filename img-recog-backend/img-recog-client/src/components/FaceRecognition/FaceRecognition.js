import React, { useRef, useState } from "react";
import { detectObjects } from "../../lib/tensorflow";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

const FaceRecognition = ({ imageURL }) => {
  const [loading, setLoading] = useState(false);
  const [imageHeight, setHeight] = useState(null);
  const [imageWidth, setWidth] = useState(null);
  const imgContainer = useRef();
  const canvas = useRef();

  const onImageLoad = async () => {
    const { height, width } = imgContainer.current;

    const ctx = canvas.current.getContext("2d");
    canvas.current.width = width;
    canvas.current.height = height;

    setWidth(width);
    setHeight(height);

    setLoading(true);
    const result = await detectObjects(imgContainer.current, ctx);
    setLoading(false);
  };

  return (
    <div className="center ma mb2 mb4-ns">
      <div className="relative">
        {loading && (
          <LoadingSpinner imageHeight={imageHeight} imageWidth={imageWidth} />
        )}
        <img
          id="inputImage"
          className="vh-50 w-auto"
          src={imageURL}
          ref={imgContainer}
          crossOrigin="anonymous"
          onLoad={onImageLoad}
        />
        <canvas
          id="detection"
          style={{ position: "absolute", left: 0 }}
          ref={canvas}
        />
      </div>
    </div>
  );
};
export default FaceRecognition;
