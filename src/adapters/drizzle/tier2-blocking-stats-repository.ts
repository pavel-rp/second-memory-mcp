import { sql } from 'drizzle-orm';
import { extractExecuteRows, getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import type {
  Tier2BlockingStatsRepository,
  Tier2WeeklyBlockingCounts,
} from '../../ports/tier2-blocking-stats-repository.js';
import {
  PERSISTED_TIER2_FIELD_NAMES,
  type PersistedTier2FieldName,
} from '../../shared/prompts/classifier-prompts.js';
import { VERDICT_FIELDS } from '../../domain/types/classifier.js';

/**
 * Drizzle adapter for the NEU-621 circuit-breaker stats query. Reads
 * `infrastructure.operation_event_log` directly with a single grouped query
 * so the breaker pays one round-trip per cache window (default 60 s).
 *
 * NEU-672 changes:
 *   - Bucket expression evaluated once via a CTE; the outer SELECT groups on
 *     the alias instead of re-computing FLOOR(EXTRACT(...)) twice.
 *   - Unknown field names (rows with `data->>'field'` outside the known
 *     verdict-field set) are filtered at the boundary so the port can return
 *     a typed `PersistedTier2FieldName` union end-to-end.
 *   - A partial index on `(timestamp DESC) WHERE event = 'classifier.tier2_blocked'`
 *     would keep this scan selective as the event log grows. Deferred —
 *     adding it requires a Drizzle migration with a regenerated snapshot;
 *     track as a follow-up if the scan ever shows up hot.
 */
export class DrizzleTier2BlockingStatsRepository implements Tier2BlockingStatsRepository {
  constructor(private db: SqlDb = getSql()) {}

  async getWeeklyBlockingCounts(): Promise<Tier2WeeklyBlockingCounts[]> {
    type RawRow = { field: string; week_offset: number; event_count: number };
    const result = await this.db.execute<RawRow>(sql`
      WITH bucketed AS (
        SELECT
          data->>'field' AS field,
          FLOOR(EXTRACT(EPOCH FROM (NOW() - "timestamp")) / (7 * 86400))::int AS week_offset
        FROM infrastructure.operation_event_log
        WHERE event = 'classifier.tier2_blocked'
          AND "timestamp" >= NOW() - INTERVAL '5 weeks'
          AND data->>'field' IS NOT NULL
      )
      SELECT field, week_offset, COUNT(*)::int AS event_count
      FROM bucketed
      GROUP BY field, week_offset
    `);
    const rows = extractExecuteRows<RawRow>(result);

    // Allowlist of known persisted snake-case field names. Rows with anything
    // outside this set are silently dropped — they cannot map back to a
    // VerdictFieldName and shouldn't contribute to breaker math.
    const knownFields = new Set<string>(VERDICT_FIELDS.map(f => PERSISTED_TIER2_FIELD_NAMES[f]));

    const byField = new Map<PersistedTier2FieldName, { current: number; priors: number[] }>();
    for (const row of rows) {
      if (!knownFields.has(row.field)) continue;
      const field = row.field as PersistedTier2FieldName;
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
