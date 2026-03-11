import type { DrillFormat } from '../../shared/prompts/prompt-pack.js';

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
