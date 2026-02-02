const path = require("path");
const fs = require("fs");

module.exports = async function globalTeardown() {
  const file = path.join(__dirname, "..", ".test-mongo-uri");
  try {
    fs.unlinkSync(file);
  } catch (_) {}
};
