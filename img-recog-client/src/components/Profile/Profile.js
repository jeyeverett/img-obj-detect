import React from 'react';
import './Profile.css';
class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.user.name,
      bio: this.props.user.bio,
    };
  }

  onNameChange = (event) => {
    this.setState({ name: event.target.value });
  };

  onBioChange = (event) => {
    this.setState({ bio: event.target.value });
  };

  updateUser = (data) => {
    fetch(`http://localhost:8080/profile/${this.props.user.id}`, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + window.sessionStorage.getItem('token'),
      },
      body: JSON.stringify({
        name: data.name,
        bio: data.bio,
      }),
    })
      .then((res) => res.json())
      .then((user) => {
        if (user.id) {
          this.props.loadUser(user);
          this.props.toggleModal();
        }
      })
      .catch((err) => console.log(err));
  };

  render() {
    const { toggleModal, user } = this.props;
    return (
      <div className="profile-modal">
        <article className="br2 ba b--black-20 mv4 w-100 w-50-m w-25-l mw6 center bg-light shadow-5 h-5">
          <main className="pa4 black-80 w-80 relative">
            <button className="exit-profile f2" onClick={toggleModal}>
              &times;
            </button>
            <div className="tc">
              <img
                src="http://tachyons.io/img/logo.jpg"
                className="br-100 h3 w3 dib mr3"
                alt="avatar"
              />
              <h1 className="f2 mv0 mt1 dib">{this.state.name}</h1>
              <h4 className="f4 mt4">Images submitted: {user.entries}</h4>
              <p className="f6">
                Member since: {new Date(user.joined).toLocaleDateString()}
              </p>
            </div>
            <hr />
            <label className="mt2 fw6" htmlFor="username">
              Name
            </label>
            <input
              className="pa2 ba w-100 f6"
              type="text"
              name="username"
              id="name"
              maxLength="15"
              style={{ outline: 'none' }}
              value={this.state.name}
              onChange={this.onNameChange}
            />
            <label className="mt2 fw6" htmlFor="bio">
              Bio
            </label>
            <textarea
              className="pa2 ba w-100 h4 f6 style-4"
              type="text"
              name="bio"
              id="bio"
              value={this.state.bio || 'Write your bio here...'}
              style={{ outline: 'none', resize: 'none' }}
              onChange={(event) => this.onBioChange(event)}
            />
            <div className="flex justify-center">
              <button
                className="br2 b--dark ph3 pv1 fw6 shadow-5 grow"
                style={{
                  backgroundColor: 'rgba(255,255,255,.5)',
                }}
                onClick={() => this.updateUser({ ...this.state })}
              >
                Save
              </button>
            </div>
          </main>
        </article>
      </div>
    );
  }
}

export default Profile;
