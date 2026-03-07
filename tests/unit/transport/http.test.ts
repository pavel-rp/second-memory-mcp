import { describe, it, expect, beforeAll, vi } from 'vitest';
import http from 'node:http';
import { startHttpTransport } from '../../../src/transport/http.js';
import { createMcpServer } from '../../../src/transport/create-server.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import type { TransportConfig } from '../../../src/config/resolve-transport-config.js';

vi.mock('../../../src/shared/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
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
  const port = 19876;
  const config: TransportConfig = { mode: 'http', httpPort: port, httpHost: '127.0.0.1' };
  const ctx = createMockAppContext();

  beforeAll(async () => {
    await startHttpTransport(config, () => createMcpServer(ctx));
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
    expect(parsed.error.code).toBe(-32000);
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

  // ── POST with invalid session ID ──────────────────────────────

  it('returns 400 for POST with invalid session ID and non-init body', async () => {
    const res = await makeRequest(port, {
      method: 'POST',
      headers: { 'mcp-session-id': 'does-not-exist' },
      body: { jsonrpc: '2.0', method: 'tools/list', id: 3 },
    });
    expect(res.status).toBe(400);
  });
});
