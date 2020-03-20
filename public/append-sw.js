//
// Push Notifications
//

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type: 'window'}).then(clients => {
    clients.forEach(client => {
      if ('focus' in client) client.focus();
      if ('postMessage' in client) client.postMessage({newMessage: e.notification.data.fromUserUid});
    })
  }));
});

importScripts('https://www.gstatic.com/firebasejs/7.6.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.6.2/firebase-messaging.js');

if (firebase.messaging.isSupported()) {
  firebase.initializeApp({
    apiKey: "AIzaSyCpeA-4i6sZalkiqjB3ks6u1__hO4E2o8U",
    authDomain: "just-pwa.firebaseapp.com",
    databaseURL: "https://just-pwa.firebaseio.com",
    projectId: "just-pwa",
    storageBucket: "just-pwa.appspot.com",
    messagingSenderId: "389806956797",
    appId: "1:389806956797:web:18d5c9ae865eda5b51de94",
    measurementId: "G-8FFPRPW39V"
  });

  const messaging = firebase.messaging();

  messaging.setBackgroundMessageHandler(async ({data}) => {
    if ('message' in data) {
      const clients = self.clients.matchAll();
      clients.forEach(client =>
        client.postMessage
          && client.postMessage({onMessage: data.message}));
    }

    self.registration.showNotification(
      data.fromName, {
        body: data.body,
        badge: 'https://just.zemke.io/badge.png',
        icon: '/logo192.png'
      });
  });
}

//
// Share Target
//

let waitingShareTarget = null;

self.addEventListener('message', e =>
  e.data === 'onChatLoad'
    && waitingShareTarget
    && waitingShareTarget());

self.addEventListener('fetch', event => {
  if (event.request.method !== 'POST'
      || !event.request.url.endsWith('/share-target')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(Response.redirect('/'));
  event.waitUntil((async () => {
    waitingShareTarget = async () => {
      const client = await self.clients.get(event.resultingClientId || event.clientId);
      client.postMessage &&
        client.postMessage({shareTarget: Array.from((await event.request.formData()).entries())})
    }
  })());
});
