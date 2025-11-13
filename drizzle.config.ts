import { defineConfig } from 'drizzle-kit';
import path from 'node:path';

const dbUrl =
  typeof process.env.SM_DB_PATH === 'string' && process.env.SM_DB_PATH.trim().length > 0
    ? path.resolve(process.env.SM_DB_PATH)
    : path.resolve('./second-memory.db');

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: dbUrl,
  },
  strict: true,
});

