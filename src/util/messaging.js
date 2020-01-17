import * as firebase from "firebase/app";
import "firebase/messaging";

const messaging = firebase.messaging();

messaging.usePublicVapidKey("BAoM6C4OkVC0TASZfRYD_I_es2VHdg8E_5owQWlza2sS79FFhfu5SN2bcueGyvZ9WBzyS4AiTeFLXutCLKyskeQ");


const getToken = cb => messaging.getToken().then(cb);
const onTokenRefresh = cb => messaging.onTokenRefresh(() => messaging.getToken().then(cb));
const onMessage = () => messaging.onMessage;

export default (async () => {
  if (!('serviceWorker' in navigator)) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return null;
  messaging.useServiceWorker(reg);
  return {getToken, onTokenRefresh, onMessage};
})();
