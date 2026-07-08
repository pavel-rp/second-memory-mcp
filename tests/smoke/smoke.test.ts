import { describe, it, expect } from 'vitest';

/**
 * Post-deploy smoke tests for a live MCP instance.
 *
 * Requires MCP_BASE_URL env var (e.g. https://2mem-test.neurasphere.ee).
 * Optionally accepts MCP_AUTH_TOKEN for authenticated instances.
 *
 * Tests exercise the Streamable HTTP transport at POST /mcp using
 * raw JSON-RPC 2.0 requests — no MCP SDK dependency needed.
 */

const RAW_BASE_URL = process.env.MCP_BASE_URL;
const AUTH_TOKEN = process.env.MCP_AUTH_TOKEN;

// Normalize: strip trailing slashes, build canonical endpoint
const BASE_URL = RAW_BASE_URL?.replace(/\/+$/, '');
const MCP_ENDPOINT = BASE_URL ? new URL('/mcp', BASE_URL).toString() : '';

// ── JSON-RPC helpers ────────────────────────────────────────

let requestId = 0;

function jsonRpcRequest(method: string, params?: Record<string, unknown>) {
  return {
    jsonrpc: '2.0' as const,
    id: ++requestId,
    method,
    ...(params !== undefined ? { params } : {}),
  };
}

function jsonRpcNotification(method: string, params?: Record<string, unknown>) {
  return {
    jsonrpc: '2.0' as const,
    method,
    ...(params !== undefined ? { params } : {}),
  };
}

function headers(sessionId?: string): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };
  if (AUTH_TOKEN) h['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  if (sessionId) h['mcp-session-id'] = sessionId;
  return h;
}

/**
 * Parse a response that may be JSON or SSE (text/event-stream).
 * SSE responses contain `event: message` + `data: <json>` lines.
 */
async function parseResponse(res: Response): Promise<unknown> {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('text/event-stream')) {
    const text = await res.text();
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        return JSON.parse(line.slice(6));
      }
    }
    throw new Error(`No data line found in SSE response:\n${text}`);
  }
  return res.json();
}

/**
 * Decode the standard MCP tool-response envelope emitted by
 * `toolData` / `toolError` in src/server/tool-helpers.ts.
 *
 * Kept local to the smoke suite — production imports are intentionally
 * avoided so the smoke tests exercise the wire contract, not the code.
 */
type ToolEnvelope =
  | { status: 'ok'; data: unknown }
  | { status: 'error'; error: { type: string; message: string; retryable: boolean } };

function parseEnvelope(text: string): ToolEnvelope {
  try {
    return JSON.parse(text) as ToolEnvelope;
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    const truncated = text.length > 500 ? `${text.slice(0, 500)}…` : text;
    throw new Error(`parseEnvelope: invalid JSON (${reason}). Payload: ${truncated}`, {
      cause: err,
    });
  }
}

async function mcpPost(body: unknown, sessionId?: string) {
  return fetch(MCP_ENDPOINT, {
    method: 'POST',
    headers: headers(sessionId),
    body: JSON.stringify(body),
  });
}

// ── Test suite ──────────────────────────────────────────────

describe.skipIf(!BASE_URL)('Public endpoints', () => {
  it('GET /health returns ok', async () => {
    const res = await fetch(new URL('/health', BASE_URL!));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: 'ok' });
  });

  it('GET /version returns server info', async () => {
    const res = await fetch(new URL('/version', BASE_URL!));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name: string; version: string; buildTime: string | null };
    expect(body.name).toBe('second-memory-learning');
    expect(body.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(typeof body.buildTime).toBe('string');
    expect((body.buildTime as string).length).toBeGreaterThan(0);
  });
});

describe.skipIf(!BASE_URL)('Smoke tests', () => {
  let sessionId: string | undefined;
  let contextToken: string | undefined;

  // ── Initialize handshake ────────────────────────────────

  it('MCP initialize handshake returns session and capabilities', async () => {
    const res = await mcpPost(
      jsonRpcRequest('initialize', {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: 'smoke-test', version: '1.0.0' },
      })
    );

    expect(res.status).toBe(200);

    sessionId = res.headers.get('mcp-session-id') ?? undefined;
    expect(sessionId).toBeDefined();

    const body = (await parseResponse(res)) as {
      result?: { serverInfo?: { name: string }; capabilities?: Record<string, unknown> };
    };
    expect(body.result).toBeDefined();
    expect(body.result!.serverInfo).toBeDefined();
    expect(body.result!.capabilities).toBeDefined();
  });

  // ── Send initialized notification ──────────────────────

  it('accepts initialized notification', async () => {
    expect(sessionId).toBeDefined();

    const res = await mcpPost(jsonRpcNotification('notifications/initialized'), sessionId);

    // Notifications may return any success status (often 202 or 204)
    expect(res.status).toBeLessThan(400);
  });

  // ── init_agent_context (obtain context_token) ──────────

  it('init_agent_context returns a context_token', async () => {
    expect(sessionId).toBeDefined();

    const res = await mcpPost(
      jsonRpcRequest('tools/call', {
        name: 'init_agent_context',
        arguments: {},
      }),
      sessionId
    );

    expect(res.status).toBe(200);

    const body = (await parseResponse(res)) as {
      result?: { content?: Array<{ type: string; text: string }> };
    };
    expect(body.result?.content?.[0]?.text).toBeDefined();

    const parsed = parseEnvelope(body.result!.content![0]!.text);
    expect(parsed.status).toBe('ok');
    if (parsed.status !== 'ok') throw new Error('unreachable');
    const data = parsed.data as {
      context_token?: string;
      action?: string;
      learner_context?: unknown;
    };
    expect(typeof data.context_token).toBe('string');
    expect(data.action).toBe('initialized');
    // null is acceptable (graceful degradation); we only verify the field is present.
    // `toHaveProperty` yields a clean assertion failure if `data` ever drifts to
    // a non-object — unlike the `in` operator, which throws TypeError on null.
    expect(data).toHaveProperty('learner_context');
    contextToken = data.context_token;
  });

  // ── list_learning_items (DB connectivity) ──────────────

  it('list_learning_items returns valid response', async () => {
    expect(sessionId).toBeDefined();
    expect(contextToken).toBeDefined();

    const res = await mcpPost(
      jsonRpcRequest('tools/call', {
        name: 'list_learning_items',
        arguments: { context_token: contextToken },
      }),
      sessionId
    );

    expect(res.status).toBe(200);

    const body = (await parseResponse(res)) as {
      result?: { content?: Array<{ type: string; text: string }> };
    };
    expect(body.result).toBeDefined();
    expect(body.result!.content).toBeDefined();
    expect(Array.isArray(body.result!.content)).toBe(true);
    expect(body.result!.content!.length).toBeGreaterThan(0);

    // The tool returns a standard envelope with data = array of items
    const parsed = parseEnvelope(body.result!.content![0]!.text);
    expect(parsed.status).toBe('ok');
    if (parsed.status !== 'ok') throw new Error('unreachable');
    expect(Array.isArray(parsed.data)).toBe(true);
  });

  // ── session_status ───────────────────────────────────

  it('session_status returns error for nonexistent session_id', async () => {
    expect(sessionId).toBeDefined();
    expect(contextToken).toBeDefined();

    const res = await mcpPost(
      jsonRpcRequest('tools/call', {
        name: 'session_status',
        arguments: {
          context_token: contextToken,
          session_id: 'smoke-nonexistent-session',
        },
      }),
      sessionId
    );

    expect(res.status).toBe(200);

    const body = (await parseResponse(res)) as {
      result?: { content?: Array<{ type: string; text: string }> };
    };
    expect(body.result).toBeDefined();
    expect(body.result!.content).toBeDefined();
    expect(body.result!.content!.length).toBeGreaterThan(0);

    const parsed = parseEnvelope(body.result!.content![0]!.text);
    expect(parsed.status).toBe('error');
    if (parsed.status !== 'error') throw new Error('unreachable');
    expect(parsed.error.type).toBe('not_found');
  });

  // ── Session cleanup ────────────────────────────────────

  it('session DELETE cleans up gracefully', async () => {
    expect(sessionId).toBeDefined();

    const res = await fetch(MCP_ENDPOINT, {
      method: 'DELETE',
      headers: headers(sessionId),
    });

    // 200 on successful close, or 400 if session already gone — both acceptable
    expect([200, 202, 204, 400]).toContain(res.status);
  });
});
