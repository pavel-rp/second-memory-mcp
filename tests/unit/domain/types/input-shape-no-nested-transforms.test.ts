import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  CreateTopicWithChunksInputShape,
  CreateTopicWithChunksInputSchema,
} from '../../../../src/domain/types/persistence-tools.js';
import {
  RankCandidatesInputShape,
  RankCandidatesInputSchema,
} from '../../../../src/domain/types/spaced-repetition-tools.js';
import {
  RecommendationInputShape,
  RecommendationInputSchema,
} from '../../../../src/domain/types/recommendations.js';
import {
  BatchUpdateInputShape,
  BatchUpdateInputSchema,
} from '../../../../src/domain/types/session.js';

// Import all InputShapes for the guardrail test
import * as persistenceTools from '../../../../src/domain/types/persistence-tools.js';
import * as spacedRepetitionTools from '../../../../src/domain/types/spaced-repetition-tools.js';
import * as recommendations from '../../../../src/domain/types/recommendations.js';
import * as session from '../../../../src/domain/types/session.js';
import * as sessionManagementTools from '../../../../src/domain/types/session-management-tools.js';
import * as searchTools from '../../../../src/domain/types/search-tools.js';
import * as teaching from '../../../../src/domain/types/teaching.js';
import * as contentTools from '../../../../src/domain/types/content-tools.js';
import * as analytics from '../../../../src/domain/types/analytics.js';
import * as notesTools from '../../../../src/domain/types/notes-tools.js';

/**
 * Recursively check if a Zod schema contains a `.transform()` effect.
 * Unwraps ZodArray, ZodOptional, ZodDefault, ZodNullable, and ZodObject wrappers.
 */
function hasTransform(schema: z.ZodTypeAny): boolean {
  if (schema instanceof z.ZodEffects && schema._def.effect.type === 'transform') {
    return true;
  }
  if (schema instanceof z.ZodArray) {
    return hasTransform(schema.element);
  }
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    return hasTransform(schema.unwrap());
  }
  if (schema instanceof z.ZodDefault) {
    return hasTransform(schema.removeDefault());
  }
  if (schema instanceof z.ZodObject) {
    return Object.values(schema.shape).some(field => hasTransform(field as z.ZodTypeAny));
  }
  return false;
}

// ---------------------------------------------------------------------------
// Round-trip tests: simulate SDK pre-parse (z.object(InputShape).parse) then
// handler parse (InputSchema.parse). Snake_case fields in nested objects must
// survive the round-trip.
// ---------------------------------------------------------------------------

describe('CreateTopicWithChunksInputShape round-trip', () => {
  it('preserves snake_case fields in nested chunks after double-parse', () => {
    const input = {
      topic_title: 'Test Topic',
      subject: 'Math',
      chunks: [
        {
          id: 'c1',
          title: 'Chunk 1',
          content: 'Content for chunk 1 that is long enough',
          difficulty: 5,
          estimated_duration: 15,
          order: 1,
          chunk_type: 'new',
        },
      ],
    };

    // SDK pre-parse: uses InputShape (no transforms)
    const preParsed = z.object(CreateTopicWithChunksInputShape).parse(input);
    // Handler parse: uses InputSchema (with transforms)
    const result = CreateTopicWithChunksInputSchema.parse(preParsed);

    expect(result.chunks[0].estimatedDuration).toBe(15);
    expect(result.chunks[0].chunkType).toBe('new');
  });

  it('preserves snake_case fields in user_preferences after double-parse', () => {
    const input = {
      topic_title: 'Test Topic',
      subject: 'Math',
      chunks: [
        {
          id: 'c1',
          title: 'Chunk 1',
          content: 'Content for chunk 1 that is long enough',
          difficulty: 5,
          estimated_duration: 10,
          order: 1,
        },
      ],
      user_preferences: {
        preferred_difficulty: 7,
        learning_style: 'visual' as const,
        max_chunk_duration: 30,
        include_prerequisites: true,
      },
    };

    const preParsed = z.object(CreateTopicWithChunksInputShape).parse(input);
    const result = CreateTopicWithChunksInputSchema.parse(preParsed);

    expect(result.userPreferences?.preferredDifficulty).toBe(7);
    expect(result.userPreferences?.learningStyle).toBe('visual');
    expect(result.userPreferences?.maxChunkDuration).toBe(30);
    expect(result.userPreferences?.includePrerequisites).toBe(true);
  });
});

describe('RankCandidatesInputShape round-trip', () => {
  it('preserves snake_case fields in nested candidates after double-parse', () => {
    const input = {
      candidates: [
        {
          id: 'item1',
          next_review_date: '2026-03-15',
          ease_factor: 2.5,
          repetitions: 3,
          difficulty: 5,
          estimated_duration: 10,
        },
      ],
    };

    const preParsed = z.object(RankCandidatesInputShape).parse(input);
    const result = RankCandidatesInputSchema.parse(preParsed);

    expect(result.candidates[0].nextReviewDate).toBe('2026-03-15');
    expect(result.candidates[0].easeFactor).toBe(2.5);
    expect(result.candidates[0].estimatedDuration).toBe(10);
  });
});

describe('RecommendationInputShape round-trip', () => {
  it('preserves snake_case fields in nested learning_items after double-parse', () => {
    const input = {
      learning_items: [
        {
          id: 'item1',
          title: 'Test Item',
          subject: 'Math',
          difficulty: 5,
          next_review_date: '2026-03-15',
          ease_factor: 2.5,
          repetitions: 3,
          estimated_duration: 10,
          chunk_type: 'review' as const,
        },
      ],
    };

    const preParsed = z.object(RecommendationInputShape).parse(input);
    const result = RecommendationInputSchema.parse(preParsed);

    expect(result.learningItems![0].nextReviewDate).toBe('2026-03-15');
    expect(result.learningItems![0].easeFactor).toBe(2.5);
    expect(result.learningItems![0].estimatedDuration).toBe(10);
  });

  it('preserves snake_case fields in nested user_history after double-parse', () => {
    const input = {
      fetch_from_database: true,
      user_history: {
        recent_sessions: [
          {
            date: '2026-03-14',
            duration: 30,
            items_completed: 5,
            average_quality: 4.0,
            cognitive_load: 7,
          },
        ],
        patterns: {
          average_session_duration: 25,
          preferred_difficulty: 6,
          success_rate: 0.85,
          fatigue_threshold: 8,
          subject_preferences: { machine_learning: 5 },
        },
      },
    };

    const preParsed = z.object(RecommendationInputShape).parse(input);
    const result = RecommendationInputSchema.parse(preParsed);

    expect(result.userHistory!.recentSessions[0].itemsCompleted).toBe(5);
    expect(result.userHistory!.recentSessions[0].averageQuality).toBe(4.0);
    expect(result.userHistory!.patterns.averageSessionDuration).toBe(25);
    expect(result.userHistory!.patterns.subjectPreferences).toEqual({
      machine_learning: 5,
    });
  });

  it('preserves snake_case fields in nested session_context after double-parse', () => {
    const input = {
      fetch_from_database: true,
      session_context: {
        current_session_id: 'sess-1',
        active_items: ['item1'],
        session_start_time: 1000,
        last_activity: 2000,
        user_preferences: { theme: 'dark' },
        current_recommendations: [
          {
            item: {
              id: 'item1',
              title: 'Test',
              subject: 'Math',
              difficulty: 5,
              next_review_date: '2026-03-15',
              ease_factor: 2.5,
              repetitions: 3,
              estimated_duration: 10,
              chunk_type: 'review' as const,
            },
            priority: 1,
            reason: 'overdue',
            order: 1,
          },
        ],
        current_item_index: 0,
      },
    };

    const preParsed = z.object(RecommendationInputShape).parse(input);
    const result = RecommendationInputSchema.parse(preParsed);

    expect(result.sessionContext!.currentSessionId).toBe('sess-1');
    expect(result.sessionContext!.currentRecommendations![0].item.nextReviewDate).toBe(
      '2026-03-15'
    );
  });

  it('preserves snake_case fields in nested constraints after double-parse', () => {
    const input = {
      fetch_from_database: true,
      constraints: {
        max_duration: 60,
        max_cognitive_load: 8,
        max_new_items: 5,
        subject_filter: 'Math',
        exclude_ids: ['id1'],
      },
    };

    const preParsed = z.object(RecommendationInputShape).parse(input);
    const result = RecommendationInputSchema.parse(preParsed);

    expect(result.constraints!.maxDuration).toBe(60);
    expect(result.constraints!.maxCognitiveLoad).toBe(8);
    expect(result.constraints!.maxNewItems).toBe(5);
  });
});

describe('BatchUpdateInputShape round-trip', () => {
  it('preserves snake_case fields in nested operations after double-parse', () => {
    const input = {
      session_id: 'sess-1',
      operations: [
        {
          chunk_id: 'c1',
          time_spent_ms: 5000,
        },
      ],
    };

    const preParsed = z.object(BatchUpdateInputShape).parse(input);
    const result = BatchUpdateInputSchema.parse(preParsed);

    expect(result.operations[0].chunkId).toBe('c1');
    expect(result.operations[0].timeSpentMs).toBe(5000);
  });
});

// ---------------------------------------------------------------------------
// Structural guardrail: no InputShape exported from src/domain/types/ should
// contain a nested Zod schema with .transform()
// ---------------------------------------------------------------------------

describe('InputShape structural guardrail', () => {
  it('no exported InputShape contains nested schemas with .transform()', () => {
    const allModules = [
      persistenceTools,
      spacedRepetitionTools,
      recommendations,
      session,
      sessionManagementTools,
      searchTools,
      teaching,
      contentTools,
      analytics,
      notesTools,
    ];

    const violations: string[] = [];

    for (const mod of allModules) {
      for (const [exportName, exportValue] of Object.entries(mod)) {
        if (!exportName.endsWith('InputShape')) continue;

        // InputShape is a plain object { field: ZodSchema, ... }
        const shape = exportValue as Record<string, z.ZodTypeAny>;
        for (const [fieldName, fieldSchema] of Object.entries(shape)) {
          if (hasTransform(fieldSchema)) {
            violations.push(`${exportName}.${fieldName}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
