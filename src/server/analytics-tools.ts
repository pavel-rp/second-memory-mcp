import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { computeDailyKpis, computeWindowRollup } from "../tools/analytics.js";

export function registerAnalyticsTools(server: McpServer): void {
        server.registerTool(
                "analytics_daily",
                {
                        title: "Calculate Daily KPIs",
                        description: "Compute daily analytics KPIs from review entries for a single day",
                        inputSchema: {
                                entries: z.array(
                                        z.object({
                                                date: z
                                                        .string()
                                                        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
                                                quality: z.number().min(0).max(5).optional().default(0),
                                                isNew: z.boolean().optional().default(false),
                                                topic: z.string().optional(),
                                                tags: z.array(z.string()).optional().default([]),
                                        })
                                ),
                        },
                },
                async ({ entries }: { entries: Array<{ date: string; quality?: number; isNew?: boolean; topic?: string; tags?: string[] }> }) => {
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
                        inputSchema: {
                                entries: z.array(
                                        z.object({
                                                date: z
                                                        .string()
                                                        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
                                                quality: z.number().min(0).max(5).optional().default(0),
                                                isNew: z.boolean().optional().default(false),
                                                topic: z.string().optional(),
                                                tags: z.array(z.string()).optional().default([]),
                                        })
                                ),
                                window: z.object({
                                        start: z
                                                .string()
                                                .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
                                        end: z
                                                .string()
                                                .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
                                }),
                                includeBreakdowns: z.boolean().optional().default(false),
                        },
                },
                async ({ entries, window, includeBreakdowns }: {
                        entries: Array<{ date: string; quality?: number; isNew?: boolean; topic?: string; tags?: string[] }>;
                        window: { start: string; end: string };
                        includeBreakdowns?: boolean;
                }) => {
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
