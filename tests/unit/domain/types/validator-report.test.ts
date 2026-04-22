import { describe, it, expect } from 'vitest';
import {
  ValidatorReportSchema,
  canonicalEmptyReport,
  mergeReportSections,
  type ValidatorReport,
} from '../../../../src/domain/types/validator-report.js';

const ISO_A = '2026-04-22T11:00:00.000Z';
const ISO_B = '2026-04-22T12:00:00.000Z';

describe('canonicalEmptyReport', () => {
  it('returns only updated_at when given a timestamp', () => {
    const report = canonicalEmptyReport(ISO_A);
    expect(report).toEqual({ updated_at: ISO_A });
  });

  it('does not introduce tier keys', () => {
    const report = canonicalEmptyReport(ISO_A);
    expect('tier1a' in report).toBe(false);
    expect('tier1b' in report).toBe(false);
    expect('tier2' in report).toBe(false);
  });
});

describe('mergeReportSections', () => {
  it('returns canonical-empty plus partial when prev is null', () => {
    const result = mergeReportSections(null, { tier1a: ['x'] }, ISO_A);
    expect(result).toEqual({ updated_at: ISO_A, tier1a: ['x'] });
  });

  it('preserves untouched tier sections from prev', () => {
    const prev: ValidatorReport = {
      updated_at: ISO_A,
      tier1a: ['old-1a'],
      tier1b: ['old-1b'],
      tier2: { score: 0.1 },
    };
    const result = mergeReportSections(prev, { tier2: { score: 0.9 } }, ISO_B);
    expect(result.tier1a).toEqual(['old-1a']);
    expect(result.tier1b).toEqual(['old-1b']);
    expect(result.tier2).toEqual({ score: 0.9 });
    expect(result.updated_at).toBe(ISO_B);
  });

  it('replaces a whole tier key (no deep merge inside the tier)', () => {
    const prev: ValidatorReport = {
      updated_at: ISO_A,
      tier2: { score: 0.1, label: 'old' },
    };
    // Partial only specifies `score` — the merge replaces tier2 wholesale.
    const result = mergeReportSections(prev, { tier2: { score: 0.9 } }, ISO_B);
    expect(result.tier2).toEqual({ score: 0.9 });
  });

  it('always sets updated_at to the supplied timestamp', () => {
    const prev: ValidatorReport = { updated_at: ISO_A };
    const result = mergeReportSections(prev, {}, ISO_B);
    expect(result.updated_at).toBe(ISO_B);
  });

  it('replaces tier1b when provided in partial', () => {
    const prev: ValidatorReport = { updated_at: ISO_A, tier1b: ['old'] };
    const result = mergeReportSections(prev, { tier1b: ['new'] }, ISO_B);
    expect(result.tier1b).toEqual(['new']);
  });

  it('skips undefined values in partial (matches SQL || semantics — prior value preserved)', () => {
    const prev: ValidatorReport = { updated_at: ISO_A, tier1a: ['x'] };
    const result = mergeReportSections(prev, { tier1a: undefined }, ISO_B);
    expect(result.tier1a).toEqual(['x']);
  });

  it('persists explicit null as JSON null (key present, value null)', () => {
    const prev: ValidatorReport = { updated_at: ISO_A, tier2: { score: 0.5 } };
    const result = mergeReportSections(prev, { tier2: null }, ISO_B);
    expect('tier2' in result).toBe(true);
    expect(result.tier2).toBeNull();
  });
});

describe('ValidatorReportSchema', () => {
  it('parses an empty canonical payload', () => {
    const parsed = ValidatorReportSchema.parse({ updated_at: ISO_A });
    expect(parsed).toEqual({ updated_at: ISO_A });
  });

  it('parses a fully populated payload', () => {
    const payload = {
      updated_at: ISO_A,
      tier1a: [{ rule: 'r1' }],
      tier1b: [{ rule: 'r2' }],
      tier2: { score: 0.5 },
    };
    expect(ValidatorReportSchema.parse(payload)).toEqual(payload);
  });

  it('rejects payload missing updated_at', () => {
    expect(() => ValidatorReportSchema.parse({ tier1a: [] })).toThrow();
  });
});
