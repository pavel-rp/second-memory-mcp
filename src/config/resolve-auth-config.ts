// Composition root layer: reads process.env and returns auth configuration
// Returns null for STDIO transport (inherently trusted, no auth needed)
// Throws on missing required vars when transport=http (fail-fast)

import type { TransportMode } from './resolve-transport-config.js';

export type AuthConfig = {
  issuer: string;
  audience: string;
  corsAllowedOrigins: string[];
};

function requireEnv(env: Record<string, string | undefined>, key: string): string {
  const value = env[key]?.trim();
  if (!value) {
    throw new Error(
      `${key} is required when TRANSPORT=http. Set ${key} or switch to TRANSPORT=stdio.`
    );
  }
  return value;
}

function requireUrl(env: Record<string, string | undefined>, key: string): string {
  const value = requireEnv(env, key);
  try {
    new URL(value);
  } catch {
    throw new Error(`${key} must be a valid absolute URL, got: "${value}"`);
  }
  return value;
}

function parseStringList(value: string | undefined, fallback: string[]): string[] {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  const parsed = trimmed
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : fallback;
}

/**
 * Normalize CORS origin entries to scheme+host+port only.
 * Browser Origin headers never include paths or trailing slashes,
 * so config values like "https://app.example.com/" or "https://app.example.com/path"
 * would silently fail the includes() check without normalization.
 * The wildcard "*" is passed through unchanged.
 */
function normalizeOrigins(origins: string[]): string[] {
  return origins.map(entry => {
    if (entry === '*') return entry;
    try {
      return new URL(entry).origin;
    } catch {
      return entry;
    }
  });
}

export function resolveAuthConfig(
  transportMode: TransportMode,
  env: Record<string, string | undefined> = process.env
): AuthConfig | null {
  if (transportMode === 'stdio') return null;

  return {
    issuer: requireUrl(env, 'AUTH_ISSUER'),
    audience: requireUrl(env, 'AUTH_AUDIENCE'),
    corsAllowedOrigins: normalizeOrigins(parseStringList(env.CORS_ALLOWED_ORIGINS, ['*'])),
  };
}
