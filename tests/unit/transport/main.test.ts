import { describe, it, expect } from 'vitest';
import { resolveTransportConfig } from '../../../src/config/resolve-transport-config.js';

// main.ts is a bootstrap module with top-level side effects (process.exit, dotenv/config).
// Its logic is tested indirectly: resolveTransportConfig, createMcpServer, and startHttpTransport
// each have dedicated test suites. This file verifies the config wiring is correct.

describe('transport/main bootstrap wiring', () => {
  it('resolveTransportConfig defaults to stdio mode', () => {
    const config = resolveTransportConfig({});
    expect(config.mode).toBe('stdio');
  });

  it('resolveTransportConfig switches to http mode', () => {
    const config = resolveTransportConfig({ TRANSPORT: 'http' });
    expect(config.mode).toBe('http');
  });
});
