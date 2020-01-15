export default (userUid, names) => (names || {})[userUid] || userUid;
