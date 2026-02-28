import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger', () => {
  const originalEnv = { ...process.env };
  let originalStdinIsTTY: boolean | undefined;
  let originalStdoutIsTTY: boolean | undefined;

  beforeEach(() => {
    originalStdinIsTTY = process.stdin.isTTY;
    originalStdoutIsTTY = process.stdout.isTTY;
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    Object.defineProperty(process.stdin, 'isTTY', { value: originalStdinIsTTY, writable: true });
    Object.defineProperty(process.stdout, 'isTTY', { value: originalStdoutIsTTY, writable: true });
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    vi.resetModules();
  });

  async function loadLogger() {
    const mod = await import('../../../src/shared/logger.js');
    return mod.logger;
  }

  describe('TTY mode (non-MCP)', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdin, 'isTTY', { value: true, writable: true });
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
    });

    it('info routes to console.info', async () => {
      const logger = await loadLogger();
      logger.info('hello');
      expect(console.info).toHaveBeenCalledWith('hello');
    });

    it('warn routes to console.warn', async () => {
      const logger = await loadLogger();
      logger.warn('warning');
      expect(console.warn).toHaveBeenCalledWith('warning');
    });

    it('error routes to console.error', async () => {
      const logger = await loadLogger();
      logger.error('err');
      expect(console.error).toHaveBeenCalledWith('err');
    });
  });

  describe('MCP mode (non-TTY)', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdin, 'isTTY', { value: false, writable: true });
      Object.defineProperty(process.stdout, 'isTTY', { value: false, writable: true });
    });

    it('info routes to console.error with [INFO] prefix', async () => {
      const logger = await loadLogger();
      logger.info('hello');
      expect(console.error).toHaveBeenCalledWith('[INFO]', 'hello');
    });

    it('warn routes to console.error with [WARN] prefix', async () => {
      const logger = await loadLogger();
      logger.warn('warning');
      expect(console.error).toHaveBeenCalledWith('[WARN]', 'warning');
    });

    it('error routes to console.error with [ERROR] prefix', async () => {
      const logger = await loadLogger();
      logger.error('err');
      expect(console.error).toHaveBeenCalledWith('[ERROR]', 'err');
    });
  });

  describe('debug gating', () => {
    it('logs when DEBUG env var is set', async () => {
      process.env.DEBUG = '1';
      Object.defineProperty(process.stdin, 'isTTY', { value: true, writable: true });
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
      const logger = await loadLogger();
      logger.debug('dbg');
      expect(console.debug).toHaveBeenCalledWith('dbg');
    });

    it('does not log when DEBUG env var is unset', async () => {
      delete process.env.DEBUG;
      const logger = await loadLogger();
      logger.debug('dbg');
      expect(console.debug).not.toHaveBeenCalled();
    });
  });

  describe('multiple arguments', () => {
    it('passes all arguments through', async () => {
      Object.defineProperty(process.stdin, 'isTTY', { value: true, writable: true });
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
      const logger = await loadLogger();
      logger.info('a', 'b', 3);
      expect(console.info).toHaveBeenCalledWith('a', 'b', 3);
    });
  });
});
