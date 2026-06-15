import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type pino from 'pino';
import { instrument } from '../../../../src/adapters/drizzle/instrument.js';
import { setEventLogger } from '../../../../src/shared/logger.js';

class FakeRepo {
  readonly label = 'raw';
  async getValue(): Promise<number> {
    return 7;
  }
  async echo(a: number, b: number): Promise<[number, number]> {
    return [a, b];
  }
  async willThrow(): Promise<never> {
    throw new TypeError('boom');
  }
  // Internal delegation — calls another method on `this`.
  async delegate(): Promise<number> {
    return this.getValue();
  }
}

describe('instrument', () => {
  let infoMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    infoMock = vi.fn();
    setEventLogger({
      info: infoMock,
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(),
    } as unknown as pino.Logger);
  });

  afterEach(() => {
    setEventLogger(null);
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('passes through arguments and the method result with `this` bound', async () => {
    vi.stubEnv('SLOW_QUERY_THRESHOLD_MS', '100000');
    const repo = instrument('fakeRepo', new FakeRepo());

    expect(await repo.getValue()).toBe(7);
    expect(await repo.echo(1, 2)).toEqual([1, 2]);
    expect(infoMock).not.toHaveBeenCalled();
  });

  it('times each method with a `${name}.${method}` label', async () => {
    vi.stubEnv('SLOW_QUERY_THRESHOLD_MS', '-1');
    const repo = instrument('fakeRepo', new FakeRepo());

    await repo.getValue();

    expect(infoMock).toHaveBeenCalledTimes(1);
    expect(infoMock.mock.calls[0][0]).toMatchObject({
      operation: 'fakeRepo.getValue',
      event: 'slow_query',
    });
  });

  it('emits query_failed and re-throws the original error', async () => {
    vi.stubEnv('SLOW_QUERY_THRESHOLD_MS', '100000');
    const repo = instrument('fakeRepo', new FakeRepo());
    const err = await repo.willThrow().catch((e: unknown) => e);

    expect(err).toBeInstanceOf(TypeError);
    expect((err as Error).message).toBe('boom');
    expect(infoMock.mock.calls[0][0]).toMatchObject({
      operation: 'fakeRepo.willThrow',
      event: 'query_failed',
      data: { error_class: 'TypeError', error_message: 'boom' },
    });
  });

  it('does not double-emit for internal delegation (inner call hits the raw target)', async () => {
    vi.stubEnv('SLOW_QUERY_THRESHOLD_MS', '-1');
    const repo = instrument('fakeRepo', new FakeRepo());

    expect(await repo.delegate()).toBe(7);

    // Only the outer `delegate` is timed; the internal `this.getValue()` is not.
    expect(infoMock).toHaveBeenCalledTimes(1);
    expect(infoMock.mock.calls[0][0]).toMatchObject({ operation: 'fakeRepo.delegate' });
  });

  it('passes non-function properties and the constructor through untouched', () => {
    const repo = instrument('fakeRepo', new FakeRepo());

    expect(repo.label).toBe('raw');
    expect(repo.constructor).toBe(FakeRepo);
    expect(infoMock).not.toHaveBeenCalled();
  });
});
