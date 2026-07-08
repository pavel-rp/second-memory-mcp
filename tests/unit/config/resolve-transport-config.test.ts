import { describe, it, expect } from 'vitest';
import { resolveTransportConfig } from '../../../src/config/resolve-transport-config.js';

describe('resolveTransportConfig', () => {
  it('returns defaults with empty env', () => {
    expect(resolveTransportConfig({})).toEqual({
      mode: 'stdio',
      httpPort: 3000,
      httpHost: '127.0.0.1',
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

  it('falls back to 127.0.0.1 for empty HTTP_HOST', () => {
    expect(resolveTransportConfig({ HTTP_HOST: '' }).httpHost).toBe('127.0.0.1');
  });

  it('falls back to 127.0.0.1 for whitespace-only HTTP_HOST', () => {
    expect(resolveTransportConfig({ HTTP_HOST: '   ' }).httpHost).toBe('127.0.0.1');
  });

  // ── ALLOWED_HOSTS / Host-header DNS-rebinding fail-fast (NEU-834) ──────────

  it('leaves allowedHosts undefined on the default localhost bind', () => {
    expect(resolveTransportConfig({ TRANSPORT: 'http' }).allowedHosts).toBeUndefined();
  });

  it.each(['127.0.0.1', 'localhost', '::1'])(
    'starts a localhost bind (%s) without ALLOWED_HOSTS',
    host => {
      const result = resolveTransportConfig({ TRANSPORT: 'http', HTTP_HOST: host });
      expect(result.httpHost).toBe(host);
      expect(result.allowedHosts).toBeUndefined();
    }
  );

  it('throws when HTTP_HOST is a non-localhost bind and ALLOWED_HOSTS is unset', () => {
    expect(() => resolveTransportConfig({ TRANSPORT: 'http', HTTP_HOST: '0.0.0.0' })).toThrow(
      'ALLOWED_HOSTS'
    );
  });

  it('parses ALLOWED_HOSTS for a non-localhost bind', () => {
    const result = resolveTransportConfig({
      TRANSPORT: 'http',
      HTTP_HOST: '0.0.0.0',
      ALLOWED_HOSTS: 'mcp.example.com',
    });
    expect(result.allowedHosts).toEqual(['mcp.example.com']);
  });

  it('trims and splits a comma-separated ALLOWED_HOSTS list', () => {
    const result = resolveTransportConfig({
      TRANSPORT: 'http',
      HTTP_HOST: '0.0.0.0',
      ALLOWED_HOSTS: ' a.example.com , b.example.com ,, ',
    });
    expect(result.allowedHosts).toEqual(['a.example.com', 'b.example.com']);
  });

  it('does not fail-fast on a non-localhost HTTP_HOST in STDIO mode', () => {
    const result = resolveTransportConfig({ TRANSPORT: 'stdio', HTTP_HOST: '0.0.0.0' });
    expect(result.mode).toBe('stdio');
    expect(result.allowedHosts).toBeUndefined();
  });

  it('treats whitespace-only ALLOWED_HOSTS as unset (fails on non-localhost bind)', () => {
    expect(() =>
      resolveTransportConfig({ TRANSPORT: 'http', HTTP_HOST: '0.0.0.0', ALLOWED_HOSTS: '   ' })
    ).toThrow('ALLOWED_HOSTS');
  });
});
