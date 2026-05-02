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
  parseVerdictFieldList,
} from '../shared/env-parsing.js';
import { getRequestLogger } from '../shared/logger.js';

/**
 * Resolve the classifier "is wired" toggle from env, honoring the legacy
 * `CLASSIFIER_ENABLE_AT_CREATE` alias for one release. `CLASSIFIER_ENABLE`
 * is canonical. Whenever the legacy var is present (alone, or alongside
 * `CLASSIFIER_ENABLE` in agreement) a deprecation warning is logged at
 * resolution time — effectively one-shot per process because the
 * composition root invokes `resolveClassifierConfig` exactly once at
 * startup. When both are set with disagreeing parsed booleans, this throws
 * so misconfigured deployments fail fast at startup.
 */
function resolveEnableToggle(env: Record<string, string | undefined>): boolean {
  const canonicalRaw = env.CLASSIFIER_ENABLE;
  const legacyRaw = env.CLASSIFIER_ENABLE_AT_CREATE;
  const canonicalPresent = canonicalRaw != null && canonicalRaw.trim() !== '';
  const legacyPresent = legacyRaw != null && legacyRaw.trim() !== '';

  if (!canonicalPresent && !legacyPresent) {
    return DEFAULT_CLASSIFIER_CONFIG.enable;
  }
  if (canonicalPresent && !legacyPresent) {
    return parseBoolean(canonicalRaw, DEFAULT_CLASSIFIER_CONFIG.enable);
  }
  if (!canonicalPresent && legacyPresent) {
    getRequestLogger().warn(
      'CLASSIFIER_ENABLE_AT_CREATE is deprecated and will be removed in a future release; set CLASSIFIER_ENABLE instead.'
    );
    return parseBoolean(legacyRaw, DEFAULT_CLASSIFIER_CONFIG.enable);
  }
  // Both set — compare parsed booleans so equivalent string forms (e.g.
  // `true` and `on`) agree without a hard failure. Disagreement is a config
  // error and must fail fast so the operator notices before serving traffic.
  // Even when they agree, emit the deprecation warning: an operator who left
  // the legacy var in place needs the same migration nudge as one who set
  // only the legacy var.
  const canonicalParsed = parseBoolean(canonicalRaw, DEFAULT_CLASSIFIER_CONFIG.enable);
  const legacyParsed = parseBoolean(legacyRaw, DEFAULT_CLASSIFIER_CONFIG.enable);
  if (canonicalParsed !== legacyParsed) {
    throw new Error(
      `Conflicting classifier toggle: CLASSIFIER_ENABLE=${JSON.stringify(canonicalRaw)} (parsed as ${canonicalParsed}) but CLASSIFIER_ENABLE_AT_CREATE=${JSON.stringify(legacyRaw)} (parsed as ${legacyParsed}). Remove CLASSIFIER_ENABLE_AT_CREATE and set CLASSIFIER_ENABLE to the desired value.`
    );
  }
  getRequestLogger().warn(
    'CLASSIFIER_ENABLE_AT_CREATE is deprecated and will be removed in a future release; set CLASSIFIER_ENABLE instead.'
  );
  return canonicalParsed;
}

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
    enable: resolveEnableToggle(env),
    // NEU-621: per-field allowlist of verdict-field names. Empty/unset = soft-warn
    // only (the NEU-620 default). `enable` remains the global kill switch —
    // when false, no blocking can occur regardless of this list.
    blockingFields: parseVerdictFieldList(env.CLASSIFIER_BLOCKING_FIELDS),
  };

  return { classifier };
}
