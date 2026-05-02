/**
 * Port interface for the Tier 2 circuit-breaker (NEU-621).
 *
 * Reads `classifier.tier2_blocked` rows from
 * `infrastructure.operation_event_log` and reduces them into per-field weekly
 * counts. The breaker uses these counts to detect when a field's recent
 * rejection rate has spiked above the rolling-mean + 2σ threshold and should
 * be auto-disabled in process memory.
 *
 * This port intentionally returns aggregated weekly bins rather than raw
 * events — the orchestration layer must not know about timestamps or
 * grouping windows. Implementations live in the Drizzle adapter; the breaker
 * itself is pure logic.
 */
import type { PersistedTier2FieldName } from '../shared/prompts/classifier-prompts.js';

export type Tier2WeeklyBlockingCounts = {
  /** Snake-case verdict-field name (matches keys in `validator_report.tier2`). */
  field: PersistedTier2FieldName;
  /** Block events in the last 7 days. */
  currentWeekCount: number;
  /**
   * Block events in the four 7-day windows before the current week. Index 0
   * is the oldest bucket (28-21 days ago), index 3 is the newest prior bucket
   * (14-7 days ago). Length is always 4; weeks with no events are reported
   * as `0` rather than omitted so the rolling mean and σ have a stable
   * sample size.
   */
  priorWeeksCounts: number[];
};

export interface Tier2BlockingStatsRepository {
  /**
   * Return the weekly block-event histogram per field over the last five
   * 7-day windows. Result includes only fields that have at least one event
   * in the five-week window — fields with zero events are absent (the
   * breaker treats absence as "no signal," equivalent to an all-zero bucket).
   */
  getWeeklyBlockingCounts(): Promise<Tier2WeeklyBlockingCounts[]>;
}
