import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import { z, ZodError } from 'zod';
import { SubmitAnswerInputShape, SubmitAnswerInputSchema } from '../domain/types/teaching.js';
import { logger } from '../shared/logger.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

export function registerTeachingTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'teach_next',
    {
      title: 'Teach Next Chunk',
      description:
        'Get the next teaching instruction for the active learning session. ' +
        'Automatically selects the next chunk, hydrates the appropriate prompt, ' +
        'and returns a structured teaching instruction. No input needed — reads the active session.',
      inputSchema: z.object({}).shape,
    },
    async () => {
      try {
        const result = await ctx.getNextTeachingStep();
        return toolJson(result);
      } catch (error) {
        const msg = extractErrorMessage(error);
        logger.error('teach_next failed:', error);
        return toolError(`Failed to get next teaching step: ${msg}`, {
          type: 'session',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'submit_answer',
    {
      title: 'Submit Answer',
      description:
        "Submit the learner's answer for the current in-progress chunk. " +
        'Server derives the quality score, records the attempt, and manages the two-attempt flow. ' +
        'After completion, the response includes the next teaching instruction (piggybacks teach_next).',
      inputSchema: z.object(SubmitAnswerInputShape).shape,
    },
    async input => {
      try {
        const parsed = SubmitAnswerInputSchema.parse(input);
        const result = await ctx.submitAnswer(parsed);
        return toolJson(result);
      } catch (error) {
        const msg = extractErrorMessage(error);
        if (error instanceof ZodError) {
          logger.error('Invalid submit_answer input:', error);
          return toolError(`Failed to submit answer: ${msg}`, {
            type: 'validation',
            message: msg,
            retryable: false,
          });
        }
        logger.error('submit_answer failed:', error);
        return toolError(`Failed to submit answer: ${msg}`, {
          type: 'session',
          message: msg,
          retryable: true,
        });
      }
    }
  );
}
