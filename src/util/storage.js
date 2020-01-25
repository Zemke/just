import "firebase/storage";
import firebase from './firebase';
import Auth from './auth';
import randomString from './randomString.js';

const api = {};

api.upload = async (file, to) =>
  firebase
    .storage()
    .ref()
    .child(`images/${randomString()}`)
    .put(file, {customMetadata: {from: (await Auth.current()).uid, to}});
};

export default api;
