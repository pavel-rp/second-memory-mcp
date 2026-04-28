import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/shared/logger.js', () => ({
  getRequestLogger: vi.fn(() => ({ warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() })),
  logEvent: vi.fn(),
}));

import { createTier2CircuitBreaker } from '../../../src/orchestration/tier2-circuit-breaker.js';
import { logEvent } from '../../../src/shared/logger.js';
import type {
  Tier2BlockingStatsRepository,
  Tier2WeeklyBlockingCounts,
} from '../../../src/ports/tier2-blocking-stats.js';
import type { VerdictFieldName } from '../../../src/domain/types/classifier.js';

function makeStats(buckets: Tier2WeeklyBlockingCounts[]): Tier2BlockingStatsRepository {
  return {
    getWeeklyBlockingCounts: vi.fn().mockResolvedValue(buckets),
  };
}

describe('createTier2CircuitBreaker', () => {
  beforeEach(() => {
    vi.mocked(logEvent).mockClear();
  });

  it('returns the input set unchanged when blockingFields is empty (no DB call)', async () => {
    const stats = makeStats([]);
    const breaker = createTier2CircuitBreaker({ stats });
    const out = await breaker.applyTo(new Set());
    expect(out.size).toBe(0);
    expect(stats.getWeeklyBlockingCounts).not.toHaveBeenCalled();
  });

  it('removes a tripped field and emits exactly one trip event across calls', async () => {
    const stats = makeStats([
      {
        // current week is far above mean+2σ.
        field: 'rendering_clarity',
        currentWeekCount: 50,
        priorWeeksCounts: [1, 0, 1, 1], // mean = 0.75, σ ≈ 0.43, threshold ≈ 1.6
      },
    ]);
    const breaker = createTier2CircuitBreaker({ stats, now: () => 1000 });
    const blocking = new Set<VerdictFieldName>(['renderingClarity', 'overallFit']);
    const out1 = await breaker.applyTo(blocking);
    expect(out1.has('renderingClarity')).toBe(false);
    expect(out1.has('overallFit')).toBe(true);

    // Second call within the cache window should reuse the cached decision —
    // does not re-emit the trip event, regardless of stats query count.
    const out2 = await breaker.applyTo(blocking);
    expect(out2.has('renderingClarity')).toBe(false);

    const tripped = vi
      .mocked(logEvent)
      .mock.calls.filter(c => c[1] === 'tier2.circuit_breaker_tripped');
    expect(tripped).toHaveLength(1);
    expect((tripped[0][2] as { field: string }).field).toBe('rendering_clarity');
  });

  it('does not re-emit the trip event after cache expiry when the field is already tripped', async () => {
    const stats = makeStats([
      {
        field: 'overall_fit',
        currentWeekCount: 100,
        // mean=2, σ=0, threshold=2 — current=100 trips on first observation.
        priorWeeksCounts: [2, 2, 2, 2],
      },
    ]);
    let now = 1000;
    const breaker = createTier2CircuitBreaker({ stats, now: () => now });
    await breaker.applyTo(new Set<VerdictFieldName>(['overallFit']));
    // Advance well past the 60 s TTL.
    now = 1000 + 120_000;
    await breaker.applyTo(new Set<VerdictFieldName>(['overallFit']));

    const tripped = vi
      .mocked(logEvent)
      .mock.calls.filter(c => c[1] === 'tier2.circuit_breaker_tripped');
    expect(tripped).toHaveLength(1);
  });

  it('does not trip when prior history is all-zeros (newly activated field)', async () => {
    // A freshly enabled field has no rejection history, so any non-zero
    // current-week count would trip a naive mean+2σ rule (mean=σ=0,
    // threshold=0). Treat all-zero priors as insufficient signal.
    const stats = makeStats([
      {
        field: 'rendering_clarity',
        currentWeekCount: 5,
        priorWeeksCounts: [0, 0, 0, 0],
      },
    ]);
    const breaker = createTier2CircuitBreaker({ stats });
    const blocking = new Set<VerdictFieldName>(['renderingClarity']);
    const out = await breaker.applyTo(blocking);
    expect(out.has('renderingClarity')).toBe(true);
    const tripped = vi
      .mocked(logEvent)
      .mock.calls.filter(c => c[1] === 'tier2.circuit_breaker_tripped');
    expect(tripped).toHaveLength(0);
  });

  it('still trips once at least one prior bucket has a non-zero signal', async () => {
    // As soon as history accumulates a single non-zero week, the breaker can
    // compute a meaningful threshold and resume tripping on spikes.
    const stats = makeStats([
      {
        field: 'rendering_clarity',
        currentWeekCount: 50,
        priorWeeksCounts: [0, 0, 0, 1], // mean = 0.25, σ ≈ 0.43
      },
    ]);
    const breaker = createTier2CircuitBreaker({ stats });
    const blocking = new Set<VerdictFieldName>(['renderingClarity']);
    const out = await breaker.applyTo(blocking);
    expect(out.has('renderingClarity')).toBe(false);
    const tripped = vi
      .mocked(logEvent)
      .mock.calls.filter(c => c[1] === 'tier2.circuit_breaker_tripped');
    expect(tripped).toHaveLength(1);
  });

  it('does not trip when the current week is at or below the threshold', async () => {
    const stats = makeStats([
      {
        field: 'rendering_clarity',
        currentWeekCount: 2,
        priorWeeksCounts: [2, 2, 2, 2], // mean=2, σ=0, threshold=2
      },
    ]);
    const breaker = createTier2CircuitBreaker({ stats });
    const out = await breaker.applyTo(new Set<VerdictFieldName>(['renderingClarity']));
    expect(out.has('renderingClarity')).toBe(true);
    const tripped = vi
      .mocked(logEvent)
      .mock.calls.filter(c => c[1] === 'tier2.circuit_breaker_tripped');
    expect(tripped).toHaveLength(0);
  });

  it('serializes concurrent recomputes after TTL expiry — one DB round-trip, no duplicate trip events', async () => {
    // Without the in-flight promise, two `applyTo` calls that both observe an
    // expired cache would each call `getWeeklyBlockingCounts` and each emit a
    // `tier2.circuit_breaker_tripped` event for the same crossing field.
    let resolveQuery: ((buckets: Tier2WeeklyBlockingCounts[]) => void) | undefined;
    const queryFn = vi.fn().mockImplementation(() => {
      return new Promise<Tier2WeeklyBlockingCounts[]>(resolve => {
        resolveQuery = resolve;
      });
    });
    const stats: Tier2BlockingStatsRepository = { getWeeklyBlockingCounts: queryFn };
    const breaker = createTier2CircuitBreaker({ stats });
    const blocking = new Set<VerdictFieldName>(['renderingClarity']);

    // Launch two concurrent calls. The second must observe the in-flight
    // promise and await its result rather than starting its own recompute.
    const p1 = breaker.applyTo(blocking);
    const p2 = breaker.applyTo(blocking);

    // Resolve the single in-flight DB call.
    resolveQuery?.([
      {
        field: 'rendering_clarity',
        currentWeekCount: 50,
        priorWeeksCounts: [1, 0, 1, 1],
      },
    ]);

    const [out1, out2] = await Promise.all([p1, p2]);
    expect(out1.has('renderingClarity')).toBe(false);
    expect(out2.has('renderingClarity')).toBe(false);
    expect(queryFn).toHaveBeenCalledTimes(1);

    const tripped = vi
      .mocked(logEvent)
      .mock.calls.filter(c => c[1] === 'tier2.circuit_breaker_tripped');
    expect(tripped).toHaveLength(1);
  });

  it('falls open and returns the input unchanged when the stats query throws', async () => {
    const stats: Tier2BlockingStatsRepository = {
      getWeeklyBlockingCounts: vi.fn().mockRejectedValue(new Error('db unavailable')),
    };
    const breaker = createTier2CircuitBreaker({ stats });
    const blocking = new Set<VerdictFieldName>(['renderingClarity']);
    const out = await breaker.applyTo(blocking);
    expect(out).toEqual(blocking);
  });

  it('ignores buckets for unknown field names (defensive)', async () => {
    const stats = makeStats([
      {
        field: 'unknown_field',
        currentWeekCount: 1000,
        priorWeeksCounts: [1, 1, 1, 1],
      },
    ]);
    const breaker = createTier2CircuitBreaker({ stats });
    const blocking = new Set<VerdictFieldName>(['renderingClarity']);
    const out = await breaker.applyTo(blocking);
    expect(out).toEqual(blocking);
  });
});
