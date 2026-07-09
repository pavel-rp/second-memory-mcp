import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import http from 'node:http';
import { SignJWT, exportJWK, generateKeyPair, type JWK } from 'jose';
import { startHttpTransport, type HttpTransportHandle } from '../../../src/transport/http.js';
import { createMcpServer } from '../../../src/transport/create-server.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import type { TransportConfig } from '../../../src/config/resolve-transport-config.js';
import type { AuthConfig } from '../../../src/config/resolve-auth-config.js';

// Mock only the logger so the audit middleware never touches a real DB.
// jose is intentionally NOT mocked — this test exercises real JWT signature,
// issuer, and audience validation end-to-end through the transport (NEU-882).
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

describe('JWT issuer trailing-slash + dyn$ audience (HTTP transport, real jose)', () => {
  let authServer: http.Server;
  // AUTH_ISSUER is configured WITHOUT a trailing slash; the AS advertises and mints
  // `iss` WITH one — the exact NEU-882 mismatch that used to 401 every request.
  let issuer: string;
  let issuerWithSlash: string;
  let trustedKey: Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];
  let untrustedKey: Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];
  let handle: HttpTransportHandle;
  let port: number;
  let processOnSpy: ReturnType<typeof vi.spyOn>;

  async function signToken(opts: {
    key: Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];
    kid?: string;
    iss?: string;
    aud?: string;
    sub?: string;
  }): Promise<string> {
    let jwt = new SignJWT({})
      .setProtectedHeader({ alg: 'RS256', kid: opts.kid ?? KID })
      .setIssuer(opts.iss ?? issuerWithSlash)
      .setSubject(opts.sub ?? 'user-1')
      .setIssuedAt()
      .setExpirationTime('5m');
    if (opts.aud !== undefined) jwt = jwt.setAudience(opts.aud);
    return jwt.sign(opts.key);
  }

  beforeAll(async () => {
    const trusted = await generateKeyPair('RS256');
    const untrusted = await generateKeyPair('RS256');
    trustedKey = trusted.privateKey;
    untrustedKey = untrusted.privateKey;

    // Only the trusted public key is published in the JWKS.
    const publicJwk: JWK = {
      ...(await exportJWK(trusted.publicKey)),
      kid: KID,
      alg: 'RS256',
      use: 'sig',
    };

    authServer = http.createServer((req, res) => {
      const host = req.headers.host ?? '127.0.0.1';
      if (req.url === '/.well-known/openid-configuration') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        // Advertise the issuer WITH a trailing slash (Rauthy's format).
        res.end(
          JSON.stringify({ issuer: `http://${host}/`, jwks_uri: `http://${host}/jwks.json` })
        );
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
    issuerWithSlash = `${issuer}/`;

    const authConfig: AuthConfig = {
      issuer, // configured WITHOUT a trailing slash
      audience: AUDIENCE,
      corsAllowedOrigins: ['*'],
    };
    const config: TransportConfig = { mode: 'http', httpPort: 0, httpHost: '127.0.0.1' };
    const ctx = createMockAppContext();

    // Avoid registering real SIGINT/SIGTERM handlers during the test.
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
    await new Promise<void>(resolve => authServer.close(() => resolve()));
  });

  it('accepts a token whose iss carries a trailing slash the config lacks (NEU-882)', async () => {
    const token = await signToken({ key: trustedKey, iss: issuerWithSlash, aud: AUDIENCE });
    const res = await makeRequest(port, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: INIT_BODY,
    });
    expect(res.status).toBe(200);
    expect(res.headers['mcp-session-id']).toBeDefined();
  });

  it('rejects a token from an untrusted issuer with 401', async () => {
    const token = await signToken({
      key: trustedKey,
      iss: 'https://evil.example.com/',
      aud: AUDIENCE,
    });
    const res = await makeRequest(port, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: INIT_BODY,
    });
    expect(res.status).toBe(401);
  });

  it('rejects a token signed by an untrusted key with 401', async () => {
    const token = await signToken({
      key: untrustedKey,
      kid: 'untrusted-key-1',
      iss: issuerWithSlash,
      aud: AUDIENCE,
    });
    const res = await makeRequest(port, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: INIT_BODY,
    });
    expect(res.status).toBe(401);
  });

  it('accepts a DCR dyn$ audience from the trusted issuer (NEU-882)', async () => {
    const token = await signToken({
      key: trustedKey,
      iss: issuerWithSlash,
      aud: 'dyn$ZeqN7HUePudbYlt2',
    });
    const res = await makeRequest(port, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: INIT_BODY,
    });
    expect(res.status).toBe(200);
    expect(res.headers['mcp-session-id']).toBeDefined();
  });

  it('still rejects a token with an unrelated, non-dyn$ audience with 401 (NEU-833 preserved)', async () => {
    const token = await signToken({
      key: trustedKey,
      iss: issuerWithSlash,
      aud: 'https://someone-else.example.com/mcp',
    });
    const res = await makeRequest(port, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: INIT_BODY,
    });
    expect(res.status).toBe(401);
  });
});
