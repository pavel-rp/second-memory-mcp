import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock pg before importing the transport
const mockQuery = vi.fn<(...args: unknown[]) => Promise<{ rowCount: number }>>();
const mockEnd = vi.fn<() => Promise<void>>();
vi.mock('pg', () => {
  class MockPool {
    query = mockQuery;
    end = mockEnd;
  }
  return {
    default: { Pool: MockPool },
  };
});

// Mock pino-abstract-transport to capture the handler function
let capturedHandler: ((source: AsyncIterable<Record<string, unknown>>) => Promise<void>) | null =
  null;
vi.mock('pino-abstract-transport', () => ({
  default: (
    fn: (source: AsyncIterable<Record<string, unknown>>) => Promise<void>,
    _opts: unknown
  ) => {
    capturedHandler = fn;
    return { on: vi.fn() };
  },
}));

describe('pg-audit-transport', () => {
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockQuery.mockReset();
    mockEnd.mockReset();
    mockQuery.mockResolvedValue({ rowCount: 1 });
    mockEnd.mockResolvedValue(undefined);
    capturedHandler = null;
    stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  function createAuditEntry(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      module: 'mcp-audit',
      time: '2026-03-22T15:00:00.000Z',
      method: 'tools/call',
      rpcId: 'req-1',
      params: { name: 'test' },
      responseStatus: 200,
      responseBody: '{"result":"ok"}',
      durationMs: 42,
      ...overrides,
    };
  }

  async function* asyncIterableFrom(
    items: Record<string, unknown>[]
  ): AsyncIterable<Record<string, unknown>> {
    for (const item of items) {
      yield item;
    }
  }

  async function initTransport(
    opts: Record<string, unknown> = {}
  ): Promise<(source: AsyncIterable<Record<string, unknown>>) => Promise<void>> {
    // Dynamic import to get fresh module with mocks applied
    const mod = await import('../../../src/transport/pg-audit-transport.js');
    await mod.default({
      connectionString: 'postgresql://test:test@localhost:5432/test_db',
      ...opts,
    });
    if (!capturedHandler) throw new Error('Transport handler was not captured');
    return capturedHandler;
  }

  describe('batch accumulation', () => {
    it('does not flush when buffer is below threshold', async () => {
      const handler = await initTransport({ batchSize: 5 });
      const entries = Array.from({ length: 3 }, () => createAuditEntry());

      await handler(asyncIterableFrom(entries));

      // Stream ended — should flush remaining
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery.mock.calls[0][1]).toHaveLength(3 * 7); // 7 params per entry
    });

    it('flushes at batch size threshold', async () => {
      const handler = await initTransport({ batchSize: 3 });
      const entries = Array.from({ length: 6 }, (_, i) => createAuditEntry({ rpcId: `req-${i}` }));

      await handler(asyncIterableFrom(entries));

      // Should have flushed twice at threshold (3 entries each), no remaining
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('flushes remaining entries when stream ends', async () => {
      const handler = await initTransport({ batchSize: 100 });
      const entries = [createAuditEntry(), createAuditEntry()];

      await handler(asyncIterableFrom(entries));

      // Flushed on stream end
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('timer-based flushing', () => {
    it('flushes on interval timer', async () => {
      const handler = await initTransport({
        batchSize: 100,
        flushIntervalMs: 1000,
      });

      // Create a source that yields entries with delays
      let resolveYield: (() => void) | null = null;
      async function* slowSource() {
        yield createAuditEntry();
        // Wait for timer to fire
        await new Promise<void>(resolve => {
          resolveYield = resolve;
        });
      }

      const handlerPromise = handler(slowSource());

      // Advance timer to trigger flush
      await vi.advanceTimersByTimeAsync(1100);

      expect(mockQuery).toHaveBeenCalledTimes(1);

      // Resolve to end the stream
      resolveYield!();
      await handlerPromise;
    });
  });

  describe('entry filtering', () => {
    it('ignores entries without module: mcp-audit', async () => {
      const handler = await initTransport({ batchSize: 100 });
      const entries = [
        { level: 30, msg: 'regular log entry', time: '2026-01-01T00:00:00Z' },
        createAuditEntry(),
      ];

      await handler(asyncIterableFrom(entries));

      // Only 1 entry should be flushed (the audit one)
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery.mock.calls[0][1]).toHaveLength(7); // 7 params for 1 entry
    });

    it('skips flush when all entries are filtered out', async () => {
      const handler = await initTransport({ batchSize: 100 });
      const entries = [{ level: 30, msg: 'not an audit entry', time: '2026-01-01T00:00:00Z' }];

      await handler(asyncIterableFrom(entries));

      // No entries to flush
      expect(mockQuery).not.toHaveBeenCalled();
    });
  });

  describe('circuit breaker', () => {
    it('transitions to open after consecutive failures', async () => {
      const handler = await initTransport({
        batchSize: 1,
        circuitBreakerThreshold: 3,
      });

      mockQuery
        .mockRejectedValueOnce(new Error('db down'))
        .mockRejectedValueOnce(new Error('db down'))
        .mockRejectedValueOnce(new Error('db down'))
        .mockResolvedValue({ rowCount: 1 });

      // Feed 5 entries one at a time (batchSize=1 triggers flush each time)
      const entries = Array.from({ length: 5 }, (_, i) => createAuditEntry({ rpcId: `req-${i}` }));

      await handler(asyncIterableFrom(entries));

      // First 3 attempted writes failed → circuit opened
      // Entries 4 and 5 should be dropped (circuit open)
      expect(mockQuery).toHaveBeenCalledTimes(3);
      expect(stderrSpy).toHaveBeenCalled();
    });

    it('transitions to half-open after reset timeout', async () => {
      const handler = await initTransport({
        batchSize: 1,
        circuitBreakerThreshold: 2,
        circuitBreakerResetMs: 5000,
      });

      mockQuery
        .mockRejectedValueOnce(new Error('db down'))
        .mockRejectedValueOnce(new Error('db down'))
        .mockResolvedValue({ rowCount: 1 });

      // Create a controlled source
      let resolveNext: (() => void) | null = null;
      const _entries: Record<string, unknown>[] = [];

      async function* controlledSource() {
        // Entry 1: fails
        yield createAuditEntry({ rpcId: 'req-1' });
        // Entry 2: fails → opens circuit
        yield createAuditEntry({ rpcId: 'req-2' });
        // Entry 3: dropped (circuit open)
        yield createAuditEntry({ rpcId: 'req-3' });
        // Wait for timer to advance
        await new Promise<void>(resolve => {
          resolveNext = resolve;
        });
        // Entry 4: should attempt (half-open after timeout)
        yield createAuditEntry({ rpcId: 'req-4' });
      }

      const handlerPromise = handler(controlledSource());

      // Advance time past circuit breaker reset
      await vi.advanceTimersByTimeAsync(6000);
      resolveNext!();

      await handlerPromise;

      // 2 failures + 1 half-open attempt = 3 query calls
      // Entry 3 was dropped while circuit was open
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it('transitions half-open to closed on successful write', async () => {
      const handler = await initTransport({
        batchSize: 1,
        circuitBreakerThreshold: 2,
        circuitBreakerResetMs: 1000,
      });

      mockQuery
        .mockRejectedValueOnce(new Error('db down'))
        .mockRejectedValueOnce(new Error('db down'))
        .mockResolvedValue({ rowCount: 1 }); // Success on half-open attempt

      let resolveWait: (() => void) | null = null;

      async function* controlledSource() {
        yield createAuditEntry({ rpcId: 'req-1' }); // fail
        yield createAuditEntry({ rpcId: 'req-2' }); // fail → open
        await new Promise<void>(r => {
          resolveWait = r;
        });
        yield createAuditEntry({ rpcId: 'req-3' }); // half-open → success → closed
        yield createAuditEntry({ rpcId: 'req-4' }); // closed → success
      }

      const handlerPromise = handler(controlledSource());
      await vi.advanceTimersByTimeAsync(1100);
      resolveWait!();
      await handlerPromise;

      // 2 failures + 2 successes = 4 calls
      expect(mockQuery).toHaveBeenCalledTimes(4);
    });

    it('transitions half-open to open on failed write', async () => {
      const handler = await initTransport({
        batchSize: 1,
        circuitBreakerThreshold: 2,
        circuitBreakerResetMs: 1000,
      });

      mockQuery
        .mockRejectedValueOnce(new Error('db down'))
        .mockRejectedValueOnce(new Error('db down'))
        .mockRejectedValueOnce(new Error('still down')); // half-open attempt fails

      let resolveWait: (() => void) | null = null;

      async function* controlledSource() {
        yield createAuditEntry({ rpcId: 'req-1' }); // fail
        yield createAuditEntry({ rpcId: 'req-2' }); // fail → open
        await new Promise<void>(r => {
          resolveWait = r;
        });
        yield createAuditEntry({ rpcId: 'req-3' }); // half-open → fail → open again
        yield createAuditEntry({ rpcId: 'req-4' }); // dropped (circuit open again)
      }

      const handlerPromise = handler(controlledSource());
      await vi.advanceTimersByTimeAsync(1100);
      resolveWait!();
      await handlerPromise;

      // 2 initial failures + 1 half-open failure = 3 query calls
      // Entry 4 dropped
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it('drops entries silently when circuit is open', async () => {
      const handler = await initTransport({
        batchSize: 1,
        circuitBreakerThreshold: 2,
      });

      mockQuery.mockRejectedValue(new Error('db down'));

      const entries = Array.from({ length: 5 }, (_, i) => createAuditEntry({ rpcId: `req-${i}` }));

      await handler(asyncIterableFrom(entries));

      // Only 2 actual query attempts (then circuit opens)
      expect(mockQuery).toHaveBeenCalledTimes(2);
      // Should have stderr warnings for dropped entries
      expect(stderrSpy).toHaveBeenCalled();
    });
  });

  describe('stderr warnings', () => {
    it('emits stderr warning on write failure', async () => {
      const handler = await initTransport({ batchSize: 1, circuitBreakerThreshold: 10 });
      mockQuery.mockRejectedValueOnce(new Error('connection refused'));

      await handler(asyncIterableFrom([createAuditEntry()]));

      // At least one call to stderr should mention the failure
      const stderrCalls = stderrSpy.mock.calls.map((c: unknown[]) => String(c[0]));
      expect(stderrCalls.some((msg: string) => msg.includes('Failed to write audit batch'))).toBe(
        true
      );
      expect(stderrCalls.some((msg: string) => msg.includes('connection refused'))).toBe(true);
    });
  });

  describe('graceful shutdown', () => {
    it('flushes remaining buffer when stream ends', async () => {
      const handler = await initTransport({ batchSize: 100 });

      const entries = Array.from({ length: 5 }, (_, i) => createAuditEntry({ rpcId: `req-${i}` }));

      await handler(asyncIterableFrom(entries));

      // Buffer should have been flushed on stream end
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery.mock.calls[0][1]).toHaveLength(5 * 7);

      // Pool should be closed
      expect(mockEnd).toHaveBeenCalledTimes(1);
    });
  });

  describe('SQL parameterization', () => {
    it('builds correct INSERT with parameterized values', async () => {
      const handler = await initTransport({ batchSize: 100 });

      await handler(
        asyncIterableFrom([
          createAuditEntry({
            method: 'tools/call',
            rpcId: 'req-1',
            params: { name: 'get_info' },
            responseStatus: 200,
            responseBody: '{"ok":true}',
            durationMs: 15,
          }),
        ])
      );

      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain('INSERT INTO infrastructure.mcp_request_log');
      expect(sql).toContain('$1');
      expect(params).toEqual([
        'tools/call',
        'req-1',
        '2026-03-22T15:00:00.000Z',
        '{"name":"get_info"}',
        200,
        '{"ok":true}',
        15,
      ]);
    });

    it('handles null optional fields', async () => {
      const handler = await initTransport({ batchSize: 100 });

      await handler(
        asyncIterableFrom([
          createAuditEntry({
            method: undefined,
            rpcId: undefined,
            params: undefined,
            responseStatus: undefined,
            responseBody: undefined,
            durationMs: undefined,
          }),
        ])
      );

      const [, params] = mockQuery.mock.calls[0] as [string, unknown[]];
      // method, rpcId, timestamp, params, responseStatus, responseBody, durationMs
      expect(params[0]).toBeNull(); // method
      expect(params[1]).toBeNull(); // rpcId
      expect(typeof params[2]).toBe('string'); // timestamp always present
      expect(params[3]).toBeNull(); // params
      expect(params[4]).toBeNull(); // responseStatus
      expect(params[5]).toBeNull(); // responseBody
      expect(params[6]).toBeNull(); // durationMs
    });
  });
});
