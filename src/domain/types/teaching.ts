import type { DrillFormat } from '../../shared/prompts/prompt-pack.js';
import type { NoteType, NoteAuthor } from './notes-tools.js';
import type { ContentStatus } from './recommendations.js';
import type { SessionMode } from './session.js';
import type { TeachingApproach } from '../algorithms/classify-chunk.js';
import type { TopicStalenessProfile } from '../algorithms/compute-topic-profile.js';
import { z } from 'zod';

/**
 * All TeachNext* response types (TeachNextNote, TeachNextTeach, TeachNextComplete,
 * TeachNextBlocked, TeachNextRoadblock, TeachNextError) use snake_case field names.
 * This is an intentional exception to the domain camelCase convention: these types
 * serialize directly through toolData() in the server layer without a
 * camelCase-to-snake_case mapping step.
 */
export type TeachNextNote = {
  id: string;
  note_type: NoteType;
  content: string;
  author: NoteAuthor;
  created_at: string;
};

export type PrerequisiteContextItem = {
  chunk_id: string;
  title: string;
  condensed_summary: string | null;
};

export type ReviewUpdate = {
  next_review_date: string;
  interval_days: number;
  ease_factor: number;
  is_leech: boolean;
};

export type TeachNextTeach = {
  action: 'teach';
  session_id: string;
  chunk_id: string;
  session_chunk_id: string;
  chunk_index: number; // 1-based: chunk position (teaching) or question index (assessment)
  total_chunks: number; // chunk count (teaching) or question count (assessment)
  mode: 'learning' | 'retrieval' | 'assessment';
  instruction: string; // hydrated PromptPack prompt (teaching) or raw question text (assessment)
  drill_format: DrillFormat;
  content_status: ContentStatus;
  prerequisite_context?: PrerequisiteContextItem[];
  previous_feedback?: string[]; // feedback strings from past sessions
  notes?: TeachNextNote[];
  review_update?: ReviewUpdate; // SR result from completing the previous chunk
  // NEU-313: prerequisite reteach IDs when stale prereqs were inserted
  prerequisite_reteach_needed?: string[];
  // NEU-312: per-chunk retrievability + tier assignment
  teaching_approach?: TeachingApproach;
  estimated_retrievability?: number;
  days_overdue?: number;
  reteach_compression?: number;
  storage_strength_estimate?: number;
  // NEU-312: topic-level staleness context
  topic_staleness_profile?: TopicStalenessProfile;
  is_first_chunk_in_topic?: boolean;
  dominant_tier?: TeachingApproach;
};

export type TeachNextComplete = {
  action: 'complete';
  message: string;
  summary: {
    total: number;
    passed_first_try: number;
    needed_retry: number;
    exhausted_retries: number;
  };
  review_update?: ReviewUpdate; // SR result from completing the last chunk
};

export type TeachNextBlocked = {
  action: 'blocked';
  message: string;
  current_chunk_id: string;
};

export type TeachNextError = {
  action: 'error';
  message: string;
};

export type RoadblockDetail = {
  trigger_quality: number;
  trigger_question: string;
  required_followups: number;
  completed_followups: number;
  remaining: number;
  chunk_ids: string[];
  instruction: string;
};

export type TeachNextRoadblock = {
  action: 'roadblock';
  current_chunk_id: string;
  roadblock_detail: RoadblockDetail;
};

export type TeachNextResponse =
  | TeachNextTeach
  | TeachNextComplete
  | TeachNextBlocked
  | TeachNextRoadblock
  | TeachNextError;

// ── submit_answer types ──────────────────────────────────────────

export type QuestionType = 'recall' | 'explain_apply' | 'analyze_create';

export type SubmitAnswerInputInline = {
  promptText: string;
  chunkIds: string[];
  response: string;
  passed?: boolean;
  quality: number;
  questionType: QuestionType;
  feedback: string;
  timeSpentMs: number;
};

export type SubmitAnswerInputRetry = {
  sessionQuestionId: string;
  response: string;
  passed?: boolean;
  quality: number;
  questionType: QuestionType;
  feedback: string;
  timeSpentMs: number;
};

export type SubmitAnswerInput = SubmitAnswerInputInline | SubmitAnswerInputRetry;

export type RoadblockForecast = {
  trigger_quality: number;
  required_followups: number;
  completed_followups: number;
  remaining: number;
  quality_floor: 3;
};

export type RetryGuidance = {
  roadblock: RoadblockForecast;
  teaching_approach: TeachingApproach;
  pivot: string;
};

export type SubmitAnswerRetry = {
  action: 'retry';
  session_question_id: string;
  attempt: 1 | 2;
  chunk_id: string;
  message: string;
  feedback: string;
  retry_guidance?: RetryGuidance;
};

export type SubmitAnswerRecorded = {
  action: 'recorded';
  session_question_id: string;
  attempt: 1 | 2;
  passed: boolean;
  quality: number;
  question_type: QuestionType;
  chunk_id: string;
  review_update?: ReviewUpdate;
  late_submission?: boolean;
  roadblock_forecast?: RoadblockForecast;
};

export type SubmitAnswerError = {
  action: 'error';
  message: string;
};

export type SubmitAnswerResult = SubmitAnswerRetry | SubmitAnswerRecorded | SubmitAnswerError;

export const SubmitAnswerInputShape = {
  prompt_text: z
    .string()
    .min(1)
    .optional()
    .describe('The drill question text. Required for inline question creation (omit for retries).'),
  chunk_ids: z
    .array(z.string().min(1))
    .min(1)
    .optional()
    .describe(
      'Chunk IDs this question evaluates. Required for inline question creation (omit for retries). Teaching mode: exactly 1.'
    ),
  response: z
    .string()
    .min(1)
    .describe(
      "The learner's answer — VERBATIM. Copy exactly as written: no paraphrasing, " +
        'no sanitization, no censorship, no grammar fixes. Profanity, slang, errors, ' +
        'tangential commentary — all preserved as-is. ' +
        'For non-text artifacts (images, handwriting), append a clearly-delimited ' +
        '"[Agent transcription of attached artifact]" block after the verbatim text. ' +
        'Use the feedback field for your assessment, not this field.'
    ),
  passed: z
    .boolean()
    .optional()
    .describe(
      'Whether the learner recalled the material correctly. Optional — derived from quality >= 3 when omitted. ' +
        'Pass = they answered without significant prompting or errors. ' +
        "Fail = they couldn't answer, needed the answer revealed, or made a meaningful error. " +
        'When in doubt, fail — spaced repetition benefits from honest assessment.'
    ),
  quality: z
    .number()
    .int()
    .min(0)
    .max(5)
    .describe(
      'Agent-judged quality score (0–5) per the quality rubric. ' +
        '0 = no recall, 1 = wrong but recognized, 2 = wrong but close, ' +
        '3 = correct with difficulty, 4 = correct with minor hesitation, 5 = perfect instant recall. ' +
        'Score HONESTLY: a learner who just failed badly cannot realistically score 5 on the very next ' +
        'question about the same concept. When in doubt, score lower rather than higher. ' +
        'The server enforces session-scoped caps, but accurate agent scoring produces better ' +
        'spaced-repetition scheduling.'
    ),
  question_type: z
    .enum(['recall', 'explain_apply', 'analyze_create'])
    .describe(
      'The cognitive level of the question asked. ' +
        'recall = factual retrieval, explain_apply = understanding + application, analyze_create = analysis + synthesis.'
    ),
  feedback: z.string().min(1).describe("Agent's explanation of why right/wrong"),
  time_spent_ms: z.number().int().min(0).describe('Time the learner spent in milliseconds'),
  session_question_id: z
    .string()
    .min(1)
    .optional()
    .describe(
      'Session question ID for retries (2nd+ attempts on an existing question). Omit for inline question creation.'
    ),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const SubmitAnswerInputSchema = z
  .object(SubmitAnswerInputShape)
  .superRefine((data, ctx) => {
    const hasInline = data.prompt_text !== undefined && data.chunk_ids !== undefined;
    const hasRetry = data.session_question_id !== undefined;
    const hasPartialInline = (data.prompt_text !== undefined) !== (data.chunk_ids !== undefined);

    if (hasInline && hasRetry) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Provide either (prompt_text + chunk_ids) for inline question creation OR session_question_id for retries, not both.',
      });
    }
    if (hasPartialInline) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'prompt_text and chunk_ids must both be provided together for inline question creation.',
      });
    }
    if (!hasInline && !hasRetry && !hasPartialInline) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Provide either (prompt_text + chunk_ids) for inline question creation OR session_question_id for retries.',
      });
    }
  })
  .transform(
    ({
      time_spent_ms,
      session_question_id,
      prompt_text,
      chunk_ids,
      question_type,
      context_token: _ct,
      ...rest
    }) => {
      const base = { ...rest, timeSpentMs: time_spent_ms, questionType: question_type };
      if (session_question_id !== undefined) {
        return { ...base, sessionQuestionId: session_question_id };
      }
      return {
        ...base,
        promptText: prompt_text as string,
        chunkIds: chunk_ids as string[],
      };
    }
  );

// ── start_learning types ────────────────────────────────────────

export type StartLearningInput = {
  subjectFilter?: string;
};

export type StartLearningStarted = {
  action: 'started';
  session_id: string;
  mode: 'learning' | 'review';
  total_chunks: number;
  estimated_duration: number;
  first_chunk: TeachNextResponse;
  recommendation_summary: string;
};

export type StartLearningNothingDue = {
  action: 'nothing_due';
  message: string;
};

export type StartLearningResumed = {
  action: 'resumed';
  session_id: string;
  mode: SessionMode;
  total_chunks: number;
  first_chunk: TeachNextResponse;
};

export type StartLearningError = {
  action: 'error';
  message: string;
};

export type StartLearningResult =
  | StartLearningStarted
  | StartLearningResumed
  | StartLearningNothingDue
  | StartLearningError;

export const StartLearningInputShape = {
  subject_filter: z.string().optional().describe('Filter recommendations by subject'),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const StartLearningInputSchema = z
  .object(StartLearningInputShape)
  .transform(({ subject_filter }) => ({
    subjectFilter: subject_filter,
  }));

// ── create_session_questions types ─────────────────────────────

export type CreateSessionQuestionsInput = {
  sessionId: string;
  questions: { promptText: string; chunkIds: string[] }[];
};

export type CreateSessionQuestionsSuccess = {
  action: 'created';
  sessionId: string;
  questionIds: string[];
};

export type CreateSessionQuestionsError = {
  action: 'error';
  message: string;
};

export type CreateSessionQuestionsResult =
  | CreateSessionQuestionsSuccess
  | CreateSessionQuestionsError;

export const CreateSessionQuestionsInputShape = {
  session_id: z.string().min(1).describe('The session ID to attach questions to'),
  questions: z
    .array(
      z.object({
        prompt_text: z.string().min(1).describe('The drill question text'),
        chunk_ids: z
          .array(z.string().min(1))
          .min(1)
          .describe(
            'Chunk IDs this question evaluates. Teaching mode: exactly 1. Assessment mode: 1+.'
          ),
      })
    )
    .min(1)
    .max(10)
    .describe('Array of questions to create'),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const CreateSessionQuestionsInputSchema = z
  .object(CreateSessionQuestionsInputShape)
  .transform(({ session_id, questions }) => ({
    sessionId: session_id,
    questions: questions.map(q => ({ promptText: q.prompt_text, chunkIds: q.chunk_ids })),
  }));
