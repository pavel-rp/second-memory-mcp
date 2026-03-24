import build from 'pino-abstract-transport';
import pg from 'pg';

interface AuditLogEntry {
  timestamp: string;
  method?: string;
  rpcId?: string;
  params?: unknown;
  responseStatus?: number;
  responseBody?: string;
  durationMs?: number;
}

interface CircuitBreakerState {
  status: 'closed' | 'open' | 'half-open';
  consecutiveFailures: number;
  openedAt: number;
}

interface PgAuditTransportOptions {
  connectionString: string;
  batchSize?: number;
  flushIntervalMs?: number;
  circuitBreakerThreshold?: number;
  circuitBreakerResetMs?: number;
}

const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_FLUSH_INTERVAL_MS = 5_000;
const DEFAULT_CIRCUIT_BREAKER_THRESHOLD = 5;
const DEFAULT_CIRCUIT_BREAKER_RESET_MS = 60_000;

/** Truncate response bodies beyond this size before DB insertion. */
const MAX_RESPONSE_BODY_BYTES = 65_536;

export default async function pgAuditTransport(opts: PgAuditTransportOptions) {
  const batchSize = opts.batchSize ?? DEFAULT_BATCH_SIZE;
  const flushIntervalMs = opts.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS;
  const cbThreshold = opts.circuitBreakerThreshold ?? DEFAULT_CIRCUIT_BREAKER_THRESHOLD;
  const cbResetMs = opts.circuitBreakerResetMs ?? DEFAULT_CIRCUIT_BREAKER_RESET_MS;

  const pool = new pg.Pool({ connectionString: opts.connectionString });
  let buffer: AuditLogEntry[] = [];
  let flushTimer: ReturnType<typeof setInterval> | null = null;

  const cb: CircuitBreakerState = {
    status: 'closed',
    consecutiveFailures: 0,
    openedAt: 0,
  };

  function shouldAllowWrite(): boolean {
    if (cb.status === 'closed') return true;
    if (cb.status === 'open') {
      if (Date.now() - cb.openedAt >= cbResetMs) {
        cb.status = 'half-open';
        return true;
      }
      return false;
    }
    // half-open: allow one attempt
    return true;
  }

  function recordSuccess(): void {
    cb.status = 'closed';
    cb.consecutiveFailures = 0;
  }

  function recordFailure(): void {
    cb.consecutiveFailures++;
    if (cb.consecutiveFailures >= cbThreshold) {
      cb.status = 'open';
      cb.openedAt = Date.now();
    }
  }

  async function flushBuffer(): Promise<void> {
    if (buffer.length === 0) return;

    if (!shouldAllowWrite()) {
      const dropped = buffer.length;
      buffer = [];
      process.stderr.write(
        `[pg-audit-transport] Circuit breaker open — dropped ${dropped} audit entries\n`
      );
      return;
    }

    const batch = buffer;
    buffer = [];

    try {
      const values: unknown[] = [];
      const placeholders: string[] = [];
      let paramIdx = 1;

      for (const entry of batch) {
        placeholders.push(
          `($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}::jsonb, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`
        );
        values.push(
          entry.method ?? null,
          entry.rpcId ?? null,
          entry.timestamp,
          entry.params != null ? JSON.stringify(entry.params) : null,
          entry.responseStatus ?? null,
          entry.responseBody ?? null,
          entry.durationMs ?? null
        );
      }

      const sql = `INSERT INTO infrastructure.mcp_request_log (method, rpc_id, timestamp, params, response_status, response_body, duration_ms) VALUES ${placeholders.join(', ')}`;
      await pool.query(sql, values);
      recordSuccess();
    } catch (err) {
      recordFailure();
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(
        `[pg-audit-transport] Failed to write audit batch (${batch.length} entries): ${message}\n`
      );
    }
  }

  function parseLogEntry(obj: Record<string, unknown>): AuditLogEntry | null {
    // Only process entries tagged as mcp-audit
    if (obj.module !== 'mcp-audit') return null;
    return {
      timestamp: typeof obj.time === 'string' ? obj.time : new Date().toISOString(),
      method: typeof obj.method === 'string' ? obj.method : undefined,
      rpcId: typeof obj.rpcId === 'string' ? obj.rpcId : undefined,
      params: obj.params,
      responseStatus: typeof obj.responseStatus === 'number' ? obj.responseStatus : undefined,
      responseBody:
        typeof obj.responseBody === 'string'
          ? obj.responseBody.length > MAX_RESPONSE_BODY_BYTES
            ? obj.responseBody.slice(0, MAX_RESPONSE_BODY_BYTES)
            : obj.responseBody
          : undefined,
      durationMs: typeof obj.durationMs === 'number' ? obj.durationMs : undefined,
    };
  }

  return build(async function (source) {
    flushTimer = setInterval(() => {
      void flushBuffer();
    }, flushIntervalMs);

    for await (const obj of source) {
      const entry = parseLogEntry(obj as Record<string, unknown>);
      if (!entry) continue;

      buffer.push(entry);

      if (buffer.length >= batchSize) {
        await flushBuffer();
      }
    }

    // Stream ended — flush remaining
    if (flushTimer) {
      clearInterval(flushTimer);
      flushTimer = null;
    }
    await flushBuffer();
    await pool.end();
  });
}

// Exported for testing
export {
  DEFAULT_BATCH_SIZE,
  DEFAULT_FLUSH_INTERVAL_MS,
  DEFAULT_CIRCUIT_BREAKER_THRESHOLD,
  DEFAULT_CIRCUIT_BREAKER_RESET_MS,
  MAX_RESPONSE_BODY_BYTES,
};
export type { AuditLogEntry, CircuitBreakerState, PgAuditTransportOptions };
