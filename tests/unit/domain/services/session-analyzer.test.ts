import { describe, it, expect } from 'vitest';
import {
  calculateSessionProgress,
  determineNextPhase,
  checkSessionCompletion,
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
        title: 'Introduction to Programming',
        status: 'completed',
        attempts: [
          {
            timestamp: '2024-01-01T10:15:00.000Z',
            quality: 4,
            time_spent_ms: 900000, // 15 minutes
            completed: true,
          },
        ],
        quality_scores: [4],
        time_spent_ms: 900000,
      },
      {
        chunk_id: 'chunk-2',
        title: 'Variables and Data Types',
        status: 'in_progress',
        attempts: [
          {
            timestamp: '2024-01-01T10:25:00.000Z',
            quality: 3,
            time_spent_ms: 300000, // 5 minutes
            completed: false,
          },
        ],
        quality_scores: [3],
        time_spent_ms: 300000,
      },
      {
        chunk_id: 'chunk-3',
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
            title: 'Test Chunk',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:15:00.000Z',
                quality: 10, // Invalid: too high
                time_spent_ms: 900000,
                completed: true,
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

  describe('determineNextPhase', () => {
    it('should determine scaffolding phases correctly', () => {
      const scaffoldingSession: SessionInput = {
        ...mockSessionInput,
        mode: 'scaffolding',
      };

      const result = determineNextPhase(scaffoldingSession, NOW);
      expect(result.current_phase).toBe('chunk_planning');
      expect(result.next_phase).toBe('chunk_validation');
      expect(result.guidance).toContain('chunk');
      expect(result.can_advance).toBe(true);
    });

    it('should determine learning phases correctly', () => {
      const result = determineNextPhase(mockSessionInput, NOW); // mode: "learning"
      expect(result.current_phase).toBe('content_presentation');
      expect(result.next_phase).toBe('comprehension_check');
      expect(result.guidance).toContain('learning');
    });

    it('should determine retrieval phases correctly', () => {
      const retrievalSession: SessionInput = {
        ...mockSessionInput,
        mode: 'retrieval',
      };

      const result = determineNextPhase(retrievalSession, NOW);
      expect(result.current_phase).toBe('first_attempt');
      expect(result.next_phase).toBe('second_attempt');
      expect(result.can_advance).toBe(true);
    });

    it('should determine review phases correctly', () => {
      const reviewSession: SessionInput = {
        ...mockSessionInput,
        mode: 'review',
      };

      const result = determineNextPhase(reviewSession, NOW);
      expect(result.current_phase).toBe('spaced_review');
      expect(result.next_phase).toBe('consolidation');
    });

    it('should clamp phase progress between 0 and 1', () => {
      const result = determineNextPhase(mockSessionInput, NOW);
      expect(result.phase_progress).toBeGreaterThanOrEqual(0);
      expect(result.phase_progress).toBeLessThanOrEqual(1);
    });
  });

  describe('checkSessionCompletion', () => {
    it('should recommend completion for high quality and progress', () => {
      const highQualitySession: SessionInput = {
        ...mockSessionInput,
        chunks: mockSessionInput.chunks.map(chunk => ({
          ...chunk,
          status: 'completed' as const,
          quality_scores: [5],
        })),
      };

      const result = checkSessionCompletion(highQualitySession, DEFAULT_ALGORITHM_CONFIG, NOW);
      expect(result.is_complete).toBe(true);
      expect(result.quality_threshold_met).toBe(true);
      expect(result.chunk_threshold_met).toBe(true);
      expect(result.recommendation).toBe('complete');
    });

    it('should recommend break for long sessions', () => {
      const longSession: SessionInput = {
        ...mockSessionInput,
        start_time: '2024-01-01T08:00:00.000Z', // 2.5 hours ago
        current_time: '2024-01-01T10:30:00.000Z',
      };

      const result = checkSessionCompletion(longSession, DEFAULT_ALGORITHM_CONFIG, NOW);
      expect(result.is_complete).toBe(true);
      expect(result.recommendation).toBe('break');
      expect(result.completion_reason).toContain('Maximum session time');
    });

    it('should recommend continue for short sessions', () => {
      const shortSession: SessionInput = {
        ...mockSessionInput,
        start_time: '2024-01-01T10:15:00.000Z', // 15 minutes ago
        current_time: '2024-01-01T10:30:00.000Z',
        chunks: mockSessionInput.chunks.map(chunk => ({
          ...chunk,
          status: 'pending' as const,
        })),
      };

      const result = checkSessionCompletion(shortSession, DEFAULT_ALGORITHM_CONFIG, NOW);
      expect(result.is_complete).toBe(false);
      expect(result.recommendation).toBe('continue');
    });

    it('should handle edge cases gracefully', () => {
      const edgeCaseSession: SessionInput = {
        ...mockSessionInput,
        chunks: [],
      };

      // Should not throw an error even with invalid data
      expect(() =>
        checkSessionCompletion(edgeCaseSession, DEFAULT_ALGORITHM_CONFIG, NOW)
      ).not.toThrow();
    });
  });

  describe('validateSessionContext', () => {
    it('should validate correct session data', () => {
      const result = validateSessionContext(mockSessionInput, NOW);
      expect(result).toEqual(
        expect.objectContaining({
          session_id: 'test-session-123',
          mode: 'learning',
        })
      );
    });

    it('should reject invalid session data', () => {
      const invalidSession = {
        session_id: '', // Invalid: empty string
        mode: 'invalid-mode', // Invalid mode
        start_time: 'not-a-date', // Invalid date format
        chunks: [],
      };

      expect(() => validateSessionContext(invalidSession, NOW)).toThrow('Invalid session context');
    });

    it('should reject sessions with empty chunks array', () => {
      const noChunksSession = {
        ...mockSessionInput,
        chunks: [],
      };

      expect(() => validateSessionContext(noChunksSession, NOW)).toThrow(
        'Session must contain at least one chunk'
      );
    });

    it('should reject sessions where current time is before start time', () => {
      const timeInconsistentSession = {
        ...mockSessionInput,
        start_time: '2024-01-01T10:30:00.000Z',
        current_time: '2024-01-01T10:00:00.000Z', // Before start time
      };

      expect(() => validateSessionContext(timeInconsistentSession, NOW)).toThrow(
        'Current time cannot be before start time'
      );
    });

    it('should set default current_time if not provided', () => {
      const sessionWithoutCurrentTime = {
        ...mockSessionInput,
        current_time: undefined,
      };

      const result = validateSessionContext(sessionWithoutCurrentTime, NOW);
      expect(result.current_time).toBeDefined();
      expect(new Date(result.current_time!).getTime()).toBeGreaterThan(
        new Date(mockSessionInput.start_time).getTime()
      );
    });

    it('should reject invalid chunk data during validation', () => {
      const sessionWithBadData = {
        ...mockSessionInput,
        chunks: [
          {
            chunk_id: 'chunk-1',
            title: 'Test Chunk',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:15:00.000Z',
                quality: 10, // Invalid: too high
                time_spent_ms: -100, // Invalid: negative
                completed: true,
              },
            ],
            quality_scores: [-1, 6], // Invalid: outside range
            time_spent_ms: -500, // Invalid: negative
          },
        ],
      };

      expect(() => validateSessionContext(sessionWithBadData, NOW)).toThrow(
        'Invalid session context'
      );
    });

    it('should clean chunk data when using calculate functions directly', () => {
      // Test that the cleaning happens in the calculation functions
      const sessionWithValidData: SessionInput = {
        ...mockSessionInput,
        chunks: [
          {
            chunk_id: 'chunk-1',
            title: 'Test Chunk',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:15:00.000Z',
                quality: 4,
                time_spent_ms: 900000,
                completed: true,
              },
            ],
            quality_scores: [4, 5],
            time_spent_ms: 900000,
          },
        ],
      };

      // This should work without errors
      const result = calculateSessionProgress(sessionWithValidData, NOW);
      expect(result).toBeDefined();
      expect(result.average_quality).toBe(4.5);
    });
  });

  describe('determineNextPhase — mode-specific zero-progress branches', () => {
    const zeroProgressSession: SessionInput = {
      ...mockSessionInput,
      chunks: mockSessionInput.chunks.map(chunk => ({
        ...chunk,
        status: 'pending' as const,
        attempts: [],
        quality_scores: [],
        time_spent_ms: 0,
      })),
    };

    it('returns prerequisite_check for learning mode with 0 completed', () => {
      const result = determineNextPhase({ ...zeroProgressSession, mode: 'learning' }, NOW);
      expect(result.current_phase).toBe('prerequisite_check');
      expect(result.next_phase).toBe('content_presentation');
      expect(result.can_advance).toBe(false);
    });

    it('returns problem_analysis for scaffolding mode with 0 completed', () => {
      const result = determineNextPhase({ ...zeroProgressSession, mode: 'scaffolding' }, NOW);
      expect(result.current_phase).toBe('problem_analysis');
      expect(result.next_phase).toBe('chunk_planning');
      expect(result.can_advance).toBe(false);
    });

    it('returns retrieval_setup for retrieval mode with 0 completed', () => {
      const result = determineNextPhase({ ...zeroProgressSession, mode: 'retrieval' }, NOW);
      expect(result.current_phase).toBe('retrieval_setup');
      expect(result.next_phase).toBe('first_attempt');
      expect(result.can_advance).toBe(false);
    });

    it('returns review_preparation for review mode with 0 completed', () => {
      const result = determineNextPhase({ ...zeroProgressSession, mode: 'review' }, NOW);
      expect(result.current_phase).toBe('review_preparation');
      expect(result.next_phase).toBe('spaced_review');
      expect(result.can_advance).toBe(false);
    });

    it('returns unknown phase for unrecognized mode', () => {
      const result = determineNextPhase(
        { ...zeroProgressSession, mode: 'unknown_mode' as SessionInput['mode'] },
        NOW
      );
      expect(result.current_phase).toBe('unknown');
      expect(result.guidance).toContain('analysis in progress');
      expect(result.can_advance).toBe(false);
    });
  });

  describe('determineNextPhase — high-progress branches', () => {
    it('returns comprehension_check for learning mode at high progress', () => {
      const highProgressSession: SessionInput = {
        ...mockSessionInput,
        mode: 'learning',
        chunks: mockSessionInput.chunks.map(chunk => ({
          ...chunk,
          status: 'completed' as const,
          quality_scores: [5],
        })),
      };
      const result = determineNextPhase(highProgressSession, NOW);
      expect(result.current_phase).toBe('comprehension_check');
    });

    it('returns chunk_validation for scaffolding mode at high progress', () => {
      const highProgressSession: SessionInput = {
        ...mockSessionInput,
        mode: 'scaffolding',
        chunks: mockSessionInput.chunks.map(chunk => ({
          ...chunk,
          status: 'completed' as const,
          quality_scores: [5],
        })),
      };
      const result = determineNextPhase(highProgressSession, NOW);
      expect(result.current_phase).toBe('chunk_validation');
    });

    it('returns second_attempt for retrieval mode at high progress', () => {
      const highProgressSession: SessionInput = {
        ...mockSessionInput,
        mode: 'retrieval',
        chunks: mockSessionInput.chunks.map(chunk => ({
          ...chunk,
          status: 'completed' as const,
          quality_scores: [5],
        })),
      };
      const result = determineNextPhase(highProgressSession, NOW);
      expect(result.current_phase).toBe('second_attempt');
    });

    it('returns consolidation for review mode at high progress', () => {
      const highProgressSession: SessionInput = {
        ...mockSessionInput,
        mode: 'review',
        chunks: mockSessionInput.chunks.map(chunk => ({
          ...chunk,
          status: 'completed' as const,
          quality_scores: [5],
        })),
      };
      const result = determineNextPhase(highProgressSession, NOW);
      expect(result.current_phase).toBe('consolidation');
    });
  });

  describe('checkSessionCompletion — completes when only chunk threshold is met', () => {
    it('completes when chunk threshold met but quality below threshold', () => {
      // chunkMet=true, qualityMet=false, timeMet=false
      // Need overall_progress >= 0.8 (completionThreshold) with low quality
      const session: SessionInput = {
        ...mockSessionInput,
        mode: 'learning',
        start_time: '2024-01-01T10:00:00.000Z',
        current_time: '2024-01-01T10:30:00.000Z',
        chunks: [
          {
            chunk_id: 'chunk-1',
            title: 'Chunk 1',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:05:00.000Z',
                quality: 3,
                time_spent_ms: 300000,
                completed: true,
              },
            ],
            quality_scores: [3],
            time_spent_ms: 300000,
          },
          {
            chunk_id: 'chunk-2',
            title: 'Chunk 2',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:10:00.000Z',
                quality: 3,
                time_spent_ms: 300000,
                completed: true,
              },
            ],
            quality_scores: [3],
            time_spent_ms: 300000,
          },
        ],
      };

      const result = checkSessionCompletion(session, DEFAULT_ALGORITHM_CONFIG, NOW);
      // All chunks completed → overall_progress = 1.0 >= 0.8 → chunkMet
      // Quality 3 < 4.0 → qualityMet=false
      // 30 min < 90 min → timeMet=false
      expect(result.is_complete).toBe(true);
      expect(result.chunk_threshold_met).toBe(true);
      expect(result.quality_threshold_met).toBe(false);
      expect(result.recommendation).toBe('complete');
      expect(result.completion_reason).toContain('objectives completed');
    });
  });

  describe('checkSessionCompletion — quality and time thresholds met with incomplete chunks', () => {
    it('completes when quality and time thresholds met but chunks incomplete', () => {
      // qualityMet=true, timeMet=true, chunkMet=false, maxTime not exceeded
      // Quality >= 4.0, 90min <= time < 120min, progress < 0.8
      const session: SessionInput = {
        ...mockSessionInput,
        mode: 'learning',
        start_time: '2024-01-01T08:50:00.000Z', // 100 min ago (< 120 max)
        current_time: '2024-01-01T10:30:00.000Z',
        chunks: [
          {
            chunk_id: 'chunk-1',
            title: 'Chunk 1',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T09:00:00.000Z',
                quality: 5,
                time_spent_ms: 600000,
                completed: true,
              },
            ],
            quality_scores: [5],
            time_spent_ms: 600000,
          },
          {
            chunk_id: 'chunk-2',
            title: 'Chunk 2',
            status: 'in_progress',
            attempts: [
              {
                timestamp: '2024-01-01T10:00:00.000Z',
                quality: 4,
                time_spent_ms: 300000,
                completed: false,
              },
            ],
            quality_scores: [4],
            time_spent_ms: 300000,
          },
          {
            chunk_id: 'chunk-3',
            title: 'Chunk 3',
            status: 'pending',
            attempts: [],
            quality_scores: [],
            time_spent_ms: 0,
          },
          {
            chunk_id: 'chunk-4',
            title: 'Chunk 4',
            status: 'pending',
            attempts: [],
            quality_scores: [],
            time_spent_ms: 0,
          },
        ],
      };

      const result = checkSessionCompletion(session, DEFAULT_ALGORITHM_CONFIG, NOW);
      // avg quality = (5+4)/2 = 4.5 >= 4.0 → qualityMet
      // time = 100 min >= 90 min → timeMet, < 120 → not maxTimeExceeded
      // progress = 1/4 = 0.25 < 0.8 → chunkMet=false
      expect(result.is_complete).toBe(true);
      expect(result.quality_threshold_met).toBe(true);
      expect(result.time_threshold_met).toBe(true);
      expect(result.chunk_threshold_met).toBe(false);
      expect(result.recommendation).toBe('complete');
      expect(result.completion_reason).toContain('High quality');
    });
  });

  describe('checkSessionCompletion — time threshold met with 50%+ progress recommends break', () => {
    it('recommends break when time threshold met with 50%+ progress', () => {
      // timeMet=true, progress >= 0.5, qualityMet=false, chunkMet=false
      // 90min <= time < 120min, quality < 4.0, 0.5 <= progress < 0.8
      const session: SessionInput = {
        ...mockSessionInput,
        mode: 'learning',
        start_time: '2024-01-01T08:50:00.000Z', // 100 min ago
        current_time: '2024-01-01T10:30:00.000Z',
        chunks: [
          {
            chunk_id: 'chunk-1',
            title: 'Chunk 1',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T09:00:00.000Z',
                quality: 3,
                time_spent_ms: 600000,
                completed: true,
              },
            ],
            quality_scores: [3],
            time_spent_ms: 600000,
          },
          {
            chunk_id: 'chunk-2',
            title: 'Chunk 2',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:00:00.000Z',
                quality: 3,
                time_spent_ms: 300000,
                completed: true,
              },
            ],
            quality_scores: [3],
            time_spent_ms: 300000,
          },
          {
            chunk_id: 'chunk-3',
            title: 'Chunk 3',
            status: 'pending',
            attempts: [],
            quality_scores: [],
            time_spent_ms: 0,
          },
        ],
      };

      const result = checkSessionCompletion(session, DEFAULT_ALGORITHM_CONFIG, NOW);
      // quality = 3 < 4 → qualityMet=false
      // time = 100 min >= 90 min → timeMet=true, < 120 → not maxTime
      // progress = 2/3 = 0.67 >= 0.5 but < 0.8 → chunkMet=false
      expect(result.is_complete).toBe(true);
      expect(result.recommendation).toBe('break');
      expect(result.completion_reason).toContain('Good progress');
    });
  });

  describe('checkSessionCompletion — default evaluateCompletionCriteria branch', () => {
    it('returns continue for mid-progress session with moderate quality and time', () => {
      // Craft a session that misses ALL specific completion criteria:
      // - Not max time exceeded
      // - Not quality+chunk met
      // - Not chunk met alone
      // - Not quality+time met
      // - Not time+50% progress
      // - Not <30% progress and <30min (the "just beginning" branch)
      // - Not !can_advance && quality < 3
      // Falls through to the default "progressing normally" return
      const midSession: SessionInput = {
        ...mockSessionInput,
        mode: 'learning',
        start_time: '2024-01-01T09:30:00.000Z', // 60 min ago (past the 30min check)
        current_time: '2024-01-01T10:30:00.000Z',
        chunks: [
          {
            chunk_id: 'chunk-1',
            title: 'Chunk 1',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:00:00.000Z',
                quality: 3,
                time_spent_ms: 600000,
                completed: true,
              },
            ],
            quality_scores: [3],
            time_spent_ms: 600000,
          },
          {
            chunk_id: 'chunk-2',
            title: 'Chunk 2',
            status: 'in_progress',
            attempts: [
              {
                timestamp: '2024-01-01T10:15:00.000Z',
                quality: 3,
                time_spent_ms: 300000,
                completed: false,
              },
            ],
            quality_scores: [3],
            time_spent_ms: 300000,
          },
          {
            chunk_id: 'chunk-3',
            title: 'Chunk 3',
            status: 'pending',
            attempts: [],
            quality_scores: [],
            time_spent_ms: 0,
          },
        ],
      };

      const result = checkSessionCompletion(midSession, DEFAULT_ALGORITHM_CONFIG, NOW);
      expect(result.is_complete).toBe(false);
      expect(result.recommendation).toBe('continue');
      expect(result.completion_reason).toContain('progressing normally');
    });
  });

  describe('helper function edge cases', () => {
    it('clamps NaN quality to 0 and handles negative time_spent_ms', () => {
      const session: SessionInput = {
        ...mockSessionInput,
        chunks: [
          {
            chunk_id: 'chunk-1',
            title: 'Bad Data',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:00:00.000Z',
                quality: NaN,
                time_spent_ms: -100,
                completed: true,
              },
            ],
            quality_scores: [NaN],
            time_spent_ms: -500,
          },
        ],
      };

      const result = calculateSessionProgress(session, NOW);
      expect(result.average_quality).toBe(0);
      // Negative chunk time clamped to 0
      expect(result.time_elapsed_ms).toBeGreaterThanOrEqual(0);
    });

    it('clamps quality > 5 to 5 in session chunks', () => {
      const session: SessionInput = {
        ...mockSessionInput,
        chunks: [
          {
            chunk_id: 'chunk-1',
            title: 'Over Max',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:00:00.000Z',
                quality: 10,
                time_spent_ms: 1000,
                completed: true,
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

    it('handles undefined quality in attempt', () => {
      const session: SessionInput = {
        ...mockSessionInput,
        chunks: [
          {
            chunk_id: 'chunk-1',
            title: 'No Quality',
            status: 'completed',
            attempts: [
              {
                timestamp: '2024-01-01T10:00:00.000Z',
                quality: undefined as any,
                time_spent_ms: 1000,
                completed: true,
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

    it('throws validation error for invalid start_time in validateSessionContext', () => {
      const session: SessionInput = {
        ...mockSessionInput,
        start_time: 'not-a-date',
        current_time: '2024-01-01T10:30:00.000Z',
      };

      expect(() => validateSessionContext(session, NOW)).toThrow('Invalid session context');
    });

    it('validates context without current_time by using fallback', () => {
      const session: SessionInput = {
        ...mockSessionInput,
        current_time: undefined as any,
      };
      // Should not throw — current_time falls back to now
      const result = validateSessionContext(session, NOW);
      expect(result).toBeDefined();
    });
  });

  describe('applyBatchSessionChunkOperations', () => {
    it('throws when operations exceed maxOps', async () => {
      const ops = Array.from({ length: 51 }, (_, i) => ({
        chunkId: `chunk-${i}`,
        status: 'completed' as const,
      }));

      await expect(
        applyBatchSessionChunkOperations({
          sessionId: 'session-1',
          operations: ops,
          maxOps: 50,
          activeSessionExists: true,
          persistFn: async () => ({ created: 0, updated: 0, unchanged: 0, affectedChunkIds: [] }),
        })
      ).rejects.toThrow('Too many operations');
    });

    it('throws when no active session exists', async () => {
      await expect(
        applyBatchSessionChunkOperations({
          sessionId: 'session-1',
          operations: [{ chunkId: 'chunk-1', status: 'completed' as const }],
          activeSessionExists: false,
          persistFn: async () => ({ created: 0, updated: 0, unchanged: 0, affectedChunkIds: [] }),
        })
      ).rejects.toThrow('No active session found');
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

      expect(result.created).toBe(1);
      expect(result.affectedChunkIds).toEqual(['chunk-1']);
    });
  });
});
