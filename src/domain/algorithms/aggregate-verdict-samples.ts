// Self-consistency aggregator for Tier 2 classifier verdict fields (NEU-757).
//
// Domain layer: pure computation — zero I/O, no clock, no randomness. Reduces N
// independent samples of a single verdict field into one deterministic field so
// the classifier's findings stop flickering near the blocking threshold.

import type { VerdictField } from '../types/classifier.js';

/**
 * Aggregate self-consistency samples of one verdict field into a single field.
 *
 * Determinism contract: identical input → identical output on every call.
 *
 * - Empty input → `null`: every sample for this field failed, so the caller
 *   treats the field as unscored — this preserves the fail-open contract and
 *   the existing all-null / `classify_aggregate_failed` path.
 * - `score` is the **lower median**: samples are sorted ascending by score and
 *   the element at index `floor((n - 1) / 2)` is the representative. On an even
 *   count this picks the lower of the two middle scores, biasing ties toward
 *   the more cautious (lower / more likely to flag) verdict.
 * - `applicable` is the majority vote across all samples; a tie falls back to
 *   the representative sample's `applicable`.
 * - `rationale` is the representative sample's rationale — its score equals the
 *   reported median by construction.
 */
export function aggregateVerdictSamples(samples: readonly VerdictField[]): VerdictField | null {
  if (samples.length === 0) return null;

  // Sort a copy ascending by score. Array.prototype.sort is stable, so
  // equal-score samples keep input order, keeping the representative
  // deterministic for a fixed input.
  const sorted = [...samples].sort((a, b) => a.score - b.score);
  const representative = sorted[Math.floor((sorted.length - 1) / 2)];

  let applicableCount = 0;
  for (const sample of samples) {
    if (sample.applicable) applicableCount += 1;
  }
  const notApplicableCount = samples.length - applicableCount;
  let applicable: boolean;
  if (applicableCount > notApplicableCount) {
    applicable = true;
  } else if (notApplicableCount > applicableCount) {
    applicable = false;
  } else {
    applicable = representative.applicable;
  }

  return {
    score: representative.score,
    rationale: representative.rationale,
    applicable,
  };
}
