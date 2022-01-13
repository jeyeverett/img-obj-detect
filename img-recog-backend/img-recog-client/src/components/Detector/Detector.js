import React, { useRef, useState } from "react";
import { detectObjects } from "../../lib/tensorflow";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import styles from "./Detector.module.css";

const Detector = ({ imageURL, setDetectionResults }) => {
  const [loading, setLoading] = useState(false);
  const [imageHeight, setHeight] = useState(null);
  const [imageWidth, setWidth] = useState(null);
  const [detectionError, setDetectionError] = useState(false);
  const imgContainer = useRef();
  const canvas = useRef();

  const onImageLoad = async () => {
    setDetectionError(false);

    const { height, width } = imgContainer.current;

    const ctx = canvas.current.getContext("2d");
    canvas.current.width = width;
    canvas.current.height = height;

    setWidth(width);
    setHeight(height);

    setLoading(true);
    const results = await detectObjects(imgContainer.current, ctx);
    setLoading(false);

    if (!Object.keys(results).length) {
      setDetectionError(true);
    } else {
      setDetectionResults(results);
    }
  };

  return (
    <div className="center ma mb2 mb4-ns">
      <div className="relative">
        {loading && (
          <LoadingSpinner imageHeight={imageHeight} imageWidth={imageWidth} />
        )}
        {detectionError && (
          <div
            className={styles.detectionError}
            style={{
              height: imageHeight,
              width: imageWidth,
            }}
          >
            <span>Failed to detect objects</span>
            <span>Please try a different image</span>
          </div>
        )}
        <img
          className="vh-25 vh-50-l w-auto"
          src={imageURL}
          ref={imgContainer}
          crossOrigin="anonymous"
          onLoad={onImageLoad}
        />
        <canvas className="absolute left-0" ref={canvas} />
      </div>
    </div>
  );
};
export default Detector;
