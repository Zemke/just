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

exports.purge = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .send("Please issue a post")
  }

  const max = req.query.max || 50;

  console.log(`Going to be keeping ${max} messages per conversation.`);

  const subjects =
    Object.entries(
      (await admin.firestore().collection('messages').get()).docs
        .reduce((acc, curr) => {
          const conversationId = curr.data().users.sort().join('-');
          acc[conversationId] = acc[conversationId] || [];
          acc[conversationId].push(curr);
          return acc;
        }, {}))
      .filter(([_id, conversation]) => conversation.length > max)
      .map(([_id, conversation]) => conversation
        .sort((m1, m2) => m2.createTime.toMillis() - m1.createTime.toMillis())
        .slice(max))
      .reduce((acc, curr) => acc.concat(curr)); // Array.prototype.flat

  console.log(`Deleting ${subjects.length} messages.`);

  if (!subjects.length) {
    return res
      .status(200)
      .send("There are no messages to delete");
  }

  const batchSize = 500;
  const batchQuantity = Math.ceil(subjects.length / batchSize);

  console.log(`Execution will take place in ${batchQuantity} batches.`);

  const promises = subjects
    .reduce((acc, curr) => {
      acc[acc.length - 1].length < batchSize
        ? acc[acc.length - 1].push(curr)
        : acc.push([curr]);
      return acc;
    }, [[]])
    .map(messageBatch => {
      const batchWrite = admin.firestore().batch();
      messageBatch.forEach(docSnap => batchWrite.delete(docSnap.ref));
      return batchWrite.commit()
        .then(() => console.log("Batch successfully committed."))
        .catch(console.error);
    });

  await Promise.all(promises);

  return res
    .status(200)
    .send(`${subjects.length} messages deleted.`);
});

exports.deleteAssociatedImage = functions.firestore
  .document('messages/{messageId}')
  .onDelete(async (snap, _context) => {
    const image = snap.data().image;
    if (!image) return Promise.resolve(null);
    console.log(`Deleting image ${image} of message ${snap.id}`);
    return admin.storage()
      .bucket("just-pwa.appspot.com")
      .file(image)
      .delete();
  });
