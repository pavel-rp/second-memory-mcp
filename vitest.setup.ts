import crypto from "node:crypto";
import path from "node:path";

// CRITICAL: Ensure tests NEVER use production database
// Set SM_DB_PATH to a unique temp file for EVERY test run
if (!process.env.SM_DB_PATH || process.env.SM_DB_PATH.includes("second-memory.db")) {
	process.env.SM_DB_PATH = path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}
