import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import { ZodError } from 'zod';
import { SessionStatusInputShape, SessionStatusInputSchema } from '../domain/types/session.js';
import { toSnakeCase } from '../shared/case-convert.js';
import { logger } from '../shared/logger.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

export function registerSessionTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'session_status',
    {
      title: 'Get Session Status',
      description:
        'Get session progress metrics and completion evaluation. Returns chunks completed/remaining, quality, time elapsed, and a continue/complete/break recommendation.',
      inputSchema: SessionStatusInputShape,
    },
    async (input: unknown) => {
      try {
        const { sessionId } = SessionStatusInputSchema.parse(input);

        const session = await ctx.getSessionById(sessionId);
        if (!session) {
          return toolError(`Session ${sessionId} not found`, {
            type: 'not_found',
            message: `Session ${sessionId} not found`,
            retryable: false,
          });
        }
        const sessionInput = await ctx.convertSessionToInput(session.id);
        if (!sessionInput) {
          return toolError(`Failed to convert session ${sessionId} to SessionInput format`, {
            type: 'session',
            message: `Failed to convert session ${sessionId} to SessionInput format`,
            retryable: false,
          });
        }

        logger.info(`Retrieved session ${sessionId} for status check`);

        const validated = ctx.validateSessionContext(sessionInput);
        if (!validated.success) {
          return toolError(`Failed to get session status: ${validated.error.message}`, {
            type: validated.error.type,
            message: validated.error.message,
            retryable: false,
          });
        }
        const result = ctx.getSessionStatus(validated.data);
        return toolJson(toSnakeCase(result));
      } catch (error) {
        if (error instanceof ZodError) {
          const msg = extractErrorMessage(error);
          logger.error('Invalid session_status input:', error);
          return toolError(`Failed to get session status: ${msg}`, {
            type: 'validation',
            message: msg,
            retryable: false,
          });
        }
        const msg = extractErrorMessage(error);
        logger.error('Session status check failed:', error);
        return toolError(`Failed to get session status: ${msg}`, {
          type: 'session',
          message: msg,
          retryable: true,
        });
      }
    }
  );
}
