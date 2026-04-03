/**
 * Run: node scripts/hash-password.mjs yourpassword
 * Then set ADMIN_PASSWORD_HASH=<output> in your .env file.
 */
import crypto from "crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const derived = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex");
console.log(`${salt}:${derived}`);
