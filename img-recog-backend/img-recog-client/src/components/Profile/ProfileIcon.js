import React from "react";
import "./Profile.css";

import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

class ProfileIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
    };
  }

  toggle = () =>
    this.setState((state) => ({ dropdownOpen: !state.dropdownOpen }));

  render() {
    const { dropdownOpen } = this.state;
    return (
      <Dropdown
        isOpen={dropdownOpen}
        toggle={this.toggle}
        className="pa3 dropdown"
        style={{ position: "fixed" }}
      >
        <DropdownToggle
          tag="span"
          data-toggle="dropdown"
          aria-expanded={dropdownOpen}
          className="pointer"
        >
          <img src="avatar.png" className="br-100 h3 w3 dib" alt="avatar" />
        </DropdownToggle>
        <DropdownMenu
          className={`shadow-5 mt4 overflow-hidden ${
            dropdownOpen ? "w-auto" : "w-0"
          }`}
          style={{ backgroundColor: "rgba(255,255,255,0.75)" }}
          right
        >
          <DropdownItem onClick={() => this.props.onRouteChange("home")}>
            Home
          </DropdownItem>
          <DropdownItem onClick={() => this.props.toggleModal()}>
            Profile
          </DropdownItem>
          <DropdownItem onClick={() => this.props.onRouteChange("signout")}>
            Sign out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default ProfileIcon;
