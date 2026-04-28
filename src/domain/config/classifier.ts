// Configuration types for the Tier 2 content classifier (NEU-619).
// Domain layer: type definitions and allowlist constants only — no process.env reads.

import type { VerdictFieldName } from '../types/classifier.js';

export type ClassifierProvider = 'openai';

/** The set of accepted `reasoning_effort` values for the OpenAI responses API. */
export const CLASSIFIER_REASONING_EFFORTS = ['none', 'low', 'medium', 'high', 'xhigh'] as const;
export type ClassifierReasoningEffort = (typeof CLASSIFIER_REASONING_EFFORTS)[number];

export type ClassifierConfig = {
  provider: ClassifierProvider | null;
  model: string;
  reasoningEffort: ClassifierReasoningEffort;
  /**
   * Sampling temperature. `null` means "use the model default" — required for
   * reasoning models (e.g. `gpt-5.4-mini`) which reject any non-default value.
   * Set a numeric override only for non-reasoning models that support it.
   */
  temperature: number | null;
  maxRetries: number;
  timeout: number;
  openaiApiKey: string | null;
  /** Consumed by NEU-620 — signals whether `create_chunk` should invoke the classifier. */
  enableAtCreate: boolean;
  /**
   * Consumed by NEU-621 — per-field allowlist of verdict fields that, when scored
   * at or below the soft-warn threshold, will reject topic creation. Empty set
   * means soft-warn only (the NEU-620 default). Operators flip fields one at a
   * time after both calibration agreement (≥ 0.85) and OOD precision (≥ 0.85)
   * have passed; see `docs/runbooks/classifier-blocking-activation.md`.
   */
  blockingFields: ReadonlySet<VerdictFieldName>;
};

/**
 * NEU-672: shared blocking-decision threshold. A Tier 2 verdict field with
 * `score <= BLOCKING_THRESHOLD` either soft-warns (default) or rejects creation
 * when the field is in `blockingFields`. Single source of truth so the
 * calibration script and production stay aligned.
 */
export const BLOCKING_THRESHOLD = 2;
