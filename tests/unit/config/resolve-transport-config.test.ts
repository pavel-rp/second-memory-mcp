import { describe, it, expect } from 'vitest';
import { resolveTransportConfig } from '../../../src/config/resolve-transport-config.js';

describe('resolveTransportConfig', () => {
  it('returns defaults with empty env', () => {
    expect(resolveTransportConfig({})).toEqual({
      mode: 'stdio',
      httpPort: 3000,
      httpHost: '0.0.0.0',
    });
  });

  it('sets mode to http when TRANSPORT=http', () => {
    expect(resolveTransportConfig({ TRANSPORT: 'http' }).mode).toBe('http');
  });

  it('sets mode to stdio when TRANSPORT=stdio', () => {
    expect(resolveTransportConfig({ TRANSPORT: 'stdio' }).mode).toBe('stdio');
  });

  it('falls back to stdio for invalid TRANSPORT value', () => {
    expect(resolveTransportConfig({ TRANSPORT: 'websocket' }).mode).toBe('stdio');
  });

  it('is case-insensitive for TRANSPORT', () => {
    expect(resolveTransportConfig({ TRANSPORT: 'HTTP' }).mode).toBe('http');
  });

  it('overrides httpPort from HTTP_PORT', () => {
    expect(resolveTransportConfig({ HTTP_PORT: '8080' }).httpPort).toBe(8080);
  });

  it('falls back to 3000 for non-numeric HTTP_PORT', () => {
    expect(resolveTransportConfig({ HTTP_PORT: 'abc' }).httpPort).toBe(3000);
  });

  it('overrides httpHost from HTTP_HOST', () => {
    expect(resolveTransportConfig({ HTTP_HOST: '127.0.0.1' }).httpHost).toBe('127.0.0.1');
  });

  it('trims whitespace from HTTP_HOST', () => {
    expect(resolveTransportConfig({ HTTP_HOST: '  localhost  ' }).httpHost).toBe('localhost');
  });

  it('falls back to 0.0.0.0 for empty HTTP_HOST', () => {
    expect(resolveTransportConfig({ HTTP_HOST: '' }).httpHost).toBe('0.0.0.0');
  });

  it('falls back to 0.0.0.0 for whitespace-only HTTP_HOST', () => {
    expect(resolveTransportConfig({ HTTP_HOST: '   ' }).httpHost).toBe('0.0.0.0');
  });
});
