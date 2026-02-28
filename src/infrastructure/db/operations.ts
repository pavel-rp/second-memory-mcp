import { drizzle } from 'drizzle-orm/node-postgres';
import { getPool } from './client.js';

// Drizzle DB singleton
let drizzleDb: ReturnType<typeof drizzle> | undefined;
function getDrizzle() {
  if (!drizzleDb) {
    drizzleDb = drizzle(getPool());
  }
  return drizzleDb;
}

export function resetDrizzle(): void {
  drizzleDb = undefined;
}

// Transaction helper
export type SqlDb = ReturnType<typeof drizzle>;
export type SqlTx = Parameters<Parameters<SqlDb['transaction']>[0]>[0];

export async function withTx<T>(fn: (tx: SqlTx) => Promise<T>): Promise<T> {
  const db = getDrizzle();
  return db.transaction(async tx => fn(tx));
}

// Bulk insert helper (chunked)
export async function bulkInsert<Row>(
  rows: Row[],
  insertChunk: (chunk: Row[]) => Promise<unknown> | unknown,
  chunkSize: number = 500
): Promise<void> {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await insertChunk(chunk);
  }
}

// Expose drizzle accessor for services
export function getSql() {
  return getDrizzle();
}
