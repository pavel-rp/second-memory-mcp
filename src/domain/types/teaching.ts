import type { DrillFormat } from '../../shared/prompts/prompt-pack.js';
import { z } from 'zod';

export type TeachNextTeach = {
  status: 'teach';
  chunk_id: string;
  chunk_index: number; // 1-based position in session
  total_chunks: number;
  mode: 'learning' | 'retrieval';
  instruction: string; // hydrated prompt from PromptPack
  drill_format: DrillFormat;
  previous_feedback?: string[]; // feedback strings from past sessions
};

export type TeachNextComplete = {
  status: 'complete';
  message: string;
  summary: {
    total: number;
    passed_first_try: number;
    needed_retry: number;
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
  review_update: {
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
} as const;
