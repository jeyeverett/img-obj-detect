import React from "react";

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      name: "",
    };
  }
  onNameChange = (event) => {
    this.setState({ name: event.target.value });
  };
  onEmailChange = (event) => {
    this.setState({ email: event.target.value });
  };
  onPasswordChange = (event) => {
    this.setState({ password: event.target.value });
  };
  onSubmitReg = (event) => {
    event.preventDefault();
    const { name, email, password } = this.state;
    if (!name || !email || !password) {
      return;
    }
    fetch(`${process.env.REACT_APP_HOSTNAME}/register`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          window.sessionStorage.setItem("token", data.userData.token);
          this.props.loadUser({
            user: data.userData.user,
            leaderboard: data.leaderboard,
          });
          this.props.onRouteChange("home");
        } else {
          this.props.loadUser({
            user: null,
            leaderboard: null,
            error: data,
          });
        }
      })
      .catch((err) => console.log(err));
  };
  render() {
    return (
      <article className="br2 ba b--black-20 mv4 w-100 w-50-m w-25-l mw6 center shadow-5">
        <main className="pa4 black-80">
          <div className="measure">
            {this.props.serverError && <p>{this.props.serverError}</p>}
            <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
              <legend className="f3 fw6 ph0 mh0">Register</legend>
              <div className="mt3">
                <label className="db fw6 lh-copy f6 tl" htmlFor="email-address">
                  Name
                </label>
                <input
                  className="pa2 input-reset ba bg-transparent w-100"
                  type="text"
                  name="name"
                  id="name"
                  onChange={this.onNameChange}
                />
              </div>
              <div className="mt3">
                <label className="db fw6 lh-copy f6 tl" htmlFor="email-address">
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
                <label className="db fw6 lh-copy f6 tl" htmlFor="password">
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
                onClick={this.onSubmitReg}
                className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                type="submit"
                value="Register"
              />
            </div>
            <div className="lh-copy mt3">
              <p
                href="#0"
                className="f6 link dim black db pointer"
                onClick={() => this.props.onRouteChange("signin")}
              >
                Sign in
              </p>
            </div>
          </div>
        </main>
      </article>
    );
  }
}
export default Register;
