import * as firebase from "firebase/app";
import "firebase/firestore";
import Auth from "./auth";

firebase.initializeApp({
  apiKey: "AIzaSyCpeA-4i6sZalkiqjB3ks6u1__hO4E2o8U",
  authDomain: "just-pwa.firebaseapp.com",
  databaseURL: "https://just-pwa.firebaseio.com",
  projectId: "just-pwa",
  storageBucket: "just-pwa.appspot.com",
  messagingSenderId: "389806956797",
  appId: "1:389806956797:web:18d5c9ae865eda5b51de94",
  measurementId: "G-8FFPRPW39V"
});

const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

const api = {};

api.sendMessage = ({from, to, body}) =>
  firebase
    .firestore()
    .collection('messages')
    .add({from, to, body, users: [from, to], when: serverTimestamp()});

const mapTimestamp = message => {
  message.when = message.when?.toMillis();
  return message;
};

api.onMessage = async cb =>
  firebase
    .firestore()
    .collection('messages')
    .where('users', 'array-contains', (await Auth.current()).uid)
    .onSnapshot(snapshot =>
      snapshot
        .docChanges()
        .forEach(({doc, type}) =>
          cb({...mapTimestamp(doc.data()), id: doc.id}, doc, type)));

api.deleteChatWithUser = async userUid =>
  firebase
    .firestore()
    .collection('messages')
    .where('users', 'array-contains', userUid)
    .where('users', 'array-contains', (await Auth.current()).uid)
    .get()
    .then(res => res.docs.forEach(doc => doc.ref.delete()));

api.setDelivered = message =>
  message.update({delivered: true});

api.saveChatName = (chat, newName) => {
  const names = JSON.parse(window.localStorage.getItem('names')) || {};
  names[chat] = newName;
  window.localStorage.setItem('names', JSON.stringify(names));
  return names;
};

api.getChatName = chat => (JSON.parse(window.localStorage.getItem('names')) || {})[chat] || chat;

api.saveSignInEmail = emailForSignIn => window.localStorage.setItem('emailForSignIn', emailForSignIn);
api.getSignInEmail = () => window.localStorage.getItem('emailForSignIn');
api.removeSignInEmail = () => window.localStorage.removeItem('emailForSignIn');

export default api;
