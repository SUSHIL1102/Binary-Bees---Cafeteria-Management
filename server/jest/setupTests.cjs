const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const uriFile = path.join(__dirname, "..", ".test-mongo-uri");
const TEST_DB_NAME = "cafeteria_test";
if (fs.existsSync(uriFile)) {
  let uri = fs.readFileSync(uriFile, "utf8").trim();
  if (uri.includes("?")) {
    uri = uri.replace("/?", `/${TEST_DB_NAME}?`);
  } else {
    uri = uri.replace(/\/?$/, "") + "/" + TEST_DB_NAME;
  }
  process.env.DATABASE_URL = uri;
  execSync("npx prisma db push --accept-data-loss", {
    env: { ...process.env, DATABASE_URL: uri },
    cwd: path.join(__dirname, ".."),
    stdio: "pipe",
  });
}
