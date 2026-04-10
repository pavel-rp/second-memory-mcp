import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AppContext } from '../composition-root.js';
import { DOMAIN_RULES } from '../shared/domain-rules.js';
import { WORKFLOW_SUMMARY } from '../shared/instructions.js';
import { getRequestLogger, withRequestContext } from '../shared/logger.js';
import { toSnakeCase } from '../shared/case-convert.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

export function registerServerContextTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'init_agent_context',
    {
      title: 'Initialize Agent Context',
      description:
        'Start and authenticate your Second Memory session. Initializes the agent context and returns a ' +
        'context_token — the authentication token required by every other Second Memory tool. ' +
        'MUST be called first before any other operation.\n\n' +
        'This is the entry point for all Second Memory workflows: learning, review, search, topic creation, ' +
        'and analytics. Call this to obtain your session token, initialize context, and begin authenticated access.',
      inputSchema: z.object({}).shape,
    },
    async () =>
      withRequestContext('init_agent_context', async () => {
        try {
          const safeLearnerContext = Promise.resolve()
            .then(() => ctx.buildLearnerContext())
            .catch(err => {
              getRequestLogger().warn('buildLearnerContext failed — returning null', err);
              return null;
            });

          const [contextToken, learnerContext] = await Promise.all([
            ctx.createContextToken(),
            safeLearnerContext,
          ]);

          return toolJson({
            context_token: contextToken,
            status: 'initialized',
            domain_rules: DOMAIN_RULES,
            workflow_summary: WORKFLOW_SUMMARY,
            learner_context: learnerContext ? toSnakeCase(learnerContext) : null,
          });
        } catch (error) {
          const msg = extractErrorMessage(error);
          return toolError(`Failed to initialize agent context: ${msg}`, {
            type: 'system',
            message: msg,
            retryable: true,
          });
        }
      })
  );
}
