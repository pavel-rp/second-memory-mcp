import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import { contextTokens } from '../../infrastructure/db/schema.js';
import type { ContextTokenRepository } from '../../ports/context-token-repository.js';

export class DrizzleContextTokenRepository implements ContextTokenRepository {
  constructor(private db: SqlDb = getSql()) {}

  async create(ttlMs: number): Promise<string> {
    const id = `ctx-${crypto.randomUUID()}`;
    const createdAt = Date.now();
    const expiresAt = createdAt + ttlMs;
    await this.db.insert(contextTokens).values({ id, createdAt, expiresAt });
    return id;
  }

  async validate(token: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: contextTokens.id, expiresAt: contextTokens.expiresAt })
      .from(contextTokens)
      .where(eq(contextTokens.id, token));

    if (rows.length === 0) return false;

    if (rows[0].expiresAt <= Date.now()) {
      await this.cleanup(token);
      return false;
    }

    return true;
  }

  async cleanup(token: string): Promise<void> {
    await this.db.delete(contextTokens).where(eq(contextTokens.id, token));
  }
}
