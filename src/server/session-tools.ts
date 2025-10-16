import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
        calculateSessionProgress,
        determineNextPhase,
        checkSessionCompletion,
        validateSessionContext,
} from "../tools/session-manager.js";
import { ConversationManager } from "../tools/conversation-manager.js";
import { sessionToolInputSchema } from "./tool-helpers.js";
import { ConversationRequestSchema } from "../types/recommendations.js";

export function registerSessionTools(server: McpServer): void {
        server.registerTool(
                "session_progress",
                {
                        title: "Calculate Session Progress",
                        description: "Compute session progress metrics including completion percentages and quality averages",
                        inputSchema: sessionToolInputSchema,
                },
                async (sessionData: unknown) => {
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
                async (sessionData: unknown) => {
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
                async (sessionData: unknown) => {
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
                                context: z.unknown().optional(),
                                userInput: z.string().optional(),
                                sessionState: z.unknown().optional(),
                        },
                },
                async (input: unknown) => {
                        try {
                                const parsedInput = ConversationRequestSchema.parse(input);
                                const conversationManager = new ConversationManager();
                                const result = await conversationManager.conductLearningSession(parsedInput);
                                return { content: [{ type: "text", text: JSON.stringify(result) }] };
                        } catch (error) {
                                const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
                                return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
                        }
                }
        );
}
