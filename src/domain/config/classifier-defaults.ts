// Hardcoded defaults for classifier configuration (NEU-619).
// No I/O, no process.env reads.

import type { ClassifierConfig } from './classifier.js';

export const DEFAULT_CLASSIFIER_CONFIG: ClassifierConfig = {
  provider: null,
  model: 'gpt-5.4-mini',
  reasoningEffort: 'minimal',
  temperature: 0,
  maxRetries: 2,
  timeout: 10_000,
  openaiApiKey: null,
  enableAtCreate: true,
  blockingMode: false,
};
