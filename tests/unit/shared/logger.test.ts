import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const {
  mockInfo,
  mockWarn,
  mockError,
  mockDebug,
  mockChild,
  mockDestination,
  mockTransport,
  pinoFactory,
} = vi.hoisted(() => {
  const mockInfo = vi.fn();
  const mockWarn = vi.fn();
  const mockError = vi.fn();
  const mockDebug = vi.fn();
  const mockChildChild = vi.fn();
  const mockChild = vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: mockChildChild,
  }));
  const mockDestination = vi.fn((..._args: unknown[]) => ({ fd: 2 }));
  const mockTransport = vi.fn((..._args: unknown[]) => ({ on: vi.fn() }));
  const pinoFactory = vi.fn((..._args: unknown[]) => ({
    info: mockInfo,
    warn: mockWarn,
    error: mockError,
    debug: mockDebug,
    child: mockChild,
  }));
  return {
    mockInfo,
    mockWarn,
    mockError,
    mockDebug,
    mockChild,
    mockDestination,
    mockTransport,
    pinoFactory,
  };
});

vi.mock('pino', () => {
  const factory = Object.assign((...args: unknown[]) => pinoFactory(...args), {
    destination: (...args: unknown[]) => mockDestination(...args),
    transport: (...args: unknown[]) => mockTransport(...args),
    stdTimeFunctions: { isoTime: () => ',"time":"2026-01-01T00:00:00.000Z"' },
  });
  return { default: factory };
});

describe('logger', () => {
  const originalEnv = { ...process.env };
  let originalStdinIsTTY: boolean | undefined;
  let originalStdoutIsTTY: boolean | undefined;

  beforeEach(() => {
    originalStdinIsTTY = process.stdin.isTTY;
    originalStdoutIsTTY = process.stdout.isTTY;
  });

  afterEach(() => {
    Object.defineProperty(process.stdin, 'isTTY', { value: originalStdinIsTTY, writable: true });
    Object.defineProperty(process.stdout, 'isTTY', { value: originalStdoutIsTTY, writable: true });
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    vi.resetModules();
    pinoFactory.mockClear();
    mockDestination.mockClear();
    mockInfo.mockClear();
    mockWarn.mockClear();
    mockError.mockClear();
    mockDebug.mockClear();
    mockChild.mockClear();
    mockTransport.mockClear();
  });

  function setTTY(value: boolean) {
    Object.defineProperty(process.stdin, 'isTTY', { value, writable: true });
    Object.defineProperty(process.stdout, 'isTTY', { value, writable: true });
  }

  async function loadModule() {
    return import('../../../src/shared/logger.js');
  }

  describe('destination routing', () => {
    it('TTY mode: defaults to stdout (no explicit destination)', async () => {
      setTTY(true);
      await loadModule();
      expect(mockDestination).not.toHaveBeenCalled();
      expect(pinoFactory).toHaveBeenCalledWith(expect.any(Object), undefined);
    });

    it('MCP mode: routes to stderr via pino.destination(2)', async () => {
      setTTY(false);
      await loadModule();
      expect(mockDestination).toHaveBeenCalledWith(2);
    });
  });

  describe('log level', () => {
    it('defaults to info', async () => {
      delete process.env.LOG_LEVEL;
      delete process.env.DEBUG;
      setTTY(true);
      await loadModule();
      const [opts] = pinoFactory.mock.calls[0];
      expect((opts as Record<string, unknown>).level).toBe('info');
    });

    it('sets debug when DEBUG env var is present', async () => {
      process.env.DEBUG = '1';
      delete process.env.LOG_LEVEL;
      setTTY(true);
      await loadModule();
      const [opts] = pinoFactory.mock.calls[0];
      expect((opts as Record<string, unknown>).level).toBe('debug');
    });

    it('LOG_LEVEL overrides default', async () => {
      process.env.LOG_LEVEL = 'warn';
      delete process.env.DEBUG;
      setTTY(true);
      await loadModule();
      const [opts] = pinoFactory.mock.calls[0];
      expect((opts as Record<string, unknown>).level).toBe('warn');
    });

    it('LOG_LEVEL takes precedence over DEBUG', async () => {
      process.env.LOG_LEVEL = 'warn';
      process.env.DEBUG = '1';
      setTTY(true);
      await loadModule();
      const [opts] = pinoFactory.mock.calls[0];
      expect((opts as Record<string, unknown>).level).toBe('warn');
    });

    it('ignores invalid LOG_LEVEL and falls back to info', async () => {
      process.env.LOG_LEVEL = 'garbage';
      delete process.env.DEBUG;
      setTTY(true);
      await loadModule();
      const [opts] = pinoFactory.mock.calls[0];
      expect((opts as Record<string, unknown>).level).toBe('info');
    });
  });

  describe('base context', () => {
    it('includes service and version fields', async () => {
      setTTY(true);
      await loadModule();
      const [opts] = pinoFactory.mock.calls[0];
      const base = (opts as Record<string, unknown>).base as Record<string, unknown>;
      expect(base.service).toBe('second-memory-mcp');
      expect(typeof base.version).toBe('string');
      expect(base.version).toBeTruthy();
    });
  });

  describe('variadic adapter', () => {
    it('passes single string message', async () => {
      setTTY(true);
      const { logger } = await loadModule();
      logger.info('hello');
      expect(mockInfo).toHaveBeenCalledWith('hello');
    });

    it('serializes trailing Error as err field', async () => {
      setTTY(true);
      const { logger } = await loadModule();
      const error = new Error('boom');
      logger.error('Failed:', error);
      expect(mockError).toHaveBeenCalledWith({ err: error }, 'Failed:');
    });

    it('merges trailing plain object into log entry', async () => {
      setTTY(true);
      const { logger } = await loadModule();
      logger.info('Created', { id: 123 });
      expect(mockInfo).toHaveBeenCalledWith({ id: 123 }, 'Created');
    });

    it('joins multiple primitive args with spaces', async () => {
      setTTY(true);
      const { logger } = await loadModule();
      logger.info('a', 'b', 3);
      expect(mockInfo).toHaveBeenCalledWith('a b 3');
    });

    it('handles single object argument with empty message', async () => {
      setTTY(true);
      const { logger } = await loadModule();
      logger.info({ id: 123 });
      expect(mockInfo).toHaveBeenCalledWith({ id: 123 }, '');
    });

    it('handles empty call', async () => {
      setTTY(true);
      const { logger } = await loadModule();
      logger.info();
      expect(mockInfo).toHaveBeenCalledWith('');
    });

    it('uses Error message when no preceding text', async () => {
      setTTY(true);
      const { logger } = await loadModule();
      const error = new Error('connection refused');
      logger.error(error);
      expect(mockError).toHaveBeenCalledWith({ err: error }, 'connection refused');
    });
  });

  describe('method routing', () => {
    it('info calls pino info', async () => {
      setTTY(true);
      const { logger } = await loadModule();
      logger.info('msg');
      expect(mockInfo).toHaveBeenCalled();
      expect(mockWarn).not.toHaveBeenCalled();
    });

    it('warn calls pino warn', async () => {
      setTTY(true);
      const { logger } = await loadModule();
      logger.warn('msg');
      expect(mockWarn).toHaveBeenCalled();
      expect(mockInfo).not.toHaveBeenCalled();
    });

    it('error calls pino error', async () => {
      setTTY(true);
      const { logger } = await loadModule();
      logger.error('msg');
      expect(mockError).toHaveBeenCalled();
      expect(mockInfo).not.toHaveBeenCalled();
    });

    it('debug calls pino debug', async () => {
      setTTY(true);
      const { logger } = await loadModule();
      logger.debug('msg');
      expect(mockDebug).toHaveBeenCalled();
      expect(mockInfo).not.toHaveBeenCalled();
    });
  });

  describe('createAuditPinoLogger', () => {
    it('creates pino logger wired to pg-audit-transport', async () => {
      setTTY(true);
      const { createAuditPinoLogger } = await loadModule();
      const connString = 'postgresql://test:test@localhost:5432/audit_db';

      const result = createAuditPinoLogger(connString);

      expect(mockTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.stringContaining('pg-audit-transport'),
          options: { connectionString: connString },
        })
      );
      // Called twice: once for module-level pinoLogger, once for createAuditPinoLogger
      expect(pinoFactory).toHaveBeenCalledTimes(2);
      const [opts, transport] = pinoFactory.mock.calls[1];
      expect((opts as Record<string, unknown>).level).toBe('info');
      expect((opts as Record<string, unknown>).base).toEqual(
        expect.objectContaining({ service: 'second-memory-mcp' })
      );
      expect(transport).toBeDefined();
      expect(result).toBeDefined();
    });
  });

  describe('getRequestLogger', () => {
    it('returns root logger when called outside any context', async () => {
      setTTY(true);
      const { logger, getRequestLogger } = await loadModule();
      const requestLogger = getRequestLogger();
      expect(requestLogger).toBe(logger);
      expect(mockChild).not.toHaveBeenCalled();
    });

    it('returns cached logger on repeated calls within same context', async () => {
      setTTY(true);
      const { getRequestLogger, withRequestContext } = await loadModule();
      await withRequestContext('cached_tool', async () => {
        const first = getRequestLogger();
        const second = getRequestLogger();
        expect(first).toBe(second);
        // pinoLogger.child should only be called once (cached on second call)
        expect(mockChild).toHaveBeenCalledTimes(1);
      });
    });

    it('returns child-backed wrapper when called inside withRequestContext', async () => {
      setTTY(true);
      const { getRequestLogger, withRequestContext } = await loadModule();
      await withRequestContext('my_tool', async () => {
        const requestLogger = getRequestLogger();
        expect(mockChild).toHaveBeenCalledWith(
          expect.objectContaining({
            tool: 'my_tool',
            correlationId: expect.stringMatching(
              /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            ),
          })
        );
        // Verify the wrapper has the expected methods
        expect(typeof requestLogger.info).toBe('function');
        expect(typeof requestLogger.warn).toBe('function');
        expect(typeof requestLogger.error).toBe('function');
        expect(typeof requestLogger.debug).toBe('function');
        expect(typeof requestLogger.child).toBe('function');
      });
    });
  });

  describe('withRequestContext', () => {
    it('propagates the callback return value', async () => {
      setTTY(true);
      const { withRequestContext } = await loadModule();
      const result = await withRequestContext('test_tool', async () => 42);
      expect(result).toBe(42);
    });

    it('calls pinoLogger.child with tool name and UUID correlationId', async () => {
      setTTY(true);
      const { getRequestLogger, withRequestContext } = await loadModule();
      await withRequestContext('submit_answer', async () => {
        getRequestLogger();
      });
      expect(mockChild).toHaveBeenCalledWith({
        tool: 'submit_answer',
        correlationId: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        ),
      });
    });

    it('produces distinct correlationId values for sequential calls', async () => {
      setTTY(true);
      const { getRequestLogger, withRequestContext } = await loadModule();
      await withRequestContext('tool_a', async () => {
        getRequestLogger();
      });
      await withRequestContext('tool_b', async () => {
        getRequestLogger();
      });
      expect(mockChild).toHaveBeenCalledTimes(2);
      const calls = mockChild.mock.calls as unknown as Array<[{ correlationId: string }]>;
      expect(calls[0][0].correlationId).not.toBe(calls[1][0].correlationId);
    });

    it('propagates rejections from the callback', async () => {
      setTTY(true);
      const { withRequestContext } = await loadModule();
      await expect(
        withRequestContext('failing_tool', async () => {
          throw new Error('boom');
        })
      ).rejects.toThrow('boom');
    });

    it('context does not persist after callback completes (uses run, not enterWith)', async () => {
      setTTY(true);
      const { logger, getRequestLogger, withRequestContext } = await loadModule();
      await withRequestContext('temp_tool', async () => {
        // Inside context — should return child logger
        const inner = getRequestLogger();
        expect(inner).not.toBe(logger);
      });
      // Outside context — should return root logger
      const outer = getRequestLogger();
      expect(outer).toBe(logger);
    });
  });

  describe('exports', () => {
    it('exports raw pino instance that supports child()', async () => {
      setTTY(true);
      const { pinoLogger } = await loadModule();
      const child = pinoLogger.child({ module: 'test' });
      expect(mockChild).toHaveBeenCalledWith({ module: 'test' });
      expect(child).toBeDefined();
    });

    it('logger.child delegates to pinoLogger.child', async () => {
      setTTY(true);
      const { logger } = await loadModule();
      logger.child({ module: 'session' });
      expect(mockChild).toHaveBeenCalledWith({ module: 'session' });
    });

    it('exports isMcpMode function', async () => {
      setTTY(true);
      const { isMcpMode } = await loadModule();
      expect(typeof isMcpMode).toBe('function');
      expect(isMcpMode()).toBe(false); // TTY mode = not MCP
    });
  });
});
