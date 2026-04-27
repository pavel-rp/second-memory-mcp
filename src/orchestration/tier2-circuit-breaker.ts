/**
 * Tier 2 circuit-breaker (NEU-621).
 *
 * Auto-disables a Tier 2 verdict field whose recent rejection rate spikes
 * above the rolling-mean + 2σ threshold, exactly once per (process, field).
 *
 * The breaker is read-only against `infrastructure.operation_event_log`: it
 * never persists state. "Tripped" status is held in process memory only —
 * after a restart the breaker re-evaluates from scratch, which is intentional
 * (the operator's permanent disable path is removing the field from
 * `CLASSIFIER_BLOCKING_FIELDS` on the next deploy).
 *
 * Fail-open contract: any error inside the stats query leaves the input set
 * unchanged for that call. The breaker may not amplify a partial outage into
 * a creation-blocking failure.
 */

import { VERDICT_FIELDS, type VerdictFieldName } from '../domain/types/classifier.js';
import { getRequestLogger, logEvent } from '../shared/logger.js';
import { PERSISTED_TIER2_FIELD_NAMES } from '../shared/prompts/classifier-prompts.js';
import type {
  Tier2BlockingStatsRepository,
  Tier2WeeklyBlockingCounts,
} from '../ports/tier2-blocking-stats.js';
import type { Tier2CircuitBreakerHandle } from './topic-workflows.js';

/** Multiplier on σ for the trip threshold. Hardcoded per spec; not auto-tuned. */
const SIGMA_MULTIPLIER = 2;

/** Cache TTL for the stats query — caps DB load to one round-trip per minute. */
const CACHE_TTL_MS = 60_000;

type BreakerCache = {
  trippedFields: Set<VerdictFieldName>;
  computedAt: number;
};

export type Tier2CircuitBreakerDeps = {
  stats: Tier2BlockingStatsRepository;
  /** Optional clock; defaults to `Date.now`. Injected for tests. */
  now?: () => number;
};

/**
 * Build a circuit-breaker bound to a specific stats repository. The returned
 * handle keeps in-process state (cache + tripped fields), so callers should
 * create exactly one breaker per process and reuse it across requests.
 */
export function createTier2CircuitBreaker(
  deps: Tier2CircuitBreakerDeps
): Tier2CircuitBreakerHandle {
  const now = deps.now ?? ((): number => Date.now());
  // One-shot per (process, field). Persisted across cache refreshes so the
  // trip event is emitted exactly once per field per process lifetime even
  // if the field's spike continues for weeks.
  const tripped = new Set<VerdictFieldName>();
  let cache: BreakerCache | null = null;

  // Snake → camel reverse lookup for verdict-field names; computed once.
  const snakeToCamel = new Map<string, VerdictFieldName>();
  for (const field of VERDICT_FIELDS) {
    snakeToCamel.set(PERSISTED_TIER2_FIELD_NAMES[field], field);
  }

  async function recompute(): Promise<Set<VerdictFieldName>> {
    // Start from already-tripped fields. Re-checks on each refresh do not
    // re-emit the trip event for fields already known tripped.
    const out = new Set<VerdictFieldName>(tripped);
    let buckets: Tier2WeeklyBlockingCounts[];
    try {
      buckets = await deps.stats.getWeeklyBlockingCounts();
    } catch (err) {
      // Fail-open: log and return whatever we already had tripped. The caller
      // will see the unchanged set and apply it; downstream creates proceed.
      getRequestLogger().warn('Tier 2 circuit-breaker stats query failed:', err);
      return out;
    }
    for (const bucket of buckets) {
      const camelField = snakeToCamel.get(bucket.field);
      if (camelField === undefined) continue; // unknown field name — defensive
      if (out.has(camelField)) continue; // already tripped — skip to prevent re-emit
      const priors = bucket.priorWeeksCounts;
      if (priors.length === 0) continue; // no prior history — cannot compute σ
      const mean = priors.reduce((acc, x) => acc + x, 0) / priors.length;
      const variance = priors.reduce((acc, x) => acc + (x - mean) * (x - mean), 0) / priors.length;
      const sigma = Math.sqrt(variance);
      const threshold = mean + SIGMA_MULTIPLIER * sigma;
      if (bucket.currentWeekCount > threshold) {
        out.add(camelField);
        tripped.add(camelField);
        try {
          logEvent('tier2CircuitBreaker', 'tier2.circuit_breaker_tripped', {
            field: bucket.field,
            current_week_count: bucket.currentWeekCount,
            rolling_mean: mean,
            sigma,
            sample_window_days: 7,
          });
        } catch {
          // A broken event logger must not poison creation. Trip state still
          // advances — the field remains disabled for the rest of the process.
        }
      }
    }
    return out;
  }

  return {
    async applyTo(blockingFields: ReadonlySet<VerdictFieldName>) {
      // Skip the query entirely when there are no blocking fields to shrink —
      // saves a round-trip in the common (default-config) case.
      if (blockingFields.size === 0) return blockingFields;
      const t = now();
      let trippedSet: Set<VerdictFieldName>;
      if (cache !== null && t - cache.computedAt < CACHE_TTL_MS) {
        trippedSet = cache.trippedFields;
      } else {
        trippedSet = await recompute();
        cache = { trippedFields: trippedSet, computedAt: t };
      }
      if (trippedSet.size === 0) return blockingFields;
      const shrunk = new Set<VerdictFieldName>();
      for (const field of blockingFields) {
        if (!trippedSet.has(field)) shrunk.add(field);
      }
      return shrunk;
    },
  };
}
