import * as firebase from "firebase/app";
import "firebase/auth";

const authUrl = window.location.origin;
const actionCodeSettings = {
  url: authUrl,
  handleCodeInApp: true,
};

const api = {};

api.sendMail = email =>
  firebase
    .auth()
    .sendSignInLinkToEmail(email, actionCodeSettings);

api.isSignInLink = link =>
  firebase
    .auth()
    .isSignInWithEmailLink(link);

api.signIn = email =>
  firebase
    .auth()
    .signInWithEmailLink(email, window.location.href);

api.safariSignIn = (email, safariLink) =>
  firebase
    .auth()
    .signInWithEmailLink(email, safariLink);

api.current = () => {
  const authFromStorage = window.localStorage.getItem('auth');
  return authFromStorage
    ? Promise.resolve(JSON.parse(authFromStorage))
    : new Promise(resolve => api.onAuthStateChanged(
      user => {
        if (user) {
          window.localStorage.setItem('auth', JSON.stringify(user));
          resolve(user);
        } else {
          window.localStorage.removeItem('auth');
          resolve(null);
        }
      }));
};

api.onAuthStateChanged = cb =>
  firebase
    .auth()
    .onAuthStateChanged(cb);

api.signOut = () =>
  firebase
    .auth()
    .signOut();

export default api;
