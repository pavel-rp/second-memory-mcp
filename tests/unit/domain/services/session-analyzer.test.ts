import { describe, it, expect } from 'vitest';
import {
  calculateSessionProgress,
  getSessionStatus,
  validateSessionContext,
  applyBatchSessionChunkOperations,
} from '../../../../src/domain/services/session-analyzer.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../../src/domain/config/algorithm-defaults.js';
import type { SessionInput } from '../../../../src/domain/types/session.js';

const NOW = new Date('2024-01-01T10:30:00.000Z');

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

      expect(result.chunks_completed).toBe(1);
      expect(result.chunks_remaining).toBe(2);
      expect(result.overall_progress).toBe(0.33);
      expect(result.average_quality).toBe(3.5);
      expect(result.time_elapsed_ms).toBe(1800000);
      expect(result.should_complete).toBe(false);
      expect(result.recommendation).toBe('continue');
    });

    it('returns should_complete=true with recommendation=break when max time exceeded', () => {
      const longSession: SessionInput = {
        ...mockSessionInput,
        start_time: '2024-01-01T08:00:00.000Z', // 2.5 hours ago
        current_time: '2024-01-01T10:30:00.000Z',
      };

      const result = getSessionStatus(longSession, DEFAULT_ALGORITHM_CONFIG, NOW);
      expect(result.should_complete).toBe(true);
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
      expect(result.should_complete).toBe(true);
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
      expect(result.should_complete).toBe(true);
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
      expect(result.should_complete).toBe(true);
      expect(result.recommendation).toBe('complete');
      expect(result.reason).toContain('High quality');
    });

    it('returns should_complete=true with recommendation=break when time+50% progress', () => {
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
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:00:00.000Z',
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

      const result = getSessionStatus(session, DEFAULT_ALGORITHM_CONFIG, NOW);
      expect(result.should_complete).toBe(true);
      expect(result.recommendation).toBe('break');
      expect(result.reason).toContain('Good progress');
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
      expect(result.should_complete).toBe(false);
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
      expect(result.should_complete).toBe(false);
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
});
