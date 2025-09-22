import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
        calculateSessionProgress,
        determineNextPhase,
        checkSessionCompletion,
        validateSessionContext,
} from "../tools/session-manager.js";
import { ConversationManager } from "../tools/conversation-manager.js";
import { generateOrchestrationGuidance } from "../tools/orchestration-helper.js";
import { sessionToolInputSchema } from "./tool-helpers.js";

export function registerSessionTools(server: McpServer): void {
        server.registerTool(
                "session_progress",
                {
                        title: "Calculate Session Progress",
                        description: "Compute session progress metrics including completion percentages and quality averages",
                        inputSchema: sessionToolInputSchema,
                },
                async (sessionData: any) => {
                        try {
                                const validatedSession = validateSessionContext(sessionData);
                                const result = calculateSessionProgress(validatedSession);
                                return { content: [{ type: "text", text: JSON.stringify(result) }] };
                        } catch (error) {
                                const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
                                return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
                        }
                }
        );

        server.registerTool(
                "session_workflow",
                {
                        title: "Determine Session Workflow Phase",
                        description: "Analyze session state and provide workflow guidance for next learning phase",
                        inputSchema: sessionToolInputSchema,
                },
                async (sessionData: any) => {
                        try {
                                const validatedSession = validateSessionContext(sessionData);
                                const result = determineNextPhase(validatedSession);
                                return { content: [{ type: "text", text: JSON.stringify(result) }] };
                        } catch (error) {
                                const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
                                return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
                        }
                }
        );

        server.registerTool(
                "session_completion",
                {
                        title: "Check Session Completion",
                        description: "Analyze session metrics to determine if session should be completed",
                        inputSchema: sessionToolInputSchema,
                },
                async (sessionData: any) => {
                        try {
                                const validatedSession = validateSessionContext(sessionData);
                                const result = checkSessionCompletion(validatedSession);
                                return { content: [{ type: "text", text: JSON.stringify(result) }] };
                        } catch (error) {
                                const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
                                return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
                        }
                }
        );

        server.registerTool(
                "guided_learning_conversation",
                {
                        title: "Guided Learning Conversation",
                        description:
                                "Conduct a conversational 'teach me' session with zero friction. Handles session guidance, clarifying questions, and learning orchestration.",
                        inputSchema: {
                                intent: z.string().min(1),
                                context: z.any().optional(),
                                userInput: z.string().optional(),
                                sessionState: z.any().optional(),
                        },
                },
                async (input: any) => {
                        try {
                                const conversationManager = new ConversationManager();
                                const result = await conversationManager.conductLearningSession(input);
                                return { content: [{ type: "text", text: JSON.stringify(result) }] };
                        } catch (error) {
                                const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
                                return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
                        }
                }
        );

        server.registerTool(
                "orchestrate_learning_workflow",
                {
                        title: "Orchestrate Learning Workflow",
                        description:
                                "Provides step-by-step guidance for SQLite-based learning workflows. Use this when you need instructions on how to use list_learning_items_sqlite and recommendation tools together for optimal learning sessions.",
                        inputSchema: {
                                mode: z.enum(["guided", "explicit"]).optional(),
                                context: z
                                        .object({
                                                currentStep: z.number().optional(),
                                                errorMessage: z.string().optional(),
                                        })
                                        .optional(),
                        },
                },
                async (input: { mode?: "guided" | "explicit"; context?: { currentStep?: number; errorMessage?: string } }) => {
                        try {
                                const result = generateOrchestrationGuidance(input);
                                return { content: [{ type: "text", text: JSON.stringify(result) }] };
                        } catch (error) {
                                const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
                                return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
                        }
                }
        );
}
