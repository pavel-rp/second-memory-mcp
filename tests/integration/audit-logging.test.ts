import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import http from 'node:http';
import { startHttpTransport, type HttpTransportHandle } from '../../src/transport/http.js';
import { createMcpServer } from '../../src/transport/create-server.js';
import { createMockAppContext } from '../helpers/mock-app-context.js';
import type { TransportConfig } from '../../src/config/resolve-transport-config.js';

vi.mock('../../src/shared/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  createAuditPinoLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
  withHttpCorrelation: vi.fn((_id: string, fn: () => unknown) => fn()),
  getCorrelationId: vi.fn(() => undefined),
  createEventPinoLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
  setEventLogger: vi.fn(),
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

describe('audit logging integration', () => {
  let handle: HttpTransportHandle;
  const config: TransportConfig = {
    mode: 'http',
    httpHost: '127.0.0.1',
    httpPort: 0,
  };

  beforeEach(async () => {
    // Set DATABASE_URL so audit middleware is enabled
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

    const ctx = createMockAppContext();
    handle = await startHttpTransport(config, () => createMcpServer(ctx));
  });

  afterEach(async () => {
    await handle.close();
    delete process.env.DATABASE_URL;
  });

  it('MCP responds normally when audit logging is active', async () => {
    // Send initialize request
    const initRes = await makeRequest(handle.port, {
      method: 'POST',
      body: {
        jsonrpc: '2.0',
        method: 'initialize',
        id: 1,
        params: {
          protocolVersion: '2025-03-26',
          capabilities: {},
          clientInfo: { name: 'test-client', version: '1.0.0' },
        },
      },
    });

    // MCP should respond with valid JSON-RPC regardless of audit state
    expect(initRes.status).toBe(200);
    const body = JSON.parse(
      initRes.body
        .split('\n')
        .filter(l => l.startsWith('data: '))[0]
        ?.slice(6) ?? initRes.body
    );
    expect(body.jsonrpc).toBe('2.0');
    expect(body.result).toBeDefined();
  });
});
