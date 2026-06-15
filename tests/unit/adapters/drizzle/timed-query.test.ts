import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type pino from 'pino';
import { timedQuery } from '../../../../src/adapters/drizzle/timed-query.js';
import { setEventLogger } from '../../../../src/shared/logger.js';

describe('timedQuery', () => {
  let mockEventLogger: pino.Logger;
  let infoMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    infoMock = vi.fn();
    mockEventLogger = {
      info: infoMock,
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(),
    } as unknown as pino.Logger;
    setEventLogger(mockEventLogger);
  });

  afterEach(() => {
    setEventLogger(null);
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns the result and emits no event when duration is within threshold', async () => {
    // A very high threshold guarantees the real call duration stays under it.
    vi.stubEnv('SLOW_QUERY_THRESHOLD_MS', '100000');

    const result = await timedQuery('chunkRepository.getById', async () => 'ok');

    expect(result).toBe('ok');
    expect(infoMock).not.toHaveBeenCalled();
  });

  it('emits a single slow_query event with operation and numeric durationMs when over threshold', async () => {
    // A negative threshold forces every (non-negative) duration to exceed it.
    vi.stubEnv('SLOW_QUERY_THRESHOLD_MS', '-1');

    const result = await timedQuery('sessionRepository.createSession', async () => 42);

    expect(result).toBe(42);
    expect(infoMock).toHaveBeenCalledTimes(1);
    const entry = infoMock.mock.calls[0][0] as Record<string, unknown>;
    expect(entry).toMatchObject({
      module: 'mcp-event',
      operation: 'sessionRepository.createSession',
      event: 'slow_query',
      data: { threshold_ms: -1 },
    });
    expect(typeof entry.durationMs).toBe('number');
    expect(entry.durationMs as number).toBeGreaterThanOrEqual(0);
  });

  it('emits query_failed with error context and re-throws the original error', async () => {
    vi.stubEnv('SLOW_QUERY_THRESHOLD_MS', '100000');
    const boom = new TypeError('db exploded');

    await expect(
      timedQuery('reviewPersistence.persistReviewUpdate', () => Promise.reject(boom))
    ).rejects.toBe(boom);

    expect(infoMock).toHaveBeenCalledTimes(1);
    const entry = infoMock.mock.calls[0][0] as Record<string, unknown>;
    expect(entry).toMatchObject({
      operation: 'reviewPersistence.persistReviewUpdate',
      event: 'query_failed',
      data: { error_class: 'TypeError', error_message: 'db exploded' },
    });
    expect(typeof entry.durationMs).toBe('number');
  });

  it('derives error context for a non-Error throw without crashing', async () => {
    vi.stubEnv('SLOW_QUERY_THRESHOLD_MS', '100000');

    await expect(
      timedQuery('chunkRepository.delete', () => Promise.reject('plain string failure'))
    ).rejects.toBe('plain string failure');

    const entry = infoMock.mock.calls[0][0] as Record<string, unknown>;
    expect(entry.event).toBe('query_failed');
    expect(entry.data).toEqual({
      error_class: 'string',
      error_message: 'plain string failure',
    });
  });

  it('is fail-open: a throwing event logger never changes the success result', async () => {
    vi.stubEnv('SLOW_QUERY_THRESHOLD_MS', '-1');
    infoMock.mockImplementation(() => {
      throw new Error('logger is broken');
    });

    const result = await timedQuery('unitOfWork.execute', async () => 'still-ok');

    expect(result).toBe('still-ok');
    expect(infoMock).toHaveBeenCalledTimes(1);
  });

  it('is fail-open: a throwing event logger never masks the original error', async () => {
    vi.stubEnv('SLOW_QUERY_THRESHOLD_MS', '100000');
    infoMock.mockImplementation(() => {
      throw new Error('logger is broken');
    });
    const original = new RangeError('original failure');

    await expect(
      timedQuery('sessionRepository.updateSessionChunk', () => Promise.reject(original))
    ).rejects.toBe(original);
  });
});
