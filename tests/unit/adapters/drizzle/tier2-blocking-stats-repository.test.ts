import { describe, it, expect, vi } from 'vitest';
import type { SqlDb } from '../../../../src/infrastructure/db/operations.js';
import { DrizzleTier2BlockingStatsRepository } from '../../../../src/adapters/drizzle/tier2-blocking-stats-repository.js';

type RawRow = { field: string; week_offset: number; event_count: number };

function makeDb(executeResult: unknown): { db: SqlDb; execute: ReturnType<typeof vi.fn> } {
  const execute = vi.fn().mockResolvedValue(executeResult);
  const db = { execute } as Partial<SqlDb> as SqlDb;
  return { db, execute };
}

describe('DrizzleTier2BlockingStatsRepository.getWeeklyBlockingCounts', () => {
  it('aggregates rows into per-field current/prior buckets indexed oldest-first', async () => {
    // offset 0 → currentWeekCount; offset 1..4 → priors[3..0].
    const rows: RawRow[] = [
      { field: 'rendering_clarity', week_offset: 0, event_count: 12 },
      { field: 'rendering_clarity', week_offset: 1, event_count: 4 },
      { field: 'rendering_clarity', week_offset: 4, event_count: 1 },
      { field: 'overall_fit', week_offset: 0, event_count: 3 },
    ];
    const { db } = makeDb({ rows });
    const repo = new DrizzleTier2BlockingStatsRepository(db);

    const result = await repo.getWeeklyBlockingCounts();

    expect(result).toHaveLength(2);
    const rendering = result.find(r => r.field === 'rendering_clarity');
    expect(rendering).toEqual({
      field: 'rendering_clarity',
      currentWeekCount: 12,
      // offset 1 → priors[3], offset 4 → priors[0].
      priorWeeksCounts: [1, 0, 0, 4],
    });
    const overall = result.find(r => r.field === 'overall_fit');
    expect(overall).toEqual({
      field: 'overall_fit',
      currentWeekCount: 3,
      priorWeeksCounts: [0, 0, 0, 0],
    });
  });

  it('skips rows with offsets outside the 0..4 window (defensive)', async () => {
    // The query filters to the 5-week range, but the adapter still rejects
    // any row whose offset falls outside that range.
    const rows: RawRow[] = [
      { field: 'rendering_clarity', week_offset: -1, event_count: 999 },
      { field: 'rendering_clarity', week_offset: 5, event_count: 999 },
      { field: 'rendering_clarity', week_offset: 0, event_count: 7 },
    ];
    const { db } = makeDb({ rows });
    const repo = new DrizzleTier2BlockingStatsRepository(db);

    const result = await repo.getWeeklyBlockingCounts();

    expect(result).toHaveLength(1);
    expect(result[0].currentWeekCount).toBe(7);
    expect(result[0].priorWeeksCounts).toEqual([0, 0, 0, 0]);
  });

  it('returns an empty array when no events match the query', async () => {
    const { db } = makeDb({ rows: [] });
    const repo = new DrizzleTier2BlockingStatsRepository(db);

    const result = await repo.getWeeklyBlockingCounts();

    expect(result).toEqual([]);
  });

  it('handles bare-array execute result shape (older Drizzle adapters)', async () => {
    // Pre-`{ rows: [...] }` shape — the typed helper must still return rows.
    const rows: RawRow[] = [{ field: 'overall_fit', week_offset: 2, event_count: 5 }];
    const { db } = makeDb(rows);
    const repo = new DrizzleTier2BlockingStatsRepository(db);

    const result = await repo.getWeeklyBlockingCounts();

    expect(result).toHaveLength(1);
    expect(result[0].field).toBe('overall_fit');
    // offset 2 → priors[2].
    expect(result[0].priorWeeksCounts).toEqual([0, 0, 5, 0]);
  });

  it('returns an empty array when the execute result has no recognizable shape', async () => {
    const { db } = makeDb({ unexpected: true });
    const repo = new DrizzleTier2BlockingStatsRepository(db);

    const result = await repo.getWeeklyBlockingCounts();

    expect(result).toEqual([]);
  });
});
