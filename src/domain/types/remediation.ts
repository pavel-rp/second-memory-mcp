import { z } from 'zod';
import { toCamelCaseKeys } from '../../shared/case-convert.js';

// ── Reason codes ───────────────────────────────────────────────

export type ReasonCode =
  | 'WEAK_AFTER_ASSESSMENT'
  | 'LEECH_THRESHOLD'
  | 'PREREQ_LOW_EASE'
  | 'NEW_MATERIAL';

// ── Input schema (snake_case wire format) ──────────────────────

export const RecommendRemediationInputShape = {
  session_id: z.string().min(1).describe('ID of a completed session to analyze for remediation'),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const RecommendRemediationInputSchema = z
  .object(RecommendRemediationInputShape)
  .transform(toCamelCaseKeys);

// ── Output types (camelCase internal) ──────────────────────────

export type WeakChunk = {
  chunkId: string;
  topicId: string;
  easeFactor: number;
  leech: boolean;
  reasonCode: ReasonCode;
};

export type PrerequisiteChunk = {
  chunkId: string;
  easeFactor: number;
  reasonCode: ReasonCode;
};

export type RecommendedSession = {
  mode: string;
  topicId: string | null;
  chunkIds: string[];
  estimatedDurationMinutes: number;
  reasonCode: ReasonCode;
};

export type SrScheduleDelta = {
  chunksDemoted: number;
  chunksRescheduledSooner: number;
};

export type GapNoteWritten = {
  chunkId: string;
  noteId: string;
};

export type RemediationPlan = {
  weakChunks: WeakChunk[];
  prerequisiteChunksToRevisit: PrerequisiteChunk[];
  recommendedNextSession: RecommendedSession;
  srScheduleDelta: SrScheduleDelta;
  gapNotesWritten: GapNoteWritten[];
};
