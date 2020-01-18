const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

exports.sendMessageNotification = functions.firestore
  .document('message/{messageId}')
  .onCreate(async (snap, _context) => {
    const message = snap.data();

    console.log('Message created:', message);

    const userDoc = await admin.firestore()
      .collection('users')
      .doc(message.to)
      .get();

    if (!userDoc.exists) {
      return console.warn('User not found in names collection');
    }

    const tokens = userDoc.data().tokens;

    if (!tokens || !tokens.length) {
      return console.warn('User has no tokens');
    }

    const notification = {
      title: `${message.from} replied`, // todo toName
      body: message.body
    };

    console.log(`Sending to ${tokens.length} tokens:`, notification);

    // actual sending
    const response = await admin.messaging()
      .sendToDevice(tokens, {notification});

    const tokensToRemove = response.results.filter(({error}) =>
      !!error
        && (error.code === 'messaging/invalid-registration-token'
        || error.code === 'messaging/registration-token-not-registered'));

    return userDoc.ref
      .update({tokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove)});
  });
