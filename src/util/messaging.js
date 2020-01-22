import * as firebase from "firebase/app";
import "firebase/messaging";

const b64PublicKey = "BAoM6C4OkVC0TASZfRYD_I_es2VHdg8E_5owQWlza2sS79FFhfu5SN2bcueGyvZ9WBzyS4AiTeFLXutCLKyskeQ";
let messaging;

export default apiCallback => {
  if (!firebase.messaging.isSupported()) return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  const subscriptions = [];

  (async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return;

    if (!messaging) {
      messaging = firebase.messaging();
      messaging.usePublicVapidKey(b64PublicKey);
      messaging.useServiceWorker(reg);
    }


    const getToken = cb => messaging.getToken().then(cb);
    const onTokenRefresh = cb => subscriptions.push(messaging.onTokenRefresh(() => getToken(cb)));
    const onMessage = cb => subscriptions.push(messaging.onMessage(cb));

    apiCallback({getToken, onTokenRefresh, onMessage});
  })();

  return () => subscriptions.forEach(sub => sub());
};
