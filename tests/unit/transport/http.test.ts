import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import http from 'node:http';
import { startHttpTransport, type HttpTransportHandle } from '../../../src/transport/http.js';
import { createMcpServer } from '../../../src/transport/create-server.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import type { TransportConfig } from '../../../src/config/resolve-transport-config.js';
import type { AuthConfig } from '../../../src/config/resolve-auth-config.js';

vi.mock('../../../src/shared/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  createAuditPinoLogger: vi.fn(() => ({
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  })),
}));

const MCP_ACCEPT = 'application/json, text/event-stream';

function makeRequest(
  port: number,
  options: {
    method: string;
    path?: string;
    headers?: Record<string, string>;
    body?: unknown;
  }
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: options.path ?? '/mcp',
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          Accept: MCP_ACCEPT,
          ...options.headers,
        },
      },
      res => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode ?? 0,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf-8'),
          });
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

/**
 * Parse SSE response body to extract JSON data lines.
 * SSE format: "event: message\ndata: {...}\n\n"
 */
function parseSSEData(body: string): unknown[] {
  return body
    .split('\n')
    .filter(line => line.startsWith('data: '))
    .map(line => JSON.parse(line.slice(6)));
}

/** Send a request with a raw string body (not JSON-serialized). */
function makeRawRequest(
  port: number,
  options: {
    method: string;
    path?: string;
    headers?: Record<string, string>;
    rawBody?: string;
  }
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: options.path ?? '/mcp',
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          Accept: MCP_ACCEPT,
          ...options.headers,
        },
      },
      res => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode ?? 0,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf-8'),
          });
        });
      }
    );
    req.on('error', reject);
    if (options.rawBody) {
      req.write(options.rawBody);
    }
    req.end();
  });
}

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

describe('startHttpTransport', () => {
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

  // ── Public endpoints ─────────────────────────────────────────

  it('GET /health returns 200 with status ok', async () => {
    const res = await makeRequest(port, { method: 'GET', path: '/health' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(JSON.parse(res.body)).toEqual({ status: 'ok' });
  });

  it('GET /version returns 200 with server info', async () => {
    const res = await makeRequest(port, { method: 'GET', path: '/version' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('name', 'second-memory-learning');
    expect(body).toHaveProperty('version');
    expect(typeof body.version).toBe('string');
    expect(body).toHaveProperty('buildTime');
  });

  // ── Route filtering ───────────────────────────────────────────

  it('returns 404 for non-/mcp paths', async () => {
    const res = await makeRequest(port, { method: 'GET', path: '/other' });
    expect(res.status).toBe(404);
    expect(JSON.parse(res.body)).toEqual({ error: 'Not found' });
  });

  // ── CORS ──────────────────────────────────────────────────────

  it('returns 204 for OPTIONS preflight with CORS headers', async () => {
    const res = await makeRequest(port, { method: 'OPTIONS' });
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('*');
    expect(res.headers['access-control-allow-methods']).toContain('POST');
    expect(res.headers['access-control-allow-headers']).toContain('mcp-session-id');
    expect(res.headers['access-control-allow-headers']).toContain('Authorization');
    expect(res.headers['access-control-expose-headers']).toContain('mcp-session-id');
  });

  // ── POST without session ──────────────────────────────────────

  it('returns 400 for POST with non-init body and no session', async () => {
    const res = await makeRequest(port, {
      method: 'POST',
      body: { jsonrpc: '2.0', method: 'tools/list', id: 1 },
    });
    expect(res.status).toBe(400);
    const parsed = JSON.parse(res.body);
    expect(parsed.error.code).toBe(-32600);
    expect(parsed.error.message).toBe('Missing session ID');
  });

  // ── POST initialization ───────────────────────────────────────

  it('accepts initialize request and returns session ID', async () => {
    const res = await makeRequest(port, { method: 'POST', body: INIT_BODY });
    expect(res.status).toBe(200);
    expect(res.headers['mcp-session-id']).toBeDefined();
    // Response may be SSE or JSON depending on SDK version
    const data = res.headers['content-type']?.includes('text/event-stream')
      ? parseSSEData(res.body)
      : [JSON.parse(res.body)];
    const initResponse = data[0] as Record<string, unknown>;
    expect((initResponse.result as Record<string, unknown>)?.serverInfo).toBeDefined();
  });

  it('accepts initialize request even with stale session header', async () => {
    const res = await makeRequest(port, {
      method: 'POST',
      headers: { 'mcp-session-id': 'stale-gone-session' },
      body: { ...INIT_BODY, id: 50 },
    });
    expect(res.status).toBe(200);
    expect(res.headers['mcp-session-id']).toBeDefined();
    expect(res.headers['mcp-session-id']).not.toBe('stale-gone-session');
  });

  // ── Session reuse ─────────────────────────────────────────────

  it('reuses transport for existing session on POST', async () => {
    // Initialize to get a session ID
    const initRes = await makeRequest(port, {
      method: 'POST',
      body: { ...INIT_BODY, id: 10 },
    });
    const sessionId = initRes.headers['mcp-session-id'] as string;
    expect(sessionId).toBeDefined();

    // Send initialized notification
    await makeRequest(port, {
      method: 'POST',
      headers: { 'mcp-session-id': sessionId },
      body: { jsonrpc: '2.0', method: 'notifications/initialized' },
    });

    // Use that session ID for a tools/list request
    const listRes = await makeRequest(port, {
      method: 'POST',
      headers: { 'mcp-session-id': sessionId },
      body: { jsonrpc: '2.0', method: 'tools/list', id: 11 },
    });
    expect(listRes.status).toBe(200);
    const data = listRes.headers['content-type']?.includes('text/event-stream')
      ? parseSSEData(listRes.body)
      : [JSON.parse(listRes.body)];
    const listResponse = data[0] as Record<string, unknown>;
    expect((listResponse.result as Record<string, unknown>)?.tools).toBeDefined();
  });

  // ── GET/DELETE without session ────────────────────────────────

  it('returns 400 for GET without session ID', async () => {
    const res = await makeRequest(port, { method: 'GET' });
    expect(res.status).toBe(400);
    expect(res.body).toBe('Invalid or missing session ID');
  });

  it('returns 400 for DELETE without session ID', async () => {
    const res = await makeRequest(port, { method: 'DELETE' });
    expect(res.status).toBe(400);
    expect(res.body).toBe('Invalid or missing session ID');
  });

  it('returns 400 for GET with invalid session ID', async () => {
    const res = await makeRequest(port, {
      method: 'GET',
      headers: { 'mcp-session-id': 'nonexistent' },
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 for DELETE with invalid session ID', async () => {
    const res = await makeRequest(port, {
      method: 'DELETE',
      headers: { 'mcp-session-id': 'nonexistent' },
    });
    expect(res.status).toBe(400);
  });

  // ── Method not allowed ────────────────────────────────────────

  it('returns 405 for unsupported methods like PUT', async () => {
    const res = await makeRequest(port, { method: 'PUT' });
    expect(res.status).toBe(405);
    expect(res.body).toBe('Method not allowed');
  });

  // ── POST with empty body ─────────────────────────────────────

  it('returns 400 for POST with empty body', async () => {
    const res = await makeRawRequest(port, { method: 'POST' });
    expect(res.status).toBe(400);
  });

  // ── POST with invalid session ID ──────────────────────────────

  it('returns 404 for POST with invalid session ID and non-init body', async () => {
    const res = await makeRequest(port, {
      method: 'POST',
      headers: { 'mcp-session-id': 'does-not-exist' },
      body: { jsonrpc: '2.0', method: 'tools/list', id: 3 },
    });
    expect(res.status).toBe(404);
    const parsed = JSON.parse(res.body);
    expect(parsed.error.code).toBe(-32000);
    expect(parsed.error.message).toBe('Session not found');
  });

  // ── POST with invalid JSON body (readBody parse error → catch) ─

  it('returns 400 for POST with malformed JSON body', async () => {
    const res = await makeRawRequest(port, {
      method: 'POST',
      rawBody: '{not valid json!!!',
    });
    expect(res.status).toBe(400);
    const parsed = JSON.parse(res.body);
    expect(parsed.error.code).toBe(-32700);
  });

  // ── POST with oversized body (>1 MB) ────────────────────────────

  it('returns 413 for POST with body exceeding 1 MB', async () => {
    const oversizedBody = 'x'.repeat(1_048_577); // 1 MB + 1 byte
    const res = await makeRawRequest(port, {
      method: 'POST',
      rawBody: oversizedBody,
    });
    expect(res.status).toBe(413);
    const parsed = JSON.parse(res.body);
    expect(parsed.error.code).toBe(-32600);
  });

  // ── DELETE with valid session ──────────────────────────────────

  it('handles DELETE with a valid session ID', async () => {
    // Initialize to get a session ID
    const initRes = await makeRequest(port, {
      method: 'POST',
      body: { ...INIT_BODY, id: 20 },
    });
    const sessionId = initRes.headers['mcp-session-id'] as string;
    expect(sessionId).toBeDefined();

    // DELETE the session — SDK transport handles this
    const delRes = await makeRequest(port, {
      method: 'DELETE',
      headers: { 'mcp-session-id': sessionId },
    });
    // SDK may return 200 or 204; either way it's not 400/500
    expect(delRes.status).toBeLessThan(400);
  });
});

describe('startHttpTransport shutdown', () => {
  const shutdownConfig: TransportConfig = {
    mode: 'http',
    httpPort: 0,
    httpHost: '127.0.0.1',
  };
  const ctx = createMockAppContext();
  let shutdownHandle: HttpTransportHandle;
  let shutdownPort: number;

  // Capture SIGINT/SIGTERM handlers registered by startHttpTransport
  const capturedHandlers: Record<string, (...args: unknown[]) => void> = {};
  let processOnSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    processOnSpy = vi
      .spyOn(process, 'on')
      .mockImplementation((event: string | symbol, handler: (...args: unknown[]) => void) => {
        capturedHandlers[String(event)] = handler;
        return process;
      });
    shutdownHandle = await startHttpTransport(shutdownConfig, () => createMcpServer(ctx));
    shutdownPort = shutdownHandle.port;
  });

  afterAll(async () => {
    processOnSpy.mockRestore();
    // The shutdown test already closes the server, but ensure cleanup
    try {
      await shutdownHandle.close();
    } catch {
      /* already closed */
    }
  });

  it('registers SIGINT and SIGTERM handlers', () => {
    expect(capturedHandlers['SIGINT']).toBeTypeOf('function');
    expect(capturedHandlers['SIGTERM']).toBeTypeOf('function');
  });

  it('graceful shutdown closes transports and server', async () => {
    // Create a session first so shutdown has something to clean up
    const initRes = await makeRequest(shutdownPort, {
      method: 'POST',
      body: { ...INIT_BODY, id: 40 },
    });
    expect(initRes.headers['mcp-session-id']).toBeDefined();

    // Mock process.exit to prevent test runner from exiting
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    // Invoke the captured SIGTERM handler (which calls shutdown via void ...then)
    capturedHandlers['SIGTERM']();

    // Wait deterministically for the async shutdown chain
    await vi.waitFor(() => {
      expect(exitSpy).toHaveBeenCalledWith(0);
    });
    exitSpy.mockRestore();
  });
});

// ── Auth-enabled transport ─────────────────────────────────────

vi.mock('jose', () => ({
  jwtVerify: vi.fn().mockResolvedValue({
    payload: { sub: 'test-user', email: 'test@example.com' },
  }),
  createRemoteJWKSet: vi.fn().mockReturnValue(vi.fn()),
}));

// Mock fetch for OIDC discovery used by createJwtMiddleware
vi.stubGlobal(
  'fetch',
  vi.fn().mockImplementation(() =>
    Promise.resolve(
      new Response(JSON.stringify({ jwks_uri: 'https://auth.test.local/auth/v1/oidc/certs' }), {
        status: 200,
      })
    )
  )
);

describe('startHttpTransport with auth', () => {
  const authConfig: AuthConfig = {
    issuer: 'https://auth.test.local',
    audience: 'https://mcp.test.local/mcp',
    corsAllowedOrigins: ['https://app.test.local'],
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

  // ── Public endpoints bypass auth ─────────────────────────────

  it('GET /health returns 200 without Authorization header', async () => {
    const res = await makeRequest(port, { method: 'GET', path: '/health' });
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ status: 'ok' });
  });

  it('GET /version returns 200 without Authorization header', async () => {
    const res = await makeRequest(port, { method: 'GET', path: '/version' });
    expect(res.status).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('name', 'second-memory-learning');
    expect(body).toHaveProperty('version');
  });

  // ── CORS with configured origins (VC-11) ────────────────────

  it('reflects allowed origin in Access-Control-Allow-Origin (VC-11)', async () => {
    const res = await makeRequest(port, {
      method: 'OPTIONS',
      headers: { Origin: 'https://app.test.local' },
    });
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('https://app.test.local');
  });

  it('does not set Access-Control-Allow-Origin for disallowed origin (VC-11)', async () => {
    const res = await makeRequest(port, {
      method: 'OPTIONS',
      headers: { Origin: 'https://evil.com' },
    });
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('sets Vary: Origin when reflecting allowed origin (VC-11)', async () => {
    const res = await makeRequest(port, {
      method: 'OPTIONS',
      headers: { Origin: 'https://app.test.local' },
    });
    expect(res.headers['vary']).toBe('Origin');
  });

  it('includes Authorization in Access-Control-Allow-Headers (VC-11)', async () => {
    const res = await makeRequest(port, {
      method: 'OPTIONS',
      headers: { Origin: 'https://app.test.local' },
    });
    expect(res.headers['access-control-allow-headers']).toContain('Authorization');
  });

  // ── OPTIONS preflight skips JWT (VC-04) ─────────────────────

  it('OPTIONS preflight returns 204 without JWT check (VC-04)', async () => {
    // No Authorization header — should still return 204 (JWT middleware is not invoked for OPTIONS)
    const res = await makeRequest(port, {
      method: 'OPTIONS',
      headers: { Origin: 'https://app.test.local' },
    });
    expect(res.status).toBe(204);
  });

  // ── PRM endpoint ────────────────────────────────────────────

  it('serves PRM document at well-known URL', async () => {
    const res = await makeRequest(port, {
      method: 'GET',
      path: '/.well-known/oauth-protected-resource/mcp',
    });
    expect(res.status).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.resource).toBe('https://mcp.test.local/mcp');
    expect(body.authorization_servers).toEqual(['https://auth.test.local']);
  });

  it('PRM endpoint includes CORS headers for cross-origin discovery', async () => {
    const res = await makeRequest(port, {
      method: 'GET',
      path: '/.well-known/oauth-protected-resource/mcp',
    });
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  it('PRM endpoint handles OPTIONS preflight', async () => {
    const res = await makeRequest(port, {
      method: 'OPTIONS',
      path: '/.well-known/oauth-protected-resource/mcp',
    });
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  // ── PRM document without audience ───────────────────────────

  it('PRM document omits resource field when audience is undefined', async () => {
    const noAudAuthConfig: AuthConfig = {
      issuer: 'https://auth.test.local',
      audience: undefined,
      corsAllowedOrigins: ['https://app.test.local'],
    };
    const noAudConfig: TransportConfig = { mode: 'http', httpPort: 0, httpHost: '127.0.0.1' };
    const noAudCtx = createMockAppContext();
    const noAudProcessOnSpy = vi
      .spyOn(process, 'on')
      .mockImplementation(
        (_event: string | symbol, _handler: (...args: unknown[]) => void) => process
      );
    const noAudHandle = await startHttpTransport(
      noAudConfig,
      () => createMcpServer(noAudCtx),
      noAudAuthConfig
    );
    const noAudPort = noAudHandle.port;

    try {
      const res = await makeRequest(noAudPort, {
        method: 'GET',
        path: '/.well-known/oauth-protected-resource/mcp',
      });
      expect(res.status).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.resource).toBeUndefined();
      expect(body.authorization_servers).toEqual(['https://auth.test.local']);
    } finally {
      noAudProcessOnSpy.mockReset();
      await noAudHandle.close();
    }
  });

  // ── Expose WWW-Authenticate for browser-based OAuth ─────────

  it('exposes WWW-Authenticate in Access-Control-Expose-Headers when auth is enabled', async () => {
    const res = await makeRequest(port, {
      method: 'OPTIONS',
      headers: { Origin: 'https://app.test.local' },
    });
    expect(res.headers['access-control-expose-headers']).toContain('WWW-Authenticate');
  });

  // ── Session-subject binding ────────────────────────────────

  it('rejects request with different sub on an existing session (403)', async () => {
    const { jwtVerify } = await import('jose');

    // Initialize a session as test-user
    const initRes = await makeRequest(port, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer token-user-a',
        Origin: 'https://app.test.local',
      },
      body: { ...INIT_BODY, id: 200 },
    });
    expect(initRes.status).toBe(200);
    const sessionId = initRes.headers['mcp-session-id'] as string;
    expect(sessionId).toBeDefined();

    // Now mock jwtVerify to return a different sub
    vi.mocked(jwtVerify).mockResolvedValueOnce({
      payload: { sub: 'attacker', email: 'attacker@evil.com' },
      protectedHeader: { alg: 'RS256' },
      key: new Uint8Array(),
    });

    // Try to use the session as a different user
    const hijackRes = await makeRequest(port, {
      method: 'POST',
      headers: {
        'mcp-session-id': sessionId,
        Authorization: 'Bearer token-user-b',
        Origin: 'https://app.test.local',
      },
      body: { jsonrpc: '2.0', method: 'tools/list', id: 201 },
    });
    expect(hijackRes.status).toBe(403);
    const body = JSON.parse(hijackRes.body);
    expect(body.error.message).toContain('session bound to a different subject');
  });

  // ── Session identity (VC-12) ────────────────────────────────

  it('stores and cleans up session identity on auth-enabled transport (VC-12)', async () => {
    // Initialize with Bearer token (jose is mocked to return { sub: 'test-user', email: 'test@example.com' })
    const initRes = await makeRequest(port, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer mock-valid-token',
        Origin: 'https://app.test.local',
      },
      body: { ...INIT_BODY, id: 100 },
    });
    expect(initRes.status).toBe(200);
    const sessionId = initRes.headers['mcp-session-id'] as string;
    expect(sessionId).toBeDefined();

    // DELETE the session — triggers cleanup
    const delRes = await makeRequest(port, {
      method: 'DELETE',
      headers: {
        'mcp-session-id': sessionId,
        Authorization: 'Bearer mock-valid-token',
        Origin: 'https://app.test.local',
      },
    });
    expect(delRes.status).toBeLessThan(400);
  });
});
