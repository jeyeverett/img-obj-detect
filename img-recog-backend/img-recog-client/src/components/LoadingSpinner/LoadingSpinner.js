import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = (props) => {
  return (
    <div className="spinner-container">
      <div id="loading"></div>
    </div>
  );
};

export default LoadingSpinner;
