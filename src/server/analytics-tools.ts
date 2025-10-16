import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { computeDailyKpis, computeWindowRollup } from "../tools/analytics.js";
import {
        AnalyticsDailyInputSchema,
        AnalyticsDailyInputShape,
        type AnalyticsDailyInput,
        AnalyticsWindowInputSchema,
        AnalyticsWindowInputShape,
        type AnalyticsWindowInput,
} from "../types/analytics.js";

export function registerAnalyticsTools(server: McpServer): void {
        server.registerTool(
                "analytics_daily",
                {
                        title: "Calculate Daily KPIs",
                        description: "Compute daily analytics KPIs from review entries for a single day",
                        inputSchema: AnalyticsDailyInputShape,
                },
                async (rawInput: unknown) => {
                        const { entries }: AnalyticsDailyInput = AnalyticsDailyInputSchema.parse(rawInput);
                        try {
                                const result = computeDailyKpis(entries);
                                return { content: [{ type: "text", text: JSON.stringify(result) }] };
                        } catch (error) {
                                const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
                                return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
                        }
                }
        );

        server.registerTool(
                "analytics_window",
                {
                        title: "Calculate Window Analytics",
                        description: "Compute analytics for a date range with optional topic/tag breakdowns",
                        inputSchema: AnalyticsWindowInputShape,
                },
                async (rawInput: unknown) => {
                        const { entries, window, includeBreakdowns }: AnalyticsWindowInput =
                                AnalyticsWindowInputSchema.parse(rawInput);
                        try {
                                const result = computeWindowRollup({ entries }, window, { includeBreakdowns });
                                return { content: [{ type: "text", text: JSON.stringify(result) }] };
                        } catch (error) {
                                const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
                                return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
                        }
                }
        );
}
