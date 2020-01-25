import "firebase/storage";
import firebase from './firebase';

const api = {};

api.upload = async file => {
  const now = Date.now();
  return firebase
    .storage()
    .ref()
    .child(`images/${now.toString()}`)
    .put(file);
};

export default api;
