import firebase from './firebase.js';
import "firebase/firestore";
import Auth from "./auth";

firebase.firestore().enablePersistence()
  .then(() => console.log('Firestore offline persistence has been enabled.'))
  .catch(err => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence');
    } else {
      console.warn('Unexpected error when trying to enable Firestore persistence', err);
    }
  });

const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

const api = {};

api.timestampFromMillis = millis =>
  new firebase.firestore.Timestamp.fromMillis(millis);

api.sendMessage = ({from, to, body, image, when = serverTimestamp()}) =>
  firebase
    .firestore()
    .collection('messages')
    .add({from, to, body, users: [from, to], when, image: image || null});

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
      cb(snapshot
        .docChanges()
        .map(({doc, type}) => ({message: {...mapTimestamp(doc.data()), id: doc.id}, doc, type}))));

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

api.sendTapback = async (action, messageId) =>
  firebase
    .firestore()
    .collection('messages')
    .doc(messageId)
    .update({tapback: {action, from: (await Auth.current()).uid}});

api.setDelivered = message =>
  message.update({delivered: true});

api.onNames = async cb =>
  firebase
    .firestore()
    .collection('names')
    .doc((await Auth.current()).uid)
    .onSnapshot(cb);

api.putNames = async names =>
  firebase
    .firestore()
    .collection('names')
    .doc((await Auth.current()).uid)
    .set(names);

api.saveToken = async token =>
  firebase
    .firestore()
    .collection('users')
    .doc((await Auth.current()).uid)
    .set({tokens: firebase.firestore.FieldValue.arrayUnion(token)}, {merge: true});

api.saveSignInEmail = emailForSignIn => window.localStorage.setItem('emailForSignIn', emailForSignIn);
api.getSignInEmail = () => window.localStorage.getItem('emailForSignIn');
api.removeSignInEmail = () => window.localStorage.removeItem('emailForSignIn');

export default api;
