import crypto from 'node:crypto';
import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { getSql } from '../../../../src/infrastructure/db/operations.js';
import { contextTokens } from '../../../../src/infrastructure/db/schema.js';
import { DrizzleContextTokenRepository } from '../../../../src/adapters/drizzle/context-token-repository.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../../helpers/db-setup.js';

describe('DrizzleContextTokenRepository (integration)', () => {
  let repo: DrizzleContextTokenRepository;

  beforeAll(async () => {
    await setupTestDb();
    repo = new DrizzleContextTokenRepository(getSql());
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it('validates non-expired tokens as true and expired tokens as false', async () => {
    // Insert an already-expired row directly to avoid wall-clock dependency
    const now = Date.now();
    const expiredId = `ctx-${crypto.randomUUID()}`;
    await getSql()
      .insert(contextTokens)
      .values({
        id: expiredId,
        createdAt: now - 2000,
        expiresAt: now - 1000,
      });

    const longToken = await repo.create(60_000);
    expect(await repo.validate(longToken)).toBe(true);
    expect(await repo.validate(expiredId)).toBe(false);
  });

  it('validate() on a non-existent token returns false', async () => {
    expect(await repo.validate('ctx-does-not-exist')).toBe(false);
  });

  it('after validate() returns false for expired token, second validate() also returns false', async () => {
    const now = Date.now();
    const expiredId = `ctx-${crypto.randomUUID()}`;
    await getSql()
      .insert(contextTokens)
      .values({
        id: expiredId,
        createdAt: now - 2000,
        expiresAt: now - 1000,
      });

    // First validate — finds expired row, cleans it up, returns false
    expect(await repo.validate(expiredId)).toBe(false);

    // Second validate — row already deleted, returns false
    expect(await repo.validate(expiredId)).toBe(false);
  });

  it('deleteExpired() removes only rows with expiresAt before the given timestamp', async () => {
    const now = Date.now();
    const expiredId = `ctx-${crypto.randomUUID()}`;
    await getSql()
      .insert(contextTokens)
      .values({
        id: expiredId,
        createdAt: now - 2000,
        expiresAt: now - 1000,
      });
    const validToken = await repo.create(60_000);

    const deleted = await repo.deleteExpired(now);

    expect(deleted).toBe(1);
    expect(await repo.validate(validToken)).toBe(true);
    expect(await repo.validate(expiredId)).toBe(false);
  });
});
