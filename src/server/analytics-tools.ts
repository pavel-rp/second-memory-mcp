import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../composition-root.js';
import {
  AnalyticsDailyInputSchema,
  AnalyticsDailyInputShape,
  type AnalyticsDailyInput,
  AnalyticsWindowInputSchema,
  AnalyticsWindowInputShape,
  type AnalyticsWindowInput,
} from '../domain/types/analytics.js';
import { extractErrorMessage, toolError, toolJson } from './tool-helpers.js';

export function registerAnalyticsTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'analytics_daily',
    {
      title: 'Calculate Daily KPIs',
      description: 'Compute daily analytics KPIs from review entries for a single day',
      inputSchema: AnalyticsDailyInputShape,
    },
    async (rawInput: unknown) => {
      const { entries }: AnalyticsDailyInput = AnalyticsDailyInputSchema.parse(rawInput);
      try {
        const result = ctx.computeDailyKpis(entries);
        return toolJson(result);
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`Failed to compute daily KPIs: ${msg}`, {
          type: 'computation',
          message: msg,
        });
      }
    }
  );

  server.registerTool(
    'analytics_window',
    {
      title: 'Calculate Window Analytics',
      description: 'Compute analytics for a date range with optional topic/tag breakdowns',
      inputSchema: AnalyticsWindowInputShape,
    },
    async (rawInput: unknown) => {
      const { entries, window, includeBreakdowns }: AnalyticsWindowInput =
        AnalyticsWindowInputSchema.parse(rawInput);
      try {
        const result = ctx.computeWindowRollup({ entries }, window, { includeBreakdowns });
        return toolJson(result);
      } catch (error) {
        const msg = extractErrorMessage(error);
        return toolError(`Failed to compute window analytics: ${msg}`, {
          type: 'computation',
          message: msg,
        });
      }
    }
  );
}
