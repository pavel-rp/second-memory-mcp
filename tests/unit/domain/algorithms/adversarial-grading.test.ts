import { describe, it, expect } from 'vitest';
import { mapRubricToQuality } from '../../../../src/domain/algorithms/grade-mapper.js';
import { evaluateOverValidation } from '../../../../src/domain/algorithms/over-validation-guard.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../../src/domain/config/algorithm-defaults.js';
import {
  ADVERSARIAL_GRADING_CASES,
  PASS_THRESHOLD,
  knownIncorrectCases,
  validUnusualCases,
  measureFalseAcceptRate,
} from '../../../fixtures/adversarial-grading-fixture.js';

/**
 * NEU-929 (OUT-5) — the held-out adversarial grading oracle with a fail-closed,
 * build-time over-validation ceiling assertion. This test gates every `pnpm
 * test:unit` / CI run: if the deterministic `grade mapper` ever over-validates
 * the held-out known-incorrect set beyond `overValidationCeiling`, the build
 * FAILS. This is a check on the held-out aggregate false-accept RATE, not a
 * runtime rate-limiter on any single grade.
 */
describe('adversarial grading fixture — held-out over-validation ceiling', () => {
  const ceiling = DEFAULT_ALGORITHM_CONFIG.overValidationCeiling;

  it('measures a false-accept rate at or below the configured ceiling (fail-closed)', () => {
    const measurement = measureFalseAcceptRate(mapRubricToQuality);

    // The build-gating assertion routes through the domain guard that consumes
    // the `overValidationCeiling` config knob. Message names the offending cases
    // so a regression is diagnosable from CI output alone.
    const verdict = evaluateOverValidation(measurement.rate, DEFAULT_ALGORITHM_CONFIG);
    expect(
      verdict.withinCeiling,
      `false-accept rate ${measurement.rate.toFixed(3)} exceeds ceiling ${ceiling} ` +
        `(${measurement.falseAccepts}/${measurement.knownIncorrect} known-incorrect cases passed: ` +
        `${measurement.falseAcceptIds.join(', ') || 'none'})`
    ).toBe(true);
  });

  it('does not reject every valid-but-unusual answer (ceiling is not met degenerately)', () => {
    // A reject-all mapper would trivially satisfy the ceiling. Prove the mapper
    // still passes genuinely-correct, unconventional answers.
    const valid = validUnusualCases();
    expect(valid.length).toBeGreaterThan(0);
    for (const c of valid) {
      const quality = mapRubricToQuality(c.payload);
      expect(
        quality,
        `valid-but-unusual case ${c.id} should pass but scored ${quality}`
      ).toBeGreaterThanOrEqual(PASS_THRESHOLD);
    }
  });

  it('each case grades in agreement with its expected verdict', () => {
    for (const c of ADVERSARIAL_GRADING_CASES) {
      const quality = mapRubricToQuality(c.payload);
      const verdict = quality >= PASS_THRESHOLD ? 'pass' : 'fail';
      expect(verdict, `case ${c.id} (${c.description}) scored ${quality}`).toBe(c.expectedVerdict);
    }
  });

  it('a learner rebuttal is never fed to the mapper (payload-only grading)', () => {
    // Re-grading each case with only its payload yields the same quality as the
    // stored expectation — the rebuttal metadata cannot influence the grade.
    for (const c of ADVERSARIAL_GRADING_CASES) {
      const withoutRebuttal = mapRubricToQuality(c.payload);
      const again = mapRubricToQuality({
        criteria: { ...c.payload.criteria },
        justifying_spans: { ...c.payload.justifying_spans },
      });
      expect(again).toBe(withoutRebuttal);
    }
  });

  it('is a non-trivial held-out set with both classes represented', () => {
    expect(knownIncorrectCases().length).toBeGreaterThanOrEqual(8);
    expect(validUnusualCases().length).toBeGreaterThanOrEqual(3);
    // Unique ids — no accidental duplicates that would skew the rate.
    const ids = ADVERSARIAL_GRADING_CASES.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
