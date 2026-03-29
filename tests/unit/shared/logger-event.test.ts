import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type pino from 'pino';
import {
  logEvent,
  setEventLogger,
  withRequestContext,
  withHttpCorrelation,
  getCorrelationId,
  createEventPinoLogger,
  pinoLogger,
} from '../../../src/shared/logger.js';

describe('logEvent', () => {
  let mockEventLogger: pino.Logger;
  let pinoInfoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockEventLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(),
    } as unknown as pino.Logger;
    pinoInfoSpy = vi.spyOn(pinoLogger, 'info').mockReturnValue(undefined as never);
  });

  afterEach(() => {
    // Reset event logger to null state
    setEventLogger(null as unknown as pino.Logger);
    vi.restoreAllMocks();
  });

  describe('with event logger configured', () => {
    beforeEach(() => {
      setEventLogger(mockEventLogger);
    });

    it('emits tagged pino entry with module: mcp-event', () => {
      logEvent('session', 'created');

      expect(mockEventLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          module: 'mcp-event',
          operation: 'session',
          event: 'created',
        })
      );
    });

    it('includes data when provided', () => {
      logEvent('session', 'answer_recorded', { chunkId: 'chunk-1', pass: true });

      expect(mockEventLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { chunkId: 'chunk-1', pass: true },
        })
      );
    });

    it('includes durationMs when provided', () => {
      logEvent('adapter', 'query_slow', { table: 'chunks' }, 1500);

      expect(mockEventLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          durationMs: 1500,
        })
      );
    });

    it('omits data and durationMs when not provided', () => {
      logEvent('session', 'completed');

      const call = (mockEventLogger.info as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<
        string,
        unknown
      >;
      expect(call).not.toHaveProperty('data');
      expect(call).not.toHaveProperty('durationMs');
    });

    it('enriches with correlationId and tool from AsyncLocalStorage', async () => {
      await withRequestContext(
        'submit_answer',
        async () => {
          logEvent('session', 'answer_recorded');
        },
        'corr-test-123'
      );

      expect(mockEventLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: 'corr-test-123',
          tool: 'submit_answer',
        })
      );
    });

    it('omits correlationId and tool when not in request context', () => {
      logEvent('startup', 'initialized');

      const call = (mockEventLogger.info as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<
        string,
        unknown
      >;
      expect(call).not.toHaveProperty('correlationId');
      expect(call).not.toHaveProperty('tool');
    });
  });

  describe('getCorrelationId fallback', () => {
    it('returns correlationId from httpCorrelationStorage when not in request context', () => {
      const result = withHttpCorrelation('http-corr-456', () => getCorrelationId());
      expect(result).toBe('http-corr-456');
    });

    it('prefers asyncLocalStorage over httpCorrelationStorage', async () => {
      const result = await withHttpCorrelation('http-corr-789', () =>
        withRequestContext('test_tool', async () => getCorrelationId(), 'tool-corr-123')
      );
      expect(result).toBe('tool-corr-123');
    });

    it('returns undefined when not in any context', () => {
      expect(getCorrelationId()).toBeUndefined();
    });
  });

  describe('createEventPinoLogger', () => {
    it('returns a pino logger instance', () => {
      const eventLogger = createEventPinoLogger('postgresql://test:test@localhost:5432/test');
      expect(eventLogger).toBeDefined();
      expect(typeof eventLogger.info).toBe('function');
      expect(typeof eventLogger.error).toBe('function');
    });
  });

  describe('without event logger configured', () => {
    it('falls back to stderr via pinoLogger', () => {
      logEvent('session', 'created');

      expect(pinoInfoSpy).toHaveBeenCalled();
      expect(mockEventLogger.info).not.toHaveBeenCalled();
    });

    it('includes operation and event in fallback message', () => {
      logEvent('session', 'created');

      const [entry, msg] = pinoInfoSpy.mock.calls[0];
      expect(msg).toBe('[event] session:created');
      expect(entry).toEqual(
        expect.objectContaining({
          operation: 'session',
          event: 'created',
        })
      );
    });
  });
});
