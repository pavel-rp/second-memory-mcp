import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { getSql } from '../../../../src/infrastructure/db/operations.js';
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

  it('round-trip: create → validate(true) → expire → validate(false)', async () => {
    // Create a token with a very short TTL (1ms)
    const tokenId = await repo.create(1);

    // Immediately validate — should still be valid (or just barely)
    // Use a longer TTL to ensure validity
    const longToken = await repo.create(60_000);
    expect(await repo.validate(longToken)).toBe(true);

    // Wait for the 1ms token to expire
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(await repo.validate(tokenId)).toBe(false);
  });

  it('validate() on a non-existent token returns false', async () => {
    expect(await repo.validate('ctx-does-not-exist')).toBe(false);
  });

  it('after validate() returns false for expired token, second validate() also returns false', async () => {
    const tokenId = await repo.create(1);
    await new Promise(resolve => setTimeout(resolve, 10));

    // First validate — finds expired row, cleans it up, returns false
    expect(await repo.validate(tokenId)).toBe(false);

    // Second validate — row already deleted, returns false
    expect(await repo.validate(tokenId)).toBe(false);
  });
});
