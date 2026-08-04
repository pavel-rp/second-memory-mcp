import { describe, it, expect } from 'vitest';
import { computeSchedulingSnapshot } from '../../../../src/domain/algorithms/scheduling-snapshot.js';
import {
  classifyChunk,
  type ClassifyChunkInput,
} from '../../../../src/domain/algorithms/classify-chunk.js';

const MS_PER_DAY = 86_400_000;
const NOW = new Date('2025-06-15T12:00:00.000Z');

/** Build a ClassifyChunkInput from human-readable fields. */
function makeInput(opts: {
  intervalDays: number | null;
  daysOverdue: number;
  easeFactor?: number;
  repetitions?: number;
}): ClassifyChunkInput {
  return {
    easeFactor: opts.easeFactor ?? 2.5,
    repetitions: opts.repetitions ?? 3,
    nextReviewAt: NOW.getTime() - opts.daysOverdue * MS_PER_DAY,
    intervalDays: opts.intervalDays,
  };
}

describe('computeSchedulingSnapshot', () => {
  describe('fresh band', () => {
    it('null intervalDays → fresh with no predicted recall', () => {
      const snapshot = computeSchedulingSnapshot(
        makeInput({ intervalDays: null, daysOverdue: 0 }),
        NOW
      );

      expect(snapshot).toEqual({
        band: 'fresh',
        predictedRecall: null,
        intervalDays: null,
        daysOverdue: 0,
      });
    });

    it('zero intervalDays → fresh with no predicted recall', () => {
      const snapshot = computeSchedulingSnapshot(
        makeInput({ intervalDays: 0, daysOverdue: 0 }),
        NOW
      );

      expect(snapshot.band).toBe('fresh');
      expect(snapshot.predictedRecall).toBeNull();
      expect(snapshot.intervalDays).toBe(0);
    });

    it('negative intervalDays → fresh with no predicted recall', () => {
      const snapshot = computeSchedulingSnapshot(
        makeInput({ intervalDays: -3, daysOverdue: 0 }),
        NOW
      );

      expect(snapshot.band).toBe('fresh');
      expect(snapshot.predictedRecall).toBeNull();
      expect(snapshot.intervalDays).toBe(-3);
    });

    it('captures daysOverdue on the fresh band too', () => {
      const snapshot = computeSchedulingSnapshot(
        makeInput({ intervalDays: null, daysOverdue: 4.5 }),
        NOW
      );

      expect(snapshot.band).toBe('fresh');
      expect(snapshot.daysOverdue).toBeCloseTo(4.5, 6);
    });

    it('clamps daysOverdue at 0 for a not-yet-due chunk', () => {
      const snapshot = computeSchedulingSnapshot(
        makeInput({ intervalDays: null, daysOverdue: -7 }),
        NOW
      );

      expect(snapshot.daysOverdue).toBe(0);
    });
  });

  describe('established band', () => {
    it('an overdue chunk carries exactly the classifyChunk power-law estimate, strictly < 1', () => {
      const input = makeInput({ intervalDays: 10, daysOverdue: 45 });
      const snapshot = computeSchedulingSnapshot(input, NOW);
      const expected = classifyChunk(input, NOW).estimatedRetrievability;

      expect(snapshot.band).toBe('established');
      expect(snapshot.predictedRecall).toBe(expected);
      expect(snapshot.predictedRecall).toBeLessThan(1);
      expect(snapshot.predictedRecall).toBeGreaterThan(0);
      expect(snapshot.intervalDays).toBe(10);
      expect(snapshot.daysOverdue).toBeCloseTo(45, 6);
    });
  });

  describe('the on-time-1.0 vs fresh-1.0 discrimination', () => {
    it('distinguishes an on-time established review from a fresh chunk by band alone', () => {
      const onTime = makeInput({ intervalDays: 10, daysOverdue: 0 });
      const fresh = makeInput({ intervalDays: null, daysOverdue: 0 });

      // classifyChunk returns exactly 1.0 for BOTH — the collision a single
      // numeric column could never resolve.
      expect(classifyChunk(onTime, NOW).estimatedRetrievability).toBe(1);
      expect(classifyChunk(fresh, NOW).estimatedRetrievability).toBe(1);

      const onTimeSnapshot = computeSchedulingSnapshot(onTime, NOW);
      const freshSnapshot = computeSchedulingSnapshot(fresh, NOW);

      expect(onTimeSnapshot.band).toBe('established');
      expect(onTimeSnapshot.predictedRecall).toBe(1);

      expect(freshSnapshot.band).toBe('fresh');
      expect(freshSnapshot.predictedRecall).toBeNull();
    });
  });

  describe('defensive nulling — never emits a value the CHECK constraints reject', () => {
    it('a non-finite nextReviewAt yields null recall and null daysOverdue without throwing', () => {
      const input: ClassifyChunkInput = {
        easeFactor: 2.5,
        repetitions: 3,
        nextReviewAt: Number.NaN,
        intervalDays: 10,
      };

      const snapshot = computeSchedulingSnapshot(input, NOW);

      expect(snapshot.band).toBe('established');
      expect(snapshot.predictedRecall).toBeNull();
      expect(snapshot.daysOverdue).toBeNull();
      expect(snapshot.intervalDays).toBe(10);
    });

    it('a non-finite intervalDays falls back to the fresh band', () => {
      const input: ClassifyChunkInput = {
        easeFactor: 2.5,
        repetitions: 3,
        nextReviewAt: NOW.getTime(),
        intervalDays: Number.POSITIVE_INFINITY,
      };

      const snapshot = computeSchedulingSnapshot(input, NOW);

      expect(snapshot.band).toBe('fresh');
      expect(snapshot.predictedRecall).toBeNull();
      expect(snapshot.intervalDays).toBeNull();
    });

    it('a non-finite `now` does not throw', () => {
      const input = makeInput({ intervalDays: 10, daysOverdue: 5 });

      const snapshot = computeSchedulingSnapshot(input, new Date(Number.NaN));

      expect(snapshot.predictedRecall).toBeNull();
      expect(snapshot.daysOverdue).toBeNull();
    });
  });
});
