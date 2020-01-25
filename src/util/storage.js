import "firebase/storage";
import firebase from './firebase';
import Auth from './auth';

const api = {};

api.upload = async (file, to) => {
  const now = Date.now();
  return firebase
    .storage()
    .ref()
    .child(`images/${now.toString()}`)
    .put(file, {customMetadata: {from: (await Auth.current()).uid, to}});
};

export default api;
