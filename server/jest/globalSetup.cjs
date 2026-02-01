const { MongoMemoryReplSet } = require("mongodb-memory-server");
const path = require("path");
const fs = require("fs");

let replSet;

module.exports = async function globalSetup() {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  });
  const uri = replSet.getUri();
  const file = path.join(__dirname, "..", ".test-mongo-uri");
  fs.writeFileSync(file, uri, "utf8");
  global.__MONGO_REPL_SET__ = replSet;
};
