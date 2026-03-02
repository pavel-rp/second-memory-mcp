import { describe, it, expect } from 'vitest';
import { resolveAlgorithmConfig } from '../../../../src/config/resolve-algorithm-config.js';

describe('algorithm config env overrides', () => {
  it('applies overrides from env record', () => {
    const config = resolveAlgorithmConfig({
      SM_MIN_EASE_FACTOR: '1.5',
      SM_INITIAL_INTERVAL_DAYS: '2',
      SM_SECOND_INTERVAL_DAYS: '7',
      SM_EASE_DELTA_GOOD: '0.2',
      SM_EASE_DELTA_HARD: '-0.05',
      SM_EASE_PENALTY_FAILURE: '-0.3',
      SM_PRIORITY_W_URGENCY: '0.5',
      SM_PRIORITY_W_EASE: '0.2',
      SM_PRIORITY_W_REPS: '0.2',
      SM_PRIORITY_W_DIFF: '0.1',
    });
    expect(config.minimumEaseFactor).toBeGreaterThanOrEqual(1.5);
    expect(config.initialIntervalDays).toBe(2);
    expect(config.secondIntervalDays).toBe(7);
    expect(config.easeDeltaGood).toBeCloseTo(0.2, 5);
    expect(config.easeDeltaHard).toBeCloseTo(-0.05, 5);
    expect(config.easePenaltyFailure).toBeCloseTo(-0.3, 5);
  });
});
