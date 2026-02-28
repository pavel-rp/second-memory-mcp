import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getSql, resetDrizzle, withTx, bulkInsert } from '../../src/db/operations.js';
import { learningTopics } from '../../src/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../helpers/db-setup.js';

describe('db/operations', () => {
  beforeAll(setupTestDb);
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  describe('getSql', () => {
    it('returns a drizzle instance', () => {
      const db = getSql();
      expect(db).toBeDefined();
      expect(typeof db.select).toBe('function');
    });

    it('returns the same instance on subsequent calls', () => {
      const db1 = getSql();
      const db2 = getSql();
      expect(db1).toBe(db2);
    });
  });

  describe('resetDrizzle', () => {
    it('forces creation of a new instance', () => {
      const db1 = getSql();
      resetDrizzle();
      const db2 = getSql();
      expect(db1).not.toBe(db2);
    });
  });

  describe('withTx', () => {
    it('executes callback within a transaction and returns result', async () => {
      const now = Date.now();
      const result = await withTx(async tx => {
        await tx.insert(learningTopics).values({
          id: 'tx-test-1',
          title: 'TX Test',
          subject: 'Testing',
          createdAt: now,
          updatedAt: now,
        });
        return 'done';
      });
      expect(result).toBe('done');

      // Verify the insert persisted
      const db = getSql();
      const rows = await db.select().from(learningTopics);
      expect(rows.length).toBe(1);
      expect(rows[0].id).toBe('tx-test-1');
    });

    it('rolls back on error', async () => {
      const now = Date.now();
      await expect(
        withTx(async tx => {
          await tx.insert(learningTopics).values({
            id: 'tx-rollback-1',
            title: 'Will Rollback',
            subject: 'Testing',
            createdAt: now,
            updatedAt: now,
          });
          throw new Error('forced rollback');
        })
      ).rejects.toThrow('forced rollback');

      // Verify the insert was rolled back
      const db = getSql();
      const rows = await db.select().from(learningTopics);
      expect(rows.length).toBe(0);
    });
  });

  describe('bulkInsert', () => {
    it('handles empty array', async () => {
      const calls: number[][] = [];
      await bulkInsert([], (chunk: number[]) => {
        calls.push(chunk);
      });
      expect(calls.length).toBe(0);
    });

    it('inserts single chunk when rows < chunkSize', async () => {
      const calls: number[][] = [];
      await bulkInsert(
        [1, 2, 3],
        (chunk: number[]) => {
          calls.push(chunk);
        },
        10
      );
      expect(calls.length).toBe(1);
      expect(calls[0]).toEqual([1, 2, 3]);
    });

    it('splits into multiple chunks', async () => {
      const calls: number[][] = [];
      await bulkInsert(
        [1, 2, 3, 4, 5],
        (chunk: number[]) => {
          calls.push(chunk);
        },
        2
      );
      expect(calls.length).toBe(3);
      expect(calls[0]).toEqual([1, 2]);
      expect(calls[1]).toEqual([3, 4]);
      expect(calls[2]).toEqual([5]);
    });

    it('handles exact chunkSize boundary', async () => {
      const calls: number[][] = [];
      await bulkInsert(
        [1, 2, 3, 4],
        (chunk: number[]) => {
          calls.push(chunk);
        },
        2
      );
      expect(calls.length).toBe(2);
      expect(calls[0]).toEqual([1, 2]);
      expect(calls[1]).toEqual([3, 4]);
    });
  });
});
