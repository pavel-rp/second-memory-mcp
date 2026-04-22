import { z } from 'zod';

/**
 * Canonical persisted shape for chunk validator output.
 *
 * Stored as JSONB in `learning_chunks.validator_report`. Section ownership:
 *   - `tier1a` — structural blocking rules (NEU-628)
 *   - `tier1b` — heuristic warning rules (NEU-617)
 *   - `tier2`  — classifier output (NEU-620)
 *
 * `updated_at` uses snake_case to match other JSONB persisted shapes in this
 * project. Per-tier sub-shapes are owned by their respective tickets and are
 * stored here as `unknown` — this module does not constrain or inspect them.
 *
 * Merge semantics: each tier key is replaced wholesale by the merging caller
 * (no deep merge inside a tier). Concurrent writes to the same tier are
 * last-write-wins. The Drizzle adapter implements `mergeValidatorReport`
 * atomically via Postgres `||` JSONB shallow-merge so concurrent writes to
 * different tiers do not lose updates.
 */
export const ValidatorReportSchema = z.object({
  tier1a: z.unknown().optional(),
  tier1b: z.unknown().optional(),
  tier2: z.unknown().optional(),
  updated_at: z.string(),
});

export type ValidatorReport = z.infer<typeof ValidatorReportSchema>;

/** Returns the canonical empty report — written by the create path when no findings exist. */
export function canonicalEmptyReport(updatedAt: string): ValidatorReport {
  return { updated_at: updatedAt };
}

/**
 * Pure section-level merge. Replaces whole tier keys present in `partial`,
 * preserves untouched sections from `prev`, and always sets `updated_at`.
 * Does not deep-merge inside a tier.
 *
 * Used by in-memory adapters and test doubles. The production Drizzle adapter
 * implements the same contract via Postgres `||` for atomicity.
 */
export function mergeReportSections(
  prev: ValidatorReport | null,
  partial: Partial<ValidatorReport>,
  updatedAt: string
): ValidatorReport {
  const base: ValidatorReport = prev ?? { updated_at: updatedAt };
  const merged: ValidatorReport = { ...base, updated_at: updatedAt };
  // Aligns with the Drizzle adapter's Postgres `||` semantics: undefined values
  // in `partial` are skipped (matches `JSON.stringify` behavior); explicit
  // `null` would persist as JSON null (key present, value null).
  if (partial.tier1a !== undefined) merged.tier1a = partial.tier1a;
  if (partial.tier1b !== undefined) merged.tier1b = partial.tier1b;
  if (partial.tier2 !== undefined) merged.tier2 = partial.tier2;
  return merged;
}
