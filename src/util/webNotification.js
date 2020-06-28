const api = {};

api.requestPermission = async () => {
  if (!('Notification' in window) || Notification.permission === "granted") return;
  const status = await Notification.requestPermission();
  if (Notification.permission !== status) Notification.permission = status;
};

api.notify = async (title, body, data) => {
  if (Notification.permission !== 'granted') return;
  return (await navigator.serviceWorker.ready).showNotification(
    title, {body, icon: '/logo192.png', badge: 'https://just.zemke.io/badge.png', data});
};

api.notifyStandalone = (title, {body, image}, data) => {
  const notification = new Notification(title, {body: body || (image ? '📷' : ''), data});
  notification.onclick = e =>
    dispatchEvent(new CustomEvent('notificationClick', {detail: e.target.data.fromUserUid}));
}

export default api;
