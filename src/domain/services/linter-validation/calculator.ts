/**
 * Pure metric and eligibility calculations for the OOD validation harness
 * (NEU-627). No I/O — invoked from `scripts/lint-validate.ts` and from the
 * unit test suite. Same code, deterministic output.
 */

export type MetricResult = {
  precision: number;
  recall: number;
  f1: number;
};

export type EligibilityCounts = {
  heldOutCount: number;
  adversarialCount: number;
};

export type EligibilityMetrics = {
  precisionHeldOut: number | null;
  recallHeldOut: number | null;
  precisionAdversarial: number | null;
};

export type EligibilityThresholds = {
  precisionHeldOut: number;
  recallHeldOut: number;
  precisionAdversarial: number;
  minHeldOutCount: number;
  minAdversarialCount: number;
};

/**
 * Default eligibility thresholds (NEU-627 spec). Bumped via the
 * `thresholds_version` column in `linter_rule_validation_report` so older
 * validation reports remain interpretable when thresholds change.
 */
export const DEFAULT_ELIGIBILITY_THRESHOLDS: EligibilityThresholds = Object.freeze({
  precisionHeldOut: 0.9,
  recallHeldOut: 0.7,
  precisionAdversarial: 0.8,
  minHeldOutCount: 50,
  minAdversarialCount: 20,
});

/**
 * Compute precision, recall, and F1 for a single rule given parallel arrays
 * of expected (`true` = should flag) and observed (`true` = rule flagged)
 * outcomes. Uses the standard binary-classification definitions:
 *
 *   precision = TP / (TP + FP)
 *   recall    = TP / (TP + FN)
 *   F1        = 2 * (P * R) / (P + R)
 *
 * Zero-denominator branches return `0` (rather than `NaN`) so downstream
 * threshold comparisons never produce `NaN`-tainted booleans. Walks only
 * `min(expected.length, observed.length)` entries so a length mismatch
 * cannot crash the caller — `lint:validate` always builds these arrays in
 * parallel from the same loop, so a mismatch indicates a bug, not data
 * corruption; the metric report would silently undercount, which is fine
 * because the eligibility gate then refuses to promote the rule.
 */
export function computeMetrics(
  expected: readonly boolean[],
  observed: readonly boolean[]
): MetricResult {
  const length = Math.min(expected.length, observed.length);
  if (length === 0) return { precision: 0, recall: 0, f1: 0 };

  let tp = 0;
  let fp = 0;
  let fn = 0;
  for (let i = 0; i < length; i++) {
    const e = expected[i];
    const o = observed[i];
    if (e && o) tp++;
    else if (!e && o) fp++;
    else if (e && !o) fn++;
  }

  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { precision, recall, f1 };
}

/**
 * Eligibility decision: a rule is eligible to block when every threshold is
 * met. Missing metrics (`null`) are treated as failing — a rule that has
 * not been measured cannot be promoted.
 */
export function evaluateEligibility(
  metrics: EligibilityMetrics,
  counts: EligibilityCounts,
  thresholds: EligibilityThresholds = DEFAULT_ELIGIBILITY_THRESHOLDS
): boolean {
  if (metrics.precisionHeldOut === null) return false;
  if (metrics.recallHeldOut === null) return false;
  if (metrics.precisionAdversarial === null) return false;
  if (metrics.precisionHeldOut < thresholds.precisionHeldOut) return false;
  if (metrics.recallHeldOut < thresholds.recallHeldOut) return false;
  if (metrics.precisionAdversarial < thresholds.precisionAdversarial) return false;
  if (counts.heldOutCount < thresholds.minHeldOutCount) return false;
  if (counts.adversarialCount < thresholds.minAdversarialCount) return false;
  return true;
}

/**
 * Human-readable explanation of which thresholds a rule failed. Used by
 * `pnpm lint:validate` to print actionable stderr context next to the
 * non-zero exit. Returns an empty array when the rule passes — the caller
 * uses that as the success branch.
 */
export function explainEligibilityMiss(
  metrics: EligibilityMetrics,
  counts: EligibilityCounts,
  thresholds: EligibilityThresholds = DEFAULT_ELIGIBILITY_THRESHOLDS
): string[] {
  const reasons: string[] = [];
  if (metrics.precisionHeldOut === null) {
    reasons.push('precision_held_out: not measured');
  } else if (metrics.precisionHeldOut < thresholds.precisionHeldOut) {
    reasons.push(
      `precision_held_out: ${metrics.precisionHeldOut.toFixed(3)} < ${thresholds.precisionHeldOut}`
    );
  }
  if (metrics.recallHeldOut === null) {
    reasons.push('recall_held_out: not measured');
  } else if (metrics.recallHeldOut < thresholds.recallHeldOut) {
    reasons.push(
      `recall_held_out: ${metrics.recallHeldOut.toFixed(3)} < ${thresholds.recallHeldOut}`
    );
  }
  if (metrics.precisionAdversarial === null) {
    reasons.push('precision_adversarial: not measured');
  } else if (metrics.precisionAdversarial < thresholds.precisionAdversarial) {
    reasons.push(
      `precision_adversarial: ${metrics.precisionAdversarial.toFixed(3)} < ${thresholds.precisionAdversarial}`
    );
  }
  if (counts.heldOutCount < thresholds.minHeldOutCount) {
    reasons.push(`held_out_count: ${counts.heldOutCount} < ${thresholds.minHeldOutCount}`);
  }
  if (counts.adversarialCount < thresholds.minAdversarialCount) {
    reasons.push(
      `adversarial_count: ${counts.adversarialCount} < ${thresholds.minAdversarialCount}`
    );
  }
  return reasons;
}
