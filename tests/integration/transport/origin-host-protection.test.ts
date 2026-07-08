import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import http from 'node:http';
import { startHttpTransport, type HttpTransportHandle } from '../../../src/transport/http.js';
import { createMcpServer } from '../../../src/transport/create-server.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { resolveAuthConfig } from '../../../src/config/resolve-auth-config.js';
import { resolveTransportConfig } from '../../../src/config/resolve-transport-config.js';
import type { TransportConfig } from '../../../src/config/resolve-transport-config.js';
import type { AuthConfig } from '../../../src/config/resolve-auth-config.js';

// Mock only the logger so the audit middleware never touches a real DB.
vi.mock('../../../src/shared/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    debug: vi.fn(),
  },
  createAuditPinoLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    debug: vi.fn(),
  })),
  withHttpCorrelation: vi.fn((_id: string, fn: () => unknown) => fn()),
  getCorrelationId: vi.fn(() => undefined),
  createEventPinoLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    debug: vi.fn(),
  })),
  setEventLogger: vi.fn(),
}));

// jose is mocked so any Bearer token verifies — this suite exercises Origin /
// Host-header protection, not JWT signature validation (which the
// jwt-audience-enforcement suite covers end-to-end with real jose).
vi.mock('jose', () => ({
  jwtVerify: vi.fn().mockResolvedValue({
    payload: { sub: 'test-user', email: 'test@example.com' },
  }),
  createRemoteJWKSet: vi.fn().mockReturnValue(vi.fn()),
}));

// OIDC discovery fetch used by createJwtMiddleware at startup.
vi.stubGlobal(
  'fetch',
  vi.fn().mockImplementation(() =>
    Promise.resolve(
      new Response(JSON.stringify({ jwks_uri: 'https://auth.test.local/oidc/certs' }), {
        status: 200,
      })
    )
  )
);

const MCP_ACCEPT = 'application/json, text/event-stream';
const ALLOWED_ORIGIN = 'https://app.test.local';

const INIT_BODY = {
  jsonrpc: '2.0',
  method: 'initialize',
  params: {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'test', version: '1.0' },
  },
  id: 1,
};

function makeRequest(
  port: number,
  options: { method: string; path?: string; headers?: Record<string, string>; body?: unknown }
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: options.path ?? '/mcp',
        method: options.method,
        headers: { 'Content-Type': 'application/json', Accept: MCP_ACCEPT, ...options.headers },
      },
      res => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () =>
          resolve({
            status: res.statusCode ?? 0,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf-8'),
          })
        );
      }
    );
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

// ── Origin validation (403 forged-Origin rejection ahead of CORS) ────────────

describe('Origin validation (HTTP transport)', () => {
  const authConfig: AuthConfig = {
    issuer: 'https://auth.test.local',
    audience: 'https://mcp.test.local/mcp',
    corsAllowedOrigins: [ALLOWED_ORIGIN],
  };
  const config: TransportConfig = { mode: 'http', httpPort: 0, httpHost: '127.0.0.1' };
  const ctx = createMockAppContext();
  let handle: HttpTransportHandle;
  let port: number;
  let processOnSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    processOnSpy = vi
      .spyOn(process, 'on')
      .mockImplementation(
        (_event: string | symbol, _handler: (...args: unknown[]) => void) => process
      );
    handle = await startHttpTransport(config, () => createMcpServer(ctx), authConfig);
    port = handle.port;
  });

  afterAll(async () => {
    processOnSpy.mockRestore();
    await handle.close();
  });

  it('proceeds to the handler for an allowlisted Origin', async () => {
    const res = await makeRequest(port, {
      method: 'POST',
      headers: { Authorization: 'Bearer valid', Origin: ALLOWED_ORIGIN },
      body: INIT_BODY,
    });
    expect(res.status).toBe(200);
    expect(res.headers['mcp-session-id']).toBeDefined();
  });

  it('proceeds when no Origin header is present (non-browser MCP client)', async () => {
    const res = await makeRequest(port, {
      method: 'POST',
      headers: { Authorization: 'Bearer valid' },
      body: { ...INIT_BODY, id: 2 },
    });
    expect(res.status).toBe(200);
    expect(res.headers['mcp-session-id']).toBeDefined();
  });

  it('rejects a present, non-allowlisted Origin with 403 before any handler', async () => {
    // A valid bearer token is supplied to prove the Origin gate precedes auth
    // and the route handlers — the request never reaches them.
    const res = await makeRequest(port, {
      method: 'POST',
      headers: { Authorization: 'Bearer valid', Origin: 'https://evil.example' },
      body: { ...INIT_BODY, id: 3 },
    });
    expect(res.status).toBe(403);
    expect(res.headers['mcp-session-id']).toBeUndefined();
    const parsed = JSON.parse(res.body) as { error: { message: string } };
    expect(parsed.error.message).toContain('origin not allowed');
  });

  it('rejects a forged Origin ahead of the JWT check (no auth header, still 403 not 401)', async () => {
    const res = await makeRequest(port, {
      method: 'POST',
      headers: { Origin: 'https://evil.example' },
      body: { ...INIT_BODY, id: 4 },
    });
    expect(res.status).toBe(403);
  });
});

// ── Host-header DNS-rebinding protection — default localhost bind ─────────────

describe('Host-header protection (default localhost bind, no ALLOWED_HOSTS)', () => {
  const config: TransportConfig = { mode: 'http', httpPort: 0, httpHost: '127.0.0.1' };
  const ctx = createMockAppContext();
  let handle: HttpTransportHandle;
  let port: number;
  let processOnSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    processOnSpy = vi
      .spyOn(process, 'on')
      .mockImplementation(
        (_event: string | symbol, _handler: (...args: unknown[]) => void) => process
      );
    handle = await startHttpTransport(config, () => createMcpServer(ctx));
    port = handle.port;
  });

  afterAll(async () => {
    processOnSpy.mockRestore();
    await handle.close();
  });

  it('starts without ALLOWED_HOSTS on a localhost bind', () => {
    expect(port).toBeGreaterThan(0);
  });

  it('accepts a request whose Host is localhost (SDK auto-validation passes)', async () => {
    const res = await makeRequest(port, { method: 'GET', path: '/health' });
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ status: 'ok' });
  });

  it('rejects a forged Host header with 403 (SDK localhost validation active)', async () => {
    const res = await makeRequest(port, {
      method: 'GET',
      path: '/health',
      headers: { Host: 'attacker.example' },
    });
    expect(res.status).toBe(403);
    const parsed = JSON.parse(res.body) as { error: { message: string } };
    expect(parsed.error.message).toContain('Invalid Host');
  });
});

// ── Host-header DNS-rebinding protection — non-localhost bind + ALLOWED_HOSTS ─

describe('Host-header protection (non-localhost bind with ALLOWED_HOSTS)', () => {
  // Bind to all interfaces; the allowlist must include 127.0.0.1 so the default
  // Host header of loopback requests passes, plus a custom hostname to prove the
  // list — not localhost auto-validation — is what engages.
  const config: TransportConfig = {
    mode: 'http',
    httpPort: 0,
    httpHost: '0.0.0.0',
    allowedHosts: ['127.0.0.1', 'myapp.local'],
  };
  const ctx = createMockAppContext();
  let handle: HttpTransportHandle;
  let port: number;
  let processOnSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    processOnSpy = vi
      .spyOn(process, 'on')
      .mockImplementation(
        (_event: string | symbol, _handler: (...args: unknown[]) => void) => process
      );
    handle = await startHttpTransport(config, () => createMcpServer(ctx));
    port = handle.port;
  });

  afterAll(async () => {
    processOnSpy.mockRestore();
    await handle.close();
  });

  it('starts on a non-localhost bind when ALLOWED_HOSTS is set', () => {
    expect(port).toBeGreaterThan(0);
  });

  it('accepts a request whose Host is in ALLOWED_HOSTS', async () => {
    const res = await makeRequest(port, {
      method: 'GET',
      path: '/health',
      headers: { Host: 'myapp.local' },
    });
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ status: 'ok' });
  });

  it('rejects a Host not in ALLOWED_HOSTS with 403 (allowedHosts engaged)', async () => {
    const res = await makeRequest(port, {
      method: 'GET',
      path: '/health',
      headers: { Host: 'attacker.example' },
    });
    expect(res.status).toBe(403);
    const parsed = JSON.parse(res.body) as { error: { message: string } };
    expect(parsed.error.message).toContain('Invalid Host');
  });
});

// ── Startup fail-fast (config resolution) ────────────────────────────────────

describe('Startup fail-fast for Origin/Host misconfiguration', () => {
  const HTTP_ENV = {
    AUTH_ISSUER: 'https://auth.example.com',
    AUTH_AUDIENCE: 'https://mcp.example.com/mcp',
  };

  it('fails startup when CORS_ALLOWED_ORIGINS is unset in HTTP mode', () => {
    expect(() => resolveAuthConfig('http', { ...HTTP_ENV })).toThrow('CORS_ALLOWED_ORIGINS');
  });

  it('fails startup when CORS_ALLOWED_ORIGINS is the wildcard "*"', () => {
    expect(() =>
      resolveAuthConfig('http', { ...HTTP_ENV, CORS_ALLOWED_ORIGINS: '*' })
    ).toThrow('CORS_ALLOWED_ORIGINS');
  });

  it('fails startup when CORS_ALLOWED_ORIGINS contains "*" among explicit origins', () => {
    expect(() =>
      resolveAuthConfig('http', {
        ...HTTP_ENV,
        CORS_ALLOWED_ORIGINS: 'https://app.example.com,*',
      })
    ).toThrow('must not contain "*"');
  });

  it('accepts an explicit CORS_ALLOWED_ORIGINS list in HTTP mode', () => {
    const result = resolveAuthConfig('http', {
      ...HTTP_ENV,
      CORS_ALLOWED_ORIGINS: 'https://app.example.com',
    });
    expect(result?.corsAllowedOrigins).toEqual(['https://app.example.com']);
  });

  it('fails startup for a non-localhost HTTP_HOST bind without ALLOWED_HOSTS', () => {
    expect(() =>
      resolveTransportConfig({ TRANSPORT: 'http', HTTP_HOST: '0.0.0.0' })
    ).toThrow('ALLOWED_HOSTS');
  });

  it('starts a non-localhost bind when ALLOWED_HOSTS is set', () => {
    const result = resolveTransportConfig({
      TRANSPORT: 'http',
      HTTP_HOST: '0.0.0.0',
      ALLOWED_HOSTS: 'myapp.local',
    });
    expect(result.allowedHosts).toEqual(['myapp.local']);
  });

  it('starts the default localhost bind without ALLOWED_HOSTS', () => {
    const result = resolveTransportConfig({ TRANSPORT: 'http' });
    expect(result.httpHost).toBe('127.0.0.1');
    expect(result.allowedHosts).toBeUndefined();
  });

  it('leaves STDIO unaffected by a non-localhost HTTP_HOST', () => {
    const result = resolveTransportConfig({ TRANSPORT: 'stdio', HTTP_HOST: '0.0.0.0' });
    expect(result.mode).toBe('stdio');
    expect(result.allowedHosts).toBeUndefined();
  });
});
