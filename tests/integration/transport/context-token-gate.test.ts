import { describe, it, expect, vi, afterEach } from 'vitest';
import http from 'node:http';
import { startHttpTransport, type HttpTransportHandle } from '../../../src/transport/http.js';
import { createMcpServer } from '../../../src/transport/create-server.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import type { TransportConfig } from '../../../src/config/resolve-transport-config.js';
import type { ContextTokenRepository } from '../../../src/ports/context-token-repository.js';

vi.mock('../../../src/shared/logger.js', () => ({
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

const config: TransportConfig = {
  mode: 'http',
  httpHost: '127.0.0.1',
  httpPort: 0,
};

function makeRequest(port: number, body: unknown): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: '/mcp',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: MCP_ACCEPT,
        },
      },
      res => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode ?? 0, body: Buffer.concat(chunks).toString('utf-8') });
        });
      }
    );
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

function makeStubRepo(overrides?: Partial<ContextTokenRepository>): ContextTokenRepository {
  return {
    create: vi.fn(),
    validate: vi.fn(),
    validateWithStatus: vi.fn().mockResolvedValue({ valid: false, expired: false }),
    delete: vi.fn(),
    deleteExpired: vi.fn(),
    ...overrides,
  } as unknown as ContextTokenRepository;
}

async function startGate(repo: ContextTokenRepository): Promise<HttpTransportHandle> {
  const ctx = createMockAppContext();
  return startHttpTransport(config, () => createMcpServer(ctx), null, repo);
}

describe('context token gate integration', () => {
  let handle: HttpTransportHandle;

  afterEach(async () => {
    await handle.close();
  });

  it('returns auth error for tools/call without context_token', async () => {
    handle = await startGate(makeStubRepo());

    const res = await makeRequest(handle.port, {
      jsonrpc: '2.0',
      method: 'tools/call',
      id: 1,
      params: { name: 'teach_next', arguments: { session_id: 'abc' } },
    });

    expect(res.status).toBe(200);
    const body = JSON.parse(res.body) as {
      result: { isError: boolean; content: { text: string }[] };
    };
    expect(body.result.isError).toBe(true);
    const payload = JSON.parse(body.result.content[0].text) as {
      error: { type: string; retryable: boolean };
    };
    expect(payload.error.type).toBe('auth');
    expect(payload.error.retryable).toBe(true);
  });

  it('returns auth error with expired message for expired token', async () => {
    handle = await startGate(
      makeStubRepo({
        validateWithStatus: vi.fn().mockResolvedValue({ valid: false, expired: true }),
      })
    );

    const res = await makeRequest(handle.port, {
      jsonrpc: '2.0',
      method: 'tools/call',
      id: 1,
      params: { name: 'teach_next', arguments: { context_token: 'ctx-old' } },
    });

    expect(res.status).toBe(200);
    const body = JSON.parse(res.body) as {
      result: { isError: boolean; content: { text: string }[] };
    };
    expect(body.result.isError).toBe(true);
    const payload = JSON.parse(body.result.content[0].text) as { message: string };
    expect(payload.message).toMatch(/expired/i);
  });

  it('passes through to session handler for valid token (no auth error)', async () => {
    handle = await startGate(
      makeStubRepo({
        validateWithStatus: vi.fn().mockResolvedValue({ valid: true, expired: false }),
      })
    );

    const res = await makeRequest(handle.port, {
      jsonrpc: '2.0',
      method: 'tools/call',
      id: 1,
      params: { name: 'teach_next', arguments: { context_token: 'ctx-valid' } },
    });

    // Middleware passed — session handler responded with 400 (no session ID)
    expect(res.status).toBe(400);
    const body = JSON.parse(res.body) as { result?: unknown; error?: unknown };
    expect(body.result).toBeUndefined();
    expect(body.error).toBeDefined();
  });

  it('bypasses context_token check for excluded tool init_agent_context', async () => {
    const repo = makeStubRepo(); // validateWithStatus returns invalid by default
    handle = await startGate(repo);

    const res = await makeRequest(handle.port, {
      jsonrpc: '2.0',
      method: 'tools/call',
      id: 1,
      params: { name: 'init_agent_context', arguments: {} },
    });

    // Middleware bypassed — not an auth error
    expect(res.status).toBe(400);
    const body = JSON.parse(res.body) as { result?: unknown };
    expect(body.result).toBeUndefined();
    expect(repo.validateWithStatus).not.toHaveBeenCalled();
  });

  it('does not gate non-tools/call requests (initialize passes through)', async () => {
    handle = await startGate(makeStubRepo());

    const res = await makeRequest(handle.port, {
      jsonrpc: '2.0',
      method: 'initialize',
      id: 1,
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' },
      },
    });

    // initialize is not tools/call — middleware skips it, MCP server responds
    expect(res.status).toBe(200);
    const rawBody =
      res.body
        .split('\n')
        .find((l: string) => l.startsWith('data: '))
        ?.slice(6) ?? res.body;
    const body = JSON.parse(rawBody) as { jsonrpc: string; result?: unknown };
    expect(body.jsonrpc).toBe('2.0');
    expect(body.result).toBeDefined();
  });
});
