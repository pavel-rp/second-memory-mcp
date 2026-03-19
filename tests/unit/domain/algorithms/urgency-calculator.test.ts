import { describe, it, expect } from 'vitest';
import { calculateUrgencyScore } from '../../../../src/domain/algorithms/urgency-calculator.js';

describe('calculateUrgencyScore', () => {
  it('returns 0 for a single non-overdue chunk with default ease', () => {
    const { score } = calculateUrgencyScore({
      maxOverdueDays: 0,
      dueCount: 1,
      minEaseFactor: 2.5,
    });
    expect(score).toBe(0);
  });

  it('returns higher score for more overdue days', () => {
    const low = calculateUrgencyScore({ maxOverdueDays: 2, dueCount: 1, minEaseFactor: 2.5 });
    const high = calculateUrgencyScore({ maxOverdueDays: 15, dueCount: 1, minEaseFactor: 2.5 });
    expect(high.score).toBeGreaterThan(low.score);
  });

  it('returns higher score for more due chunks', () => {
    const few = calculateUrgencyScore({ maxOverdueDays: 0, dueCount: 2, minEaseFactor: 2.5 });
    const many = calculateUrgencyScore({ maxOverdueDays: 0, dueCount: 8, minEaseFactor: 2.5 });
    expect(many.score).toBeGreaterThan(few.score);
  });

  it('returns higher score for lower ease factor', () => {
    const easy = calculateUrgencyScore({ maxOverdueDays: 0, dueCount: 3, minEaseFactor: 2.5 });
    const hard = calculateUrgencyScore({ maxOverdueDays: 0, dueCount: 3, minEaseFactor: 1.3 });
    expect(hard.score).toBeGreaterThan(easy.score);
  });

  it('clamps score to [0, 1]', () => {
    const extreme = calculateUrgencyScore({
      maxOverdueDays: 100,
      dueCount: 50,
      minEaseFactor: 1.3,
    });
    expect(extreme.score).toBeLessThanOrEqual(1);
    expect(extreme.score).toBeGreaterThanOrEqual(0);
  });

  it('overdue days dominates the score (highest weight)', () => {
    const overdueHeavy = calculateUrgencyScore({
      maxOverdueDays: 30,
      dueCount: 1,
      minEaseFactor: 2.5,
    });
    const countHeavy = calculateUrgencyScore({
      maxOverdueDays: 0,
      dueCount: 10,
      minEaseFactor: 2.5,
    });
    expect(overdueHeavy.score).toBeGreaterThan(countHeavy.score);
  });

  it('generates reason mentioning overdue when overdue days dominate', () => {
    const { reason } = calculateUrgencyScore({
      maxOverdueDays: 10,
      dueCount: 2,
      minEaseFactor: 2.5,
    });
    expect(reason).toContain('overdue');
  });

  it('generates reason mentioning chunks due when count dominates', () => {
    const { reason } = calculateUrgencyScore({
      maxOverdueDays: 0,
      dueCount: 8,
      minEaseFactor: 2.5,
    });
    expect(reason).toContain('chunks due');
  });

  it('generates reason mentioning struggling when ease dominates', () => {
    const { reason } = calculateUrgencyScore({
      maxOverdueDays: 0,
      dueCount: 1,
      minEaseFactor: 1.3,
    });
    expect(reason).toContain('struggling');
  });

  it('generates fallback reason for single non-overdue chunk', () => {
    const { reason } = calculateUrgencyScore({
      maxOverdueDays: 0,
      dueCount: 1,
      minEaseFactor: 2.5,
    });
    expect(reason).toContain('ready to learn');
  });

  it('rounds score to 2 decimal places', () => {
    const { score } = calculateUrgencyScore({
      maxOverdueDays: 7,
      dueCount: 3,
      minEaseFactor: 2.0,
    });
    const decimalPlaces = score.toString().split('.')[1]?.length ?? 0;
    expect(decimalPlaces).toBeLessThanOrEqual(2);
  });

  it('uses fallback overdue reason when ease dominates but minEaseFactor >= 2.0', () => {
    // Ease weight is highest but minEaseFactor >= 2.0 skips the "struggling" branch,
    // falling through to the overdue fallback at lines 70-72
    const { reason } = calculateUrgencyScore({
      maxOverdueDays: 1,
      dueCount: 1,
      minEaseFactor: 2.0,
    });
    expect(reason).toContain('overdue');
  });

  it('pluralizes fallback overdue reason for multiple chunks and days', () => {
    // Same fallback path but with plural values
    const { reason } = calculateUrgencyScore({
      maxOverdueDays: 2,
      dueCount: 3,
      minEaseFactor: 2.0,
    });
    expect(reason).toBe('3 chunks overdue (max 2 days)');
  });

  it('uses singular "chunk" and "day" for count 1', () => {
    const { reason } = calculateUrgencyScore({
      maxOverdueDays: 1,
      dueCount: 1,
      minEaseFactor: 2.5,
    });
    expect(reason).toContain('1 chunk');
    expect(reason).toContain('1 day');
    expect(reason).not.toContain('chunks');
    expect(reason).not.toContain('days');
  });
});
