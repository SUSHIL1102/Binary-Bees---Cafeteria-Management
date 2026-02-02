const path = require("path");
const fs = require("fs");

const uriFile = path.join(__dirname, "..", ".test-mongo-uri");
if (fs.existsSync(uriFile)) {
  const uri = fs.readFileSync(uriFile, "utf8").trim();
  process.env.DATABASE_URL = uri;
}
