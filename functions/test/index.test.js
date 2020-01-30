const testData = require('../private/testData');

const firebaseFn = require('firebase-admin');
const test = require('firebase-functions-test')({
  storageBucket: "just-pwa.appspot.com",
  projectId: "just-pwa",
  databaseURL: "https://just-pwa.firebaseio.com",
}, 'private/service-account-key.json');

const myFunctions = require('../index.js');

// sendMessageNotification
(() => {
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
})();

// createMessageForFile
(async () => {
  const name = 'images/bfez33wzpiat9n6e3d3k';

  const snap = test.storage.makeObjectMetadata({
    name,
    metadata: {
      from: testData.users.flzemke,
      to: testData.users.zemke,
      when: new firebaseFn.firestore.Timestamp(1180112111, 326)
        .toMillis()
        .toString(), // 1180112111000 on millis
    }
  });

  const result = await test.wrap(myFunctions.createMessageForFile)(snap);
  const savedMessage = (await result.get()).data();

  console.assert(
    savedMessage.body === null,
    `body actually is ${savedMessage.body}`);
  console.assert(
    savedMessage.to === testData.users.zemke,
    `to actually is ${savedMessage.to}`);
  console.assert(
    savedMessage.from === testData.users.flzemke,
    `from actually is ${savedMessage.from}`);
  console.assert(
    savedMessage.image === name,
    `image actually is ${savedMessage.image}`);
  console.assert(
    savedMessage.users.length === 2
        && savedMessage.users.indexOf(testData.users.zemke) !== -1
        && savedMessage.users.indexOf(testData.users.flzemke) !== -1,
    `image actually is ${savedMessage.image}`);
  console.assert(
    savedMessage.when.toMillis() === 1180112111000,
    `savedMessage.when.toMillis() is actually ${savedMessage.when.toMillis()}`);
  console.log('\x1b[32m%s\x1b[0m', 'Success');
  return test.cleanup();
})();
