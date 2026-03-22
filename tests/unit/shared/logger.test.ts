import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockInfo, mockWarn, mockError, mockDebug, mockChild, mockDestination, pinoFactory } =
  vi.hoisted(() => {
    const mockInfo = vi.fn();
    const mockWarn = vi.fn();
    const mockError = vi.fn();
    const mockDebug = vi.fn();
    const mockChild = vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    }));
    const mockDestination = vi.fn((..._args: unknown[]) => ({ fd: 2 }));
    const pinoFactory = vi.fn((..._args: unknown[]) => ({
      info: mockInfo,
      warn: mockWarn,
      error: mockError,
      debug: mockDebug,
      child: mockChild,
    }));
    return { mockInfo, mockWarn, mockError, mockDebug, mockChild, mockDestination, pinoFactory };
  });

vi.mock('pino', () => {
  const factory = Object.assign((...args: unknown[]) => pinoFactory(...args), {
    destination: (...args: unknown[]) => mockDestination(...args),
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
