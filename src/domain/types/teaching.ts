import type { DrillFormat } from '../../shared/prompts/prompt-pack.js';
import type { NoteType, NoteAuthor } from './notes-tools.js';
import type { ContentStatus } from './recommendations.js';
import { z } from 'zod';

export type TeachNextNote = {
  id: string;
  note_type: NoteType;
  content: string;
  author: NoteAuthor;
  created_at: number;
};

export type TeachNextTeach = {
  status: 'teach';
  chunk_id: string;
  session_chunk_id: string;
  chunk_index: number; // 1-based position in session
  total_chunks: number;
  mode: 'learning' | 'retrieval';
  instruction: string; // hydrated prompt from PromptPack
  drill_format: DrillFormat;
  content_status: ContentStatus;
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
  response: z.string().min(1).describe("The learner's answer"),
  passed: z.boolean().describe("Agent's pass/fail judgment"),
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
  timeAvailable?: number;
  mode?: 'learning' | 'review';
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

export type StartLearningError = {
  status: 'error';
  message: string;
};

export type StartLearningResult =
  | StartLearningStarted
  | StartLearningNothingDue
  | StartLearningError;

export const StartLearningInputShape = {
  subject_filter: z.string().optional().describe('Filter recommendations by subject'),
  time_available: z.number().int().min(1).optional().describe('Available study time in minutes'),
  mode: z
    .enum(['learning', 'review'])
    .optional()
    .describe(
      "Session mode: 'learning' for new content, 'review' for due items. Auto-detected if omitted."
    ),
} as const;

export const StartLearningInputSchema = z
  .object(StartLearningInputShape)
  .transform(({ subject_filter, time_available, ...rest }) => ({
    ...rest,
    subjectFilter: subject_filter,
    timeAvailable: time_available,
  }));

// ── create_session_questions types ─────────────────────────────

export type CreateSessionQuestionsInput = {
  sessionChunkId: string;
  questions: { promptText: string }[];
};

export type CreateSessionQuestionsSuccess = {
  status: 'created';
  sessionChunkId: string;
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
  session_chunk_id: z.string().min(1).describe('The session chunk ID to attach questions to'),
  questions: z
    .array(
      z.object({
        prompt_text: z.string().min(1).describe('The drill question text'),
      })
    )
    .min(1)
    .max(10)
    .describe('Array of questions to create for this chunk'),
} as const;

export const CreateSessionQuestionsInputSchema = z
  .object(CreateSessionQuestionsInputShape)
  .transform(({ session_chunk_id, questions }) => ({
    sessionChunkId: session_chunk_id,
    questions: questions.map(q => ({ promptText: q.prompt_text })),
  }));
