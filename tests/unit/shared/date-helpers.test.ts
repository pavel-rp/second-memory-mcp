import { describe, it, expect } from 'vitest';
import { toIsoTimestamp } from '../../../src/shared/date-helpers.js';

describe('toIsoTimestamp', () => {
  it('returns full ISO 8601 string for a known epoch ms', () => {
    // 2025-04-01T00:00:00.000Z
    const epochMs = new Date('2025-04-01T00:00:00.000Z').getTime();
    expect(toIsoTimestamp(epochMs)).toBe('2025-04-01T00:00:00.000Z');
  });

  it('preserves sub-day precision', () => {
    const epochMs = new Date('2025-06-15T14:30:45.123Z').getTime();
    expect(toIsoTimestamp(epochMs)).toBe('2025-06-15T14:30:45.123Z');
  });

  it('handles epoch zero', () => {
    expect(toIsoTimestamp(0)).toBe('1970-01-01T00:00:00.000Z');
  });

  it('handles midnight UTC at day boundary', () => {
    const midnight = new Date('2025-12-31T00:00:00.000Z').getTime();
    expect(toIsoTimestamp(midnight)).toBe('2025-12-31T00:00:00.000Z');
  });

  it('handles end-of-day boundary', () => {
    const endOfDay = new Date('2025-12-31T23:59:59.999Z').getTime();
    expect(toIsoTimestamp(endOfDay)).toBe('2025-12-31T23:59:59.999Z');
  });
});
