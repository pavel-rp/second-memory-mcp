import build from 'pino-abstract-transport';
import pg from 'pg';

interface EventLogEntry {
  timestamp: string;
  correlationId?: string;
  tool?: string;
  level: string;
  operation: string;
  event: string;
  data?: unknown;
  durationMs?: number;
}

interface CircuitBreakerState {
  status: 'closed' | 'open' | 'half-open';
  consecutiveFailures: number;
  openedAt: number;
}

interface PgEventTransportOptions {
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

export default async function pgEventTransport(opts: PgEventTransportOptions) {
  const batchSize = opts.batchSize ?? DEFAULT_BATCH_SIZE;
  const flushIntervalMs = opts.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS;
  const cbThreshold = opts.circuitBreakerThreshold ?? DEFAULT_CIRCUIT_BREAKER_THRESHOLD;
  const cbResetMs = opts.circuitBreakerResetMs ?? DEFAULT_CIRCUIT_BREAKER_RESET_MS;

  const pool = new pg.Pool({ connectionString: opts.connectionString });
  let buffer: EventLogEntry[] = [];
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
        `[pg-event-transport] Circuit breaker open — dropped ${dropped} event entries\n`
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
          `($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}::jsonb, $${paramIdx++})`
        );
        values.push(
          entry.timestamp,
          entry.correlationId ?? null,
          entry.tool ?? null,
          entry.level,
          entry.operation,
          entry.event,
          entry.data != null ? JSON.stringify(entry.data) : null,
          entry.durationMs ?? null
        );
      }

      const sql = `INSERT INTO infrastructure.operation_event_log (timestamp, correlation_id, tool, level, operation, event, data, duration_ms) VALUES ${placeholders.join(', ')}`;
      await pool.query(sql, values);
      recordSuccess();
    } catch (err) {
      recordFailure();
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(
        `[pg-event-transport] Failed to write event batch (${batch.length} entries): ${message}\n`
      );
    }
  }

  function parseLogEntry(obj: Record<string, unknown>): EventLogEntry | null {
    // Only process entries tagged as mcp-event
    if (obj.module !== 'mcp-event') return null;
    if (typeof obj.operation !== 'string' || typeof obj.event !== 'string') return null;
    return {
      timestamp: typeof obj.time === 'string' ? obj.time : new Date().toISOString(),
      correlationId: typeof obj.correlationId === 'string' ? obj.correlationId : undefined,
      tool: typeof obj.tool === 'string' ? obj.tool : undefined,
      level: typeof obj.level === 'string' ? obj.level : String(obj.level ?? 'info'),
      operation: obj.operation,
      event: obj.event,
      data: obj.data,
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
    clearInterval(flushTimer as NodeJS.Timeout);
    flushTimer = null;
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
};
export type { EventLogEntry, CircuitBreakerState, PgEventTransportOptions };
