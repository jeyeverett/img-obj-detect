import React from 'react';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

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
      <Dropdown isOpen={dropdownOpen} toggle={this.toggle} className="pa3">
        <DropdownToggle
          tag="span"
          data-toggle="dropdown"
          aria-expanded={dropdownOpen}
          className="pointer"
        >
          <img
            src="http://tachyons.io/img/logo.jpg"
            className="br-100 ba h3 w3 dib"
            alt="avatar"
          />
        </DropdownToggle>
        <DropdownMenu
          className="b--transparent shadow-5 mt4"
          style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
          right
        >
          <DropdownItem onClick={() => this.props.toggleModal()}>
            View profile
          </DropdownItem>
          <DropdownItem onClick={() => this.props.onRouteChange('signout')}>
            Sign out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default ProfileIcon;
