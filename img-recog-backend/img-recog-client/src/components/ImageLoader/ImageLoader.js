import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import { InputGroup, Input, Button } from "reactstrap";

const ImageLoader = ({ onInputChange, onDetectImage, fileUpload }) => {
  return (
    <div className="flex justify-center">
      <InputGroup className="w-80 w-60-ns">
        <Input
          placeholder="Enter a valid image URL"
          onChange={onInputChange}
          type={fileUpload ? "file" : "text"}
          className="form-control"
          accept={fileUpload ? "image/png, image/gif, image/jpeg" : ""}
        />
        <Button onClick={onDetectImage}>Detect!</Button>
      </InputGroup>
    </div>
  );
};
export default ImageLoader;
