import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import http from 'node:http';
import { SignJWT, exportJWK, generateKeyPair, type JWK } from 'jose';
import { startHttpTransport, type HttpTransportHandle } from '../../../src/transport/http.js';
import { createMcpServer } from '../../../src/transport/create-server.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import type { TransportConfig } from '../../../src/config/resolve-transport-config.js';
import type { AuthConfig } from '../../../src/config/resolve-auth-config.js';

// Mock only the logger so the audit middleware never touches a real DB.
// jose is intentionally NOT mocked — this test exercises real JWT signature
// and audience validation end-to-end through the transport.
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

describe('JWT audience enforcement (HTTP transport, real jose)', () => {
  let authServer: http.Server;
  let issuer: string;
  let privateKey: Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];
  let handle: HttpTransportHandle;
  let port: number;
  let processOnSpy: ReturnType<typeof vi.spyOn>;

  async function signToken(claims: { aud?: string; sub?: string }): Promise<string> {
    let jwt = new SignJWT({})
      .setProtectedHeader({ alg: 'RS256', kid: KID })
      .setIssuer(issuer)
      .setSubject(claims.sub ?? 'user-1')
      .setIssuedAt()
      .setExpirationTime('5m');
    if (claims.aud !== undefined) jwt = jwt.setAudience(claims.aud);
    return jwt.sign(privateKey);
  }

  beforeAll(async () => {
    // Real RSA keypair; publish the public JWK via a local JWKS endpoint.
    const keyPair = await generateKeyPair('RS256');
    privateKey = keyPair.privateKey;
    const publicJwk: JWK = {
      ...(await exportJWK(keyPair.publicKey)),
      kid: KID,
      alg: 'RS256',
      use: 'sig',
    };

    authServer = http.createServer((req, res) => {
      const host = req.headers.host ?? `127.0.0.1`;
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

    const authConfig: AuthConfig = {
      issuer,
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

  it('rejects a token whose aud does not match AUTH_AUDIENCE with 401', async () => {
    const token = await signToken({ aud: 'https://someone-else.example.com/mcp' });
    const res = await makeRequest(port, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: INIT_BODY,
    });
    expect(res.status).toBe(401);
    expect(res.headers['www-authenticate']).toContain('resource_metadata=');
  });

  it('rejects a token with no aud claim with 401', async () => {
    const token = await signToken({});
    const res = await makeRequest(port, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: INIT_BODY,
    });
    expect(res.status).toBe(401);
  });

  it('accepts a token whose aud matches AUTH_AUDIENCE', async () => {
    const token = await signToken({ aud: AUDIENCE });
    const res = await makeRequest(port, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: INIT_BODY,
    });
    expect(res.status).toBe(200);
    expect(res.headers['mcp-session-id']).toBeDefined();
  });

  it('still rejects requests with no Authorization header (401)', async () => {
    const res = await makeRequest(port, { method: 'POST', body: INIT_BODY });
    expect(res.status).toBe(401);
  });

  // ── Audience↔PRM coupling stays consistent with the enforced value ──

  it('PRM resource identifier equals AUTH_AUDIENCE', async () => {
    const res = await makeRequest(port, {
      method: 'GET',
      path: '/.well-known/oauth-protected-resource/mcp',
    });
    expect(res.status).toBe(200);
    const body = JSON.parse(res.body) as { resource: string; authorization_servers: string[] };
    expect(body.resource).toBe(AUDIENCE);
    expect(body.authorization_servers).toEqual([issuer]);
  });

  it('WWW-Authenticate resource_metadata URL derives from the audience origin', async () => {
    const res = await makeRequest(port, { method: 'POST', body: INIT_BODY });
    expect(res.status).toBe(401);
    expect(res.headers['www-authenticate']).toBe(
      'Bearer resource_metadata="https://mcp.test.local/.well-known/oauth-protected-resource/mcp"'
    );
  });
});
