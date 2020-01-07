import React, {useEffect, useState} from "react";
import Auth from './auth';
import DataStore from "./dataStore";
import './translucent.css';

export default function SignInComponent(props) {

  const [email, setEmail] = useState('');
  const [isSignInLink, setIsSignInLink] = useState(false);
  const [signedIn, setSignedIn] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    Auth
      .current()
      .then(user => {
          if (user) {
            setSignedIn(user);
            window.history.pushState(null, null, '/');
          } else if (Auth.isSignInLink(window.location.href)) {
            setIsSignInLink(true);
            Auth
              .signIn(DataStore.getSignInEmail())
              .then(result => {
                DataStore.removeSignInEmail();
                window.history.pushState(null, null, '/');
                setSignedIn(result.user);
                setIsSignInLink(false);
                props.signedIn(result.user);
              });
          } else {
            window.history.pushState(null, null, '/');
          }
        }
      );
  });

  const onSubmit = e => {
    e.preventDefault();
    Auth
      .sendMail(email)
      .then(() => {
        DataStore.saveSignInEmail(email);
        setEmailSent(true);
      });
  };

  let info = null;
  if (signedIn) {
    info = <p>You are signed in with {signedIn.email}.</p>;
  } else if (isSignInLink) {
    info = <p>You are being signed in.</p>;
  } else if (emailSent) {
    info = <p>You have been sent an email.</p>;
  }


  return (
    <div className="translucent translucent-center text-center">
      <div>
        <h1>Just</h1>

        {info === null ? (
          <form onSubmit={onSubmit}>
            <label>Sign in with only your email address</label>
            <div>
              <input
                type="email"
                value={email}
                className="form-control text-center w-60"
                onChange={e => setEmail(e.target.value)}/>
            </div>
            <button type="submit" className="form-control">Sign In</button>
          </form>
        ) : info}
      </div>
    </div>
  );
}