export default (currentUserUid, messages) =>
  [messages[0].from, messages[0].to]
    .filter(userUid => userUid !== currentUserUid)[0]