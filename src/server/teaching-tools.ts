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
        "When submit_answer returns status 'recorded', check next.status: 'teach' → present instruction, 'complete' → end session, 'blocked'/'error' → surface message.",
      inputSchema: z.object({}).shape,
    },
    async () => {
      try {
        const result = await ctx.getNextTeachingStep();
        if (result.status === 'teach') {
          return toolJson(
            toSnakeCase({
              ...result,
              workflowHint: {
                action: 'USE_STRUCTURED_QUESTIONS',
                sessionChunkId: result.session_chunk_id,
                mode: result.mode,
                instruction:
                  'Create drill questions using create_session_questions({ session_chunk_id, questions: [...] }), ' +
                  'then call submit_answer({ session_question_id, ... }) for each question. ' +
                  (result.mode === 'learning'
                    ? 'For learning mode: create 2-3 comprehension questions.'
                    : 'For retrieval mode: create 1 targeted recall question.') +
                  ' Do NOT call create_session_questions more than once per chunk.',
                nextStep: `create_session_questions({ session_chunk_id: "${result.session_chunk_id}", questions: [{ prompt_text: "..." }] })`,
              },
            })
          );
        }
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
        "The response field must contain the learner's exact words — no paraphrasing, sanitization, or censorship. " +
        'Server derives the quality score, records the attempt, and manages the two-attempt flow. ' +
        'When status is "recorded", check next.status for the next action: "teach" → present instruction, "complete" → end session, "blocked"/"error" → surface message.',
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
        'Quick-start a session with the most urgent topic. Picks the highest-urgency topic automatically and creates a single-topic session. ' +
        'If an active session exists with remaining chunks, it is resumed and status will be "resumed" with the next teaching step. ' +
        'If the active session is fully completed, it is auto-completed and a fresh session is started (status: "started"). ' +
        'For interactive topic selection, use what_to_learn_today instead. ' +
        'When status is "started" or "resumed", check first_chunk.status: "teach" means follow first_chunk.instruction verbatim; "blocked" or "error" means surface first_chunk.message and stop. ' +
        'Status "nothing_due" or "error" means the session could not start — surface the message and stop. ' +
        'After teaching, call submit_answer — check next.status for the next action (teach/complete/blocked/error).',
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
