const testData = require('../private/testData');

const test = require('firebase-functions-test')({
  storageBucket: "just-pwa.appspot.com",
  projectId: "just-pwa",
  databaseURL: "https://just-pwa.firebaseio.com",
}, 'private/service-account-key.json');

const myFunctions = require('../index.js');

const message = {
  from: testData.users.flzemke,
  to: testData.users.zemke,
  body: 'Hello, this is a test message',
};

const snap = test.firestore.makeDocumentSnapshot(message, 'messages/2938jsu');

return test.wrap(myFunctions.sendMessageNotification)(snap)
  .then(res => {
    console.assert(res != null, res);
    console.assert(res.fromName === 'flzemke', res.fromName);
    console.assert(res.fromUid === testData.users.flzemke, res.fromUid);
    console.assert(res.body === message.body, res.body);
    console.log('\x1b[32m%s\x1b[0m', 'Success');
    return test.cleanup();
  });
