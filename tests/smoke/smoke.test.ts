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

const BASE_URL = process.env.MCP_BASE_URL;
const AUTH_TOKEN = process.env.MCP_AUTH_TOKEN;

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

async function mcpPost(body: unknown, sessionId?: string) {
  const res = await fetch(`${BASE_URL}/mcp`, {
    method: 'POST',
    headers: headers(sessionId),
    body: JSON.stringify(body),
  });
  return res;
}

// ── Test suite ──────────────────────────────────────────────

describe.skipIf(!BASE_URL)('Smoke tests', () => {
  let sessionId: string | undefined;

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

    // Notifications return 202 Accepted (no response body)
    expect(res.status).toBe(202);
  });

  // ── list_learning_items (DB connectivity) ──────────────

  it('list_learning_items returns valid response', async () => {
    expect(sessionId).toBeDefined();

    const res = await mcpPost(
      jsonRpcRequest('tools/call', {
        name: 'list_learning_items',
        arguments: {},
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

    // The tool returns JSON-encoded data in a text content block
    const text = body.result!.content![0]!.text;
    const parsed = JSON.parse(text) as unknown;
    expect(Array.isArray(parsed)).toBe(true);
  });

  // ── session_workflow ───────────────────────────────────

  it('session_workflow returns valid response with inline session_data', async () => {
    expect(sessionId).toBeDefined();

    const now = new Date().toISOString();
    const res = await mcpPost(
      jsonRpcRequest('tools/call', {
        name: 'session_workflow',
        arguments: {
          session_data: {
            session_id: 'smoke-test-session',
            mode: 'learning',
            start_time: now,
            chunks: [
              {
                chunk_id: 'smoke-chunk-1',
                title: 'Smoke Test Chunk',
                status: 'pending',
                attempts: [],
                quality_scores: [],
                time_spent_ms: 0,
              },
            ],
          },
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

    const parsed = JSON.parse(body.result!.content![0]!.text) as {
      current_phase?: string;
    };
    expect(parsed.current_phase).toBeDefined();
  });

  // ── Session cleanup ────────────────────────────────────

  it('session DELETE cleans up gracefully', async () => {
    expect(sessionId).toBeDefined();

    const res = await fetch(`${BASE_URL}/mcp`, {
      method: 'DELETE',
      headers: headers(sessionId),
    });

    // 200 on successful close, or 400 if session already gone — both acceptable
    expect([200, 202, 204, 400]).toContain(res.status);
  });
});
