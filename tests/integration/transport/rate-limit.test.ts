import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import http from 'node:http';
import { SignJWT, exportJWK, generateKeyPair, type JWK } from 'jose';
import { startHttpTransport, type HttpTransportHandle } from '../../../src/transport/http.js';
import { createMcpServer } from '../../../src/transport/create-server.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import type { TransportConfig } from '../../../src/config/resolve-transport-config.js';
import type { AuthConfig } from '../../../src/config/resolve-auth-config.js';
import type { RateLimitConfig } from '../../../src/config/resolve-rate-limit-config.js';

// Mock only the logger so the audit middleware never touches a real DB.
// jose is intentionally NOT mocked — this test signs real JWTs for two distinct
// subjects so the per-subject limiter keys on the genuine `sub` claim.
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

const MCP_ACCEPT = 'application/json, text/event-stream';
const KID = 'test-key-1';
const AUDIENCE = 'https://mcp.test.local/mcp';
const MAX_REQUESTS = 2;

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

describe('Per-subject rate limiting (HTTP transport, real jose)', () => {
  let authServer: http.Server;
  let issuer: string;
  let privateKey: Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];
  let handle: HttpTransportHandle;
  let port: number;
  let processOnSpy: ReturnType<typeof vi.spyOn>;

  async function signToken(sub: string): Promise<string> {
    return new SignJWT({})
      .setProtectedHeader({ alg: 'RS256', kid: KID })
      .setIssuer(issuer)
      .setSubject(sub)
      .setAudience(AUDIENCE)
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(privateKey);
  }

  async function postInit(token: string, id: number) {
    return makeRequest(port, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { ...INIT_BODY, id },
    });
  }

  beforeAll(async () => {
    const keyPair = await generateKeyPair('RS256');
    privateKey = keyPair.privateKey;
    const publicJwk: JWK = {
      ...(await exportJWK(keyPair.publicKey)),
      kid: KID,
      alg: 'RS256',
      use: 'sig',
    };

    authServer = http.createServer((req, res) => {
      const host = req.headers.host ?? '127.0.0.1';
      if (req.url === '/.well-known/openid-configuration') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ issuer: `http://${host}`, jwks_uri: `http://${host}/jwks.json` }));
        return;
      }
      if (req.url === '/jwks.json') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ keys: [publicJwk] }));
        return;
      }
      res.writeHead(404);
      res.end();
    });
    await new Promise<void>(resolve => authServer.listen(0, '127.0.0.1', resolve));
    const authAddr = authServer.address();
    const authPort = typeof authAddr === 'object' && authAddr ? authAddr.port : 0;
    issuer = `http://127.0.0.1:${authPort}`;

    const authConfig: AuthConfig = { issuer, audience: AUDIENCE, corsAllowedOrigins: ['*'] };
    const rateLimitConfig: RateLimitConfig = { maxRequests: MAX_REQUESTS, windowMs: 60_000 };
    const config: TransportConfig = { mode: 'http', httpPort: 0, httpHost: '127.0.0.1' };
    const ctx = createMockAppContext();

    processOnSpy = vi
      .spyOn(process, 'on')
      .mockImplementation(
        (_event: string | symbol, _handler: (...args: unknown[]) => void) => process
      );
    handle = await startHttpTransport(
      config,
      () => createMcpServer(ctx),
      authConfig,
      null,
      undefined,
      rateLimitConfig
    );
    port = handle.port;
  });

  afterAll(async () => {
    processOnSpy.mockRestore();
    await handle.close();
    await new Promise<void>(resolve => authServer.close(() => resolve()));
  });

  it('drives one subject over the limit → 429, while another subject is unaffected → 200', async () => {
    const tokenA = await signToken('subject-a');
    const tokenB = await signToken('subject-b');

    // Subject A: the first MAX_REQUESTS POSTs are authorized.
    for (let i = 0; i < MAX_REQUESTS; i++) {
      const res = await postInit(tokenA, 100 + i);
      expect(res.status).toBe(200);
      expect(res.headers['mcp-session-id']).toBeDefined();
    }

    // Subject A: the next POST exceeds the limit → 429 (rejected before the handler).
    const overLimit = await postInit(tokenA, 200);
    expect(overLimit.status).toBe(429);
    expect(overLimit.headers['mcp-session-id']).toBeUndefined();
    expect(overLimit.headers['retry-after']).toBeDefined();
    const parsed = JSON.parse(overLimit.body) as { jsonrpc: string; error: { message: string } };
    expect(parsed.jsonrpc).toBe('2.0');
    expect(parsed.error.message).toContain('Too Many Requests');

    // Subject B, within its own limit, is completely unaffected.
    const bRes = await postInit(tokenB, 300);
    expect(bRes.status).toBe(200);
    expect(bRes.headers['mcp-session-id']).toBeDefined();
  });

  it('keeps rejecting the over-limit subject on subsequent requests', async () => {
    const tokenA = await signToken('subject-a');
    // subject-a is already over its window from the previous test; still 429.
    const res = await postInit(tokenA, 400);
    expect(res.status).toBe(429);
  });

  it('still authorizes an unauthenticated-free subject that stays under its limit', async () => {
    const tokenC = await signToken('subject-c');
    const res = await postInit(tokenC, 500);
    expect(res.status).toBe(200);
    expect(res.headers['mcp-session-id']).toBeDefined();
  });
});
