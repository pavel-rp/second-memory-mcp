/**
 * Pure pre-review scheduling snapshot (NEU-844).
 *
 * Turns a chunk's SR state at answer time into the four values persisted
 * alongside every scored attempt. No I/O, never throws.
 *
 * The FSRS power law lives in exactly one place — `classifyChunk`. This module
 * delegates to it and adds only the band discrimination `classifyChunk` cannot
 * express: it returns exactly `1.0` both for the fresh/no-interval band and for
 * a genuinely on-time review of an established chunk, so a single numeric
 * column could never tell the two apart. `band` does; `predictedRecall` stays
 * `null` on the fresh band so no synthetic 1.0 can enter a calibration mean.
 */

import { classifyChunk, type ClassifyChunkInput } from './classify-chunk.js';

// ── Types ──────────────────────────────────────────────────────────────────

/**
 * `'established'` — the chunk had a finite `intervalDays > 0` at answer time.
 * `'fresh'` — the `classifyChunk` R = 1.0 band: `intervalDays` is `null`, non-finite,
 * or `<= 0` (a negative interval is corrupt SR state and is treated as no interval,
 * never as an established one).
 */
export type SchedulingBand = 'fresh' | 'established';

export type SchedulingSnapshot = {
  band: SchedulingBand;
  /** Power-law estimate. Non-null only on the `'established'` band, and only inside `(0, 1]`. */
  predictedRecall: number | null;
  /** The chunk's `intervalDays` verbatim. May legitimately be `null`, `0` or negative on a `'fresh'` row. */
  intervalDays: number | null;
  /** `classifyChunk`'s `daysOverdue`, clamped at 0. Fractional days. */
  daysOverdue: number | null;
};

// ── Core function ──────────────────────────────────────────────────────────

/** Finite numbers pass through; anything else (NaN, ±Infinity, null) becomes null. */
function finiteOrNull(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Compute the snapshot for a chunk's pre-review scheduling state.
 *
 * Every field is defensively nulled when it falls outside the domain its
 * persisted CHECK constraint admits, so this function is structurally incapable
 * of producing a row the database would reject — a pathological chunk state can
 * never turn a scored answer into a constraint violation.
 */
export function computeSchedulingSnapshot(
  input: ClassifyChunkInput,
  now: Date
): SchedulingSnapshot {
  const decision = classifyChunk(input, now);

  const intervalDays = finiteOrNull(input.intervalDays);
  const rawDaysOverdue = finiteOrNull(decision.daysOverdue);
  // CHECK (snapshot_days_overdue IS NULL OR >= 0)
  const daysOverdue = rawDaysOverdue !== null && rawDaysOverdue >= 0 ? rawDaysOverdue : null;

  if (intervalDays === null || intervalDays <= 0) {
    // Fresh band: R = 1.0 is definitional, not measured — never stored.
    return { band: 'fresh', predictedRecall: null, intervalDays, daysOverdue };
  }

  const recall = finiteOrNull(decision.estimatedRetrievability);
  // CHECK (snapshot_predicted_recall IS NULL OR (> 0 AND <= 1))
  const predictedRecall = recall !== null && recall > 0 && recall <= 1 ? recall : null;

  return { band: 'established', predictedRecall, intervalDays, daysOverdue };
}
