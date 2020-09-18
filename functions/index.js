const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp({credential: admin.credential.applicationDefault()});

exports.sendMessageNotification = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap, _context) => {
    const message = snap.data();
    message.id = snap.id;

    console.log('Message created:', message);

    const userDoc = await admin.firestore()
      .collection('users')
      .doc(message.to)
      .get();

    if (!userDoc.exists) {
      console.info(`User ${message.to} not found in users collection`);
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

    const data = {
      fromName: otherUserName,
      fromUid: message.from,
      body: message.body,
      message: JSON.stringify(message)
    };

    console.log(`Sending to ${tokens.length} tokens:`, data);

    const notification = {
      title: data.fromName,
      body: data.body,
    };

    const {responses} = await admin.messaging()
      .sendMulticast({
        tokens,
        data,
        notification,
        apns: {
          payload: {
            aps: {
              mutableContent: true,
              contentAvailable: true,
            },
          },
          headers: {
            'apns-push-type': 'background',
            'apns-priority': '5',
            'apns-topic': 'org.name.justnative'
          }
        },
        android: {
          data,
          notification,
          priority: 'high'
        },
      });

    const tokensToRemove = responses
      .filter(({error}) =>
        !!error
          && (error.code === 'messaging/invalid-registration-token'
          || error.code === 'messaging/registration-token-not-registered'))
      .map((res, idx) => tokens[idx]);


    if (!tokensToRemove.length) {
      console.log('There are no invalid tokens to remove');
      return Promise.resolve(data);
    }

    console.log(`There are ${tokensToRemove.length} invalid tokens to remove.`);

    await userDoc.ref
      .update({tokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove)});

    return Promise.resolve(data);
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

  await performInBatches(subjects, (batchWrite, docSnap) => batchWrite.delete(docSnap.ref));

  return res
    .status(200)
    .send(`${subjects.length} messages deleted.`);
});

exports.purgeTest = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .send("Please issue a post")
  }

  const max = req.query.max || 1;

  console.log(`Going to be keeping ${max} test messages per test conversation.`);

  const testUsers = [
    'TTYqXE93wsMzCOF63pmXqeJgsdL2', // icloud
    '70Xz1nX8lVgGF2BgZEATRfvmCKg1', // gmail
  ];

  console.log('Test users are', testUsers.join(', '));

  const subjects =
    Object.entries(
      (await admin.firestore()
        .collection('messages')
        .where('users', 'array-contains-any', testUsers)
        .get()).docs
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

  console.log(`Deleting ${subjects.length} test messages.`);

  if (!subjects.length) {
    return res
      .status(200)
      .send("There are no messages to delete");
  }

  await performInBatches(subjects, (batchWrite, docSnap) => batchWrite.delete(docSnap.ref));

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

exports.deleteChat = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated.');
  if (!data.otherUser) throw new functions.https.HttpsError('invalid-argument', 'Invalid otherUser.');

  console.log(
    `Delete conversation of ${context.auth.uid} and ${data.otherUser} as triggered by ${context.auth.uid}`);

  const docRefs = [];

  await Promise
    .all([
      (admin
        .firestore()
        .collection('messages')
        .where('from', '==', data.otherUser)
        .where('to', '==', context.auth.uid)
        .get()),
      (admin
        .firestore()
        .collection('messages')
        .where('from', '==', context.auth.uid)
        .where('to', '==', data.otherUser)
        .get())
    ])
    .then(res => res[0].docs.concat(...res[1].docs))
    .then(docs => docRefs.push(...docs));

  await performInBatches(docRefs, (batchWrite, docSnap) => batchWrite.delete(docSnap.ref));

  return true;
});

async function performInBatches(subjects, onEach) {
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
      messageBatch.forEach(docSnap => onEach(batchWrite, docSnap));
      return batchWrite.commit()
        .then(() => console.log("Batch successfully committed."))
        .catch(console.error);
    });

  return await Promise.all(promises);
}

exports.createCustomToken = functions.https.onCall(async (data, context) => {
  const userUid = data['userUid'];
  if (userUid == null) {
    return "userUid not found in payload";
  }
  return {customToken: await admin.auth().createCustomToken(userUid)};
});
