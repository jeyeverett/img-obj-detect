import React from "react";

class Rank extends React.Component {
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.entries === this.props.entries) {
      return;
    } else {
      this.getEmoji(this.props.entries);
    }
  }

  render() {
    return (
      <div>
        <div className="white f3-ns">
          {`${this.props.name}, your current entry count is...`}
        </div>
        <div className="white f3 f1-ns">
          {typeof this.props.entries === "string"
            ? `${this.props.entries}  `
            : ""}
        </div>
      </div>
    );
  }
}
export default Rank;
