import { sql } from 'drizzle-orm';
import { extractExecuteRows, getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import type {
  Tier2BlockingStatsRepository,
  Tier2WeeklyBlockingCounts,
} from '../../ports/tier2-blocking-stats.js';

/**
 * Drizzle adapter for the NEU-621 circuit-breaker stats query. Reads
 * `infrastructure.operation_event_log` directly with a single grouped query
 * so the breaker pays one round-trip per cache window (default 60 s).
 */
export class DrizzleTier2BlockingStatsRepository implements Tier2BlockingStatsRepository {
  constructor(private db: SqlDb = getSql()) {}

  async getWeeklyBlockingCounts(): Promise<Tier2WeeklyBlockingCounts[]> {
    // Bucket each event by an integer "weeks-ago" offset relative to NOW().
    // The current week is offset 0; the four prior 7-day windows are offsets
    // 1-4. The query filters to the five-week range, so any FLOOR > 4 is
    // pre-excluded by the WHERE clause.
    type RawRow = { field: string; week_offset: number; event_count: number };
    const result = await this.db.execute<RawRow>(sql`
      SELECT
        data->>'field' AS field,
        FLOOR(EXTRACT(EPOCH FROM (NOW() - "timestamp")) / (7 * 86400))::int AS week_offset,
        COUNT(*)::int AS event_count
      FROM infrastructure.operation_event_log
      WHERE event = 'classifier.tier2_blocked'
        AND "timestamp" >= NOW() - INTERVAL '5 weeks'
        AND data->>'field' IS NOT NULL
      GROUP BY data->>'field', FLOOR(EXTRACT(EPOCH FROM (NOW() - "timestamp")) / (7 * 86400))
    `);
    const rows = extractExecuteRows<RawRow>(result);

    const byField = new Map<string, { current: number; priors: number[] }>();
    for (const row of rows) {
      const field = row.field;
      const offset = row.week_offset;
      const count = row.event_count;
      if (offset < 0 || offset > 4) continue;
      let entry = byField.get(field);
      if (entry === undefined) {
        entry = { current: 0, priors: [0, 0, 0, 0] };
        byField.set(field, entry);
      }
      if (offset === 0) {
        entry.current = count;
      } else {
        // offset 1 → priors index 3 (most recent prior), offset 4 → priors index 0 (oldest).
        entry.priors[4 - offset] = count;
      }
    }

    const out: Tier2WeeklyBlockingCounts[] = [];
    for (const [field, value] of byField.entries()) {
      out.push({
        field,
        currentWeekCount: value.current,
        priorWeeksCounts: value.priors,
      });
    }
    return out;
  }
}
