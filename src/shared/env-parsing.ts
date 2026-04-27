// Environment variable parsing helpers
// Used by config resolution functions in the composition root layer

import {
  CLASSIFIER_REASONING_EFFORTS,
  type ClassifierReasoningEffort,
} from '../domain/config/classifier.js';
import { VERDICT_FIELDS, type VerdictFieldName } from '../domain/types/classifier.js';
import { PERSISTED_TIER2_FIELD_NAMES } from './prompts/classifier-prompts.js';

export function parseNumber(envValue: string | undefined, fallback: number): number {
  if (envValue == null || envValue.trim() === '') return fallback;
  const parsed = Number(envValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseRecord(envValue: string | undefined): Record<string, number> {
  // Expect JSON like {"tagA":1.2,"tagB":0.8}
  if (!envValue) return {};
  try {
    const raw: unknown = JSON.parse(envValue);
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};
    const obj = raw as Record<string, unknown>;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(obj)) {
      let n: number | undefined;
      if (typeof v === 'number') {
        n = v;
      } else if (typeof v === 'string') {
        const parsed = Number(v);
        if (Number.isFinite(parsed)) n = parsed;
      }
      if (n !== undefined && Number.isFinite(n)) out[k] = n;
    }
    return out;
  } catch {
    return {};
  }
}

export function parseBoolean(envValue: string | undefined, fallback: boolean): boolean {
  if (envValue == null || envValue.trim() === '') return fallback;
  const v = envValue.trim().toLowerCase();
  if (v === '1' || v === 'true' || v === 'yes' || v === 'on') return true;
  if (v === '0' || v === 'false' || v === 'no' || v === 'off') return false;
  return fallback;
}

export function parseEnum<T extends string>(
  envValue: string | undefined,
  allowed: readonly T[],
  fallback: T
): T {
  if (envValue == null || envValue.trim() === '') return fallback;
  const normalized = envValue.trim().toLowerCase();
  const match = allowed.find(v => v.toLowerCase() === normalized);
  return match ?? fallback;
}

export function parseEmbeddingProvider(value: string | undefined): 'openai' | 'ollama' | null {
  const normalized = value?.trim().toLowerCase();
  if (normalized === 'openai' || normalized === 'ollama') return normalized;
  return null;
}

export function parseClassifierProvider(value: string | undefined): 'openai' | null {
  const normalized = value?.trim().toLowerCase();
  if (normalized === 'openai') return normalized;
  return null;
}

export function parseReasoningEffort(
  value: string | undefined,
  fallback: ClassifierReasoningEffort
): ClassifierReasoningEffort {
  return parseEnum(value, CLASSIFIER_REASONING_EFFORTS, fallback);
}

/**
 * Parse `CLASSIFIER_BLOCKING_FIELDS` (NEU-621) — a comma-separated list of
 * verdict-field names in snake_case (the same names persisted under
 * `validator_report.tier2`). Returns a `Set<VerdictFieldName>` keyed by the
 * internal camelCase names so consumers can look up directly against
 * `VERDICT_FIELDS`. Empty/whitespace input returns an empty set. Unknown names
 * throw — the composition root surfaces the error at startup so misconfigured
 * deployments fail loudly rather than silently soft-warn.
 */
export function parseVerdictFieldList(envValue: string | undefined): Set<VerdictFieldName> {
  const out = new Set<VerdictFieldName>();
  if (envValue == null || envValue.trim() === '') return out;
  // Build the snake → camel reverse lookup once per call. Cheap (six entries)
  // and avoids capturing module-level state that would break tree-shaking of
  // the prompts module if env-parsing is ever imported in isolation.
  const snakeToCamel = new Map<string, VerdictFieldName>();
  for (const field of VERDICT_FIELDS) {
    snakeToCamel.set(PERSISTED_TIER2_FIELD_NAMES[field], field);
  }
  for (const raw of envValue.split(',')) {
    const trimmed = raw.trim();
    if (trimmed === '') continue;
    const match = snakeToCamel.get(trimmed);
    if (match === undefined) {
      const allowed = Array.from(snakeToCamel.keys()).join(', ');
      throw new Error(
        `CLASSIFIER_BLOCKING_FIELDS: unknown verdict field "${trimmed}". Allowed: ${allowed}.`
      );
    }
    out.add(match);
  }
  return out;
}
