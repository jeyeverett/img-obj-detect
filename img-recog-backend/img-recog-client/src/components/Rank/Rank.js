import React from "react";
import { Card, CardBody, CardTitle } from "reactstrap";

const Rank = ({ entries, name }) => {
  return (
    <div>
      <Card
        className="mb4"
        style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
      >
        <CardBody>
          <CardTitle
            className="f4 f3-ns b"
            tag="h3"
          >{`${name}, you've detected ${entries} different objects!`}</CardTitle>
        </CardBody>
      </Card>
    </div>
  );
};
export default React.memo(
  Rank,
  (prevProps, nextProps) => prevProps.entries === nextProps.entries
);
