const api = {};

const createOptions = (body, data) =>
  ({body, icon: '/logo192.png', badge: '/logo192.png', data});

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

api.notify = async (title, body, data) => {
  if (!window.Notification) return;
  if (Notification.permission !== 'granted') return;

  const registrations = await navigator.serviceWorker.getRegistrations();

  if (registrations && registrations.length) {
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;

    if (serviceWorkerRegistration.showNotification) {
      await serviceWorkerRegistration.showNotification(title, createOptions(body, data));
    } else { // This is mostly for Desktop Safari.
      new Notification(title, createOptions(body, data));
    }
  } else {
    try {
      console.log('No Service Worker registered. Falling back to Web Notifications API.');
      new Notification(title, createOptions(body, data));
    } catch (e) { // I.e. Mobile Chrome doesn't support Notification constructor.
      console.warn("Could not instantiate the fallback notification: ", e);
    }
  }
};

export default api;