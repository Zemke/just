import * as React from "react";
import Auth from './auth';
import DataStore from "./dataStore";

export default class SignInComponent extends React.Component {

  state = {email: '', isSignInLink: false};

  onSubmit = e => {
    e.preventDefault();
    // todo show confirmation
    Auth
      .sendMail(this.state.email)
      .then(() => DataStore.saveSignInEmail(this.state.email))
      .catch(alert);
  };

  render() {
    if (this.state.isSignInLink) {
      return <p>You are being signed in.</p>;
    }
    return (
      <form onSubmit={e => this.onSubmit(e)}>
        <input
          value={this.state.email}
          onChange={e => this.setState({email: e.target.value})}/>
        <button type="submit">Sign In</button>
      </form>
    );
  }

  componentDidMount() {
    Auth.current()
      .then(console.log)
      .catch(() => console.log("no auth"));

    if (Auth.isSignInLink(window.location.href)) {
      this.setState({isSignInLink: true});

      Auth
        .signIn(DataStore.getSignInEmail())
        .then(result => {
          console.log(result);
          debugger;
          DataStore.removeSignInEmail();
        })
        .catch(alert);
    }
  }
}