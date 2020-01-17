self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type: 'window'}).then(clients => {
    clients.forEach(client => {
      if ('focus' in client) client.focus();
      if ('postMessage' in client) client.postMessage({newMessage: e.notification.data.fromUserUid});
    })
  }));
});
