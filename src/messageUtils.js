const api = {};

api.containsExactlyUsers = users =>
  (m, _idx, _arr) => {
    if (m.users.length !== users.length) return false;
    for (let i = 0; i < users.length; i++) {
      if (m.users.indexOf(users[i]) === -1) return false;
    }
    return true;
  };

api.getNewestMessage = messages => {
  const sorted = messages.sort((m1, m2) => m2.when - m1.when);
  return sorted.length ? sorted[0] : null;
};

export default api;