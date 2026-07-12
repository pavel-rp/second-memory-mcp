// Composition root layer: reads process.env and returns auth configuration
// Returns null for STDIO transport (inherently trusted, no auth needed)
// Throws on missing AUTH_ISSUER or AUTH_AUDIENCE when transport=http (fail-fast).
// AUTH_AUDIENCE is required so every JWT is validated against it (NEU-833) and
// doubles as the PRM `resource` identifier and WWW-Authenticate `resource_metadata`
// base URL — hence it must be a valid absolute URL.
// CORS_ALLOWED_ORIGINS is required-and-explicit in HTTP mode (NEU-834): the same
// list backs the transport-level 403 forged-Origin rejection, so an unset value
// or any wildcard "*" entry fails startup — a wildcard would make that rejection
// inert. Mirrors the AUTH_ISSUER/AUTH_AUDIENCE fail-fast pattern.

import type { TransportMode } from './resolve-transport-config.js';

export type AuthConfig = {
  issuer: string;
  audience: string;
  /**
   * Extra accepted `aud` values beyond AUTH_AUDIENCE (AUTH_ADDITIONAL_AUDIENCES,
   * comma-separated). Rauthy stamps `aud` with the OAuth client_id, so a manually
   * provisioned static client (e.g. the claude.ai connector's pre-registered
   * client id) can only be accepted by listing that client id here. Sound only
   * under the dedicated single-resource AS topology (ADR-0001).
   */
  additionalAudiences?: string[];
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

/**
 * Normalize CORS origin entries to scheme+host+port only.
 * Browser Origin headers never include paths or trailing slashes,
 * so config values like "https://app.example.com/" or "https://app.example.com/path"
 * would silently fail the includes() check without normalization.
 */
function normalizeOrigins(origins: string[]): string[] {
  return origins.map(entry => {
    try {
      return new URL(entry).origin;
    } catch {
      throw new Error(
        `CORS_ALLOWED_ORIGINS contains an invalid origin: "${entry}". Each entry must be a valid URL (scheme+host+port).`
      );
    }
  });
}

/**
 * Resolve the required-and-explicit CORS origin allowlist (NEU-834).
 * This list governs both CORS reflection and the transport-level 403 rejection
 * of forged Origins, so in HTTP mode it must name explicit origins: unset,
 * empty, or any wildcard "*" entry fails fast at startup. A wildcard would
 * reflect every Origin and make the 403 rejection inert.
 */
function requireCorsAllowedOrigins(env: Record<string, string | undefined>): string[] {
  const origins = (env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  if (origins.length === 0) {
    throw new Error(
      'CORS_ALLOWED_ORIGINS is required when TRANSPORT=http. Set it to a comma-separated list ' +
        'of explicit browser origins (scheme+host+port), e.g. "https://app.example.com". ' +
        'A wildcard "*" is rejected because it would disable forged-Origin rejection.'
    );
  }
  if (origins.includes('*')) {
    throw new Error(
      'CORS_ALLOWED_ORIGINS must not contain "*" when TRANSPORT=http — a wildcard disables ' +
        'forged-Origin rejection. List explicit origins (scheme+host+port) instead.'
    );
  }
  return normalizeOrigins(origins);
}

function parseAdditionalAudiences(env: Record<string, string | undefined>): string[] {
  return (env.AUTH_ADDITIONAL_AUDIENCES ?? '')
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
    issuer: requireUrl(env, 'AUTH_ISSUER'),
    audience: requireUrl(env, 'AUTH_AUDIENCE'),
    additionalAudiences: parseAdditionalAudiences(env),
    corsAllowedOrigins: requireCorsAllowedOrigins(env),
  };
}
