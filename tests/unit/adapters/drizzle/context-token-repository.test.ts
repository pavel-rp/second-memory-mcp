import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SqlDb } from '../../../../src/infrastructure/db/operations.js';

// ── Mock chain builders ───────────────────────────────────────

function chainMock() {
  const insertValues = vi.fn().mockResolvedValue(undefined);
  const insert = vi.fn().mockReturnValue({ values: insertValues });

  const selectWhere = vi.fn().mockResolvedValue([]);
  const selectFrom = vi.fn().mockReturnValue({ where: selectWhere });
  const select = vi.fn().mockReturnValue({ from: selectFrom });

  const deleteWhere = vi.fn().mockResolvedValue({ rowCount: 1 });
  const deleteFn = vi.fn().mockReturnValue({ where: deleteWhere });

  const txFns = { insert, select, delete: deleteFn } as Partial<SqlDb> as SqlDb;
  const transaction = vi.fn().mockImplementation(function (fn: (tx: SqlDb) => Promise<unknown>) {
    return fn(txFns);
  });
  const db = { ...txFns, transaction } as Partial<SqlDb> as SqlDb;

  return {
    db,
    insert,
    insertValues,
    select,
    selectFrom,
    selectWhere,
    deleteFn,
    deleteWhere,
    transaction,
  };
}

// ── Import adapter ────────────────────────────────────────────

const { DrizzleContextTokenRepository } =
  await import('../../../../src/adapters/drizzle/context-token-repository.js');

// ── Tests ─────────────────────────────────────────────────────

describe('DrizzleContextTokenRepository', () => {
  let mocks: ReturnType<typeof chainMock>;
  let repo: InstanceType<typeof DrizzleContextTokenRepository>;

  beforeEach(() => {
    vi.restoreAllMocks();
    mocks = chainMock();
    repo = new DrizzleContextTokenRepository(mocks.db);
  });

  describe('create()', () => {
    it('returns a ctx- prefixed UUID', async () => {
      const id = await repo.create(3600_000);
      expect(id).toMatch(/^ctx-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('throws for non-positive ttlMs', async () => {
      await expect(repo.create(0)).rejects.toThrow('ttlMs must be a positive finite number');
      await expect(repo.create(-1)).rejects.toThrow('ttlMs must be a positive finite number');
    });

    it('throws for non-finite ttlMs', async () => {
      await expect(repo.create(NaN)).rejects.toThrow('ttlMs must be a positive finite number');
      await expect(repo.create(Infinity)).rejects.toThrow('ttlMs must be a positive finite number');
    });

    it('inserts a row with correct createdAt and expiresAt', async () => {
      const now = 1700000000000;
      vi.spyOn(Date, 'now').mockReturnValue(now);

      await repo.create(7200_000);

      expect(mocks.insertValues).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAt: now,
          expiresAt: now + 7200_000,
        })
      );
    });
  });

  describe('validate()', () => {
    it('returns true for a token that exists and is not expired', async () => {
      const now = 1700000000000;
      vi.spyOn(Date, 'now').mockReturnValue(now);
      mocks.selectWhere.mockResolvedValueOnce([{ id: 'ctx-abc', expiresAt: now + 60_000 }]);

      const result = await repo.validate('ctx-abc');
      expect(result).toBe(true);
    });

    it('returns false for a token that does not exist', async () => {
      mocks.selectWhere.mockResolvedValueOnce([]);

      const result = await repo.validate('ctx-missing');
      expect(result).toBe(false);
    });

    it('returns false for an expired token and triggers delete', async () => {
      const now = 1700000000000;
      vi.spyOn(Date, 'now').mockReturnValue(now);
      mocks.selectWhere.mockResolvedValueOnce([{ id: 'ctx-expired', expiresAt: now - 1 }]);

      const result = await repo.validate('ctx-expired');

      expect(result).toBe(false);
      expect(mocks.deleteFn).toHaveBeenCalledTimes(1);
      expect(mocks.deleteWhere).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete()', () => {
    it('deletes the row from the database', async () => {
      await repo.delete('ctx-delete-me');
      expect(mocks.deleteFn).toHaveBeenCalledTimes(1);
      expect(mocks.deleteWhere).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteExpired()', () => {
    it('returns the number of deleted rows', async () => {
      mocks.deleteWhere.mockResolvedValueOnce({ rowCount: 3 });

      const count = await repo.deleteExpired(1700000000000);

      expect(count).toBe(3);
      expect(mocks.deleteFn).toHaveBeenCalledTimes(1);
      expect(mocks.deleteWhere).toHaveBeenCalledTimes(1);
    });

    it('returns 0 when no rows are expired', async () => {
      mocks.deleteWhere.mockResolvedValueOnce({ rowCount: 0 });

      const count = await repo.deleteExpired(1700000000000);

      expect(count).toBe(0);
    });

    it('returns 0 when rowCount is null', async () => {
      mocks.deleteWhere.mockResolvedValueOnce({ rowCount: null });

      const count = await repo.deleteExpired(1700000000000);

      expect(count).toBe(0);
    });
  });

  describe('validateWithStatus()', () => {
    it('returns { valid: false, expired: false } when token does not exist', async () => {
      mocks.selectWhere.mockResolvedValueOnce([]);

      const result = await repo.validateWithStatus('ctx-missing');

      expect(result).toEqual({ valid: false, expired: false });
      expect(mocks.deleteFn).not.toHaveBeenCalled();
    });

    it('returns { valid: true, expired: false } when token exists and is not expired', async () => {
      const now = 1700000000000;
      vi.spyOn(Date, 'now').mockReturnValue(now);
      mocks.selectWhere.mockResolvedValueOnce([{ id: 'ctx-abc', expiresAt: now + 60_000 }]);

      const result = await repo.validateWithStatus('ctx-abc');

      expect(result).toEqual({ valid: true, expired: false });
      expect(mocks.deleteFn).not.toHaveBeenCalled();
    });

    it('returns { valid: false, expired: true } and deletes when token is expired', async () => {
      const now = 1700000000000;
      vi.spyOn(Date, 'now').mockReturnValue(now);
      mocks.selectWhere.mockResolvedValueOnce([{ id: 'ctx-old', expiresAt: now - 1 }]);

      const result = await repo.validateWithStatus('ctx-old');

      expect(result).toEqual({ valid: false, expired: true });
      expect(mocks.deleteFn).toHaveBeenCalledTimes(1);
      expect(mocks.deleteWhere).toHaveBeenCalledTimes(1);
    });

    it('returns { valid: false, expired: true } when expiresAt equals now (boundary)', async () => {
      const now = 1700000000000;
      vi.spyOn(Date, 'now').mockReturnValue(now);
      mocks.selectWhere.mockResolvedValueOnce([{ id: 'ctx-boundary', expiresAt: now }]);

      const result = await repo.validateWithStatus('ctx-boundary');

      expect(result).toEqual({ valid: false, expired: true });
      expect(mocks.deleteFn).toHaveBeenCalledTimes(1);
    });
  });
});
