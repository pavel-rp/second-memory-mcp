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

  const db = { insert, select, delete: deleteFn } as Partial<SqlDb> as SqlDb;

  return { db, insert, insertValues, select, selectFrom, selectWhere, deleteFn, deleteWhere };
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

    it('returns false for an expired token and triggers cleanup', async () => {
      const now = 1700000000000;
      vi.spyOn(Date, 'now').mockReturnValue(now);
      mocks.selectWhere.mockResolvedValueOnce([{ id: 'ctx-expired', expiresAt: now - 1 }]);

      const result = await repo.validate('ctx-expired');

      expect(result).toBe(false);
      expect(mocks.deleteFn).toHaveBeenCalled();
    });
  });

  describe('cleanup()', () => {
    it('deletes the row from the database', async () => {
      await repo.cleanup('ctx-delete-me');
      expect(mocks.deleteFn).toHaveBeenCalled();
      expect(mocks.deleteWhere).toHaveBeenCalled();
    });
  });
});
