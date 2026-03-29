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

describe('pg-event-transport', () => {
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

  function createEventEntry(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      module: 'mcp-event',
      time: '2026-03-29T15:00:00.000Z',
      correlationId: 'corr-123',
      tool: 'submit_answer',
      level: 'info',
      operation: 'session',
      event: 'answer_recorded',
      data: { chunkId: 'chunk-1' },
      durationMs: 50,
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
    const mod = await import('../../../src/transport/pg-event-transport.js');
    await mod.default({
      connectionString: 'postgresql://test:test@localhost:5432/test_db',
      ...opts,
    });
    if (!capturedHandler) throw new Error('Transport handler was not captured');
    return capturedHandler;
  }

  describe('entry filtering', () => {
    it('only processes entries with module: mcp-event', async () => {
      const handler = await initTransport({ batchSize: 100 });
      const entries = [
        { level: 30, msg: 'regular log', time: '2026-01-01T00:00:00Z' },
        { module: 'mcp-audit', method: 'tools/call', time: '2026-01-01T00:00:00Z' },
        createEventEntry(),
      ];

      await handler(asyncIterableFrom(entries));

      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery.mock.calls[0][1]).toHaveLength(8); // 8 params for 1 entry
    });

    it('skips entries without required operation and event fields', async () => {
      const handler = await initTransport({ batchSize: 100 });
      const entries = [
        createEventEntry({ operation: undefined, event: undefined }),
        createEventEntry(),
      ];

      await handler(asyncIterableFrom(entries));

      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery.mock.calls[0][1]).toHaveLength(8);
    });
  });

  describe('field parsing', () => {
    it('parses all fields from log object', async () => {
      const handler = await initTransport({ batchSize: 100 });

      await handler(asyncIterableFrom([createEventEntry()]));

      const [sql, params] = mockQuery.mock.calls[0] as [string, unknown[]];
      expect(sql).toContain('INSERT INTO infrastructure.operation_event_log');
      expect(params).toEqual([
        '2026-03-29T15:00:00.000Z', // timestamp
        'corr-123', // correlationId
        'submit_answer', // tool
        'info', // level
        'session', // operation
        'answer_recorded', // event
        '{"chunkId":"chunk-1"}', // data (JSON stringified)
        50, // durationMs
      ]);
    });

    it('handles missing optional fields', async () => {
      const handler = await initTransport({ batchSize: 100 });

      await handler(
        asyncIterableFrom([
          createEventEntry({
            correlationId: undefined,
            tool: undefined,
            data: undefined,
            durationMs: undefined,
          }),
        ])
      );

      const [, params] = mockQuery.mock.calls[0] as [string, unknown[]];
      expect(params[1]).toBeNull(); // correlationId
      expect(params[2]).toBeNull(); // tool
      expect(params[6]).toBeNull(); // data
      expect(params[7]).toBeNull(); // durationMs
    });

    it('converts numeric level to string', async () => {
      const handler = await initTransport({ batchSize: 100 });

      await handler(asyncIterableFrom([createEventEntry({ level: 30 })]));

      const [, params] = mockQuery.mock.calls[0] as [string, unknown[]];
      expect(params[3]).toBe('30');
    });
  });

  describe('batch accumulation', () => {
    it('flushes at batch size threshold', async () => {
      const handler = await initTransport({ batchSize: 3 });
      const entries = Array.from({ length: 6 }, (_, i) =>
        createEventEntry({ operation: `op-${i}` })
      );

      await handler(asyncIterableFrom(entries));

      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('flushes remaining entries when stream ends', async () => {
      const handler = await initTransport({ batchSize: 100 });

      await handler(asyncIterableFrom([createEventEntry(), createEventEntry()]));

      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery.mock.calls[0][1]).toHaveLength(2 * 8);
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

      const entries = Array.from({ length: 5 }, (_, i) =>
        createEventEntry({ operation: `op-${i}` })
      );

      await handler(asyncIterableFrom(entries));

      expect(mockQuery).toHaveBeenCalledTimes(3);
      expect(stderrSpy).toHaveBeenCalled();
    });

    it('drops entries silently when circuit is open', async () => {
      const handler = await initTransport({
        batchSize: 1,
        circuitBreakerThreshold: 2,
      });

      mockQuery.mockRejectedValue(new Error('db down'));

      const entries = Array.from({ length: 5 }, (_, i) =>
        createEventEntry({ operation: `op-${i}` })
      );

      await handler(asyncIterableFrom(entries));

      expect(mockQuery).toHaveBeenCalledTimes(2);
      const stderrCalls = stderrSpy.mock.calls.map((c: unknown[]) => String(c[0]));
      expect(stderrCalls.some((msg: string) => msg.includes('Circuit breaker open'))).toBe(true);
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

      let resolveNext: (() => void) | null = null;

      async function* controlledSource() {
        yield createEventEntry({ operation: 'op-1' });
        yield createEventEntry({ operation: 'op-2' });
        yield createEventEntry({ operation: 'op-3' }); // dropped
        await new Promise<void>(resolve => {
          resolveNext = resolve;
        });
        yield createEventEntry({ operation: 'op-4' }); // half-open
      }

      const handlerPromise = handler(controlledSource());
      await vi.advanceTimersByTimeAsync(6000);
      resolveNext!();
      await handlerPromise;

      expect(mockQuery).toHaveBeenCalledTimes(3);
    });
  });

  describe('stderr warnings', () => {
    it('emits stderr warning on write failure', async () => {
      const handler = await initTransport({ batchSize: 1, circuitBreakerThreshold: 10 });
      mockQuery.mockRejectedValueOnce(new Error('connection refused'));

      await handler(asyncIterableFrom([createEventEntry()]));

      const stderrCalls = stderrSpy.mock.calls.map((c: unknown[]) => String(c[0]));
      expect(stderrCalls.some((msg: string) => msg.includes('Failed to write event batch'))).toBe(
        true
      );
      expect(stderrCalls.some((msg: string) => msg.includes('connection refused'))).toBe(true);
    });
  });

  describe('graceful shutdown', () => {
    it('flushes remaining buffer and closes pool when stream ends', async () => {
      const handler = await initTransport({ batchSize: 100 });

      const entries = Array.from({ length: 3 }, (_, i) =>
        createEventEntry({ operation: `op-${i}` })
      );

      await handler(asyncIterableFrom(entries));

      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery.mock.calls[0][1]).toHaveLength(3 * 8);
      expect(mockEnd).toHaveBeenCalledTimes(1);
    });
  });
});
