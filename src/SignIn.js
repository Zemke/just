import * as React from "react";
import Auth from './auth';
import DataStore from "./dataStore";

export default class SignInComponent extends React.Component {

  state = {email: '', isSignInLink: false, signedIn: null, emailSent: false};

  onSubmit = e => {
    e.preventDefault();
    Auth
      .sendMail(this.state.email)
      .then(()=> {
        DataStore.saveSignInEmail(this.state.email);
        this.setState({emailSent: true});
      });
  };

  render() {
    if (this.state.signedIn) {
      return <p>You are signed in with {this.state.signedIn.email}.</p>;
    } else if (this.state.isSignInLink) {
      return <p>You are being signed in.</p>;
    } else if (this.state.emailSent) {
      return <p>You have been sent an email.</p>;
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
    Auth
      .current()
      .then(user => {
        if (user) {
          console.log(user);
          this.setState({signedIn: user});
          window.history.pushState(null, null, '/');
        } else if (Auth.isSignInLink(window.location.href)) {
          this.setState({isSignInLink: true});
          Auth
            .signIn(DataStore.getSignInEmail())
            .then(result => {
              DataStore.removeSignInEmail();
              window.history.pushState(null, null, '/');
              this.setState({signedIn: result.user, isSignInLink: false});
              this.props.signedIn(result.user);
            });
        } else {
          window.history.pushState(null, null, '/');
        }}
      );
  }
}