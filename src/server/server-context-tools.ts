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
        'Initialize your session with Second Memory. Returns domain rules, ' +
        'workflow guide, learner context snapshot, and a context_token required for all subsequent tool calls.\n\n' +
        'IMPORTANT: You must call this tool before calling any other Second Memory tool. ' +
        'The context_token returned here is a required parameter on every other tool.',
      inputSchema: z.object({}).shape,
    },
    async () =>
      withRequestContext('init_agent_context', async () => {
        try {
          const safeLearnerContext = ctx.buildLearnerContext().catch(err => {
            getRequestLogger().warn({ err }, 'buildLearnerContext failed — returning null');
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
          });
        }
      })
  );
}
