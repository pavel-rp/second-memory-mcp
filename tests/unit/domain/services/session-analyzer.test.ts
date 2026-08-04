import { describe, it, expect } from 'vitest';
import {
  calculateSessionProgress,
  getSessionStatus,
  validateSessionContext,
  applyBatchSessionChunkOperations,
} from '../../../../src/domain/services/session-analyzer.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../../src/domain/config/algorithm-defaults.js';
import { resolveSessionAdvisory } from '../../../../src/domain/algorithms/session-advisory.js';
import type { FatigueAttempt } from '../../../../src/domain/algorithms/fatigue-trend.js';
import type {
  SessionInput,
  SessionChunk,
  ChunkAttempt,
} from '../../../../src/domain/types/session.js';

const NOW = new Date('2024-01-01T10:30:00.000Z');

// Mirrors session-analyzer's private adapter mapping (timestamp -> epoch ms,
// quality ?? null, time_spent_ms -> latencyMs) so tests can independently
// derive what the shared resolver would see. Callers are responsible for
// passing an already-non-duplicated attempt list — this helper does not
// de-duplicate, so it must only be used with fixtures that don't replicate
// the same attempt across multiple chunks.
function toFatigueAttempts(attempts: ChunkAttempt[]): FatigueAttempt[] {
  return attempts.map(attempt => ({
    timestamp: new Date(attempt.timestamp).getTime(),
    quality: attempt.quality ?? null,
    latencyMs: attempt.time_spent_ms,
  }));
}

// Flattens every chunk's attempts (no de-duplication) — used only for
// fixtures constructed to already contain each attempt exactly once.
function flattenChunkAttempts(chunks: SessionChunk[]): FatigueAttempt[] {
  return toFatigueAttempts(chunks.flatMap(chunk => chunk.attempts));
}

describe('Session Manager', () => {
  const mockSessionInput: SessionInput = {
    session_id: 'test-session-123',
    mode: 'learning',
    start_time: '2024-01-01T10:00:00.000Z',
    current_time: '2024-01-01T10:30:00.000Z',
    chunks: [
      {
        chunk_id: 'chunk-1',
        session_chunk_id: 'sc-1',
        title: 'Introduction to Programming',
        status: 'completed',
        attempts: [
          {
            timestamp: '2024-01-01T10:15:00.000Z',
            quality: 4,
            time_spent_ms: 900000, // 15 minutes
            passed: true,
            question: 'Test question',
            response: 'Test response',
            feedback: 'Test feedback',
          },
        ],
        quality_scores: [4],
        time_spent_ms: 900000,
      },
      {
        chunk_id: 'chunk-2',
        session_chunk_id: 'sc-2',
        title: 'Variables and Data Types',
        status: 'in_progress',
        attempts: [
          {
            timestamp: '2024-01-01T10:25:00.000Z',
            quality: 3,
            time_spent_ms: 300000, // 5 minutes
            passed: false,
            question: 'Test question',
            response: 'Test response',
            feedback: 'Test feedback',
          },
        ],
        quality_scores: [3],
        time_spent_ms: 300000,
      },
      {
        chunk_id: 'chunk-3',
        session_chunk_id: 'sc-3',
        title: 'Control Flow',
        status: 'pending',
        attempts: [],
        quality_scores: [],
        time_spent_ms: 0,
      },
    ],
    context: { topic: 'Programming Basics' },
  };

  describe('calculateSessionProgress', () => {
    it('should calculate basic progress metrics correctly', () => {
      const result = calculateSessionProgress(mockSessionInput, NOW);

      expect(result.session_id).toBe('test-session-123');
      expect(result.total_chunks).toBe(3);
      expect(result.chunks_completed).toBe(1);
      expect(result.overall_progress).toBe(0.33); // 1/3 rounded to 2 decimals
      expect(result.average_quality).toBe(3.5); // (4 + 3) / 2
      expect(result.time_elapsed_ms).toBe(1800000); // 30 minutes
    });

    it('should handle empty chunks gracefully', () => {
      const emptySession: SessionInput = {
        ...mockSessionInput,
        chunks: [],
      };

      expect(() => calculateSessionProgress(emptySession, NOW)).not.toThrow();
    });

    it('should calculate estimated time remaining when applicable', () => {
      const result = calculateSessionProgress(mockSessionInput, NOW);
      expect(result.estimated_time_remaining_ms).toBeDefined();
      expect(result.estimated_time_remaining_ms).toBeGreaterThan(0);
    });

    it('should handle sessions with no completed chunks', () => {
      const noCompletedSession: SessionInput = {
        ...mockSessionInput,
        chunks: mockSessionInput.chunks.map(chunk => ({
          ...chunk,
          status: 'pending' as const,
        })),
      };

      const result = calculateSessionProgress(noCompletedSession, NOW);
      expect(result.chunks_completed).toBe(0);
      expect(result.overall_progress).toBe(0);
      expect(result.estimated_time_remaining_ms).toBeUndefined();
    });

    it('should clamp quality scores to valid range', () => {
      const invalidQualitySession: SessionInput = {
        ...mockSessionInput,
        chunks: [
          {
            chunk_id: 'chunk-1',
            session_chunk_id: 'sc-1',
            title: 'Test Chunk',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:15:00.000Z',
                quality: 10, // Invalid: too high
                time_spent_ms: 900000,
                passed: true,
                question: 'Test question',
                response: 'Test response',
                feedback: 'Test feedback',
              },
            ],
            quality_scores: [10, -5], // Invalid scores
            time_spent_ms: 900000,
          },
        ],
      };

      const result = calculateSessionProgress(invalidQualitySession, NOW);
      expect(result.average_quality).toBeLessThanOrEqual(5);
      expect(result.average_quality).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getSessionStatus', () => {
    it('returns basic metrics for a session', () => {
      const result = getSessionStatus(mockSessionInput, DEFAULT_ALGORITHM_CONFIG, NOW);

      expect(result.chunksCompleted).toBe(1);
      expect(result.chunksRemaining).toBe(2);
      expect(result.overallProgress).toBe(0.33);
      expect(result.averageQuality).toBe(3.5);
      expect(result.timeElapsedMs).toBe(1800000);
      expect(result.shouldComplete).toBe(false);
      expect(result.recommendation).toBe('continue');
    });

    it('returns should_complete=true with recommendation=break when max time exceeded', () => {
      const longSession: SessionInput = {
        ...mockSessionInput,
        start_time: '2024-01-01T08:00:00.000Z', // 2.5 hours ago
        current_time: '2024-01-01T10:30:00.000Z',
      };

      const result = getSessionStatus(longSession, DEFAULT_ALGORITHM_CONFIG, NOW);
      expect(result.shouldComplete).toBe(true);
      expect(result.recommendation).toBe('break');
      expect(result.reason).toContain('Maximum session time');
    });

    it('returns should_complete=true with recommendation=complete when quality+chunk met', () => {
      const highQualitySession: SessionInput = {
        ...mockSessionInput,
        chunks: mockSessionInput.chunks.map(chunk => ({
          ...chunk,
          status: 'completed' as const,
          quality_scores: [5],
        })),
      };

      const result = getSessionStatus(highQualitySession, DEFAULT_ALGORITHM_CONFIG, NOW);
      expect(result.shouldComplete).toBe(true);
      expect(result.recommendation).toBe('complete');
      expect(result.reason).toContain('high quality');
    });

    it('returns should_complete=true with recommendation=complete when chunk threshold met alone', () => {
      // All chunks completed with low quality
      const session: SessionInput = {
        ...mockSessionInput,
        chunks: [
          {
            chunk_id: 'chunk-1',
            session_chunk_id: 'sc-1',
            title: 'Chunk 1',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:05:00.000Z',
                quality: 3,
                time_spent_ms: 300000,
                passed: true,
                question: 'Test question',
                response: 'Test response',
                feedback: 'Test feedback',
              },
            ],
            quality_scores: [3],
            time_spent_ms: 300000,
          },
          {
            chunk_id: 'chunk-2',
            session_chunk_id: 'sc-2',
            title: 'Chunk 2',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:10:00.000Z',
                quality: 3,
                time_spent_ms: 300000,
                passed: true,
                question: 'Test question',
                response: 'Test response',
                feedback: 'Test feedback',
              },
            ],
            quality_scores: [3],
            time_spent_ms: 300000,
          },
        ],
      };

      const result = getSessionStatus(session, DEFAULT_ALGORITHM_CONFIG, NOW);
      expect(result.shouldComplete).toBe(true);
      expect(result.recommendation).toBe('complete');
      expect(result.reason).toContain('objectives completed');
    });

    it('returns should_complete=true with recommendation=complete when quality+time met', () => {
      // High quality, long time, but chunks incomplete
      const session: SessionInput = {
        ...mockSessionInput,
        start_time: '2024-01-01T08:50:00.000Z', // 100 min ago
        current_time: '2024-01-01T10:30:00.000Z',
        chunks: [
          {
            chunk_id: 'chunk-1',
            session_chunk_id: 'sc-1',
            title: 'Chunk 1',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T09:00:00.000Z',
                quality: 5,
                time_spent_ms: 600000,
                passed: true,
                question: 'Test question',
                response: 'Test response',
                feedback: 'Test feedback',
              },
            ],
            quality_scores: [5],
            time_spent_ms: 600000,
          },
          {
            chunk_id: 'chunk-2',
            session_chunk_id: 'sc-2',
            title: 'Chunk 2',
            status: 'in_progress',
            attempts: [
              {
                timestamp: '2024-01-01T10:00:00.000Z',
                quality: 4,
                time_spent_ms: 300000,
                passed: false,
                question: 'Test question',
                response: 'Test response',
                feedback: 'Test feedback',
              },
            ],
            quality_scores: [4],
            time_spent_ms: 300000,
          },
          {
            chunk_id: 'chunk-3',
            session_chunk_id: 'sc-3',
            title: 'Chunk 3',
            status: 'pending',
            attempts: [],
            quality_scores: [],
            time_spent_ms: 0,
          },
          {
            chunk_id: 'chunk-4',
            session_chunk_id: 'sc-4',
            title: 'Chunk 4',
            status: 'pending',
            attempts: [],
            quality_scores: [],
            time_spent_ms: 0,
          },
        ],
      };

      const result = getSessionStatus(session, DEFAULT_ALGORITHM_CONFIG, NOW);
      expect(result.shouldComplete).toBe(true);
      expect(result.recommendation).toBe('complete');
      expect(result.reason).toContain('High quality');
    });

    it('returns should_complete=true with recommendation=break when the within-session fatigue advisory fires (NEU-848)', () => {
      // Replaces the old fixed `timeMet && overall_progress >= 0.5` heuristic
      // (removed by NEU-848) with the measured fatigue signal: latency
      // roughly doubles and quality drops by 2 points across the later half
      // of >= 6 attempts, which is enough for `computeFatigueTrend` to fire.
      const earlierAttempts: ChunkAttempt[] = [
        {
          timestamp: '2024-01-01T09:50:00.000Z',
          quality: 4,
          time_spent_ms: 10000,
          passed: true,
          question: 'Q1',
          response: 'A1',
          feedback: 'ok',
        },
        {
          timestamp: '2024-01-01T09:51:00.000Z',
          quality: 4,
          time_spent_ms: 10000,
          passed: true,
          question: 'Q2',
          response: 'A2',
          feedback: 'ok',
        },
        {
          timestamp: '2024-01-01T09:52:00.000Z',
          quality: 4,
          time_spent_ms: 10000,
          passed: true,
          question: 'Q3',
          response: 'A3',
          feedback: 'ok',
        },
      ];
      const laterAttempts: ChunkAttempt[] = [
        {
          timestamp: '2024-01-01T10:00:00.000Z',
          quality: 2,
          time_spent_ms: 20000,
          passed: false,
          question: 'Q4',
          response: 'A4',
          feedback: 'slipping',
        },
        {
          timestamp: '2024-01-01T10:01:00.000Z',
          quality: 2,
          time_spent_ms: 20000,
          passed: false,
          question: 'Q5',
          response: 'A5',
          feedback: 'slipping',
        },
        {
          timestamp: '2024-01-01T10:02:00.000Z',
          quality: 2,
          time_spent_ms: 20000,
          passed: false,
          question: 'Q6',
          response: 'A6',
          feedback: 'slipping',
        },
      ];

      const session: SessionInput = {
        ...mockSessionInput,
        start_time: '2024-01-01T09:45:00.000Z', // 45 min ago — under both time thresholds
        current_time: '2024-01-01T10:30:00.000Z',
        chunks: [
          {
            chunk_id: 'chunk-1',
            session_chunk_id: 'sc-1',
            title: 'Chunk 1',
            status: 'completed',
            attempts: earlierAttempts,
            quality_scores: [4, 4, 4],
            time_spent_ms: 30000,
          },
          {
            chunk_id: 'chunk-2',
            session_chunk_id: 'sc-2',
            title: 'Chunk 2',
            status: 'completed',
            attempts: laterAttempts,
            quality_scores: [2, 2, 2],
            time_spent_ms: 60000,
          },
          {
            chunk_id: 'chunk-3',
            session_chunk_id: 'sc-3',
            title: 'Chunk 3',
            status: 'pending',
            attempts: [],
            quality_scores: [],
            time_spent_ms: 0,
          },
        ],
      };

      // Independently derive the expected advisory straight from the
      // resolver over the same (non-duplicated) attempts, so the assertion
      // ties to structured resolver output rather than a hardcoded string.
      const expectedAdvisory = resolveSessionAdvisory({
        attempts: toFatigueAttempts([...earlierAttempts, ...laterAttempts]),
        elapsedMs: 45 * 60 * 1000,
        maxTimeMs: DEFAULT_ALGORITHM_CONFIG.sessionConfig.maxTimeMs,
      });
      expect(expectedAdvisory?.kind).toBe('fatigue');

      const result = getSessionStatus(session, DEFAULT_ALGORITHM_CONFIG, NOW);
      expect(result.shouldComplete).toBe(true);
      expect(result.recommendation).toBe('break');
      expect(result.reason).toBe(expectedAdvisory?.reason);
    });

    it('returns should_complete=false with recommendation=continue for early session', () => {
      const shortSession: SessionInput = {
        ...mockSessionInput,
        start_time: '2024-01-01T10:15:00.000Z', // 15 minutes ago
        current_time: '2024-01-01T10:30:00.000Z',
        chunks: mockSessionInput.chunks.map(chunk => ({
          ...chunk,
          status: 'pending' as const,
        })),
      };

      const result = getSessionStatus(shortSession, DEFAULT_ALGORITHM_CONFIG, NOW);
      expect(result.shouldComplete).toBe(false);
      expect(result.recommendation).toBe('continue');
      expect(result.reason).toContain('just beginning');
    });

    it('returns should_complete=false with recommendation=continue as default', () => {
      // Mid-progress, moderate quality, 60min — hits the default branch
      const midSession: SessionInput = {
        ...mockSessionInput,
        start_time: '2024-01-01T09:30:00.000Z', // 60 min ago
        current_time: '2024-01-01T10:30:00.000Z',
        chunks: [
          {
            chunk_id: 'chunk-1',
            session_chunk_id: 'sc-1',
            title: 'Chunk 1',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:00:00.000Z',
                quality: 3,
                time_spent_ms: 600000,
                passed: true,
                question: 'Test question',
                response: 'Test response',
                feedback: 'Test feedback',
              },
            ],
            quality_scores: [3],
            time_spent_ms: 600000,
          },
          {
            chunk_id: 'chunk-2',
            session_chunk_id: 'sc-2',
            title: 'Chunk 2',
            status: 'in_progress',
            attempts: [
              {
                timestamp: '2024-01-01T10:15:00.000Z',
                quality: 3,
                time_spent_ms: 300000,
                passed: false,
                question: 'Test question',
                response: 'Test response',
                feedback: 'Test feedback',
              },
            ],
            quality_scores: [3],
            time_spent_ms: 300000,
          },
          {
            chunk_id: 'chunk-3',
            session_chunk_id: 'sc-3',
            title: 'Chunk 3',
            status: 'pending',
            attempts: [],
            quality_scores: [],
            time_spent_ms: 0,
          },
        ],
      };

      const result = getSessionStatus(midSession, DEFAULT_ALGORITHM_CONFIG, NOW);
      expect(result.shouldComplete).toBe(false);
      expect(result.recommendation).toBe('continue');
      expect(result.reason).toContain('progressing normally');
    });

    it('handles edge cases gracefully', () => {
      const edgeCaseSession: SessionInput = {
        ...mockSessionInput,
        chunks: [],
      };

      expect(() => getSessionStatus(edgeCaseSession, DEFAULT_ALGORITHM_CONFIG, NOW)).not.toThrow();
    });
  });

  describe('validateSessionContext', () => {
    it('should validate correct session data', () => {
      const result = validateSessionContext(mockSessionInput, NOW);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(
          expect.objectContaining({
            session_id: 'test-session-123',
            mode: 'learning',
          })
        );
      }
    });

    it('should reject invalid session data', () => {
      const invalidSession = {
        session_id: '', // Invalid: empty string
        mode: 'invalid-mode', // Invalid mode
        start_time: 'not-a-date', // Invalid date format
        chunks: [],
      };

      const result = validateSessionContext(invalidSession, NOW);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Invalid session context');
      }
    });

    it('should reject sessions with empty chunks array', () => {
      const noChunksSession = {
        ...mockSessionInput,
        chunks: [],
      };

      const result = validateSessionContext(noChunksSession, NOW);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Session must contain at least one chunk');
      }
    });

    it('should reject sessions where current time is before start time', () => {
      const timeInconsistentSession = {
        ...mockSessionInput,
        start_time: '2024-01-01T10:30:00.000Z',
        current_time: '2024-01-01T10:00:00.000Z', // Before start time
      };

      const result = validateSessionContext(timeInconsistentSession, NOW);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Current time cannot be before start time');
      }
    });

    it('should set default current_time if not provided', () => {
      const sessionWithoutCurrentTime = {
        ...mockSessionInput,
        current_time: undefined,
      };

      const result = validateSessionContext(sessionWithoutCurrentTime, NOW);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.current_time).toBeDefined();
        expect(new Date(result.data.current_time!).getTime()).toBeGreaterThan(
          new Date(mockSessionInput.start_time).getTime()
        );
      }
    });

    it('should reject invalid chunk data during validation', () => {
      const sessionWithBadData = {
        ...mockSessionInput,
        chunks: [
          {
            chunk_id: 'chunk-1',
            session_chunk_id: 'sc-1',
            title: 'Test Chunk',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:15:00.000Z',
                quality: 10, // Invalid: too high
                time_spent_ms: -100, // Invalid: negative
                passed: true,
                question: 'Test question',
                response: 'Test response',
                feedback: 'Test feedback',
              },
            ],
            quality_scores: [-1, 6], // Invalid: outside range
            time_spent_ms: -500, // Invalid: negative
          },
        ],
      };

      const result = validateSessionContext(sessionWithBadData, NOW);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Invalid session context');
      }
    });

    it('should accept legacy attempts with completed instead of passed', () => {
      const legacySession = {
        ...mockSessionInput,
        chunks: [
          {
            chunk_id: 'chunk-1',
            session_chunk_id: 'sc-1',
            title: 'Legacy Chunk',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:15:00.000Z',
                completed: true,
                quality: 4,
                time_spent_ms: 900000,
              },
            ],
            quality_scores: [4],
            time_spent_ms: 900000,
          },
        ],
      };

      const result = validateSessionContext(legacySession, NOW);
      expect(result.success).toBe(true);
      if (result.success) {
        const attempt = result.data.chunks[0].attempts[0];
        expect(attempt.passed).toBe(true);
        expect(attempt.question).toBe('');
        expect(attempt.response).toBe('');
        expect(attempt.feedback).toBe('');
      }
    });

    it('should default missing fields on legacy attempts', () => {
      const legacySession = {
        ...mockSessionInput,
        chunks: [
          {
            chunk_id: 'chunk-1',
            session_chunk_id: 'sc-1',
            title: 'Legacy Chunk',
            status: 'pending',
            attempts: [
              {
                timestamp: '2024-01-01T10:15:00.000Z',
                time_spent_ms: 500,
              },
            ],
            quality_scores: [],
            time_spent_ms: 500,
          },
        ],
      };

      const result = validateSessionContext(legacySession, NOW);
      expect(result.success).toBe(true);
      if (result.success) {
        const attempt = result.data.chunks[0].attempts[0];
        expect(attempt.passed).toBe(false);
        expect(attempt.quality).toBe(0);
        expect(attempt.question).toBe('');
        expect(attempt.response).toBe('');
        expect(attempt.feedback).toBe('');
      }
    });

    it('should clean chunk data when using calculate functions directly', () => {
      const sessionWithValidData: SessionInput = {
        ...mockSessionInput,
        chunks: [
          {
            chunk_id: 'chunk-1',
            session_chunk_id: 'sc-1',
            title: 'Test Chunk',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:15:00.000Z',
                quality: 4,
                time_spent_ms: 900000,
                passed: true,
                question: 'Test question',
                response: 'Test response',
                feedback: 'Test feedback',
              },
            ],
            quality_scores: [4, 5],
            time_spent_ms: 900000,
          },
        ],
      };

      const result = calculateSessionProgress(sessionWithValidData, NOW);
      expect(result).toBeDefined();
      expect(result.average_quality).toBe(4.5);
    });
  });

  describe('helper function edge cases', () => {
    it('clamps NaN quality to 0 and handles negative time_spent_ms', () => {
      const session: SessionInput = {
        ...mockSessionInput,
        chunks: [
          {
            chunk_id: 'chunk-1',
            session_chunk_id: 'sc-1',
            title: 'Bad Data',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:00:00.000Z',
                quality: NaN,
                time_spent_ms: -100,
                passed: true,
                question: 'Test question',
                response: 'Test response',
                feedback: 'Test feedback',
              },
            ],
            quality_scores: [NaN],
            time_spent_ms: -500,
          },
        ],
      };

      const result = calculateSessionProgress(session, NOW);
      expect(result.average_quality).toBe(0);
      expect(result.time_elapsed_ms).toBeGreaterThanOrEqual(0);
    });

    it('clamps quality > 5 to 5 in session chunks', () => {
      const session: SessionInput = {
        ...mockSessionInput,
        chunks: [
          {
            chunk_id: 'chunk-1',
            session_chunk_id: 'sc-1',
            title: 'Over Max',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:00:00.000Z',
                quality: 10,
                time_spent_ms: 1000,
                passed: true,
                question: 'Test question',
                response: 'Test response',
                feedback: 'Test feedback',
              },
            ],
            quality_scores: [10],
            time_spent_ms: 1000,
          },
        ],
      };

      const result = calculateSessionProgress(session, NOW);
      expect(result.average_quality).toBe(5);
    });

    it('handles NaN quality in attempt', () => {
      const session: SessionInput = {
        ...mockSessionInput,
        chunks: [
          {
            chunk_id: 'chunk-1',
            session_chunk_id: 'sc-1',
            title: 'No Quality',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:00:00.000Z',
                quality: NaN,
                question: 'Test question',
                response: 'Test response',
                passed: true,
                feedback: 'Test feedback',
                time_spent_ms: 1000,
              },
            ],
            quality_scores: [3],
            time_spent_ms: 1000,
          },
        ],
      };

      const result = calculateSessionProgress(session, NOW);
      expect(result).toBeDefined();
    });

    it('returns failure for invalid start_time in validateSessionContext', () => {
      const session: SessionInput = {
        ...mockSessionInput,
        start_time: 'not-a-date',
        current_time: '2024-01-01T10:30:00.000Z',
      };

      const result = validateSessionContext(session, NOW);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Invalid session context');
      }
    });

    it('validates context without current_time by using fallback', () => {
      const session: SessionInput = {
        ...mockSessionInput,
        current_time: undefined as any,
      };
      const result = validateSessionContext(session, NOW);
      expect(result.success).toBe(true);
    });
  });

  describe('applyBatchSessionChunkOperations', () => {
    it('returns failure when operations exceed maxOps', async () => {
      const ops = Array.from({ length: 51 }, (_, i) => ({
        chunkId: `chunk-${i}`,
        status: 'completed' as const,
      }));

      const result = await applyBatchSessionChunkOperations({
        sessionId: 'session-1',
        operations: ops,
        maxOps: 50,
        activeSessionExists: true,
        persistFn: async () => ({ created: 0, updated: 0, unchanged: 0, affectedChunkIds: [] }),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Too many operations');
        expect(result.error.type).toBe('validation');
      }
    });

    it('returns failure when no active session exists', async () => {
      const result = await applyBatchSessionChunkOperations({
        sessionId: 'session-1',
        operations: [{ chunkId: 'chunk-1', status: 'completed' as const }],
        activeSessionExists: false,
        persistFn: async () => ({ created: 0, updated: 0, unchanged: 0, affectedChunkIds: [] }),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('No active session found');
        expect(result.error.type).toBe('not_found');
      }
    });

    it('returns database failure when persistFn throws', async () => {
      const result = await applyBatchSessionChunkOperations({
        sessionId: 'session-1',
        operations: [{ chunkId: 'chunk-1', status: 'completed' as const }],
        activeSessionExists: true,
        persistFn: async () => {
          throw new Error('Connection refused');
        },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Connection refused');
        expect(result.error.type).toBe('database');
      }
    });

    it('delegates to persistFn when validations pass', async () => {
      const result = await applyBatchSessionChunkOperations({
        sessionId: 'session-1',
        operations: [{ chunkId: 'chunk-1', status: 'completed' as const }],
        activeSessionExists: true,
        persistFn: async () => ({
          created: 1,
          updated: 0,
          unchanged: 0,
          affectedChunkIds: ['chunk-1'],
        }),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.created).toBe(1);
        expect(result.data.affectedChunkIds).toEqual(['chunk-1']);
      }
    });
  });

  describe('fatigue advisory rewiring (NEU-848)', () => {
    const baseTimes = {
      start_time: '2024-01-01T09:45:00.000Z', // 45 min before NOW — under both time thresholds
      current_time: '2024-01-01T10:30:00.000Z',
    };

    function makeAttempt(
      overrides: Partial<ChunkAttempt> &
        Pick<ChunkAttempt, 'timestamp' | 'time_spent_ms' | 'quality'>
    ): ChunkAttempt {
      return {
        question: 'Q',
        response: 'A',
        passed: true,
        feedback: 'ok',
        ...overrides,
      };
    }

    it("de-duplicates a multi-chunk question's attempts before computing the advisory", () => {
      // Below the fatigue module's minimum sample size (6) when counted once.
      const earlier: ChunkAttempt[] = [
        makeAttempt({ timestamp: '2024-01-01T09:50:00.000Z', time_spent_ms: 10000, quality: 4 }),
        makeAttempt({ timestamp: '2024-01-01T09:51:00.000Z', time_spent_ms: 10000, quality: 4 }),
      ];
      const later: ChunkAttempt[] = [
        makeAttempt({ timestamp: '2024-01-01T10:00:00.000Z', time_spent_ms: 20000, quality: 2 }),
        makeAttempt({ timestamp: '2024-01-01T10:01:00.000Z', time_spent_ms: 20000, quality: 2 }),
      ];

      const singleCounted: SessionInput = {
        session_id: 'dedup-session',
        mode: 'learning',
        ...baseTimes,
        chunks: [
          {
            chunk_id: 'c1',
            session_chunk_id: 'sc1',
            title: 'C1',
            status: 'completed',
            attempts: earlier,
            quality_scores: [4, 4],
            time_spent_ms: 20000,
          },
          {
            chunk_id: 'c2',
            session_chunk_id: 'sc2',
            title: 'C2',
            status: 'in_progress',
            attempts: later,
            quality_scores: [2, 2],
            time_spent_ms: 40000,
          },
          {
            chunk_id: 'c3',
            session_chunk_id: 'sc3',
            title: 'C3',
            status: 'pending',
            attempts: [],
            quality_scores: [],
            time_spent_ms: 0,
          },
        ],
      };

      // Simulates convertSessionToSessionInput (session-repository.ts:263-284)
      // attaching a multi-chunk question's attempts to every chunk it maps
      // to: the same 4 attempts appear under both c1 and c2, so a naive
      // flatten sees 8 raw entries — at or above the fatigue module's
      // minimum sample size — and would wrongly fire fatigue.
      const duplicated: SessionInput = {
        session_id: 'dedup-session',
        mode: 'learning',
        ...baseTimes,
        chunks: [
          {
            chunk_id: 'c1',
            session_chunk_id: 'sc1',
            title: 'C1',
            status: 'completed',
            attempts: [...earlier, ...later],
            quality_scores: [4, 4],
            time_spent_ms: 20000,
          },
          {
            chunk_id: 'c2',
            session_chunk_id: 'sc2',
            title: 'C2',
            status: 'in_progress',
            attempts: [...earlier, ...later],
            quality_scores: [2, 2],
            time_spent_ms: 40000,
          },
          {
            chunk_id: 'c3',
            session_chunk_id: 'sc3',
            title: 'C3',
            status: 'pending',
            attempts: [],
            quality_scores: [],
            time_spent_ms: 0,
          },
        ],
      };

      const singleResult = getSessionStatus(singleCounted, DEFAULT_ALGORITHM_CONFIG, NOW);
      const duplicatedResult = getSessionStatus(duplicated, DEFAULT_ALGORITHM_CONFIG, NOW);

      // Correctly de-duplicated, both fixtures resolve to the same 4 unique
      // attempts — below the minimum sample size, so the trend stays silent
      // and nothing overrides the default 'continue' recommendation.
      expect(duplicatedResult.recommendation).toBe('continue');
      expect(duplicatedResult).toEqual(singleResult);
    });

    it('treats an attempt with no quality as unscored rather than a zero', () => {
      // 6 attempts whose latency doubles while quality drops by 2 — enough
      // for the trend to fire when every attempt is scored.
      const scoredAttempts: ChunkAttempt[] = [
        makeAttempt({ timestamp: '2024-01-01T09:50:00.000Z', time_spent_ms: 10000, quality: 4 }),
        makeAttempt({ timestamp: '2024-01-01T09:51:00.000Z', time_spent_ms: 10000, quality: 4 }),
        makeAttempt({ timestamp: '2024-01-01T09:52:00.000Z', time_spent_ms: 10000, quality: 4 }),
        makeAttempt({ timestamp: '2024-01-01T10:00:00.000Z', time_spent_ms: 20000, quality: 2 }),
        makeAttempt({ timestamp: '2024-01-01T10:01:00.000Z', time_spent_ms: 20000, quality: 2 }),
        makeAttempt({ timestamp: '2024-01-01T10:02:00.000Z', time_spent_ms: 20000, quality: 2 }),
      ];

      // The same population with the final attempt's `quality` omitted — the
      // shape `convertSessionToSessionInput` produces for an unscored retry.
      const unscoredRetry: ChunkAttempt = {
        timestamp: '2024-01-01T10:02:00.000Z',
        time_spent_ms: 20000,
        question: 'Q',
        response: 'A',
        passed: true,
        feedback: 'ok',
      };
      const withUnscoredAttempt: ChunkAttempt[] = [...scoredAttempts.slice(0, 5), unscoredRetry];

      function sessionWith(attempts: ChunkAttempt[]): SessionInput {
        return {
          session_id: 'unscored-attempt-session',
          mode: 'learning',
          ...baseTimes,
          chunks: [
            {
              chunk_id: 'c1',
              session_chunk_id: 'sc1',
              title: 'C1',
              status: 'completed',
              attempts,
              quality_scores: [4, 4, 4, 2, 2, 2],
              time_spent_ms: 90000,
            },
            {
              chunk_id: 'c2',
              session_chunk_id: 'sc2',
              title: 'C2',
              status: 'pending',
              attempts: [],
              quality_scores: [],
              time_spent_ms: 0,
            },
          ],
        };
      }

      const scoredResult = getSessionStatus(
        sessionWith(scoredAttempts),
        DEFAULT_ALGORITHM_CONFIG,
        NOW
      );
      const unscoredResult = getSessionStatus(
        sessionWith(withUnscoredAttempt),
        DEFAULT_ALGORITHM_CONFIG,
        NOW
      );

      // Fully scored, the trend fires.
      expect(scoredResult.recommendation).toBe('break');

      // With one attempt unscored it is dropped from the sample (not counted
      // as a quality-0 attempt, which would deepen the apparent decline and
      // still fire), leaving 5 — below the minimum sample size.
      expect(unscoredResult.recommendation).toBe('continue');
      expect(unscoredResult.shouldComplete).toBe(false);
    });

    it('still recommends break past maxTimeMs even when the fatigue trend is silent', () => {
      const session: SessionInput = {
        session_id: 'past-ceiling-silent-fatigue',
        mode: 'learning',
        start_time: '2024-01-01T08:00:00.000Z', // 2.5 hours ago — past the 2h maxTimeMs ceiling
        current_time: '2024-01-01T10:30:00.000Z',
        chunks: [
          {
            chunk_id: 'chunk-1',
            session_chunk_id: 'sc-1',
            title: 'Chunk 1',
            status: 'in_progress',
            attempts: [
              makeAttempt({
                timestamp: '2024-01-01T08:10:00.000Z',
                time_spent_ms: 300000,
                quality: 3,
              }),
            ],
            quality_scores: [3],
            time_spent_ms: 300000,
          },
        ],
      };

      // Only one attempt — far below the fatigue module's minimum sample
      // size, so the trend is silent; the ceiling branch must still fire.
      const result = getSessionStatus(session, DEFAULT_ALGORITHM_CONFIG, NOW);
      expect(result.shouldComplete).toBe(true);
      expect(result.recommendation).toBe('break');
      expect(result.reason).toContain('Maximum session time');
    });

    it('never leaves the learner silent: no fired advisory yields continue, not break or complete', () => {
      const session: SessionInput = {
        session_id: 'no-signal',
        mode: 'learning',
        start_time: '2024-01-01T09:30:00.000Z', // 60 min ago — under every threshold
        current_time: '2024-01-01T10:30:00.000Z',
        chunks: [
          {
            chunk_id: 'chunk-1',
            session_chunk_id: 'sc-1',
            title: 'Chunk 1',
            status: 'completed',
            attempts: [
              makeAttempt({
                timestamp: '2024-01-01T09:45:00.000Z',
                time_spent_ms: 300000,
                quality: 3,
              }),
            ],
            quality_scores: [3],
            time_spent_ms: 300000,
          },
          {
            chunk_id: 'chunk-2',
            session_chunk_id: 'sc-2',
            title: 'Chunk 2',
            status: 'pending',
            attempts: [],
            quality_scores: [],
            time_spent_ms: 0,
          },
        ],
      };

      const progress = calculateSessionProgress(session, NOW);
      const expectedAdvisory = resolveSessionAdvisory({
        attempts: flattenChunkAttempts(session.chunks),
        elapsedMs: progress.time_elapsed_ms,
        maxTimeMs: DEFAULT_ALGORITHM_CONFIG.sessionConfig.maxTimeMs,
      });
      expect(expectedAdvisory).toBeNull();

      const result = getSessionStatus(session, DEFAULT_ALGORITHM_CONFIG, NOW);
      expect(result.recommendation).toBe('continue');
    });

    describe('agreement invariant with the shared resolver', () => {
      // For every fixture below: an advisory firing must never leave the
      // learner on 'continue', and a 'break' recommendation must never occur
      // without a fired advisory. Both directions hold because
      // `evaluateCompletionCriteria`'s `maxTimeExceeded` threshold and the
      // resolver's time-ceiling check are the exact same comparison
      // (`progress.time_elapsed_ms >= config.maxTimeMs`), and the fatigue
      // branch is keyed directly off the resolver's advisory kind.
      function checkAgreement(session: SessionInput): {
        advisoryPresent: boolean;
        recommendation: 'continue' | 'complete' | 'break';
      } {
        const config = DEFAULT_ALGORITHM_CONFIG;
        const progress = calculateSessionProgress(session, NOW);
        const advisory = resolveSessionAdvisory({
          attempts: flattenChunkAttempts(session.chunks),
          elapsedMs: progress.time_elapsed_ms,
          maxTimeMs: config.sessionConfig.maxTimeMs,
        });
        const result = getSessionStatus(session, config, NOW);

        if (advisory !== null) {
          expect(result.recommendation).not.toBe('continue');
        }
        if (result.recommendation === 'break') {
          expect(advisory).not.toBeNull();
        }

        return { advisoryPresent: advisory !== null, recommendation: result.recommendation };
      }

      it('holds for a silent, mid-progress session (continue)', () => {
        const session: SessionInput = {
          session_id: 'invariant-continue',
          mode: 'learning',
          start_time: '2024-01-01T09:30:00.000Z', // 60 min ago
          current_time: '2024-01-01T10:30:00.000Z',
          chunks: [
            {
              chunk_id: 'chunk-1',
              session_chunk_id: 'sc-1',
              title: 'Chunk 1',
              status: 'completed',
              attempts: [
                makeAttempt({
                  timestamp: '2024-01-01T10:00:00.000Z',
                  time_spent_ms: 600000,
                  quality: 3,
                }),
              ],
              quality_scores: [3],
              time_spent_ms: 600000,
            },
            {
              chunk_id: 'chunk-2',
              session_chunk_id: 'sc-2',
              title: 'Chunk 2',
              status: 'pending',
              attempts: [],
              quality_scores: [],
              time_spent_ms: 0,
            },
          ],
        };

        const { advisoryPresent, recommendation } = checkAgreement(session);
        expect(advisoryPresent).toBe(false);
        expect(recommendation).toBe('continue');
      });

      it('holds for a fatigued session (break via advisory)', () => {
        const earlier = [0, 1, 2].map(i =>
          makeAttempt({
            timestamp: `2024-01-01T09:5${i}:00.000Z`,
            time_spent_ms: 10000,
            quality: 4,
          })
        );
        const later = [0, 1, 2].map(i =>
          makeAttempt({
            timestamp: `2024-01-01T10:0${i}:00.000Z`,
            time_spent_ms: 20000,
            quality: 2,
          })
        );
        const session: SessionInput = {
          session_id: 'invariant-fatigue',
          mode: 'learning',
          ...baseTimes,
          chunks: [
            {
              chunk_id: 'chunk-1',
              session_chunk_id: 'sc-1',
              title: 'Chunk 1',
              status: 'completed',
              attempts: earlier,
              quality_scores: [4, 4, 4],
              time_spent_ms: 30000,
            },
            {
              chunk_id: 'chunk-2',
              session_chunk_id: 'sc-2',
              title: 'Chunk 2',
              status: 'in_progress',
              attempts: later,
              quality_scores: [2, 2, 2],
              time_spent_ms: 60000,
            },
            {
              chunk_id: 'chunk-3',
              session_chunk_id: 'sc-3',
              title: 'Chunk 3',
              status: 'pending',
              attempts: [],
              quality_scores: [],
              time_spent_ms: 0,
            },
          ],
        };

        const { advisoryPresent, recommendation } = checkAgreement(session);
        expect(advisoryPresent).toBe(true);
        expect(recommendation).toBe('break');
      });

      it('holds for a session past the max-time ceiling (break via maxTimeExceeded)', () => {
        const session: SessionInput = {
          session_id: 'invariant-ceiling',
          mode: 'learning',
          start_time: '2024-01-01T08:00:00.000Z', // 2.5 hours ago
          current_time: '2024-01-01T10:30:00.000Z',
          chunks: [
            {
              chunk_id: 'chunk-1',
              session_chunk_id: 'sc-1',
              title: 'Chunk 1',
              status: 'in_progress',
              attempts: [
                makeAttempt({
                  timestamp: '2024-01-01T08:10:00.000Z',
                  time_spent_ms: 300000,
                  quality: 3,
                }),
              ],
              quality_scores: [3],
              time_spent_ms: 300000,
            },
          ],
        };

        const { advisoryPresent, recommendation } = checkAgreement(session);
        expect(advisoryPresent).toBe(true);
        expect(recommendation).toBe('break');
      });

      it('holds for a high-quality, fully-completed session (complete, advisory irrelevant)', () => {
        const session: SessionInput = {
          session_id: 'invariant-complete',
          mode: 'learning',
          start_time: '2024-01-01T10:15:00.000Z', // 15 min ago
          current_time: '2024-01-01T10:30:00.000Z',
          chunks: [
            {
              chunk_id: 'chunk-1',
              session_chunk_id: 'sc-1',
              title: 'Chunk 1',
              status: 'completed',
              attempts: [
                makeAttempt({
                  timestamp: '2024-01-01T10:20:00.000Z',
                  time_spent_ms: 300000,
                  quality: 5,
                }),
              ],
              quality_scores: [5],
              time_spent_ms: 300000,
            },
          ],
        };

        const { recommendation } = checkAgreement(session);
        expect(recommendation).toBe('complete');
      });

      it('holds for an early, just-beginning session (continue)', () => {
        const session: SessionInput = {
          session_id: 'invariant-early',
          mode: 'learning',
          start_time: '2024-01-01T10:15:00.000Z', // 15 min ago
          current_time: '2024-01-01T10:30:00.000Z',
          chunks: [
            {
              chunk_id: 'chunk-1',
              session_chunk_id: 'sc-1',
              title: 'Chunk 1',
              status: 'pending',
              attempts: [],
              quality_scores: [],
              time_spent_ms: 0,
            },
          ],
        };

        const { advisoryPresent, recommendation } = checkAgreement(session);
        expect(advisoryPresent).toBe(false);
        expect(recommendation).toBe('continue');
      });
    });
  });
});
