import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import { z } from 'zod';
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
      inputSchema: {
        session_id: z.string().describe('The session ID to check status for'),
      },
    },
    async (input: { session_id: string }) => {
      try {
        const sessionId = input.session_id;

        const session = await ctx.getSessionById(sessionId);
        if (!session) {
          throw new Error(`Session ${sessionId} not found`);
        }
        const sessionInput = await ctx.convertSessionToInput(session.id);
        if (!sessionInput) {
          throw new Error(`Failed to convert session ${sessionId} to SessionInput format`);
        }

        logger.info(`Retrieved session ${sessionId} for status check`);

        const validated = ctx.validateSessionContext(sessionInput);
        if (!validated.success) {
          return toolError(`Failed to get session status: ${validated.error.message}`, {
            type: validated.error.type,
            message: validated.error.message,
          });
        }
        const result = ctx.getSessionStatus(validated.data);
        return toolJson(toSnakeCase(result));
      } catch (error) {
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
