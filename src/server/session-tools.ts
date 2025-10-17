import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
        calculateSessionProgress,
        determineNextPhase,
        checkSessionCompletion,
        validateSessionContext,
} from "../tools/session-manager.js";
import { ConversationManager } from "../tools/conversation-manager.js";
import { getSessionById, convertSessionToSessionInput } from "../services/sessions.js";
import {
        ConversationRequestInput,
        ConversationRequestSchema,
        ConversationRequestShape,
} from "../types/recommendations.js";
import { logger } from "../utils/logger.js";

// Enhanced input schema that accepts either sessionId or SessionInput
const SessionAnalysisInputSchema = z.object({
	sessionId: z.string().optional(),
	sessionData: z.any().optional(), // SessionInput object
}).refine(
	(data) => data.sessionId || data.sessionData,
	{
		message: "Either sessionId or sessionData must be provided",
	}
);

// Create a shape schema for MCP tool registration
const SessionAnalysisInputShape = z.object({
	sessionId: z.string().optional(),
	sessionData: z.any().optional(),
});

export function registerSessionTools(server: McpServer): void {
        server.registerTool(
                "session_progress",
                {
                        title: "Calculate Session Progress",
                        description: "Compute session progress metrics including completion percentages and quality averages. Accepts either sessionId (string) or sessionData (SessionInput object) for backward compatibility.",
                        inputSchema: SessionAnalysisInputShape.shape,
                },
                async (input: unknown) => {
                        try {
                                const validatedInput = SessionAnalysisInputSchema.parse(input);
                                let sessionData: unknown;

                                if (validatedInput.sessionId) {
                                        // Retrieve session from database
                                        const session = await getSessionById(validatedInput.sessionId);
                                        if (!session) {
                                                throw new Error(`Session ${validatedInput.sessionId} not found`);
                                        }
                                        
                                        const sessionInput = await convertSessionToSessionInput(session.id);
                                        if (!sessionInput) {
                                                throw new Error(`Failed to convert session ${validatedInput.sessionId} to SessionInput format`);
                                        }
                                        
                                        sessionData = sessionInput;
                                        logger.info(`Retrieved session ${validatedInput.sessionId} from database for progress calculation`);
                                } else if (validatedInput.sessionData) {
                                        // Use provided session data directly
                                        sessionData = validatedInput.sessionData;
                                        logger.info("Using provided session data for progress calculation");
                                } else {
                                        throw new Error("Either sessionId or sessionData must be provided");
                                }

                                const validatedSession = validateSessionContext(sessionData);
                                const result = calculateSessionProgress(validatedSession);
                                return { content: [{ type: "text", text: JSON.stringify(result) }] };
                        } catch (error) {
                                const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
                                logger.error("Session progress calculation failed:", error);
                                return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
                        }
                }
        );

        server.registerTool(
                "session_workflow",
                {
                        title: "Determine Session Workflow Phase",
                        description: "Analyze session state and provide workflow guidance for next learning phase. Accepts either sessionId (string) or sessionData (SessionInput object) for backward compatibility.",
                        inputSchema: SessionAnalysisInputShape.shape,
                },
                async (input: unknown) => {
                        try {
                                const validatedInput = SessionAnalysisInputSchema.parse(input);
                                let sessionData: unknown;

                                if (validatedInput.sessionId) {
                                        // Retrieve session from database
                                        const session = await getSessionById(validatedInput.sessionId);
                                        if (!session) {
                                                throw new Error(`Session ${validatedInput.sessionId} not found`);
                                        }
                                        
                                        const sessionInput = await convertSessionToSessionInput(session.id);
                                        if (!sessionInput) {
                                                throw new Error(`Failed to convert session ${validatedInput.sessionId} to SessionInput format`);
                                        }
                                        
                                        sessionData = sessionInput;
                                        logger.info(`Retrieved session ${validatedInput.sessionId} from database for workflow analysis`);
                                } else if (validatedInput.sessionData) {
                                        // Use provided session data directly
                                        sessionData = validatedInput.sessionData;
                                        logger.info("Using provided session data for workflow analysis");
                                } else {
                                        throw new Error("Either sessionId or sessionData must be provided");
                                }

                                const validatedSession = validateSessionContext(sessionData);
                                const result = determineNextPhase(validatedSession);
                                return { content: [{ type: "text", text: JSON.stringify(result) }] };
                        } catch (error) {
                                const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
                                logger.error("Session workflow analysis failed:", error);
                                return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
                        }
                }
        );

        server.registerTool(
                "session_completion",
                {
                        title: "Check Session Completion",
                        description: "Analyze session metrics to determine if session should be completed. Accepts either sessionId (string) or sessionData (SessionInput object) for backward compatibility.",
                        inputSchema: SessionAnalysisInputShape.shape,
                },
                async (input: unknown) => {
                        try {
                                const validatedInput = SessionAnalysisInputSchema.parse(input);
                                let sessionData: unknown;

                                if (validatedInput.sessionId) {
                                        // Retrieve session from database
                                        const session = await getSessionById(validatedInput.sessionId);
                                        if (!session) {
                                                throw new Error(`Session ${validatedInput.sessionId} not found`);
                                        }
                                        
                                        const sessionInput = await convertSessionToSessionInput(session.id);
                                        if (!sessionInput) {
                                                throw new Error(`Failed to convert session ${validatedInput.sessionId} to SessionInput format`);
                                        }
                                        
                                        sessionData = sessionInput;
                                        logger.info(`Retrieved session ${validatedInput.sessionId} from database for completion analysis`);
                                } else if (validatedInput.sessionData) {
                                        // Use provided session data directly
                                        sessionData = validatedInput.sessionData;
                                        logger.info("Using provided session data for completion analysis");
                                } else {
                                        throw new Error("Either sessionId or sessionData must be provided");
                                }

                                const validatedSession = validateSessionContext(sessionData);
                                const result = checkSessionCompletion(validatedSession);
                                return { content: [{ type: "text", text: JSON.stringify(result) }] };
                        } catch (error) {
                                const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
                                logger.error("Session completion analysis failed:", error);
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
                        inputSchema: ConversationRequestShape,
                },
                async (input: unknown) => {
                        try {
                                const parsedInput: ConversationRequestInput = ConversationRequestSchema.parse(input);
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
