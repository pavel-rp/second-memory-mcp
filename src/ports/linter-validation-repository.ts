/**
 * Port interface for the OOD validation harness tables (NEU-627).
 *
 * Holds two related datasets:
 *
 *   - Labeled **corpus** entries keyed by `(rule_id, chunk_id)`. Each entry
 *     declares the split it belongs to and whether the linter rule *should*
 *     flag that chunk — the ground truth used to measure precision/recall.
 *
 *   - Per-rule **validation reports** keyed by `rule_id`. The report holds
 *     the most recent precision/recall/F1 numbers and the derived
 *     `blocking_eligible` decision applied at startup by the composition
 *     root. Updated by `pnpm lint:validate`; read by `composition-root` at
 *     startup and by the CLI itself for the CI gate.
 *
 * Types live here (not in a DB schema module) so the domain layer can depend
 * on the port without importing Drizzle. Field names are camelCase in TS and
 * map to snake_case columns at the adapter boundary.
 */

/** Which split a corpus chunk belongs to — governs how metrics are computed. */
export type CorpusSplit = 'derivation' | 'held_out' | 'adversarial_negative' | 'random_sample';

/** Ground-truth label for a (rule, chunk) pair. `should_flag` = positive; `clean` = negative. */
export type ExpectedVerdict = 'should_flag' | 'clean';

export type CorpusEntry = {
  id: number;
  ruleId: string;
  chunkId: string;
  split: CorpusSplit;
  expectedVerdict: ExpectedVerdict;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Upsert payload; `id`/`createdAt`/`updatedAt` are owned by the DB. */
export type CorpusEntryInput = {
  ruleId: string;
  chunkId: string;
  split: CorpusSplit;
  expectedVerdict: ExpectedVerdict;
  notes?: string | null;
};

export type RuleValidationReport = {
  ruleId: string;
  computedAt: Date;
  precisionHeldOut: number | null;
  recallHeldOut: number | null;
  f1HeldOut: number | null;
  precisionAdversarial: number | null;
  heldOutCount: number;
  adversarialCount: number;
  blockingEligible: boolean;
  thresholdsVersion: number;
};

export interface LinterValidationRepository {
  /** List all corpus entries for a rule, in insertion order (ascending `id`). */
  listCorpusByRule(ruleId: string): Promise<CorpusEntry[]>;
  /**
   * Insert-or-update a corpus entry keyed by `(rule_id, chunk_id)`. On
   * conflict, refreshes `split`, `expected_verdict`, `notes`, and
   * `updated_at`. `created_at` is preserved.
   */
  upsertCorpusEntry(entry: CorpusEntryInput): Promise<void>;
  /**
   * Remove a corpus entry. Returns the number of rows affected (`0` when no
   * row matched; `1` otherwise).
   */
  deleteCorpusEntry(ruleId: string, chunkId: string): Promise<number>;
  /** Fetch a single rule's report, or `null` if no report has been computed yet. */
  getReport(ruleId: string): Promise<RuleValidationReport | null>;
  /** Insert-or-update a report keyed by `rule_id`. */
  upsertReport(report: RuleValidationReport): Promise<void>;
  /** List every rule's report. Used at startup to apply eligibility flags. */
  listReports(): Promise<RuleValidationReport[]>;
}
