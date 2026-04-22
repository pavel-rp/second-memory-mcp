// Configuration types for the Tier 2 content classifier (NEU-619).
// Domain layer: type definitions and allowlist constants only — no process.env reads.

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
  /** Consumed by NEU-621 — signals whether low verdict scores should block creation. */
  blockingMode: boolean;
};
