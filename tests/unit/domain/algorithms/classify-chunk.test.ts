import { describe, it, expect } from 'vitest';
import {
  classifyChunk,
  type ClassifyChunkInput,
} from '../../../../src/domain/algorithms/classify-chunk.js';

const MS_PER_DAY = 86_400_000;
const NOW = new Date('2025-06-15T12:00:00.000Z');

/** Build a ClassifyChunkInput from human-readable fields. */
function makeInput(opts: {
  easeFactor: number;
  repetitions: number;
  intervalDays: number | null;
  daysOverdue: number;
}): ClassifyChunkInput {
  return {
    easeFactor: opts.easeFactor,
    repetitions: opts.repetitions,
    nextReviewAt: NOW.getTime() - opts.daysOverdue * MS_PER_DAY,
    intervalDays: opts.intervalDays,
  };
}

describe('classifyChunk', () => {
  describe('fresh item (Journey 1)', () => {
    it('returns R = 1.0, recall, SS = 0, compression = 0.2 for repetitions=0 / null interval', () => {
      const input = makeInput({
        easeFactor: 2.5,
        repetitions: 0,
        intervalDays: null,
        daysOverdue: 0,
      });
      const result = classifyChunk(input, NOW);

      expect(result.estimatedRetrievability).toBe(1.0);
      expect(result.teachingApproach).toBe('recall');
      expect(result.storageStrengthEstimate).toBe(0);
      expect(result.reteachCompression).toBe(0.2);
      expect(result.daysOverdue).toBe(0);
    });
  });

  describe('tier boundaries', () => {
    // S = 10 for all boundary tests. Values computed from:
    // R(t) = (1 + (19/81) * t / S)^(-0.5)

    it('R just above 0.70 → recall (daysOverdue=44, S=10)', () => {
      const input = makeInput({
        easeFactor: 2.5,
        repetitions: 3,
        intervalDays: 10,
        daysOverdue: 44,
      });
      const result = classifyChunk(input, NOW);

      expect(result.estimatedRetrievability).toBeGreaterThan(0.7);
      expect(result.estimatedRetrievability).toBeCloseTo(0.7015, 3);
      expect(result.teachingApproach).toBe('recall');
    });

    it('R just below 0.70 → cued_recall (daysOverdue=45, S=10)', () => {
      const input = makeInput({
        easeFactor: 2.5,
        repetitions: 3,
        intervalDays: 10,
        daysOverdue: 45,
      });
      const result = classifyChunk(input, NOW);

      expect(result.estimatedRetrievability).toBeLessThan(0.7);
      expect(result.estimatedRetrievability).toBeCloseTo(0.6975, 3);
      expect(result.teachingApproach).toBe('cued_recall');
    });

    it('R just above 0.50 → cued_recall (daysOverdue=127, S=10)', () => {
      const input = makeInput({
        easeFactor: 2.5,
        repetitions: 3,
        intervalDays: 10,
        daysOverdue: 127,
      });
      const result = classifyChunk(input, NOW);

      expect(result.estimatedRetrievability).toBeGreaterThan(0.5);
      expect(result.estimatedRetrievability).toBeCloseTo(0.5013, 3);
      expect(result.teachingApproach).toBe('cued_recall');
    });

    it('R just below 0.50 → reteach (daysOverdue=129, S=10)', () => {
      const input = makeInput({
        easeFactor: 2.5,
        repetitions: 3,
        intervalDays: 10,
        daysOverdue: 129,
      });
      const result = classifyChunk(input, NOW);

      expect(result.estimatedRetrievability).toBeLessThan(0.5);
      expect(result.estimatedRetrievability).toBeCloseTo(0.4984, 3);
      expect(result.teachingApproach).toBe('reteach');
    });

    it('R just above 0.30 → reteach (daysOverdue=430, S=10)', () => {
      const input = makeInput({
        easeFactor: 2.5,
        repetitions: 3,
        intervalDays: 10,
        daysOverdue: 430,
      });
      const result = classifyChunk(input, NOW);

      expect(result.estimatedRetrievability).toBeGreaterThan(0.3);
      expect(result.estimatedRetrievability).toBeCloseTo(0.3003, 3);
      expect(result.teachingApproach).toBe('reteach');
    });

    it('R just below 0.30 → scaffold (daysOverdue=432, S=10)', () => {
      const input = makeInput({
        easeFactor: 2.5,
        repetitions: 3,
        intervalDays: 10,
        daysOverdue: 432,
      });
      const result = classifyChunk(input, NOW);

      expect(result.estimatedRetrievability).toBeLessThan(0.3);
      expect(result.estimatedRetrievability).toBeCloseTo(0.2997, 3);
      expect(result.teachingApproach).toBe('scaffold');
    });
  });

  describe('edge cases', () => {
    it('intervalDays = 0 does not throw, returns R = 1.0', () => {
      const input = makeInput({ easeFactor: 2.0, repetitions: 2, intervalDays: 0, daysOverdue: 5 });
      const result = classifyChunk(input, NOW);

      expect(result.estimatedRetrievability).toBe(1.0);
      expect(result.teachingApproach).toBe('recall');
    });

    it('not-yet-due item (nextReviewAt in future) → high R, daysOverdue 0', () => {
      const input: ClassifyChunkInput = {
        easeFactor: 2.5,
        repetitions: 3,
        intervalDays: 10,
        nextReviewAt: NOW.getTime() + 5 * MS_PER_DAY, // 5 days in the future
      };
      const result = classifyChunk(input, NOW);

      expect(result.daysOverdue).toBe(0);
      expect(result.estimatedRetrievability).toBe(1.0);
      expect(result.teachingApproach).toBe('recall');
    });
  });

  describe('storage strength modulates reteach compression', () => {
    it('higher repetitions/ease → higher compression', () => {
      const lowStrength = makeInput({
        easeFactor: 1.5,
        repetitions: 1,
        intervalDays: 10,
        daysOverdue: 50,
      });
      const highStrength = makeInput({
        easeFactor: 2.5,
        repetitions: 5,
        intervalDays: 10,
        daysOverdue: 50,
      });

      const lowResult = classifyChunk(lowStrength, NOW);
      const highResult = classifyChunk(highStrength, NOW);

      // Same daysOverdue and intervalDays → same R
      expect(lowResult.estimatedRetrievability).toBeCloseTo(highResult.estimatedRetrievability, 10);

      // Different storage strength
      expect(lowResult.storageStrengthEstimate).toBeLessThan(highResult.storageStrengthEstimate);
      // Low: 1 * (1.5/2.5) = 0.6, compression = 0.2 + 0.06 = 0.26
      expect(lowResult.storageStrengthEstimate).toBeCloseTo(0.6, 5);
      expect(lowResult.reteachCompression).toBeCloseTo(0.26, 5);
      // High: 5 * (2.5/2.5) = 5.0, compression = min(0.8, 0.2 + 0.5) = 0.7
      expect(highResult.storageStrengthEstimate).toBeCloseTo(5.0, 5);
      expect(highResult.reteachCompression).toBeCloseTo(0.7, 5);
    });

    it('caps compression at 0.8', () => {
      const input = makeInput({
        easeFactor: 2.5,
        repetitions: 10,
        intervalDays: 10,
        daysOverdue: 0,
      });
      const result = classifyChunk(input, NOW);

      // SS = 10 * (2.5/2.5) = 10, compression = min(0.8, 0.2 + 1.0) = 0.8
      expect(result.storageStrengthEstimate).toBe(10);
      expect(result.reteachCompression).toBe(0.8);
    });
  });

  describe('spec journeys', () => {
    it('Journey 2: slightly overdue (2 days, S=10) → recall, R ~ 0.977', () => {
      const input = makeInput({
        easeFactor: 2.5,
        repetitions: 3,
        intervalDays: 10,
        daysOverdue: 2,
      });
      const result = classifyChunk(input, NOW);

      expect(result.teachingApproach).toBe('recall');
      expect(result.estimatedRetrievability).toBeCloseTo(0.977, 2);
      expect(result.storageStrengthEstimate).toBeCloseTo(3.0, 5);
      expect(result.reteachCompression).toBeCloseTo(0.5, 5);
      expect(result.daysOverdue).toBeCloseTo(2, 1);
    });

    it('Journey 3: heavily overdue (120 days, S=5) → reteach, R ~ 0.388', () => {
      // Note: spec expected R ~ 0.117 / scaffold, but the FSRS formula
      // (1 + (19/81) * 120/5)^(-0.5) actually yields ~ 0.388 (reteach tier).
      const input = makeInput({
        easeFactor: 1.5,
        repetitions: 1,
        intervalDays: 5,
        daysOverdue: 120,
      });
      const result = classifyChunk(input, NOW);

      expect(result.teachingApproach).toBe('reteach');
      expect(result.estimatedRetrievability).toBeCloseTo(0.388, 2);
      expect(result.storageStrengthEstimate).toBeCloseTo(0.6, 5);
      expect(result.reteachCompression).toBeCloseTo(0.26, 5);
      expect(result.daysOverdue).toBeCloseTo(120, 1);
    });
  });
});
