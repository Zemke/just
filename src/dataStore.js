import * as firebase from "firebase/app";
import "firebase/firestore";

// todo auth

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

const firestore = firebase.firestore();
const api = {};

api.sendMessage = ({chat, from, to, body}) =>
  firestore
    .collection('messages')
    .add({chat, from, to, body, when: Date.now()});

api.onMessage = (cb) => {
  return firestore
    .collection('messages')
    .onSnapshot(snapshot =>
      snapshot
        .docChanges()
        .forEach(({doc}) =>
          cb && cb({...doc.data(), id: doc.id}, doc.type)));
};

export default api;