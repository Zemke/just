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

  messaging.setBackgroundMessageHandler(({data}) =>
    self.registration.showNotification(
      data.fromName, {body: data.body, badge: 'https://just.zemke.io/badge.png', icon: '/logo192.png'}));
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'POST'
      || !event.request.url.endsWith('/share-target')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(Response.redirect('/share-target'));
  event.waitUntil((async () => {
    (await self.clients.get(event.resultingClientId || event.clientId))
      .postMessage({shareTarget: Array.from((await event.request.formData()).entries())});
  })());
});

// todo this fakes the message event which would come from the service worker
//  when something is shared to Just
self.addEventListener('push', e => {
  if (e.data.text() !== 'share') return;

  clients.matchAll({type: 'window'}).then(clients => {
    clients.forEach(async client => {
      const img = await fetch('https://cwtsite.com/assets/icon.1471fd5444f559a02015f08810d998a9.png');
      const blob = await img.blob();
      const file = new File([blob], "test.png", {type: "image/png", lastModified: Date.now()});
      const init = {data: {shareTarget: [["images", file]]}};
      console.log('MessageEvent shareTarget', init);
      client.postMessage({shareTarget: init})
    })
  });
});
