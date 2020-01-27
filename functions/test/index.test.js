const testData = require('../private/testData');

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
  const snap = test.storage.makeObjectMetadata({
    metadata: {
      from: testData.users.flzemke,
      to: testData.users.zemke,
    }
  });

  const result = await test.wrap(myFunctions.createMessageForFile)(snap);
  const savedMessage = (await result.get()).data();

  const tolerance = 10000;
  const now = Date.now();
  const savedWhen = savedMessage.when.toMillis();
  console.assert(
    now - tolerance < savedWhen && now > savedWhen,
    `Message wasn't created within the last ${tolerance} millis.`);

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
    savedMessage.image === true,
    `image actually is ${savedMessage.image}`);

  return test.cleanup();
})();
