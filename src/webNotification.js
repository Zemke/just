const api = {};

api.requestPermission = () => {
  if (!window.Notification || Notification.permission === "granted") {
    return;
  }

  Notification.requestPermission(status => {
    if (Notification.permission !== status) {
      Notification.permission = status;
    }
  });
};

api.notify = (title, body) => {
  if (document.hasFocus && document.hasFocus()) return;
  if (!window.Notification) return;
  if (Notification.permission !== 'granted') return;

  navigator.serviceWorker.ready
    .then(serviceWorkerRegistration => {
      if (serviceWorkerRegistration.showNotification) {
        serviceWorkerRegistration.showNotification(
          title, {body, icon: '/logo192.png', badge: '/logo192.png'});
      } else {
        new Notification(
          title, {body, icon: '/logo192.png', badge: '/logo192.png'});
      }
    });
};

export default api;