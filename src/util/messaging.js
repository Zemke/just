import * as firebase from "firebase/app";
import "firebase/messaging";

export default (async () => {
  if (!firebase.messaging.isSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return null;

  const messaging = firebase.messaging();
  messaging.usePublicVapidKey("BAoM6C4OkVC0TASZfRYD_I_es2VHdg8E_5owQWlza2sS79FFhfu5SN2bcueGyvZ9WBzyS4AiTeFLXutCLKyskeQ");
  messaging.useServiceWorker(reg);

  const getToken = () => messaging.getToken();
  const onTokenRefresh = cb => messaging.onTokenRefresh(() => messaging.getToken().then(cb));
  const onMessage = cb => messaging.onMessage(cb);

  return {getToken, onTokenRefresh, onMessage};
})();
