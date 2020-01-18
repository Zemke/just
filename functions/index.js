const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

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
      console.info('User not found in names collection');
      return Promise.resolve([]);
    }

    const tokens = userDoc.data().tokens;

    if (!tokens || !tokens.length) {
      console.info('User has no tokens');
      return Promise.resolve([]);
    }

    const notification = {
      title: `${message.from} replied`, // todo toName
      body: message.body
    };

    console.log(`Sending to ${tokens.length} tokens:`, notification);

    // actual sending
    const response = await admin.messaging()
      .sendToDevice(tokens, {notification});

    const tokensToRemove = response.results
      .filter(({error}) =>
        !!error
          && (error.code === 'messaging/invalid-registration-token'
          || error.code === 'messaging/registration-token-not-registered'))
      .map((res, idx) => tokens[idx]);


    if (!tokensToRemove.length) {
      console.log('There are no invalid tokens to remove');
      return Promise.resolve([]);
    }

    console.log(`There are ${tokensToRemove.length} invalid tokens to remove.`);

    console.log(tokensToRemove);

    return userDoc.ref
      .update({tokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove)});
  });
