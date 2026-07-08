// Composition root layer: reads process.env and returns transport configuration
// This is the only place transport config touches environment variables

import { parseNumber, parseEnum } from '../shared/env-parsing.js';

export type TransportMode = 'stdio' | 'http';

export type TransportConfig = {
  mode: TransportMode;
  httpPort: number;
  httpHost: string;
  /**
   * Hostnames passed to the MCP SDK's Host-header DNS-rebinding check (NEU-834).
   * Undefined for localhost binds — the SDK auto-protects 127.0.0.1/localhost/::1 —
   * and for STDIO. Populated from ALLOWED_HOSTS; required for non-localhost binds.
   */
  allowedHosts?: string[];
};

// Binds for which the MCP SDK enables localhost Host-header validation automatically.
const LOCALHOST_BINDS = new Set(['127.0.0.1', 'localhost', '::1']);

function parseHostList(value: string | undefined): string[] {
  const trimmed = value?.trim();
  if (!trimmed) return [];
  return trimmed
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

export function resolveTransportConfig(
  env: Record<string, string | undefined> = process.env
): TransportConfig {
  const mode = parseEnum(env.TRANSPORT, ['stdio', 'http'] as const, 'stdio');
  const httpPort = parseNumber(env.HTTP_PORT, 3000);
  const httpHost = env.HTTP_HOST?.trim() || '127.0.0.1';
  const allowedHosts = parseHostList(env.ALLOWED_HOSTS);

  // Fail-fast (NEU-834): a non-localhost HTTP bind must declare ALLOWED_HOSTS so
  // the SDK's Host-header DNS-rebinding check engages. Localhost binds keep the
  // SDK's automatic localhost validation and need no ALLOWED_HOSTS. Mirrors the
  // AUTH_ISSUER/AUTH_AUDIENCE fail-fast pattern. STDIO is unaffected.
  if (mode === 'http' && !LOCALHOST_BINDS.has(httpHost) && allowedHosts.length === 0) {
    throw new Error(
      `ALLOWED_HOSTS is required when TRANSPORT=http and HTTP_HOST is a non-localhost bind ` +
        `(got "${httpHost}"). Set ALLOWED_HOSTS to the comma-separated hostnames clients use ` +
        `to reach the server, or bind HTTP_HOST to 127.0.0.1/localhost/::1.`
    );
  }

  return {
    mode,
    httpPort,
    httpHost,
    ...(allowedHosts.length > 0 ? { allowedHosts } : {}),
  };
}
