import { parseNumber } from '../shared/env-parsing.js';
import { logger } from '../shared/logger.js';

export type ContextTokenConfig = {
  ttlMs: number;
};

const DEFAULT_TTL_HOURS = 2;
const MIN_TTL_MS = 300_000; // 5 minutes

export function resolveContextTokenConfig(
  env: Record<string, string | undefined> = process.env
): ContextTokenConfig {
  const hours = parseNumber(env.CONTEXT_TOKEN_TTL_HOURS, DEFAULT_TTL_HOURS);
  const ttlMs = Math.round(hours * 60 * 60 * 1000);

  if (ttlMs < MIN_TTL_MS) {
    logger.warn(
      `CONTEXT_TOKEN_TTL_HOURS=${hours} resolves to ${ttlMs}ms, below minimum ${MIN_TTL_MS}ms. Clamping to 5 minutes.`
    );
    return { ttlMs: MIN_TTL_MS };
  }

  return { ttlMs };
}
