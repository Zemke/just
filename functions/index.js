const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendMessageNotification = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap, _context) => {
    const message = snap.data();

    console.log('Message created:', message);

    const userDoc = await admin.firestore()
      .collection('users')
      .doc(message.to)
      .get();

    if (!userDoc.exists) {
      console.info('User not found in names collection');
      return Promise.resolve(null);
    }

    const tokens = userDoc.data().tokens;

    if (!tokens || !tokens.length) {
      console.info('User has no tokens');
      return Promise.resolve(null);
    }

    const otherUserName = await admin.firestore()
      .collection('names')
      .doc(message.to)
      .get()
      .then(nameDoc =>
        nameDoc.exists
          ? nameDoc.data()[message.from] || message.from
          : message.from);

    const notification = {
      fromName: otherUserName,
      fromUid: message.from,
      body: message.body,
    };

    console.log(`Sending to ${tokens.length} tokens:`, notification);

    const response = await admin.messaging()
      .sendToDevice(tokens, {data: notification});

    const tokensToRemove = response.results
      .filter(({error}) =>
        !!error
          && (error.code === 'messaging/invalid-registration-token'
          || error.code === 'messaging/registration-token-not-registered'))
      .map((res, idx) => tokens[idx]);


    if (!tokensToRemove.length) {
      console.log('There are no invalid tokens to remove');
      return Promise.resolve(notification);
    }

    console.log(`There are ${tokensToRemove.length} invalid tokens to remove.`);

    await userDoc.ref
      .update({tokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove)});

    return Promise.resolve(notification);
  });


exports.createMessageForFile = functions.storage.object().onFinalize(async object => {
  console.log(object);

  const message = {
    from: object.metadata.from,
    to: object.metadata.to,
    body: null,
    when: admin.firestore.Timestamp.fromMillis(parseInt(object.metadata.when)),
    image: object.name,
    users: [object.metadata.from, object.metadata.to]
  };

  console.log('Creating message', message);

  return admin.firestore()
    .collection('messages')
    .add(message);
});
