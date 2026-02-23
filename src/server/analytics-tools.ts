import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { computeDailyKpis, computeWindowRollup } from '../tools/analytics.js';
import {
  AnalyticsDailyInputSchema,
  AnalyticsDailyInputShape,
  type AnalyticsDailyInput,
  AnalyticsWindowInputSchema,
  AnalyticsWindowInputShape,
  type AnalyticsWindowInput,
} from '../types/analytics.js';
import { extractErrorMessage, toolError } from './tool-helpers.js';

export function registerAnalyticsTools(server: McpServer): void {
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
        const result = computeDailyKpis(entries);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
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
        const result = computeWindowRollup({ entries }, window, { includeBreakdowns });
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
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
