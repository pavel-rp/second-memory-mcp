import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import crypto from "node:crypto";
import {
	createSession,
	getActiveSession,
	completeSession,
	getSessionById,
	convertSessionToSessionInput,
	createSessionChunk,
	type CreateSessionInput,
	type CreateSessionChunkInput,
} from "../services/sessions.js";
import { SessionModeSchema } from "../types/session.js";
import { logger } from "../utils/logger.js";

// Input schemas for session management tools
const CreateSessionInputSchema = z.object({
	topicId: z.string().optional(),
	chunkIds: z.array(z.string()).optional(),
	mode: SessionModeSchema,
	estimatedDuration: z.number().min(1).max(480).optional(), // 1-480 minutes
});

const CompleteSessionInputSchema = z.object({
	sessionId: z.string().min(1),
	feedback: z.string().optional(),
});

const GetSessionInputSchema = z.object({
	sessionId: z.string().min(1).optional(), // Optional for get_active_session
});

const CreateSessionChunkInputSchema = z.object({
	sessionId: z.string().min(1),
	chunkId: z.string().min(1),
	status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
	attempts: z.array(z.object({
		timestamp: z.number(),
		quality: z.number().min(0).max(5).optional(),
		timeSpentMs: z.number().min(0),
		completed: z.boolean(),
	})).optional(),
	qualityScores: z.array(z.number().min(0).max(5)).optional(),
	timeSpentMs: z.number().min(0).default(0),
});

// Return type schemas
const CreateSessionResultSchema = z.object({
	sessionId: z.string(),
	status: z.literal("created"),
	message: z.string(),
});

const GetActiveSessionResultSchema = z.object({
	session: z.any().nullable(), // SessionInput or null
	status: z.enum(["found", "not_found"]),
});

const CompleteSessionResultSchema = z.object({
	sessionId: z.string(),
	status: z.literal("completed"),
	finalMetrics: z.object({
		duration: z.number(),
		chunksCompleted: z.number(),
		averageQuality: z.number(),
	}),
	message: z.string(),
});

/**
 * Registers session management MCP tools for creating, tracking, and completing learning sessions.
 * 
 * This function registers the following tools:
 * - create_session: Create a new learning session with specific parameters
 * - get_active_session: Retrieve the most recently created active session
 * - complete_session: Mark a session as completed with optional feedback
 * - create_session_chunk: Create session chunks to track learning progress
 * 
 * @param server - The MCP server instance to register tools with
 */
export function registerSessionManagementTools(server: McpServer): void {
	server.registerTool(
		"create_session",
		{
			title: "Create Learning Session",
			description: "Create a new learning session with specific parameters for structured learning",
			inputSchema: CreateSessionInputSchema.shape,
		},
		async (input: unknown) => {
			try {
				const validatedInput = CreateSessionInputSchema.parse(input);
				const now = Date.now();
				const sessionId = crypto.randomUUID();

				const sessionInput: CreateSessionInput = {
					id: sessionId,
					topicId: validatedInput.topicId,
					chunkIds: validatedInput.chunkIds,
					mode: validatedInput.mode,
					estimatedDuration: validatedInput.estimatedDuration,
					startTime: now,
					createdAt: now,
					updatedAt: now,
				};

				await createSession(sessionInput);

				const result = CreateSessionResultSchema.parse({
					sessionId,
					status: "created" as const,
					message: `Session created successfully with mode: ${validatedInput.mode}`,
				});

				logger.info(`Created session ${sessionId} with mode ${validatedInput.mode}`);
				return { content: [{ type: "text", text: JSON.stringify(result) }] };
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
				logger.error("Failed to create session:", error);
				return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
			}
		}
	);

	server.registerTool(
		"get_active_session",
		{
			title: "Get Active Session",
			description: "Retrieve the current active learning session to continue where you left off",
			inputSchema: z.object({}).shape, // No input required
		},
		async () => {
			try {
				const activeSession = await getActiveSession();

				if (!activeSession) {
					const result = GetActiveSessionResultSchema.parse({
						session: null,
						status: "not_found" as const,
					});
					return { content: [{ type: "text", text: JSON.stringify(result) }] };
				}

				// Convert database session to SessionInput format (includes chunks)
				const sessionInput = await convertSessionToSessionInput(activeSession.id);

				if (!sessionInput) {
					const result = GetActiveSessionResultSchema.parse({
						session: null,
						status: "not_found" as const,
					});
					return { content: [{ type: "text", text: JSON.stringify(result) }] };
				}

				const result = GetActiveSessionResultSchema.parse({
					session: sessionInput,
					status: "found" as const,
				});

				logger.info(`Retrieved active session ${activeSession.id}`);
				return { content: [{ type: "text", text: JSON.stringify(result) }] };
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
				logger.error("Failed to get active session:", error);
				return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
			}
		}
	);

	server.registerTool(
		"get_session",
		{
			title: "Get Session by ID",
			description: "Retrieve a specific learning session by its ID",
			inputSchema: GetSessionInputSchema.shape,
		},
		async (input: unknown) => {
			try {
				const validatedInput = GetSessionInputSchema.parse(input);

				if (!validatedInput.sessionId) {
					throw new Error("Session ID is required");
				}

				const session = await getSessionById(validatedInput.sessionId);

				if (!session) {
					const result = GetActiveSessionResultSchema.parse({
						session: null,
						status: "not_found" as const,
					});
					return { content: [{ type: "text", text: JSON.stringify(result) }] };
				}

				// Convert database session to SessionInput format (includes chunks)
				const sessionInput = await convertSessionToSessionInput(validatedInput.sessionId);

				if (!sessionInput) {
					const result = GetActiveSessionResultSchema.parse({
						session: null,
						status: "not_found" as const,
					});
					return { content: [{ type: "text", text: JSON.stringify(result) }] };
				}

				const result = GetActiveSessionResultSchema.parse({
					session: sessionInput,
					status: "found" as const,
				});

				logger.info(`Retrieved session ${validatedInput.sessionId}`);
				return { content: [{ type: "text", text: JSON.stringify(result) }] };
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
				logger.error("Failed to get session:", error);
				return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
			}
		}
	);

	server.registerTool(
		"complete_session",
		{
			title: "Complete Learning Session",
			description: "Complete a learning session with optional feedback and final metrics",
			inputSchema: CompleteSessionInputSchema.shape,
		},
		async (input: unknown) => {
			try {
				const validatedInput = CompleteSessionInputSchema.parse(input);

				// Get session data before completion to calculate metrics
				const session = await getSessionById(validatedInput.sessionId);
				if (!session) {
					throw new Error(`Session ${validatedInput.sessionId} not found`);
				}

				// Complete the session
				const changes = await completeSession(validatedInput.sessionId, validatedInput.feedback);

				if (changes === 0) {
					throw new Error(`Failed to complete session ${validatedInput.sessionId}`);
				}

				// Get updated session data after completion to calculate metrics
				const updatedSession = await getSessionById(validatedInput.sessionId);
				if (!updatedSession) {
					throw new Error(`Session ${validatedInput.sessionId} not found after completion`);
				}

				// Calculate final metrics from completed session data
				const duration = updatedSession.endTime ? updatedSession.endTime - updatedSession.startTime : 0;
				const chunksCompleted = 0; // Will be calculated from session chunks in future enhancement
				const averageQuality = 0; // Will be calculated from session chunks in future enhancement

				const result = CompleteSessionResultSchema.parse({
					sessionId: validatedInput.sessionId,
					status: "completed" as const,
					finalMetrics: {
						duration,
						chunksCompleted,
						averageQuality,
					},
					message: `Session completed successfully${validatedInput.feedback ? " with feedback" : ""}`,
				});

				logger.info(`Completed session ${validatedInput.sessionId} with feedback: ${validatedInput.feedback || "none"}`);
				return { content: [{ type: "text", text: JSON.stringify(result) }] };
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
				logger.error("Failed to complete session:", error);
				return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
			}
		}
	);

	// Create session chunk tool
	server.registerTool(
		"create_session_chunk",
		{
			title: "Create Session Chunk",
			description: "Create a new session chunk to track learning progress for a specific chunk within a session",
			inputSchema: CreateSessionChunkInputSchema.shape,
		},
		async (input: unknown) => {
			try {
				const validatedInput = CreateSessionChunkInputSchema.parse(input);
				const now = Date.now();
				
				const createSessionChunkInput: CreateSessionChunkInput = {
					id: crypto.randomUUID(),
					sessionId: validatedInput.sessionId,
					chunkId: validatedInput.chunkId,
					status: validatedInput.status,
					attemptsJson: validatedInput.attempts ? JSON.stringify(validatedInput.attempts) : undefined,
					qualityScoresJson: validatedInput.qualityScores ? JSON.stringify(validatedInput.qualityScores) : undefined,
					timeSpentMs: validatedInput.timeSpentMs,
					createdAt: now,
					updatedAt: now,
				};
				
				const sessionChunk = await createSessionChunk(createSessionChunkInput);
				
				const result = {
					sessionChunkId: sessionChunk.id,
					status: "created" as const,
					message: "Session chunk created successfully",
				};

				logger.info(`Created session chunk ${sessionChunk.id} for session ${validatedInput.sessionId}`);
				return { content: [{ type: "text", text: JSON.stringify(result) }] };
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
				logger.error("Failed to create session chunk:", error);
				return { content: [{ type: "text", text: JSON.stringify({ error: errorMsg }) }] };
			}
		}
	);
}
