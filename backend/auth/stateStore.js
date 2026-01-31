const store = new Map();

function save(state, nonce) {
  store.set(state, nonce);
}

function validate(state) {
  return store.has(state);
}

function remove(state) {
  store.delete(state);
}

module.exports = { save, validate, remove };
