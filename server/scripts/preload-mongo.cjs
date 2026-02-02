"use strict";

/**
 * Pre-download and cache the MongoDB binary used by mongodb-memory-server.
 * Run this once before npm test on CI so the first test run doesn't hang for 10–20 min
 * with no output. Uses the same MongoMemoryReplSet so the cache is warm for Jest.
 */
const { MongoMemoryReplSet } = require("mongodb-memory-server");

async function main() {
  console.log("Preloading MongoDB binary (first run on this agent may take 5–15 min)...");
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await replSet.getUri();
  await replSet.stop();
  console.log("MongoDB binary ready. Cache will be used by tests.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
