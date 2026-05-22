import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import { ZodError } from 'zod';
import {
  RecommendRemediationInputShape,
  RecommendRemediationInputSchema,
} from '../domain/types/remediation.js';
import { getRequestLogger, withRequestContext } from '../shared/logger.js';
import { toSnakeCase } from '../shared/case-convert.js';
import { extractErrorMessage, toolError, toolData } from './tool-helpers.js';

export function registerRemediationTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'recommend_remediation',
    {
      title: 'Recommend Remediation',
      description:
        'Analyze a completed session and return a structured remediation plan. ' +
        'Returns weak chunks (directly-failed + leeches), prerequisite chunks to revisit, ' +
        'a recommended next session (mode, chunk_ids, estimated_duration_minutes), and SR schedule delta. ' +
        'Writes gap notes on directly-failed chunks. Does NOT create a session — the consumer ' +
        'decides whether to call create_session with the recommended chunk_ids. ' +
        'All reason_code values are deterministic constants (WEAK_AFTER_ASSESSMENT, LEECH_THRESHOLD, ' +
        'PREREQ_LOW_EASE, NEW_MATERIAL). ' +
        'Accepts any completed session (assessment, learning, review, etc.).',
      inputSchema: RecommendRemediationInputShape,
    },
    async input =>
      withRequestContext('recommend_remediation', async () => {
        try {
          const parsed = RecommendRemediationInputSchema.parse(input);
          const result = await ctx.recommendRemediation(parsed.sessionId);
          if (!result.success) {
            return toolError(result.error.message, {
              type: result.error.type,
              message: result.error.message,
              retryable: result.error.retryable ?? false,
            });
          }
          return toolData(toSnakeCase(result.data));
        } catch (error) {
          const msg = extractErrorMessage(error);
          if (error instanceof ZodError) {
            getRequestLogger().error('Invalid recommend_remediation input:', error);
            return toolError(`Failed to recommend remediation: ${msg}`, {
              type: 'validation',
              message: msg,
              retryable: false,
            });
          }
          getRequestLogger().error('recommend_remediation failed:', error);
          return toolError(`Failed to recommend remediation: ${msg}`, {
            type: 'database',
            message: msg,
            retryable: true,
          });
        }
      })
  );
}
