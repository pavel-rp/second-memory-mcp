/**
 * Over-validation (false-accept) guard (NEU-929 / MM-T5, charter C007 OUT-5).
 *
 * The deterministic `grade mapper` can still over-validate at the margins. This
 * pure guard decides whether a MEASURED aggregate false-accept rate — the
 * fraction of a held-out known-incorrect grading set the mapper resolved to a
 * pass — stays at or below the configured `overValidationCeiling`. A held-out CI
 * adversarial-grading fixture measures the rate and feeds it here; the build
 * FAILS closed when `withinCeiling` is false.
 *
 * This is a check on the held-out RATE, not a runtime rate-limiter on any single
 * grade. Pure domain function: zero I/O, never throws.
 */

import type { AlgorithmConfig } from '../config/algorithm.js';

/** Quality at or above which a grade is a pass — mirrors `passed = quality >= 3`. */
export const GRADE_PASS_THRESHOLD = 3;

export type OverValidationVerdict = {
  /** The measured aggregate false-accept rate over the held-out set (0–1). */
  measuredRate: number;
  /** The configured ceiling the rate is compared against. */
  ceiling: number;
  /** True iff the measured rate is at or below the ceiling (fail-closed when false). */
  withinCeiling: boolean;
};

/**
 * Evaluate a measured false-accept rate against the configured over-validation
 * ceiling. Fail-closed: any rate strictly above the ceiling yields
 * `withinCeiling: false`.
 */
export function evaluateOverValidation(
  measuredRate: number,
  config: Pick<AlgorithmConfig, 'overValidationCeiling'>
): OverValidationVerdict {
  const ceiling = config.overValidationCeiling;
  return {
    measuredRate,
    ceiling,
    withinCeiling: measuredRate <= ceiling,
  };
}
