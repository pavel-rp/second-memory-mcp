// Composition root layer: reads process.env and merges with domain defaults
// for the Tier 2 content classifier (NEU-619).
//
// Only this module reads env for classifier configuration; the domain layer
// (`src/domain/config/classifier*.ts`) stays pure. Mirrors the pattern of
// `resolve-embedding-config.ts`.

import type { ClassifierConfig } from '../domain/config/classifier.js';
import { DEFAULT_CLASSIFIER_CONFIG } from '../domain/config/classifier-defaults.js';
import {
  parseBoolean,
  parseClassifierProvider,
  parseNumber,
  parseReasoningEffort,
} from '../shared/env-parsing.js';

function parseNullableNumber(envValue: string | undefined, fallback: number | null): number | null {
  if (envValue == null || envValue.trim() === '') return fallback;
  const parsed = Number(envValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export type ResolvedClassifierConfig = {
  classifier: ClassifierConfig;
};

export function resolveClassifierConfig(
  env: Record<string, string | undefined> = process.env
): ResolvedClassifierConfig {
  const provider = parseClassifierProvider(env.CLASSIFIER_PROVIDER);

  // CLASSIFIER_OPENAI_API_KEY takes precedence; fall back to OPENAI_API_KEY
  // so a single shared credential still works.
  const classifierKey = env.CLASSIFIER_OPENAI_API_KEY?.trim();
  const fallbackKey = env.OPENAI_API_KEY?.trim();
  const openaiApiKey = classifierKey || fallbackKey || null;

  const classifier: ClassifierConfig = {
    provider,
    model: env.CLASSIFIER_MODEL?.trim() || DEFAULT_CLASSIFIER_CONFIG.model,
    reasoningEffort: parseReasoningEffort(
      env.CLASSIFIER_REASONING_EFFORT,
      DEFAULT_CLASSIFIER_CONFIG.reasoningEffort
    ),
    temperature: parseNullableNumber(
      env.CLASSIFIER_TEMPERATURE,
      DEFAULT_CLASSIFIER_CONFIG.temperature
    ),
    maxRetries: parseNumber(env.CLASSIFIER_MAX_RETRIES, DEFAULT_CLASSIFIER_CONFIG.maxRetries),
    timeout: parseNumber(env.CLASSIFIER_TIMEOUT_MS, DEFAULT_CLASSIFIER_CONFIG.timeout),
    openaiApiKey,
    enableAtCreate: parseBoolean(
      env.CLASSIFIER_ENABLE_AT_CREATE,
      DEFAULT_CLASSIFIER_CONFIG.enableAtCreate
    ),
    blockingMode: parseBoolean(
      env.CLASSIFIER_BLOCKING_MODE,
      DEFAULT_CLASSIFIER_CONFIG.blockingMode
    ),
  };

  return { classifier };
}
