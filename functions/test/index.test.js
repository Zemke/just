const testAccountUid = require('../private/testAccountUid');

const test = require('firebase-functions-test')({
  storageBucket: "just-pwa.appspot.com",
  projectId: "just-pwa",
  databaseURL: "https://just-pwa.firebaseio.com",
}, 'private/service-account-key.json');

const myFunctions = require('../index.js');
const chai = require('chai');

const message = {
  from: 'sdfdr2hr834',
  to: testAccountUid,
  body: 'Hello, this is a test message',
};

const snap = test.firestore.makeDocumentSnapshot(message, 'message/2938jsu');

return test.wrap(myFunctions.sendMessageNotification)(snap)
  .then(res => {
    chai.expect(res).to.be.an('array');
    return test.cleanup();
  });
