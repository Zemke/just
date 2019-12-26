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
  // todo web notification
  return firestore
    .collection('messages')
    .where('chat', 'in', api.getChats().filter(c => c.code).map(c => c.code))
    .onSnapshot(snapshot =>
      snapshot
        .docChanges()
        .forEach(({doc}) =>
          cb && cb({...doc.data(), id: doc.id}, doc.type)));
};

api.getChats = () => {
  let items = window.localStorage.getItem("chats");
  return items != null ? JSON.parse(items) : [];
};

api.addChat = ({name, code}) => {
  const chats = api.getChats();
  chats.push({name, code});
  window.localStorage.setItem("chats", JSON.stringify(chats));
  return chats;
};

api.getMyName = () => window.localStorage.getItem('myName') || 'Kevin';

export default api;
