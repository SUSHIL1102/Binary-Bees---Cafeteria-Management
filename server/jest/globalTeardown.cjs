const path = require("path");
const fs = require("fs");

module.exports = async function globalTeardown() {
  await new Promise((r) => setTimeout(r, 1500));
  const replSet = global.__MONGO_REPL_SET__;
  if (replSet) {
    await replSet.stop();
  }
  const file = path.join(__dirname, "..", ".test-mongo-uri");
  try {
    fs.unlinkSync(file);
  } catch (_) {}
};
