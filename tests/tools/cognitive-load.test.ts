import { describe, it, expect } from 'vitest';
import { calculateItemCognitiveLoad } from '../../src/tools/cognitive-load.js';
import type { LearningItem } from '../../src/types/recommendations.js';

function makeItem(overrides: Partial<LearningItem> = {}): LearningItem {
  return {
    id: 'test-1',
    title: 'Test Item',
    subject: 'Math',
    difficulty: 5,
    nextReviewDate: '2026-01-01',
    easeFactor: 2.5,
    repetitions: 3,
    estimatedDuration: 15,
    chunkType: 'review',
    prerequisites: [],
    tags: [],
    ...overrides,
  };
}

describe('calculateItemCognitiveLoad', () => {
  it('uses difficulty as base load', () => {
    const low = calculateItemCognitiveLoad(makeItem({ difficulty: 2 }));
    const high = calculateItemCognitiveLoad(makeItem({ difficulty: 8 }));
    expect(high).toBeGreaterThan(low);
  });

  describe('chunk type adjustments', () => {
    it('new items have highest multiplier (1.5x)', () => {
      const newItem = calculateItemCognitiveLoad(makeItem({ chunkType: 'new' }));
      const reviewItem = calculateItemCognitiveLoad(makeItem({ chunkType: 'review' }));
      expect(newItem).toBeGreaterThan(reviewItem);
    });

    it('remediation items have moderate multiplier (1.3x)', () => {
      const remediation = calculateItemCognitiveLoad(makeItem({ chunkType: 'remediation' }));
      const review = calculateItemCognitiveLoad(makeItem({ chunkType: 'review' }));
      expect(remediation).toBeGreaterThan(review);
    });

    it('review items have lowest multiplier (0.8x)', () => {
      const review = calculateItemCognitiveLoad(makeItem({ chunkType: 'review', difficulty: 5 }));
      const newItem = calculateItemCognitiveLoad(makeItem({ chunkType: 'new', difficulty: 5 }));
      expect(review).toBeLessThan(newItem);
    });
  });

  describe('ease factor adjustments', () => {
    it('low ease factor increases load', () => {
      const hard = calculateItemCognitiveLoad(makeItem({ easeFactor: 1.5 }));
      const normal = calculateItemCognitiveLoad(makeItem({ easeFactor: 2.5 }));
      expect(hard).toBeGreaterThan(normal);
    });

    it('high ease factor decreases load', () => {
      const easy = calculateItemCognitiveLoad(makeItem({ easeFactor: 3.5 }));
      const normal = calculateItemCognitiveLoad(makeItem({ easeFactor: 2.5 }));
      expect(easy).toBeLessThan(normal);
    });
  });

  describe('duration adjustments', () => {
    it('long duration increases load', () => {
      const long = calculateItemCognitiveLoad(makeItem({ estimatedDuration: 30 }));
      const short = calculateItemCognitiveLoad(makeItem({ estimatedDuration: 15 }));
      expect(long).toBeGreaterThan(short);
    });

    it('short duration decreases load', () => {
      const short = calculateItemCognitiveLoad(makeItem({ estimatedDuration: 5 }));
      const medium = calculateItemCognitiveLoad(makeItem({ estimatedDuration: 15 }));
      expect(short).toBeLessThan(medium);
    });
  });

  describe('repetition adjustments', () => {
    it('zero repetitions increases load', () => {
      const first = calculateItemCognitiveLoad(makeItem({ repetitions: 0 }));
      const practiced = calculateItemCognitiveLoad(makeItem({ repetitions: 3 }));
      expect(first).toBeGreaterThan(practiced);
    });

    it('many repetitions decreases load', () => {
      const wellPracticed = calculateItemCognitiveLoad(makeItem({ repetitions: 10 }));
      const moderate = calculateItemCognitiveLoad(makeItem({ repetitions: 3 }));
      expect(wellPracticed).toBeLessThan(moderate);
    });
  });

  it('rounds to 1 decimal place', () => {
    const load = calculateItemCognitiveLoad(makeItem());
    const decimalPlaces = (load.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(1);
  });
});
