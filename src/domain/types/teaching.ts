import type { DrillFormat } from '../../shared/prompts/prompt-pack.js';
import type { NoteType, NoteAuthor } from './notes-tools.js';
import type { ContentStatus } from './recommendations.js';
import type { SessionMode } from './session.js';
import { z } from 'zod';

export type TeachNextNote = {
  id: string;
  note_type: NoteType;
  content: string;
  author: NoteAuthor;
  created_at: number;
};

export type PrerequisiteContextItem = {
  chunk_id: string;
  title: string;
  condensed_summary: string | null;
};

export type TeachNextTeach = {
  status: 'teach';
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
};

export type TeachNextComplete = {
  status: 'complete';
  message: string;
  summary: {
    total: number;
    passed_first_try: number;
    needed_retry: number;
    exhausted_retries: number;
  };
};

export type TeachNextBlocked = {
  status: 'blocked';
  message: string;
  current_chunk_id: string;
};

export type TeachNextError = {
  status: 'error';
  message: string;
};

export type TeachNextResponse =
  | TeachNextTeach
  | TeachNextComplete
  | TeachNextBlocked
  | TeachNextError;

// ── submit_answer types ──────────────────────────────────────────

export type SubmitAnswerInput = {
  question: string;
  response: string;
  passed: boolean;
  feedback: string;
  timeSpentMs: number;
  sessionQuestionId?: string;
};

export type SubmitAnswerRetry = {
  status: 'retry';
  attempt: number;
  chunk_id: string;
  message: string;
  feedback: string;
};

export type SubmitAnswerRecorded = {
  status: 'recorded';
  attempt: number;
  passed: boolean;
  quality: number;
  chunk_id: string;
  review_update?: {
    next_review_date: string;
    interval_days: number;
    ease_factor: number;
    is_leech: boolean;
  };
  next: TeachNextResponse;
};

export type SubmitAnswerError = {
  status: 'error';
  message: string;
};

export type SubmitAnswerResult = SubmitAnswerRetry | SubmitAnswerRecorded | SubmitAnswerError;

export const SubmitAnswerInputShape = {
  question: z.string().min(1).describe('The drill question that was asked'),
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
    .describe(
      'Whether the learner recalled the material correctly. ' +
        'Pass = they answered without significant prompting or errors. ' +
        "Fail = they couldn't answer, needed the answer revealed, or made a meaningful error. " +
        'When in doubt, fail — spaced repetition benefits from honest assessment.'
    ),
  feedback: z.string().min(1).describe("Agent's explanation of why right/wrong"),
  time_spent_ms: z.number().int().min(0).describe('Time the learner spent in milliseconds'),
  session_question_id: z
    .string()
    .min(1)
    .optional()
    .describe('Optional session question ID — when provided, uses the explicit questions flow'),
} as const;

export const SubmitAnswerInputSchema = z
  .object(SubmitAnswerInputShape)
  .transform(({ time_spent_ms, session_question_id, ...rest }) => ({
    ...rest,
    timeSpentMs: time_spent_ms,
    sessionQuestionId: session_question_id,
  }));

// ── start_learning types ────────────────────────────────────────

export type StartLearningInput = {
  subjectFilter?: string;
};

export type StartLearningStarted = {
  status: 'started';
  session_id: string;
  mode: 'learning' | 'review';
  total_chunks: number;
  estimated_duration: number;
  first_chunk: TeachNextResponse;
  recommendation_summary: string;
};

export type StartLearningNothingDue = {
  status: 'nothing_due';
  message: string;
};

export type StartLearningResumed = {
  status: 'resumed';
  session_id: string;
  mode: SessionMode;
  total_chunks: number;
  first_chunk: TeachNextResponse;
};

export type StartLearningError = {
  status: 'error';
  message: string;
};

export type StartLearningResult =
  | StartLearningStarted
  | StartLearningResumed
  | StartLearningNothingDue
  | StartLearningError;

export const StartLearningInputShape = {
  subject_filter: z.string().optional().describe('Filter recommendations by subject'),
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
  status: 'created';
  sessionId: string;
  questionIds: string[];
};

export type CreateSessionQuestionsError = {
  status: 'error';
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
} as const;

export const CreateSessionQuestionsInputSchema = z
  .object(CreateSessionQuestionsInputShape)
  .transform(({ session_id, questions }) => ({
    sessionId: session_id,
    questions: questions.map(q => ({ promptText: q.prompt_text, chunkIds: q.chunk_ids })),
  }));
