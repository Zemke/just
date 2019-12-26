import * as firebase from "firebase/app";
import "firebase/auth";
// import "firebase/firestore";
import "firebase/database";
import "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCpeA-4i6sZalkiqjB3ks6u1__hO4E2o8U",
  authDomain: "just-pwa.firebaseapp.com",
  databaseURL: "https://just-pwa.firebaseio.com",
  projectId: "just-pwa",
  storageBucket: "just-pwa.appspot.com",
  messagingSenderId: "389806956797",
  appId: "1:389806956797:web:18d5c9ae865eda5b51de94",
  measurementId: "G-8FFPRPW39V"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();
const database = firebase.database();


const api = {};

api.sendMessage = {
  // todo
};

api.getMessages = {
  // todo
};

api.onMessage = {
  // todo
};

export default api;