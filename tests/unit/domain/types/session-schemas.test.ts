import { describe, it, expect } from 'vitest';
import { ChunkAttemptSchema, SessionChunkSchema } from '../../../../src/domain/types/session.js';

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

describe('SessionChunkSchema', () => {
  const validChunk = {
    chunk_id: 'chunk-1',
    session_chunk_id: 'sc-uuid-1',
    title: 'Intro to X',
    status: 'pending',
    attempts: [],
    quality_scores: [],
    time_spent_ms: 0,
  };

  it('accepts a valid chunk with session_chunk_id', () => {
    const result = SessionChunkSchema.safeParse(validChunk);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.session_chunk_id).toBe('sc-uuid-1');
    }
  });

  it('rejects missing session_chunk_id', () => {
    const { session_chunk_id: _, ...without } = validChunk;
    const result = SessionChunkSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  it('rejects empty session_chunk_id', () => {
    const result = SessionChunkSchema.safeParse({ ...validChunk, session_chunk_id: '' });
    expect(result.success).toBe(false);
  });
});
