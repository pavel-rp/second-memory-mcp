import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import { z } from 'zod';
import { SessionInputSchema } from '../domain/types/session.js';
import { toCamelCaseKeysExcept, toSnakeCase } from '../shared/case-convert.js';
import { logger } from '../shared/logger.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

// Plain shape for MCP tool registration
const SessionAnalysisInputShape = {
  session_id: z.string().optional(),
  session_data: SessionInputSchema.optional(),
} as const;

// Refined schema for runtime validation
const SessionAnalysisInputSchema = z
  .object(SessionAnalysisInputShape)
  .refine(data => data.session_id || data.session_data, {
    message: 'Either session_id or session_data must be provided',
  })
  .transform(toCamelCaseKeysExcept(new Set(['session_data'])));

export function registerSessionTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'session_progress',
    {
      title: 'Calculate Session Progress',
      description:
        'Compute session progress metrics including completion percentages and quality averages. Accepts either session_id (string) or session_data (SessionInput object) for backward compatibility.',
      inputSchema: SessionAnalysisInputShape,
    },
    async (input: unknown) => {
      try {
        const validatedInput = SessionAnalysisInputSchema.parse(input);
        let sessionData: unknown;

        if (validatedInput.sessionId) {
          const session = await ctx.getSessionById(validatedInput.sessionId);
          if (!session) {
            throw new Error(`Session ${validatedInput.sessionId} not found`);
          }
          const sessionInput = await ctx.convertSessionToInput(session.id);
          if (!sessionInput) {
            throw new Error(
              `Failed to convert session ${validatedInput.sessionId} to SessionInput format`
            );
          }
          sessionData = sessionInput;
          logger.info(
            `Retrieved session ${validatedInput.sessionId} from database for progress calculation`
          );
        } else if (validatedInput.sessionData) {
          sessionData = validatedInput.sessionData;
          logger.info('Using provided session data for progress calculation');
        } else {
          throw new Error('Either session_id or session_data must be provided');
        }

        const validated = ctx.validateSessionContext(sessionData);
        if (!validated.success) {
          return toolError(`Failed to calculate session progress: ${validated.error.message}`, {
            type: validated.error.type,
            message: validated.error.message,
          });
        }
        const result = ctx.calculateSessionProgress(validated.data);
        return toolJson(toSnakeCase(result));
      } catch (error) {
        const msg = extractErrorMessage(error);
        logger.error('Session progress calculation failed:', error);
        return toolError(`Failed to calculate session progress: ${msg}`, {
          type: 'session',
          message: msg,
        });
      }
    }
  );

  server.registerTool(
    'session_workflow',
    {
      title: 'Determine Session Workflow Phase',
      description:
        'Analyze session state and provide workflow guidance for next learning phase. Accepts either session_id (string) or session_data (SessionInput object) for backward compatibility.',
      inputSchema: SessionAnalysisInputShape,
    },
    async (input: unknown) => {
      try {
        const validatedInput = SessionAnalysisInputSchema.parse(input);
        let sessionData: unknown;

        if (validatedInput.sessionId) {
          const session = await ctx.getSessionById(validatedInput.sessionId);
          if (!session) {
            throw new Error(`Session ${validatedInput.sessionId} not found`);
          }
          const sessionInput = await ctx.convertSessionToInput(session.id);
          if (!sessionInput) {
            throw new Error(
              `Failed to convert session ${validatedInput.sessionId} to SessionInput format`
            );
          }
          sessionData = sessionInput;
          logger.info(
            `Retrieved session ${validatedInput.sessionId} from database for workflow analysis`
          );
        } else if (validatedInput.sessionData) {
          sessionData = validatedInput.sessionData;
          logger.info('Using provided session data for workflow analysis');
        } else {
          throw new Error('Either session_id or session_data must be provided');
        }

        const validated = ctx.validateSessionContext(sessionData);
        if (!validated.success) {
          return toolError(
            `Failed to determine session workflow phase: ${validated.error.message}`,
            {
              type: validated.error.type,
              message: validated.error.message,
            }
          );
        }
        const result = ctx.determineNextPhase(validated.data);
        return toolJson(toSnakeCase(result));
      } catch (error) {
        const msg = extractErrorMessage(error);
        logger.error('Session workflow analysis failed:', error);
        return toolError(`Failed to determine session workflow phase: ${msg}`, {
          type: 'session',
          message: msg,
        });
      }
    }
  );

  server.registerTool(
    'session_completion',
    {
      title: 'Check Session Completion',
      description:
        'Analyze session metrics to determine if session should be completed. Accepts either session_id (string) or session_data (SessionInput object) for backward compatibility.',
      inputSchema: SessionAnalysisInputShape,
    },
    async (input: unknown) => {
      try {
        const validatedInput = SessionAnalysisInputSchema.parse(input);
        let sessionData: unknown;

        if (validatedInput.sessionId) {
          const session = await ctx.getSessionById(validatedInput.sessionId);
          if (!session) {
            throw new Error(`Session ${validatedInput.sessionId} not found`);
          }
          const sessionInput = await ctx.convertSessionToInput(session.id);
          if (!sessionInput) {
            throw new Error(
              `Failed to convert session ${validatedInput.sessionId} to SessionInput format`
            );
          }
          sessionData = sessionInput;
          logger.info(
            `Retrieved session ${validatedInput.sessionId} from database for completion analysis`
          );
        } else if (validatedInput.sessionData) {
          sessionData = validatedInput.sessionData;
          logger.info('Using provided session data for completion analysis');
        } else {
          throw new Error('Either session_id or session_data must be provided');
        }

        const validated = ctx.validateSessionContext(sessionData);
        if (!validated.success) {
          return toolError(`Failed to check session completion: ${validated.error.message}`, {
            type: validated.error.type,
            message: validated.error.message,
          });
        }
        const result = ctx.checkSessionCompletion(validated.data);
        return toolJson(toSnakeCase(result));
      } catch (error) {
        const msg = extractErrorMessage(error);
        logger.error('Session completion analysis failed:', error);
        return toolError(`Failed to check session completion: ${msg}`, {
          type: 'session',
          message: msg,
        });
      }
    }
  );
}
