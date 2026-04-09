import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SqlDb } from '../../../../src/infrastructure/db/operations.js';

// ── Mock DB ──────────────────────────────────────────────────

function mockDb(rows: Record<string, unknown>[] = []) {
  const execute = vi.fn().mockResolvedValue({ rows });
  return {
    db: { execute } as Partial<SqlDb> as SqlDb,
    execute,
  };
}

// ── Import adapter ───────────────────────────────────────────

const { DrizzleReviewPersistenceAdapter } =
  await import('../../../../src/adapters/drizzle/review-persistence-adapter.js');

// ── Tests ────────────────────────────────────────────────────

describe('DrizzleReviewPersistenceAdapter.getWeakAreas', () => {
  let mocks: ReturnType<typeof mockDb>;
  let adapter: InstanceType<typeof DrizzleReviewPersistenceAdapter>;

  beforeEach(() => {
    vi.restoreAllMocks();
    mocks = mockDb();
    adapter = new DrizzleReviewPersistenceAdapter(mocks.db);
  });

  it('calls db.execute with a SQL query when no options provided', async () => {
    await adapter.getWeakAreas();
    expect(mocks.execute).toHaveBeenCalledTimes(1);
  });

  it('returns empty array when DB returns no rows', async () => {
    const result = await adapter.getWeakAreas();
    expect(result).toEqual([]);
  });

  it('maps raw rows to WeakAreaResult shape with camelCase fields', async () => {
    mocks = mockDb([
      {
        chunk_id: 'c-1',
        chunk_title: 'Gray Code Connection',
        topic_title: 'LC 1611',
        low_count: '2',
        recent_attempts: '3',
        avg_recent_quality: 1.67,
      },
    ]);
    adapter = new DrizzleReviewPersistenceAdapter(mocks.db);

    const result = await adapter.getWeakAreas();

    expect(result).toEqual([
      {
        chunkId: 'c-1',
        chunkTitle: 'Gray Code Connection',
        topicTitle: 'LC 1611',
        lowCount: 2,
        recentAttempts: 3,
        avgRecentQuality: 1.67,
      },
    ]);
  });

  it('maps multiple rows correctly', async () => {
    mocks = mockDb([
      {
        chunk_id: 'c-1',
        chunk_title: 'Chunk A',
        topic_title: 'Topic 1',
        low_count: '2',
        recent_attempts: '3',
        avg_recent_quality: 1.5,
      },
      {
        chunk_id: 'c-2',
        chunk_title: 'Chunk B',
        topic_title: 'Topic 2',
        low_count: '3',
        recent_attempts: '3',
        avg_recent_quality: 1.0,
      },
    ]);
    adapter = new DrizzleReviewPersistenceAdapter(mocks.db);

    const result = await adapter.getWeakAreas();

    expect(result).toHaveLength(2);
    expect(result[0].chunkId).toBe('c-1');
    expect(result[1].chunkId).toBe('c-2');
  });

  it('passes custom options to the SQL query', async () => {
    await adapter.getWeakAreas({
      qualityThreshold: 3,
      minLowCount: 1,
      lookbackCount: 5,
      limit: 10,
    });

    expect(mocks.execute).toHaveBeenCalledTimes(1);
    // Verify the SQL object was passed (Drizzle sql tagged template produces a SQL object)
    const sqlArg = mocks.execute.mock.calls[0][0];
    expect(sqlArg).toBeDefined();
  });

  it('throws ZodError when a required column is missing', async () => {
    mocks = mockDb([
      {
        chunk_id: 'c-1',
        chunk_title: 'Test',
        // topic_title is missing
        low_count: '2',
        recent_attempts: '3',
        avg_recent_quality: 1.5,
      },
    ]);
    adapter = new DrizzleReviewPersistenceAdapter(mocks.db);

    await expect(adapter.getWeakAreas()).rejects.toThrow();
  });

  it('throws ZodError when a column has wrong type', async () => {
    mocks = mockDb([
      {
        chunk_id: 123, // should be string
        chunk_title: 'Test',
        topic_title: 'Topic',
        low_count: '2',
        recent_attempts: '3',
        avg_recent_quality: 1.5,
      },
    ]);
    adapter = new DrizzleReviewPersistenceAdapter(mocks.db);

    await expect(adapter.getWeakAreas()).rejects.toThrow();
  });

  it('converts string numeric values from raw rows to numbers', async () => {
    mocks = mockDb([
      {
        chunk_id: 'c-1',
        chunk_title: 'Test',
        topic_title: 'Topic',
        low_count: '5',
        recent_attempts: '7',
        avg_recent_quality: '2.33',
      },
    ]);
    adapter = new DrizzleReviewPersistenceAdapter(mocks.db);

    const result = await adapter.getWeakAreas();

    expect(typeof result[0].lowCount).toBe('number');
    expect(typeof result[0].recentAttempts).toBe('number');
    expect(typeof result[0].avgRecentQuality).toBe('number');
    expect(result[0].lowCount).toBe(5);
    expect(result[0].recentAttempts).toBe(7);
    expect(result[0].avgRecentQuality).toBeCloseTo(2.33);
  });
});
