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
  /**
   * NEU-757: base seed for the per-field model calls, passed as a per-call
   * option (`invoke(messages, { seed })`). Best-effort reproducibility only: it
   * pins the OpenAI *Completions* sampler, which applies when `CLASSIFIER_MODEL`
   * is overridden to a non-reasoning model. The default reasoning model
   * (`gpt-5.4-mini`) routes to the OpenAI *Responses* API, which has no `seed`
   * parameter and ignores it — for that path `samples > 1` is the determinism
   * lever, not the seed. When `samples > 1`, sample `i` uses `seed + i`: a fixed
   * but distinct seed set (stable ordering where seed is honored, with genuine
   * variance to majority-vote over).
   */
  seed: number;
  /**
   * NEU-757: self-consistency sample count per verdict field. `1` (default)
   * means a single call — same cost and fan-out as before. Operators raise this
   * (e.g. 3 or 5) to majority-vote over derived seeds and stabilize verdicts
   * near the blocking threshold; for the default reasoning model (whose
   * Responses API ignores `seed`) this is the effective determinism lever.
   * Always `>= 1`.
   */
  samples: number;
  maxRetries: number;
  timeout: number;
  openaiApiKey: string | null;
  /**
   * Global "is the classifier wired" kill switch. When `true` AND a classifier
   * port is configured, every audit-eligible write path invokes the Tier 2
   * classifier. Mirrors the `CLASSIFIER_ENABLE` env var; the legacy
   * `CLASSIFIER_ENABLE_AT_CREATE` is accepted as a deprecated alias for one
   * release. NEU-680 extends Tier 2 audits to update paths, so this is no
   * longer create-only.
   */
  enable: boolean;
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
