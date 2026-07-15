import { describe, it, expect } from 'vitest';
import {
  evaluateOverValidation,
  GRADE_PASS_THRESHOLD,
} from '../../../../src/domain/algorithms/over-validation-guard.js';

describe('evaluateOverValidation — fail-closed over-validation guard (NEU-929)', () => {
  const config = { overValidationCeiling: 0.1 };

  it('is within the ceiling when the measured rate is below it', () => {
    const verdict = evaluateOverValidation(0, config);
    expect(verdict.withinCeiling).toBe(true);
    expect(verdict.ceiling).toBe(0.1);
    expect(verdict.measuredRate).toBe(0);
  });

  it('is within the ceiling when the measured rate exactly equals it (inclusive)', () => {
    const verdict = evaluateOverValidation(0.1, config);
    expect(verdict.withinCeiling).toBe(true);
  });

  it('fails closed when the measured rate exceeds the ceiling', () => {
    const verdict = evaluateOverValidation(0.2, config);
    expect(verdict.withinCeiling).toBe(false);
    expect(verdict.measuredRate).toBe(0.2);
  });

  it('reads the ceiling from the supplied config, not a hardcoded value', () => {
    const strict = evaluateOverValidation(0.05, { overValidationCeiling: 0 });
    expect(strict.withinCeiling).toBe(false);
    const lax = evaluateOverValidation(0.05, { overValidationCeiling: 0.5 });
    expect(lax.withinCeiling).toBe(true);
  });

  it('exposes the domain pass threshold (quality >= 3)', () => {
    expect(GRADE_PASS_THRESHOLD).toBe(3);
  });
});
