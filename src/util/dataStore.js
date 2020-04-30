import firebase from './firebase.js';
import "firebase/firestore";
import "firebase/functions";
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

api.sendMessage = ({from, to, body, image = null, when = serverTimestamp(), giphy = null, location = null}) =>
  firebase
    .firestore()
    .collection('messages')
    .add({from, to, body, users: [from, to], when, image: image, giphy, location});

const mapTimestamp = message => {
  message.when = message.when?.toMillis();
  return message;
};

api.sendVideoCallRequest = async ({from, to, signalingFrom}) =>
  await firebase
    .firestore()
    .collection('videos')
    .add({from, to, signalingFrom});

api.onVideoCallRequest = async cb =>
  firebase
    .firestore()
    .collection('videos')
    .where('to', '==', (await Auth.current()).uid)
    .onSnapshot(snapshot =>
      snapshot
        .docChanges()
        .filter(docChange =>
          docChange.type === "added"
            && !docChange.doc.metadata.fromCache
            && !docChange.doc.metadata.hasPendingWrites)
        .forEach(docChange => cb({req: docChange.doc.data(), doc: docChange.doc})));

api.onMessage = async cb =>
  firebase
    .firestore()
    .collection('messages')
    .where('users', 'array-contains', (await Auth.current()).uid)
    .onSnapshot({includeMetadataChanges: true}, snapshot =>
      cb(snapshot
        .docChanges({includeMetadataChanges: true})
        .map(({doc, type}) => ({message: {...mapTimestamp(doc.data()), id: doc.id}, doc, type}))));

api.deleteChatWithUser = async otherUser =>
  firebase
    .functions()
    .httpsCallable('deleteChat')({otherUser});

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
    .set(names, {merge: true});

api.saveToken = async token =>
  firebase
    .firestore()
    .collection('users')
    .doc((await Auth.current()).uid)
    .set({tokens: firebase.firestore.FieldValue.arrayUnion(token)}, {merge: true});

api.alienateRememberedUser = () =>
  window.localStorage.removeItem('currentUser');

api.rememberUser = currentUser =>
  window.localStorage.setItem('currentUser', JSON.stringify(currentUser));

api.getRememberedUser = () => {
  const fromStorage = window.localStorage.getItem('currentUser');
  return !fromStorage ? null : JSON.parse(fromStorage);
};

api.saveSignInEmail = emailForSignIn => window.localStorage.setItem('emailForSignIn', emailForSignIn);
api.getSignInEmail = () => window.localStorage.getItem('emailForSignIn');
api.removeSignInEmail = () => window.localStorage.removeItem('emailForSignIn');

api.clearCachedNames = () =>
  window.localStorage.removeItem('names');

api.getCachedNames = () =>
  JSON.parse(window.localStorage.getItem('names') || "{}");

api.cacheName = names =>
  window.localStorage.setItem(
    'names', JSON.stringify({...(api.getCachedNames()), ...names}));

export default api;
