"use strict";

/**
 * CI-only: Start in-memory MongoDB, run prisma db push, write URI to file, then keep
 * process alive so Jest can connect to the same MongoDB (avoids prisma db push hanging
 * when run from Jest's worker process). Run in background before npm test.
 */
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const { MongoMemoryReplSet } = require("mongodb-memory-server");

const TEST_DB_NAME = "cafeteria_test";

async function main() {
  if (process.env.CI !== "true") {
    console.log("Preloading MongoDB binary (cache only)...");
    const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    await replSet.getUri();
    await replSet.stop();
    console.log("MongoDB binary ready.");
    return;
  }

  console.log("[preload] Starting in-memory MongoDB...");
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = await replSet.getUri();
  let dbUri = typeof uri === "string" && uri.includes("?")
    ? uri.replace("/?", `/${TEST_DB_NAME}?`)
    : uri.replace(/\/?$/, "") + "/" + TEST_DB_NAME;
  dbUri += dbUri.includes("?") ? "&" : "?";
  dbUri += "directConnection=true&serverSelectionTimeoutMS=20000";

  // Write URI file *before* prisma db push so Jenkins finds it even if prisma hangs
  const outFile =
    process.env.WORKSPACE && process.env.CI
      ? path.join(process.env.WORKSPACE, "server", ".test-mongo-uri")
      : path.join(process.cwd(), ".test-mongo-uri");
  fs.writeFileSync(outFile, dbUri, "utf8");
  console.log("[preload] URI written to", outFile);

  console.log("[preload] Waiting 15s for replica set...");
  await new Promise((r) => setTimeout(r, 15000));

  console.log("[preload] Running prisma db push (timeout 90s)...");
  const serverDir = path.join(__dirname, "..");
  try {
    execSync("npx prisma db push --accept-data-loss", {
      env: { ...process.env, DATABASE_URL: dbUri },
      cwd: serverDir,
      stdio: "inherit",
      timeout: 90000,
    });
  } catch (err) {
    console.error("[preload] prisma db push failed:", err.message);
    process.exit(1);
  }

  console.log("[preload] Keeping MongoDB running for tests...");

  // Keep process alive so MongoDB stays up; Jenkins will kill this after npm test
  await new Promise(() => {});
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
