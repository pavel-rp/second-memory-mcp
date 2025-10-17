import { eq, desc } from "drizzle-orm";
import { getSql } from "../db/operations.js";
import { learningSessions, sessionChunks, type LearningSessionRow, type SessionChunkRow, type NewLearningSessionRow, type NewSessionChunkRow } from "../db/schema.js";
import { SessionInput, SessionMode } from "../types/session.js";
import { logger } from "../utils/logger.js";

// Input types for session operations
export type CreateSessionInput = {
	id: string;
	topicId?: string;
	chunkIds?: string[];
	mode: SessionMode;
	estimatedDuration?: number;
	startTime: number; // epoch ms
	createdAt: number;
	updatedAt: number;
};

export type UpdateSessionInput = {
	status?: "active" | "completed";
	endTime?: number; // epoch ms
	feedback?: string;
	updatedAt: number;
};

export type CreateSessionChunkInput = {
	id: string;
	sessionId: string;
	chunkId: string;
	status?: "pending" | "in_progress" | "completed";
	attemptsJson?: string; // JSON string of ChunkAttempt[]
	qualityScoresJson?: string; // JSON string of number[]
	timeSpentMs?: number;
	createdAt: number;
	updatedAt: number;
};

export type UpdateSessionChunkInput = {
	status?: "pending" | "in_progress" | "completed";
	attemptsJson?: string;
	qualityScoresJson?: string;
	timeSpentMs?: number;
	updatedAt: number;
};

// Session service functions
export async function createSession(input: CreateSessionInput): Promise<void> {
	const db = getSql();
	const sessionData: NewLearningSessionRow = {
		id: input.id,
		topicId: input.topicId || null,
		chunkIds: input.chunkIds ? JSON.stringify(input.chunkIds) : null,
		mode: input.mode,
		estimatedDuration: input.estimatedDuration || null,
		status: "active",
		startTime: input.startTime,
		endTime: null,
		feedback: null,
		createdAt: input.createdAt,
		updatedAt: input.updatedAt,
	};
	
	await db.insert(learningSessions).values(sessionData).run();
	logger.info(`Created session ${input.id} with mode ${input.mode}`);
}

export async function getSessionById(id: string): Promise<LearningSessionRow | null> {
	const db = getSql();
	return db.select().from(learningSessions).where(eq(learningSessions.id, id)).get() || null;
}

export async function getActiveSession(): Promise<LearningSessionRow | null> {
	const db = getSql();
	return db.select()
		.from(learningSessions)
		.where(eq(learningSessions.status, "active"))
		.orderBy(desc(learningSessions.createdAt))
		.get() || null;
}

export async function updateSession(id: string, changes: UpdateSessionInput): Promise<number> {
	const db = getSql();
	const res = db.update(learningSessions)
		.set(changes)
		.where(eq(learningSessions.id, id))
		.run();
	return res.changes ?? 0;
}

export async function completeSession(id: string, feedback?: string): Promise<number> {
	const now = Date.now();
	const changes: UpdateSessionInput = {
		status: "completed",
		endTime: now,
    feedback: feedback || undefined,
		updatedAt: now,
	};
	
	const result = await updateSession(id, changes);
	if (result > 0) {
		logger.info(`Completed session ${id} with feedback: ${feedback || "none"}`);
	}
	return result;
}

export async function deleteSession(id: string): Promise<number> {
	const db = getSql();
	const res = db.delete(learningSessions).where(eq(learningSessions.id, id)).run();
	return res.changes ?? 0;
}

// Session chunk functions
export async function createSessionChunk(input: CreateSessionChunkInput): Promise<NewSessionChunkRow> {
	const db = getSql();
	const chunkData: NewSessionChunkRow = {
		id: input.id,
		sessionId: input.sessionId,
		chunkId: input.chunkId,
		status: input.status || "pending",
		attemptsJson: input.attemptsJson || null,
		qualityScoresJson: input.qualityScoresJson || null,
		timeSpentMs: input.timeSpentMs || 0,
		createdAt: input.createdAt,
		updatedAt: input.updatedAt,
	};
	
	await db.insert(sessionChunks).values(chunkData).run();
	logger.info(`Created session chunk ${input.id} for session ${input.sessionId}`);
	return chunkData;
}

export async function getSessionChunks(sessionId: string): Promise<SessionChunkRow[]> {
	const db = getSql();
	return db.select().from(sessionChunks).where(eq(sessionChunks.sessionId, sessionId)).all();
}

export async function getSessionChunkById(id: string): Promise<SessionChunkRow | null> {
	const db = getSql();
	return db.select().from(sessionChunks).where(eq(sessionChunks.id, id)).get() || null;
}

export async function updateSessionChunk(id: string, changes: UpdateSessionChunkInput): Promise<number> {
	const db = getSql();
	const res = db.update(sessionChunks)
		.set(changes)
		.where(eq(sessionChunks.id, id))
		.run();
	return res.changes ?? 0;
}

export async function deleteSessionChunk(id: string): Promise<number> {
	const db = getSql();
	const res = db.delete(sessionChunks).where(eq(sessionChunks.id, id)).run();
	return res.changes ?? 0;
}

// Utility functions for session state management
export async function getSessionWithChunks(sessionId: string): Promise<{
	session: LearningSessionRow | null;
	chunks: SessionChunkRow[];
}> {
	const session = await getSessionById(sessionId);
	const chunks = await getSessionChunks(sessionId);
	return { session, chunks };
}

export async function convertSessionToSessionInput(sessionId: string): Promise<SessionInput | null> {
	const { session, chunks } = await getSessionWithChunks(sessionId);
	
	if (!session) {
		return null;
	}

	// Convert database chunks to SessionInput format
	const sessionChunks: SessionInput["chunks"] = chunks.map(chunk => {
		let attempts: SessionInput["chunks"][0]["attempts"] = [];
		let qualityScores: number[] = [];
		
		try {
			if (chunk.attemptsJson) {
				attempts = JSON.parse(chunk.attemptsJson);
			}
			if (chunk.qualityScoresJson) {
				qualityScores = JSON.parse(chunk.qualityScoresJson);
			}
		} catch (error) {
			logger.error(`Failed to parse JSON for session chunk ${chunk.id}:`, error);
		}

		return {
			chunk_id: chunk.chunkId,
			title: "", // Will be populated by calling code if needed
			status: chunk.status as "pending" | "in_progress" | "completed",
			attempts,
			quality_scores: qualityScores,
			time_spent_ms: chunk.timeSpentMs,
		};
	});

	return {
		session_id: session.id,
		mode: session.mode as SessionMode,
		start_time: new Date(session.startTime).toISOString(),
		chunks: sessionChunks,
	};
}

// Batch operations
export async function batchCreateSessionChunks(inputs: CreateSessionChunkInput[]): Promise<void> {
	const db = getSql();
	
	for (const input of inputs) {
		const chunkData: NewSessionChunkRow = {
			id: input.id,
			sessionId: input.sessionId,
			chunkId: input.chunkId,
			status: input.status || "pending",
			attemptsJson: input.attemptsJson || null,
			qualityScoresJson: input.qualityScoresJson || null,
			timeSpentMs: input.timeSpentMs || 0,
			createdAt: input.createdAt,
			updatedAt: input.updatedAt,
		};
		
		await db.insert(sessionChunks).values(chunkData).run();
	}
	
	logger.info(`Created ${inputs.length} session chunks for session ${inputs[0]?.sessionId}`);
}

export async function listSessions(options?: {
	status?: "active" | "completed";
	limit?: number;
}): Promise<LearningSessionRow[]> {
	const db = getSql();
	
	let query = db.select().from(learningSessions);
	
	if (options?.status) {
		query = query.where(eq(learningSessions.status, options.status)) as typeof query;
	}
	
	query = query.orderBy(desc(learningSessions.createdAt)) as typeof query;
	
	if (options?.limit && options.limit > 0) {
		return query.limit(options.limit).all();
	}
	
	return query.all();
}
