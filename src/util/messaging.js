import * as firebase from "firebase/app";
import "firebase/messaging";

const messaging = firebase.messaging();

messaging.usePublicVapidKey("BAoM6C4OkVC0TASZfRYD_I_es2VHdg8E_5owQWlza2sS79FFhfu5SN2bcueGyvZ9WBzyS4AiTeFLXutCLKyskeQ");

const api = {};

api.getToken = () =>
  messaging.getToken().then((currentToken) => {
    if (!currentToken) return console.warn('Messaging token could not be obtained.');
    console.log("Houston, we have a token");
  });

messaging.onTokenRefresh(() =>
  messaging.getToken().then(refreshedToken => console.log('Token refreshed:', refreshedToken)));

export default async () => {
  if (!('serviceWorker' in navigator)) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return null;
  messaging.useServiceWorker(reg);
  return api;
};