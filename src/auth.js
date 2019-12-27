import * as firebase from "firebase/app";
import "firebase/auth";

const authUrl = 'http://localhost:3000/completeSignIn?showPromo=1234';
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

api.current = () =>
  new Promise(resolve =>
    api.onAuthStateChanged(
      user => user ? resolve(user) : resolve(null)));

api.onAuthStateChanged = cb =>
  firebase
    .auth()
    .onAuthStateChanged(cb);

api.signOut = () =>
  firebase
    .auth()
    .signOut();

export default api;
