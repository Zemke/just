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
    .add({from, to, body, when: serverTimestamp()});

const mapTimestamp = message => {
  message.when = message.when?.toMillis();
  return message;
};

const onMessage = (cb, fromOrTo, userUid) =>
  firebase
    .firestore()
    .collection('messages')
    .where(fromOrTo, '==', userUid)
    .onSnapshot(snapshot =>
      snapshot
        .docChanges()
        .forEach(({doc, type}) =>
          cb({...mapTimestamp(doc.data()), id: doc.id}, doc, type)));

api.onMessage = cb =>
  Auth
    .current()
    .then(user => {
      // todo maybe store redundant array of both participating users
      //  to have a contains where clause and only one listener.
      onMessage(cb, "from", user.uid);
      onMessage(cb, "to", user.uid);
    });

const getConversation = (userUidA, userUidB) =>
  Promise
    .all([
      (firebase
        .firestore()
        .collection('messages')
        .where('from', '==', userUidA)
        .where('to', '==', userUidB)
        .get()),
      (firebase
        .firestore()
        .collection('messages')
        .where('from', '==', userUidB)
        .where('to', '==', userUidA)
        .get())
    ])
    .then(res => res[0].docs.concat(...res[1].docs));

api.deleteChatWithUser = async userUid =>
  getConversation(userUid, (await Auth.current()).uid)
    .then(docs => docs.forEach(doc => doc.ref.delete()));

api.setDelivered = message =>
  message.update({delivered: true});

api.saveSignInEmail = emailForSignIn => window.localStorage.setItem('emailForSignIn', emailForSignIn);
api.getSignInEmail = () => window.localStorage.getItem('emailForSignIn');
api.removeSignInEmail = () => window.localStorage.removeItem('emailForSignIn');

export default api;
