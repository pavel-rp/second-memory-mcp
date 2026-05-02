// Hardcoded defaults for classifier configuration (NEU-619).
// No I/O, no process.env reads.

import type { VerdictFieldName } from '../types/classifier.js';
import type { ClassifierConfig } from './classifier.js';

export const DEFAULT_CLASSIFIER_CONFIG: ClassifierConfig = {
  provider: null,
  model: 'gpt-5.4-mini',
  reasoningEffort: 'low',
  temperature: null,
  maxRetries: 2,
  timeout: 10_000,
  openaiApiKey: null,
  // Off by default: classifier invocation is an explicit opt-in because it
  // adds a ~2 s p95 external API call to every audit-eligible write path.
  // Operators who want it set `CLASSIFIER_ENABLE=true` (or, during the
  // deprecation window, the legacy `CLASSIFIER_ENABLE_AT_CREATE` alias).
  enable: false,
  // Empty by default — soft-warn only. NEU-621 owns the per-field flip gated
  // on calibration + OOD precision; see the runbook for activation procedure.
  blockingFields: new Set<VerdictFieldName>(),
};
