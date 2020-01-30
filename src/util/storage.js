import "firebase/storage";
import firebase from './firebase';
import Auth from './auth';

const api = {};

api.upload = async (file, name, to, when) =>
  firebase
    .storage()
    .ref()
    .child(`images/${name}`)
    .put(file, {customMetadata: {from: (await Auth.current()).uid, to, when: when.toString()}});

api.download = async image =>
  await firebase
    .storage()
    .ref(image)
    .getDownloadURL();

export default api;
