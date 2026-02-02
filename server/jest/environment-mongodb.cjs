"use strict";

const NodeEnvironment = require("jest-environment-node").TestEnvironment;
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const TEST_DB_NAME = "cafeteria_test";
const uriFile = path.join(__dirname, "..", ".test-mongo-uri");

/**
 * Custom Jest environment. In CI, if .test-mongo-uri exists (written by preload script),
 * use it and skip starting MongoDB / prisma db push. Otherwise start in-memory MongoDB
 * in this worker and run prisma db push (local dev).
 */
class MongoEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();
    if (global.__JEST_MONGO_URI__) {
      process.env.DATABASE_URL = global.__JEST_MONGO_URI__;
      return;
    }
    // CI: preload script started MongoDB and wrote URI; use it so we don't run prisma db push (which hangs from Jest).
    if (process.env.CI === "true" && fs.existsSync(uriFile)) {
      const uri = fs.readFileSync(uriFile, "utf8").trim();
      process.env.DATABASE_URL = uri;
      process.stdout.write("[Jest env] Using MongoDB from preload (CI).\n");
      return;
    }
    process.stdout.write("[Jest env] Starting in-memory MongoDB...\n");
    const { MongoMemoryReplSet } = require("mongodb-memory-server");
    const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = await replSet.getUri();
    let dbUri = typeof uri === "string" && uri.includes("?")
      ? uri.replace("/?", `/${TEST_DB_NAME}?`)
      : uri.replace(/\/?$/, "") + "/" + TEST_DB_NAME;
    dbUri += dbUri.includes("?") ? "&" : "?";
    dbUri += "directConnection=true&serverSelectionTimeoutMS=20000";
    fs.writeFileSync(uriFile, dbUri, "utf8");
    global.__JEST_MONGO_URI__ = dbUri;
    this.global.__MONGO_REPL_SET__ = replSet;
    process.env.DATABASE_URL = dbUri;
    const waitMs = process.env.CI === "true" ? 15000 : 3000;
    process.stdout.write(`[Jest env] Waiting ${waitMs / 1000}s for replica set...\n`);
    await new Promise((r) => setTimeout(r, waitMs));
    const serverDir = path.join(__dirname, "..");
    process.stdout.write("[Jest env] Running prisma db push (timeout 90s)...\n");
    try {
      execSync("npx prisma db push --accept-data-loss", {
        env: { ...process.env, DATABASE_URL: dbUri },
        cwd: serverDir,
        stdio: "inherit",
        timeout: 90000,
      });
    } catch (err) {
      process.stdout.write(`[Jest env] prisma db push failed: ${err.message}\n`);
      throw err;
    }
    process.stdout.write("[Jest env] Setup done.\n");
  }
}

module.exports = MongoEnvironment;
