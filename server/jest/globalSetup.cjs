const { MongoMemoryReplSet } = require("mongodb-memory-server");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const TEST_DB_NAME = "cafeteria_test";

let replSet;

module.exports = async function globalSetup() {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  });
  const uri = replSet.getUri();
  const dbUri = uri.includes("?") ? uri.replace("/?", `/${TEST_DB_NAME}?`) : uri.replace(/\/?$/, "") + "/" + TEST_DB_NAME;
  const file = path.join(__dirname, "..", ".test-mongo-uri");
  fs.writeFileSync(file, dbUri, "utf8");
  global.__MONGO_REPL_SET__ = replSet;

  // Give replica set time to elect primary (CI can be slow).
  await new Promise((r) => setTimeout(r, 3000));

  const serverDir = path.join(__dirname, "..");
  execSync("npx prisma db push --accept-data-loss", {
    env: { ...process.env, DATABASE_URL: dbUri },
    cwd: serverDir,
    stdio: "pipe",
  });
};
