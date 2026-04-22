import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SqlDb } from '../../../../src/infrastructure/db/operations.js';
import { DrizzleChunkRepository } from '../../../../src/adapters/drizzle/chunk-repository.js';

function makeUpdateMock(rowCount: number | undefined) {
  const where = vi.fn().mockResolvedValue({ rowCount });
  const set = vi.fn().mockReturnValue({ where });
  const update = vi.fn().mockReturnValue({ set });
  const db = { update } as Partial<SqlDb> as SqlDb;
  return { db, update, set, where };
}

describe('DrizzleChunkRepository.writeValidatorReport — nullish rowCount fallback', () => {
  let mocks: ReturnType<typeof makeUpdateMock>;
  let repo: DrizzleChunkRepository;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 0 when driver reports undefined rowCount', async () => {
    mocks = makeUpdateMock(undefined);
    repo = new DrizzleChunkRepository(mocks.db);
    const result = await repo.writeValidatorReport('c-1', {
      updated_at: '2026-04-22T12:00:00.000Z',
    });
    expect(result).toBe(0);
  });
});

describe('DrizzleChunkRepository.mergeValidatorReport — nullish rowCount fallback', () => {
  let mocks: ReturnType<typeof makeUpdateMock>;
  let repo: DrizzleChunkRepository;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 0 when driver reports undefined rowCount', async () => {
    mocks = makeUpdateMock(undefined);
    repo = new DrizzleChunkRepository(mocks.db);
    const result = await repo.mergeValidatorReport(
      'c-1',
      { tier2: { score: 1 } },
      '2026-04-22T12:00:00.000Z'
    );
    expect(result).toBe(0);
  });
});
