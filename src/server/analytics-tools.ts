import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import {
  AnalyticsDailyInputSchema,
  AnalyticsDailyInputShape,
  AnalyticsWindowInputSchema,
  AnalyticsWindowInputShape,
} from '../domain/types/analytics.js';
import { withRequestContext } from '../shared/logger.js';
import { extractErrorMessage, toolError, toolData } from './tool-helpers.js';

export function registerAnalyticsTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'analytics_daily',
    {
      title: 'Calculate Daily KPIs',
      description: 'Compute daily analytics KPIs from stored review history for a single day',
      inputSchema: AnalyticsDailyInputShape,
    },
    async (rawInput: unknown) =>
      withRequestContext('analytics_daily', async () => {
        const parsed = AnalyticsDailyInputSchema.parse(rawInput);
        try {
          const result = await ctx.computeDailyAnalytics(parsed.date);
          return toolData(result);
        } catch (error) {
          const msg = extractErrorMessage(error);
          return toolError(`Failed to compute daily KPIs: ${msg}`, {
            type: 'computation',
            message: msg,
          });
        }
      })
  );

  server.registerTool(
    'analytics_window',
    {
      title: 'Calculate Window Analytics',
      description: 'Compute analytics for a date range with optional topic/tag breakdowns',
      inputSchema: AnalyticsWindowInputShape,
    },
    async (rawInput: unknown) =>
      withRequestContext('analytics_window', async () => {
        const parsed = AnalyticsWindowInputSchema.parse(rawInput);
        try {
          const result = await ctx.computeWindowAnalytics(parsed.from, parsed.to, {
            includeBreakdowns: parsed.includeBreakdowns,
          });
          return toolData(result);
        } catch (error) {
          const msg = extractErrorMessage(error);
          return toolError(`Failed to compute window analytics: ${msg}`, {
            type: 'computation',
            message: msg,
          });
        }
      })
  );
}
