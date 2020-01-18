const api = {};

api.requestPermission = async () => {
  if (!('Notification' in window) || Notification.permission === "granted") return;
  const status = await Notification.requestPermission();
  if (Notification.permission !== status) Notification.permission = status;
};

api.notify = async (title, body, data) => {
  if (Notification.permission !== 'granted') return;
  return (await navigator.serviceWorker.ready).showNotification(
    title, {body, icon: '/logo192.png', badge: '/logo72.png', data});
};

export default api;