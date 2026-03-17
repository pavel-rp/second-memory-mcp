import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import { z, ZodError } from 'zod';
import {
  SubmitAnswerInputShape,
  SubmitAnswerInputSchema,
  StartLearningInputShape,
  StartLearningInputSchema,
  CreateSessionQuestionsInputShape,
  CreateSessionQuestionsInputSchema,
} from '../domain/types/teaching.js';
import { logger } from '../shared/logger.js';
import { toSnakeCase } from '../shared/case-convert.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

export function registerTeachingTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'teach_next',
    {
      title: 'Teach Next Chunk',
      description:
        'Get the next teaching instruction for the active learning session. ' +
        'Automatically selects the next chunk, hydrates the appropriate prompt, ' +
        'and returns a structured teaching instruction. No input needed — reads the active session. ' +
        "After presenting the instruction and receiving the learner's answer, call submit_answer " +
        'with the question, response, pass/fail assessment, feedback, and time_spent_ms. ' +
        "When submit_answer returns status 'recorded', its response includes the next chunk automatically.",
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
      inputSchema: SubmitAnswerInputShape,
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

  server.registerTool(
    'start_learning',
    {
      title: 'Start Learning Session',
      description:
        'One-call convenience tool: checks for active sessions, generates recommendations, ' +
        'creates a session, and returns the first teaching chunk. ' +
        'Replaces the manual sequence of what_to_learn_today → create_session → teach_next. ' +
        'Response includes first_chunk.instruction — follow it verbatim to teach the chunk. ' +
        "After teaching and getting the learner's answer, call submit_answer to record the result. " +
        'The response includes the next chunk — repeat until the session is complete.',
      inputSchema: StartLearningInputShape,
    },
    async input => {
      try {
        const parsed = StartLearningInputSchema.parse(input);
        const result = await ctx.startLearning(parsed);
        return toolJson(result);
      } catch (error) {
        const msg = extractErrorMessage(error);
        if (error instanceof ZodError) {
          logger.error('Invalid start_learning input:', error);
          return toolError(`Failed to start learning: ${msg}`, {
            type: 'validation',
            message: msg,
            retryable: false,
          });
        }
        logger.error('start_learning failed:', error);
        return toolError(`Failed to start learning: ${msg}`, {
          type: 'session',
          message: msg,
          retryable: true,
        });
      }
    }
  );

  server.registerTool(
    'create_session_questions',
    {
      title: 'Create Session Questions',
      description:
        'Create explicit drill questions for a session chunk. ' +
        'The chunk must be in_progress. Returns the created question IDs. ' +
        'Use submit_answer with session_question_id to answer each question.',
      inputSchema: CreateSessionQuestionsInputShape,
    },
    async input => {
      try {
        const parsed = CreateSessionQuestionsInputSchema.parse(input);
        const result = await ctx.createSessionQuestions(parsed);
        if (result.status === 'error') {
          return toolError(`Failed to create session questions: ${result.message}`, {
            type: 'session',
            message: result.message,
            retryable: false,
          });
        }
        return toolJson(toSnakeCase(result));
      } catch (error) {
        const msg = extractErrorMessage(error);
        if (error instanceof ZodError) {
          logger.error('Invalid create_session_questions input:', error);
          return toolError(`Failed to create session questions: ${msg}`, {
            type: 'validation',
            message: msg,
            retryable: false,
          });
        }
        logger.error('create_session_questions failed:', error);
        return toolError(`Failed to create session questions: ${msg}`, {
          type: 'session',
          message: msg,
          retryable: true,
        });
      }
    }
  );
}
