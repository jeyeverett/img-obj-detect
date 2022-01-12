import React from 'react';

import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      signInEmail: '',
      signInPassword: '',
    };
  }

  onEmailChange = (event) => {
    this.setState({ signInEmail: event.target.value });
  };
  onPasswordChange = (event) => {
    this.setState({ signInPassword: event.target.value });
  };

  onSubmitSignIn = () => {
    const { signInEmail, signInPassword } = this.state;
    if (!signInEmail || !signInPassword) {
      return;
    }
    fetch('http://localhost:8080/signin', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: this.state.signInEmail,
        password: this.state.signInPassword,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.userId && data.success === 'true') {
          window.sessionStorage.setItem('token', data.token);
          return fetch(`http://localhost:8080/profile/${data.userId}`, {
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + data.token,
            },
          });
        }
      })
      .then((res) => res.json())
      .then((user) => {
        if (user && user.email) {
          this.props.loadUser(user);
          this.props.onRouteChange('home');
        }
      })
      .catch((err) => console.log('Invalid username or password.'));
  };
  render() {
    const { onRouteChange, isLoading } = this.props;
    return isLoading ? (
      <LoadingSpinner />
    ) : (
      <article className="br2 ba b--black-20 mv4 w-100 w-50-m w-25-l mw6 center shadow-5">
        <main className="pa4 black-80">
          <div className="measure">
            <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
              <legend className="f3 fw6 ph0 mh0">Sign In</legend>
              <div className="mt3">
                <label className="db fw6 lh-copy f6" htmlFor="email-address">
                  Email
                </label>
                <input
                  className="pa2 input-reset ba bg-transparent w-100"
                  type="email"
                  name="email-address"
                  id="email-address"
                  onChange={this.onEmailChange}
                />
              </div>
              <div className="mv3">
                <label className="db fw6 lh-copy f6" htmlFor="password">
                  Password
                </label>
                <input
                  className="b pa2 input-reset ba bg-transparent w-100"
                  type="password"
                  name="password"
                  id="password"
                  onChange={this.onPasswordChange}
                />
              </div>
            </fieldset>
            <div className="">
              <input
                onClick={this.onSubmitSignIn}
                className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                type="submit"
                value="Sign in"
              />
            </div>
            <div className="lh-copy mt3">
              <p
                href="#0"
                className="f6 link dim black db pointer"
                onClick={() => onRouteChange('register')}
              >
                Register
              </p>
            </div>
          </div>
        </main>
      </article>
    );
  }
}
export default SignIn;
