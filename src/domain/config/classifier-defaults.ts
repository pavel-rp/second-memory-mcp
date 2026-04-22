// Hardcoded defaults for classifier configuration (NEU-619).
// No I/O, no process.env reads.

import type { ClassifierConfig } from './classifier.js';

export const DEFAULT_CLASSIFIER_CONFIG: ClassifierConfig = {
  provider: null,
  model: 'gpt-5.4-mini',
  reasoningEffort: 'low',
  temperature: null,
  maxRetries: 2,
  timeout: 10_000,
  openaiApiKey: null,
  // Off by default: classification on create is an explicit opt-in because it
  // adds a ~2 s p95 external API call to the topic-creation path. Operators
  // who want it set `CLASSIFIER_ENABLE_AT_CREATE=true`.
  enableAtCreate: false,
  blockingMode: false,
};
