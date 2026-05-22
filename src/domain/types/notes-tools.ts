import { z } from 'zod';
import { VALIDATION_CONSTANTS } from '../../shared/constants/validation.js';
import { toCamelCaseKeys } from '../../shared/case-convert.js';

// ── Enums ───────────────────────────────────────────────────────

export const NoteTargetType = z.enum(['chunk', 'topic', 'session']);
export type NoteTargetType = z.infer<typeof NoteTargetType>;

export const NoteType = z.enum(['insight', 'confusion', 'connection', 'deeper_exploration', 'gap']);
export type NoteType = z.infer<typeof NoteType>;

export const NoteAuthor = z.enum(['agent', 'user']);
export type NoteAuthor = z.infer<typeof NoteAuthor>;

// ── add_note ────────────────────────────────────────────────────

export const AddNoteInputShape = {
  target_type: NoteTargetType.describe('Type of entity to annotate: chunk, topic, or session'),
  target_id: z.string().min(1, 'Target ID cannot be empty').describe('ID of the target entity'),
  note_type: NoteType.describe(
    'Classification of the note: insight, confusion, connection, deeper_exploration, or gap'
  ),
  content: z
    .string()
    .min(1, 'Content cannot be empty')
    .max(
      VALIDATION_CONSTANTS.MAX_CONTENT_SIZE,
      `Content cannot exceed ${VALIDATION_CONSTANTS.MAX_CONTENT_SIZE} characters`
    )
    .describe('Note content text'),
  author: NoteAuthor.describe('Who created the note: agent or user'),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const AddNoteInputSchema = z.object(AddNoteInputShape).transform(toCamelCaseKeys);

// ── list_notes ──────────────────────────────────────────────────

export const ListNotesInputShape = {
  target_type: NoteTargetType.describe('Type of entity to list notes for'),
  target_id: z.string().min(1, 'Target ID cannot be empty').describe('ID of the target entity'),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const ListNotesInputSchema = z.object(ListNotesInputShape).transform(toCamelCaseKeys);

// ── delete_note ─────────────────────────────────────────────────

export const DeleteNoteInputShape = {
  note_id: z.string().min(1, 'Note ID cannot be empty').describe('ID of the note to delete'),
  context_token: z
    .string()
    .min(1)
    .describe(
      'Token returned by init_agent_context. Required on every call. ' +
        'Call init_agent_context at the start of every conversation to obtain this token.'
    ),
} as const;

export const DeleteNoteInputSchema = z.object(DeleteNoteInputShape).transform(toCamelCaseKeys);

// ── Output types (camelCase internal) ───────────────────────────

export type NoteCreated = {
  id: string;
  createdAt: string;
};

export type NoteRecord = {
  id: string;
  noteType: NoteType;
  content: string;
  author: NoteAuthor;
  createdAt: string;
};

export type NoteListResult = {
  notes: NoteRecord[];
};

export type NoteDeleted = {
  success: boolean;
};
