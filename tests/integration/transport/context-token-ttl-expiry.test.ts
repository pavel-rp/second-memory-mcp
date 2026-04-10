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

describe('context token TTL expiry integration', () => {
  let handle: HttpTransportHandle;

  afterEach(async () => {
    await handle.close();
  });

  it('expired token error includes TTL duration when ttlMs is configured', async () => {
    const repo = makeStubRepo({
      validateWithStatus: vi.fn().mockResolvedValue({ valid: false, expired: true }),
    });
    const ttlMs = 7_200_000; // 2 hours
    const ctx = createMockAppContext();
    handle = await startHttpTransport(config, () => createMcpServer(ctx), null, repo, ttlMs);

    const res = await makeRequest(handle.port, {
      jsonrpc: '2.0',
      method: 'tools/call',
      id: 1,
      params: { name: 'teach_next', arguments: { context_token: 'ctx-expired' } },
    });

    expect(res.status).toBe(200);
    const body = JSON.parse(res.body) as {
      result: { isError: boolean; content: { type: string; text: string }[] };
    };
    expect(body.result.isError).toBe(true);

    const payload = JSON.parse(body.result.content[0].text) as {
      success: boolean;
      error: { type: string; retryable: boolean };
      message: string;
    };
    expect(payload.success).toBe(false);
    expect(payload.error.type).toBe('auth');
    expect(payload.error.retryable).toBe(true);
    expect(payload.message).toContain('valid for 2 hours');
    expect(payload.message).toContain('init_agent_context');
    expect(payload.message).toContain('latest domain rules');
  });

  it('expired error is JSON-RPC compliant with retryable flag', async () => {
    const repo = makeStubRepo({
      validateWithStatus: vi.fn().mockResolvedValue({ valid: false, expired: true }),
    });
    const ctx = createMockAppContext();
    handle = await startHttpTransport(
      config,
      () => createMcpServer(ctx),
      null,
      repo,
      300_000 // 5 minutes
    );

    const res = await makeRequest(handle.port, {
      jsonrpc: '2.0',
      method: 'tools/call',
      id: 42,
      params: { name: 'submit_answer', arguments: { context_token: 'ctx-old' } },
    });

    expect(res.status).toBe(200);
    const body = JSON.parse(res.body) as {
      jsonrpc: string;
      id: number;
      result: { isError: boolean; content: { type: string; text: string }[] };
    };
    expect(body.jsonrpc).toBe('2.0');
    expect(body.id).toBe(42);
    expect(body.result.isError).toBe(true);

    const payload = JSON.parse(body.result.content[0].text) as {
      error: { retryable: boolean };
      message: string;
    };
    expect(payload.error.retryable).toBe(true);
    expect(payload.message).toContain('valid for 5 minutes');
  });

  it('init_agent_context bypasses expired token gate and reaches session handler', async () => {
    const repo = makeStubRepo({
      validateWithStatus: vi.fn().mockResolvedValue({ valid: false, expired: true }),
    });
    const ctx = createMockAppContext();
    handle = await startHttpTransport(config, () => createMcpServer(ctx), null, repo, 7_200_000);

    const res = await makeRequest(handle.port, {
      jsonrpc: '2.0',
      method: 'tools/call',
      id: 1,
      params: { name: 'init_agent_context', arguments: {} },
    });

    // Middleware bypassed — reaches session handler (400 = no session, not auth error)
    expect(res.status).toBe(400);
    const body = JSON.parse(res.body) as { result?: unknown };
    expect(body.result).toBeUndefined();
    expect(repo.validateWithStatus).not.toHaveBeenCalled();
  });

  it('valid token passes through after re-init', async () => {
    const validateMock = vi
      .fn()
      .mockResolvedValueOnce({ valid: false, expired: true }) // first call: expired
      .mockResolvedValueOnce({ valid: true, expired: false }); // second call: valid (re-init)
    const repo = makeStubRepo({ validateWithStatus: validateMock });
    const ctx = createMockAppContext();
    handle = await startHttpTransport(config, () => createMcpServer(ctx), null, repo, 7_200_000);

    // First call — expired
    const res1 = await makeRequest(handle.port, {
      jsonrpc: '2.0',
      method: 'tools/call',
      id: 1,
      params: { name: 'teach_next', arguments: { context_token: 'ctx-old' } },
    });
    const body1 = JSON.parse(res1.body) as {
      result: { isError: boolean; content: { text: string }[] };
    };
    expect(body1.result.isError).toBe(true);

    // Second call — valid after re-init
    const res2 = await makeRequest(handle.port, {
      jsonrpc: '2.0',
      method: 'tools/call',
      id: 2,
      params: { name: 'teach_next', arguments: { context_token: 'ctx-new' } },
    });

    // Middleware passed — session handler responded (400 = no session, no auth error)
    expect(res2.status).toBe(400);
    const body2 = JSON.parse(res2.body) as { result?: unknown; error?: unknown };
    expect(body2.result).toBeUndefined();
    expect(body2.error).toBeDefined();
  });
});
