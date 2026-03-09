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

function parseStringList(value: string | undefined, fallback: string[]): string[] {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  return trimmed
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

export function resolveAuthConfig(
  transportMode: TransportMode,
  env: Record<string, string | undefined> = process.env
): AuthConfig | null {
  if (transportMode === 'stdio') return null;

  return {
    issuer: requireEnv(env, 'AUTH_ISSUER'),
    audience: requireEnv(env, 'AUTH_AUDIENCE'),
    corsAllowedOrigins: parseStringList(env.CORS_ALLOWED_ORIGINS, ['*']),
  };
}
