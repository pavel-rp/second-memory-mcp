import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import { ZodError } from 'zod';
import {
  AddNoteInputShape,
  AddNoteInputSchema,
  ListNotesInputShape,
  ListNotesInputSchema,
  DeleteNoteInputShape,
  DeleteNoteInputSchema,
} from '../domain/types/notes-tools.js';
import { logger } from '../shared/logger.js';
import { toSnakeCase } from '../shared/case-convert.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

export function registerNotesTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'add_note',
    {
      title: 'Add Note',
      description:
        'Create a typed annotation on a chunk, topic, or session. ' +
        'Notes capture learning insights, confusion patterns, connections, and deeper explorations ' +
        'as structured, queryable data. They surface in teach_next for the agent to tailor teaching. ' +
        'Add "insight" notes after successful retrieval. Add "confusion" notes when the learner struggles. ' +
        'Add "connection" notes when cross-chunk links emerge.',
      inputSchema: AddNoteInputShape,
    },
    async input => {
      try {
        const parsed = AddNoteInputSchema.parse(input);
        const result = await ctx.createNote(parsed);
        return toolJson(toSnakeCase(result));
      } catch (error) {
        const msg = extractErrorMessage(error);
        if (error instanceof ZodError) {
          logger.error('Invalid add_note input:', error);
          return toolError(`Failed to add note: ${msg}`, {
            type: 'validation',
            message: msg,
            retryable: false,
          });
        }
        logger.error('add_note failed:', error);
        return toolError(`Failed to add note: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'list_notes',
    {
      title: 'List Notes',
      description:
        'List all notes for a given target entity (chunk, topic, or session). ' +
        'Returns notes ordered by created_at descending, including timestamps for relevance reasoning.',
      inputSchema: ListNotesInputShape,
    },
    async input => {
      try {
        const parsed = ListNotesInputSchema.parse(input);
        const result = await ctx.listNotes(parsed.targetType, parsed.targetId);
        return toolJson(toSnakeCase(result));
      } catch (error) {
        const msg = extractErrorMessage(error);
        if (error instanceof ZodError) {
          logger.error('Invalid list_notes input:', error);
          return toolError(`Failed to list notes: ${msg}`, {
            type: 'validation',
            message: msg,
            retryable: false,
          });
        }
        logger.error('list_notes failed:', error);
        return toolError(`Failed to list notes: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'delete_note',
    {
      title: 'Delete Note',
      description: 'Delete a note by its ID. Returns whether the deletion was successful.',
      inputSchema: DeleteNoteInputShape,
    },
    async input => {
      try {
        const parsed = DeleteNoteInputSchema.parse(input);
        const result = await ctx.deleteNote(parsed.noteId);
        return toolJson(toSnakeCase(result));
      } catch (error) {
        const msg = extractErrorMessage(error);
        if (error instanceof ZodError) {
          logger.error('Invalid delete_note input:', error);
          return toolError(`Failed to delete note: ${msg}`, {
            type: 'validation',
            message: msg,
            retryable: false,
          });
        }
        logger.error('delete_note failed:', error);
        return toolError(`Failed to delete note: ${msg}`, {
          type: 'database',
          message: msg,
          retryable: true,
        });
      }
    }
  );
}
