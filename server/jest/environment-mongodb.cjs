"use strict";

const NodeEnvironment = require("jest-environment-node").TestEnvironment;
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const TEST_DB_NAME = "cafeteria_test";
const uriFile = path.join(__dirname, "..", ".test-mongo-uri");

/**
 * Custom Jest environment that starts in-memory MongoDB in the test worker
 * so it stays alive for the whole run. With maxWorkers: 1, one worker runs
 * all test files; the first setup() starts MongoDB and runs prisma db push,
 * later setup() calls just set DATABASE_URL from the file.
 */
class MongoEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();
    if (fs.existsSync(uriFile)) {
      const uri = fs.readFileSync(uriFile, "utf8").trim();
      process.env.DATABASE_URL = uri;
      return;
    }
    const { MongoMemoryReplSet } = require("mongodb-memory-server");
    const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = replSet.getUri();
    let dbUri = uri.includes("?")
      ? uri.replace("/?", `/${TEST_DB_NAME}?`)
      : uri.replace(/\/?$/, "") + "/" + TEST_DB_NAME;
    dbUri += dbUri.includes("?") ? "&" : "?";
    dbUri += "serverSelectionTimeoutMS=20000";
    fs.writeFileSync(uriFile, dbUri, "utf8");
    this.global.__MONGO_REPL_SET__ = replSet;
    process.env.DATABASE_URL = dbUri;
    // Replica set needs time to elect primary (especially on CI). Wait before prisma db push.
    const waitMs = process.env.CI === "true" ? 8000 : 3000;
    await new Promise((r) => setTimeout(r, waitMs));
    const serverDir = path.join(__dirname, "..");
    execSync("npx prisma db push --accept-data-loss", {
      env: { ...process.env, DATABASE_URL: dbUri },
      cwd: serverDir,
      stdio: "pipe",
    });
  }
}

module.exports = MongoEnvironment;
