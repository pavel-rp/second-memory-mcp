import { describe, it, expect } from 'vitest';
import { ChunkAttemptSchema } from '../../../../src/domain/types/session.js';

describe('ChunkAttemptSchema', () => {
  it('rejects non-object input through normalizeLegacyAttempt', () => {
    const result = ChunkAttemptSchema.safeParse('not-an-object');
    expect(result.success).toBe(false);
  });

  it('normalizes legacy completed field to passed', () => {
    const result = ChunkAttemptSchema.safeParse({
      timestamp: '2026-03-10T10:00:00Z',
      completed: true,
      time_spent_ms: 5000,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.passed).toBe(true);
      expect(result.data).not.toHaveProperty('completed');
    }
  });

  it('defaults passed to false when both passed and completed are absent', () => {
    const result = ChunkAttemptSchema.safeParse({
      timestamp: '2026-03-10T10:00:00Z',
      time_spent_ms: 5000,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.passed).toBe(false); // default
    }
  });
});
