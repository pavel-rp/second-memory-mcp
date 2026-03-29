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
import { getRequestLogger, withRequestContext } from '../shared/logger.js';
import { toSnakeCase } from '../shared/case-convert.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

export function registerTeachingTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'teach_next',
    {
      title: 'Teach Next Chunk',
      description:
        'Get the next teaching instruction for the active learning session. ' +
        'Completes the current in-progress chunk (if any with recorded attempts): aggregates question qualities, ' +
        'runs spaced-repetition update, marks it completed, and includes review_update in the response. ' +
        'Then selects the next chunk, hydrates the appropriate prompt, and returns a structured teaching instruction. ' +
        'No input needed — reads the active session. ' +
        "After presenting the instruction and receiving the learner's answer, call submit_answer " +
        'with prompt_text, chunk_ids, response, pass/fail assessment, feedback, and time_spent_ms. ' +
        'A progression gate requires at least one submit_answer before advancing to the next chunk. ' +
        "When submit_answer returns status 'recorded', call teach_next to get the next action: 'teach' → present instruction, 'complete' → end session, 'blocked'/'error' → surface message.",
      inputSchema: z.object({}).shape,
    },
    async () =>
      withRequestContext('teach_next', async () => {
        try {
          const result = await ctx.getNextTeachingStep();
          if (result.status === 'teach') {
            return toolJson(
              toSnakeCase({
                ...result,
                workflowHint: {
                  action: 'USE_INLINE_SUBMIT',
                  sessionId: result.session_id,
                  chunkId: result.chunk_id,
                  mode: result.mode,
                  instruction: [
                    'Per-chunk probing algorithm:',
                    'Ask a question at the current taxonomy level (Recall → Explain/Apply → Analyze/Create).',
                    'If correct → escalate one level if time permits → move to next chunk.',
                    'If wrong → give feedback → ask another question at the same level (max 3 attempts per level → move on).',
                    'Guardrails: min 1 Recall + 1 Explain question for non-trivial chunks; max 5–7 attempts per chunk.',
                    result.mode === 'learning'
                      ? 'Learning mode: start at Recall, escalate through levels.'
                      : 'Retrieval mode: start at Recall, escalate if mastery target allows.',
                    'Then call submit_answer({ prompt_text, chunk_ids, response, passed, feedback, time_spent_ms }).',
                    'If a question fails, retry with submit_answer({ session_question_id, ... }) using the session_question_id from the response.',
                  ].join(' '),
                  nextStep: `submit_answer({ prompt_text: "...", chunk_ids: ["${result.chunk_id}"], response: "...", passed: true/false, feedback: "...", time_spent_ms: ... })`,
                },
              })
            );
          }
          return toolJson(result);
        } catch (error) {
          const msg = extractErrorMessage(error);
          getRequestLogger().error('teach_next failed:', error);
          return toolError(`Failed to get next teaching step: ${msg}`, {
            type: 'session',
            message: msg,
            retryable: true,
          });
        }
      })
  );

  server.registerTool(
    'submit_answer',
    {
      title: 'Submit Answer',
      description:
        "Submit the learner's answer for the current in-progress chunk. " +
        'Records the attempt but does NOT complete the chunk or trigger spaced-repetition updates — ' +
        'chunk completion happens when teach_next is called to advance. ' +
        'Two modes: (1) Inline question creation — provide prompt_text + chunk_ids to atomically create a question and record the first attempt. ' +
        '(2) Retry — provide session_question_id to record a subsequent attempt on an existing question. ' +
        "The response field must contain the learner's exact words — no paraphrasing, sanitization, or censorship. " +
        'Agent provides quality (0–5) and question_type per the quality rubric. ' +
        'passed is optional — derived from quality >= 3 when omitted. ' +
        'Returns session_question_id in retry and recorded responses for retry reference. ' +
        'When status is "recorded", call teach_next to get the next action.',
      inputSchema: SubmitAnswerInputShape,
    },
    async input =>
      withRequestContext('submit_answer', async () => {
        try {
          const parsed = SubmitAnswerInputSchema.parse(input);
          const result = await ctx.submitAnswer(parsed);
          return toolJson(result);
        } catch (error) {
          const msg = extractErrorMessage(error);
          if (error instanceof ZodError) {
            getRequestLogger().error('Invalid submit_answer input:', error);
            return toolError(`Failed to submit answer: ${msg}`, {
              type: 'validation',
              message: msg,
              retryable: false,
            });
          }
          getRequestLogger().error('submit_answer failed:', error);
          return toolError(`Failed to submit answer: ${msg}`, {
            type: 'session',
            message: msg,
            retryable: true,
          });
        }
      })
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
        'After teaching, call submit_answer. When status is "recorded", call teach_next to get the next action.',
      inputSchema: StartLearningInputShape,
    },
    async input =>
      withRequestContext('start_learning', async () => {
        try {
          const parsed = StartLearningInputSchema.parse(input);
          const result = await ctx.startLearning(parsed);
          return toolJson(result);
        } catch (error) {
          const msg = extractErrorMessage(error);
          if (error instanceof ZodError) {
            getRequestLogger().error('Invalid start_learning input:', error);
            return toolError(`Failed to start learning: ${msg}`, {
              type: 'validation',
              message: msg,
              retryable: false,
            });
          }
          getRequestLogger().error('start_learning failed:', error);
          return toolError(`Failed to start learning: ${msg}`, {
            type: 'session',
            message: msg,
            retryable: true,
          });
        }
      })
  );

  server.registerTool(
    'create_session_questions',
    {
      title: 'Create Session Questions',
      description:
        'Create explicit drill questions for a session. ' +
        'Each question maps to one or more chunk_ids via junction table. ' +
        'Teaching mode: exactly 1 chunk_id per question (chunk must be in_progress). ' +
        'Assessment mode: 1+ chunk_ids per question (cross-chunk evaluation). ' +
        'Returns the created question IDs. ' +
        'Use submit_answer with session_question_id to answer each question.',
      inputSchema: CreateSessionQuestionsInputShape,
    },
    async input =>
      withRequestContext('create_session_questions', async () => {
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
            getRequestLogger().error('Invalid create_session_questions input:', error);
            return toolError(`Failed to create session questions: ${msg}`, {
              type: 'validation',
              message: msg,
              retryable: false,
            });
          }
          getRequestLogger().error('create_session_questions failed:', error);
          return toolError(`Failed to create session questions: ${msg}`, {
            type: 'session',
            message: msg,
            retryable: true,
          });
        }
      })
  );
}
