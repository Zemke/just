import React, {useEffect, useState} from "react";
import Auth from '../util/auth';
import DataStore from "../util/dataStore";
import '../util/translucent.css';

export default function SignInComponent(props) {

  const [email, setEmail] = useState('');
  const [isSignInLink, setIsSignInLink] = useState(false);
  const [signedIn, setSignedIn] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  const [safariSignInLink, setSafariSignInLink] = useState('');
  const [safariEmail, setSafariEmail] = useState('');
  const [isMobileSafariStandalone] = useState(() => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isStandalone = (window.matchMedia('(display-mode: standalone)').matches);
    return isSafari && isStandalone;
  });

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
    setEmailSending(true);
    e.preventDefault();
    Auth
      .sendMail(email)
      .then(() => {
        DataStore.saveSignInEmail(email);
        setEmailSent(true);
        setEmailSending(false);
      });
  };

  const onSafariSubmit = e => {
    e.preventDefault();
    Auth
      .safariSignIn(safariEmail, safariSignInLink)
      .then(result => {
        window.history.pushState(null, null, '/');
        setSignedIn(result.user);
        setIsSignInLink(false);
        props.signedIn(result.user);
      });
  };

  let info = null;
  if (signedIn) {
    info = <p>You are signed in with <span className="bold">{signedIn.email}</span>.</p>;
  } else if (isSignInLink) {
    info = <p>You are being signed in with <span className="bold">{DataStore.getSignInEmail()}</span>.</p>;
  } else if (emailSending) {
    info = <p>Hold the line.</p>;
  } else if (emailSent) {
    info = <p>You’ve been sent an email at <span className="bold">{email}</span>.</p>;
  }


  return (
    <div className="translucent translucent-center text-center">
      <div>
        <h1>Just</h1>

        {info === null ? (
          <>
            <form onSubmit={onSubmit}>
              <label>Sign in with only your email address</label>
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  className="form-control text-center"
                  onChange={e => setEmail(e.target.value)}/>
              </div>
              <button type="submit" disabled={emailSending} className="form-control">Sign In</button>
            </form>
            {isMobileSafariStandalone && (
              <form onSubmit={onSafariSubmit} className="margin-top">
                <div>
                  <label>Paste the link you were sent here</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={safariSignInLink}
                      className="form-control text-center"
                      onChange={e => setSafariSignInLink(e.target.value)}/>
                  </div>
                </div>
                <div>
                  <label>Your email address</label>
                  <div className="flex">
                    <input
                      type="email"
                      value={safariEmail}
                      className="form-control text-center"
                      onChange={e => setSafariEmail(e.target.value)}/>
                  </div>
                </div>
                <button type="submit" disabled={emailSending} className="form-control">Sign In</button>
              </form>
            )}
          </>
        ) : info}
      </div>
    </div>
  );
}
