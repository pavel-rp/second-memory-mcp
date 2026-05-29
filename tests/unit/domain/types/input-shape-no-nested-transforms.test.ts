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
      topic_summary: 'Math topic summary for round-trip test',
      chunks: [
        {
          id: 'c1',
          title: 'Chunk 1',
          content:
            'Content for chunk 1 covering fundamental mathematical concepts including algebra and arithmetic. This chunk provides the foundational knowledge needed to understand more advanced topics in the curriculum. Students should master these basics first.',
          difficulty: 5,
          estimated_duration: 15,
          order: 1,
          chunk_type: 'new',
          condensed_summary: 'Key takeaway from chunk 1.',
        },
        {
          id: 'c2',
          title: 'Chunk 2',
          content:
            'Content for chunk 2 covering intermediate mathematical concepts building on the foundations from chunk 1. This includes more complex operations and problem-solving techniques that are essential for progressing through the math curriculum effectively.',
          difficulty: 6,
          estimated_duration: 10,
          order: 2,
          chunk_type: 'new',
          condensed_summary: 'Key takeaway from chunk 2.',
        },
      ],
      context_token: 'ctx-test',
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
      topic_summary: 'Math topic summary for preferences round-trip test',
      chunks: [
        {
          id: 'c1',
          title: 'Chunk 1',
          content:
            'Content for chunk 1 covering fundamental mathematical concepts including algebra and arithmetic. This chunk provides the foundational knowledge needed to understand more advanced topics in the curriculum. Students should master these basics first.',
          difficulty: 5,
          estimated_duration: 10,
          order: 1,
          condensed_summary: 'Key takeaway from chunk 1.',
        },
        {
          id: 'c2',
          title: 'Chunk 2',
          content:
            'Content for chunk 2 covering intermediate mathematical concepts building on the foundations from chunk 1. This includes more complex operations and problem-solving techniques that are essential for progressing through the math curriculum effectively.',
          difficulty: 6,
          estimated_duration: 10,
          order: 2,
          condensed_summary: 'Key takeaway from chunk 2.',
        },
      ],
      user_preferences: {
        preferred_difficulty: 7,
        learning_style: 'visual' as const,
        max_chunk_duration: 30,
        include_prerequisites: true,
      },
      context_token: 'ctx-test',
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
      context_token: 'ctx-test',
    };

    const preParsed = z.object(RankCandidatesInputShape).parse(input);
    const result = RankCandidatesInputSchema.parse(preParsed);

    expect(result.candidates[0].nextReviewDate).toBe('2026-03-15');
    expect(result.candidates[0].easeFactor).toBe(2.5);
    expect(result.candidates[0].estimatedDuration).toBe(10);
  });
});

describe('RecommendationInputShape round-trip', () => {
  it('preserves subject_filter after double-parse', () => {
    const input = {
      subject_filter: 'Math',
      limit: 5,
      context_token: 'ctx-test',
    };

    const preParsed = z.object(RecommendationInputShape).parse(input);
    const result = RecommendationInputSchema.parse(preParsed);

    expect(result.subjectFilter).toBe('Math');
    expect(result.limit).toBe(5);
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
      context_token: 'ctx-test',
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

describe('SubmitAnswerInputSchema strips context_token from transform output', () => {
  it('does not carry context_token through on the inline path', () => {
    const input = {
      prompt_text: 'What is X?',
      chunk_ids: ['c1'],
      response: 'X is Y',
      quality: 4,
      question_type: 'recall' as const,
      feedback: 'Good',
      time_spent_ms: 1000,
      context_token: 'ctx-test',
    };

    const preParsed = z.object(teaching.SubmitAnswerInputShape).parse(input);
    const result = teaching.SubmitAnswerInputSchema.parse(preParsed);

    expect(Object.keys(result)).not.toContain('context_token');
    expect((result as Record<string, unknown>).timeSpentMs).toBe(1000);
    expect((result as Record<string, unknown>).questionType).toBe('recall');
  });

  it('does not carry context_token through on the retry path', () => {
    const input = {
      session_question_id: 'sq-1',
      response: 'X is Y',
      quality: 3,
      question_type: 'explain_apply' as const,
      feedback: 'Close',
      time_spent_ms: 500,
      context_token: 'ctx-test',
    };

    const preParsed = z.object(teaching.SubmitAnswerInputShape).parse(input);
    const result = teaching.SubmitAnswerInputSchema.parse(preParsed);

    expect(Object.keys(result)).not.toContain('context_token');
    expect((result as Record<string, unknown>).sessionQuestionId).toBe('sq-1');
  });
});

describe('SubmitAnswerInputShape feedback whitespace validation (NEU-739)', () => {
  const baseInput = {
    prompt_text: 'What is X?',
    chunk_ids: ['c1'],
    response: 'X is Y',
    quality: 4,
    question_type: 'recall' as const,
    time_spent_ms: 1000,
    context_token: 'ctx-test',
  };

  it('rejects whitespace-only feedback at the handler-parse layer', () => {
    expect(() => teaching.SubmitAnswerInputSchema.parse({ ...baseInput, feedback: '   ' })).toThrow(
      z.ZodError
    );
  });

  it('rejects whitespace-only feedback at the SDK pre-parse layer', () => {
    expect(() =>
      z.object(teaching.SubmitAnswerInputShape).parse({ ...baseInput, feedback: '   ' })
    ).toThrow(z.ZodError);
  });

  it('trims surrounding whitespace from valid feedback', () => {
    const preParsed = z
      .object(teaching.SubmitAnswerInputShape)
      .parse({ ...baseInput, feedback: '  good  ' });
    expect(preParsed.feedback).toBe('good');

    const result = teaching.SubmitAnswerInputSchema.parse(preParsed);
    expect((result as Record<string, unknown>).feedback).toBe('good');
  });

  it('leaves feedback without surrounding whitespace unchanged', () => {
    const preParsed = z
      .object(teaching.SubmitAnswerInputShape)
      .parse({ ...baseInput, feedback: 'Correct' });
    expect(preParsed.feedback).toBe('Correct');
  });
});

describe('ReviseGradeInputShape new_feedback whitespace validation (NEU-745)', () => {
  const baseInput = {
    session_question_id: 'q1',
    new_quality: 4,
    reason: 'other' as const,
    context_token: 'ctx-test',
  };

  it('rejects whitespace-only new_feedback at the handler-parse layer', () => {
    expect(() =>
      teaching.ReviseGradeInputSchema.parse({ ...baseInput, new_feedback: '   ' })
    ).toThrow(z.ZodError);
  });

  it('rejects whitespace-only new_feedback at the SDK pre-parse layer', () => {
    expect(() =>
      z.object(teaching.ReviseGradeInputShape).parse({ ...baseInput, new_feedback: '   ' })
    ).toThrow(z.ZodError);
  });

  it('trims surrounding whitespace from valid new_feedback', () => {
    const preParsed = z
      .object(teaching.ReviseGradeInputShape)
      .parse({ ...baseInput, new_feedback: '  fixed  ' });
    expect(preParsed.new_feedback).toBe('fixed');

    const result = teaching.ReviseGradeInputSchema.parse({
      ...baseInput,
      new_feedback: '  fixed  ',
    });
    expect((result as Record<string, unknown>).newFeedback).toBe('fixed');
  });

  it('leaves new_feedback without surrounding whitespace unchanged', () => {
    const result = teaching.ReviseGradeInputSchema.parse({
      ...baseInput,
      new_feedback: 'corrected',
    });
    expect((result as Record<string, unknown>).newFeedback).toBe('corrected');
  });
});
