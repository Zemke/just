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

api.notify = (title, options) => {
  if (window.Notification && Notification.permission === "granted") {
    new Notification(title, options);
  }
};

export default api;