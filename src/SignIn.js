import React, {useEffect, useState} from "react";
import Auth from './auth';
import DataStore from "./dataStore";

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

  if (signedIn) {
    return <p>You are signed in with {signedIn.email}.</p>;
  } else if (isSignInLink) {
    return <p>You are being signed in.</p>;
  } else if (emailSent) {
    return <p>You have been sent an email.</p>;
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}/>
      <button type="submit">Sign In</button>
    </form>
  );
}