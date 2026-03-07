// Composition root layer: reads process.env and returns transport configuration
// This is the only place transport config touches environment variables

import { parseNumber, parseEnum } from '../shared/env-parsing.js';

export type TransportMode = 'stdio' | 'http';

export type TransportConfig = {
  mode: TransportMode;
  httpPort: number;
  httpHost: string;
};

export function resolveTransportConfig(
  env: Record<string, string | undefined> = process.env
): TransportConfig {
  return {
    mode: parseEnum(env.TRANSPORT, ['stdio', 'http'] as const, 'stdio'),
    httpPort: parseNumber(env.HTTP_PORT, 3000),
    httpHost: env.HTTP_HOST?.trim() || '0.0.0.0',
  };
}
