import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import { ZodError } from 'zod';
import {
  SessionStatusInputShape,
  SessionStatusInputSchema,
} from '../domain/types/session-management-tools.js';
import { toSnakeCase } from '../shared/case-convert.js';
import { getRequestLogger, withRequestContext } from '../shared/logger.js';
import { extractErrorMessage, toolError, toolData } from './tool-helpers.js';

export function registerSessionTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'session_status',
    {
      title: 'Get Session Status',
      description:
        'Get session progress metrics and completion evaluation. Returns chunks completed/remaining, quality, time elapsed, and a continue/complete/break recommendation.',
      inputSchema: SessionStatusInputShape,
    },
    async (input: unknown) =>
      withRequestContext('session_status', async () => {
        try {
          const { sessionId } = SessionStatusInputSchema.parse(input);

          const session = await ctx.getSessionById(sessionId);
          if (!session) {
            const msg = `Session ${sessionId} not found`;
            return toolError(`Failed to get session status: ${msg}`, {
              type: 'not_found',
              message: msg,
              retryable: false,
            });
          }
          const sessionInput = await ctx.convertSessionToInput(session.id);
          if (!sessionInput) {
            const msg = `Failed to convert session ${sessionId} to SessionInput format`;
            return toolError(`Failed to get session status: ${msg}`, {
              type: 'session',
              message: msg,
              retryable: false,
            });
          }

          getRequestLogger().info('Session retrieved and converted for status check', {
            sessionId,
          });

          const validated = ctx.validateSessionContext(sessionInput);
          if (!validated.success) {
            return toolError(`Failed to get session status: ${validated.error.message}`, {
              type: validated.error.type,
              message: validated.error.message,
              retryable: false,
            });
          }
          const result = ctx.getSessionStatus(validated.data);
          return toolData(toSnakeCase(result));
        } catch (error) {
          if (error instanceof ZodError) {
            const msg = extractErrorMessage(error);
            getRequestLogger().error('Invalid session_status input:', msg);
            return toolError(`Failed to get session status: ${msg}`, {
              type: 'validation',
              message: msg,
              retryable: false,
            });
          }
          getRequestLogger().error('Session status check failed:', error);
          return toolError('Failed to get session status: internal error', {
            type: 'database',
            message: 'An unexpected error occurred',
            retryable: true,
          });
        }
      })
  );
}
