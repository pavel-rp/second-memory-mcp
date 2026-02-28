import { describe, it, expect, beforeAll, beforeEach, afterAll, vi, afterEach } from 'vitest';
import { getPool, resetDatabase, clearAllTables } from '../../../src/infrastructure/db/client.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

describe('db/client', () => {
  describe('getPool', () => {
    beforeAll(setupTestDb);
    afterAll(teardownTestDb);

    it('returns a pg.Pool instance', () => {
      const pool = getPool();
      expect(pool).toBeDefined();
      expect(typeof pool.query).toBe('function');
    });

    it('returns the same instance on subsequent calls (singleton)', () => {
      const pool1 = getPool();
      const pool2 = getPool();
      expect(pool1).toBe(pool2);
    });
  });

  describe('resetDatabase', () => {
    beforeAll(setupTestDb);

    it('resets pool so next getPool creates a new instance', async () => {
      const pool1 = getPool();
      await resetDatabase();
      const pool2 = getPool();
      expect(pool1).not.toBe(pool2);
    });

    afterAll(teardownTestDb);
  });

  describe('clearAllTables', () => {
    beforeAll(setupTestDb);
    beforeEach(cleanupTestDb);
    afterAll(teardownTestDb);

    it('runs without error in test environment', async () => {
      await expect(clearAllTables()).resolves.toBeUndefined();
    });
  });

  describe('getDatabaseUrl validation', () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
      process.env = { ...originalEnv };
      vi.resetModules();
    });

    it('throws when DATABASE_URL is missing', async () => {
      delete process.env.DATABASE_URL;
      vi.resetModules();
      const mod = await import('../../../src/infrastructure/db/client.js');
      // Reset the pool so it tries to create a new one with no URL
      await mod.resetDatabase();
      expect(() => mod.getPool()).toThrow('DATABASE_URL environment variable is required');
    });

    it('throws when DATABASE_URL is empty string', async () => {
      process.env.DATABASE_URL = '';
      vi.resetModules();
      const mod = await import('../../../src/infrastructure/db/client.js');
      await mod.resetDatabase();
      expect(() => mod.getPool()).toThrow('DATABASE_URL environment variable is required');
    });

    it('throws when DATABASE_URL is whitespace only', async () => {
      process.env.DATABASE_URL = '   ';
      vi.resetModules();
      const mod = await import('../../../src/infrastructure/db/client.js');
      await mod.resetDatabase();
      expect(() => mod.getPool()).toThrow('DATABASE_URL environment variable is required');
    });

    it('throws in test env when database name lacks _test', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/production_db';
      process.env.NODE_ENV = 'test';
      vi.resetModules();
      const mod = await import('../../../src/infrastructure/db/client.js');
      await mod.resetDatabase();
      expect(() => mod.getPool()).toThrow("does not contain '_test'");
    });
  });
});
