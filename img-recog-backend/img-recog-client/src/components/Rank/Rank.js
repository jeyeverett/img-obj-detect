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
            className="f4 f3-ns b mb0"
            tag="h3"
          >{`${name}, you've detected ${entries} ${
            entries > 1 ? "different" : ""
          } object${entries !== 1 ? "s" : ""}!`}</CardTitle>
        </CardBody>
      </Card>
    </div>
  );
};
export default React.memo(
  Rank,
  (prevProps, nextProps) => prevProps.entries === nextProps.entries
);
