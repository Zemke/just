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
    data.fromName, {body: data.body, badge: '/logo72.png', icon: '/logo192.png'}));
