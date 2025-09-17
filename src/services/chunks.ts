import { and, eq, lte } from "drizzle-orm";
import { getSql } from "../db/operations.js";
import { learningChunks } from "../db/schema.js";
import type { LearningItem } from "../types/recommendations.js";
import { decodeJsonArray, encodeJsonArray } from "../db/operations.js";

export type CreateChunkInput = {
	id: string;
	topicId: string;
	title: string;
	subject: string;
	difficulty: number;
	nextReviewAt: number;
	easeFactor: number;
	repetitions: number;
	lastReviewedAt?: number;
	estimatedDuration: number;
	chunkType: "new" | "review" | "remediation";
	prerequisites?: string[];
	tags?: string[];
	createdAt: number;
	updatedAt: number;
};

export async function createChunk(input: CreateChunkInput): Promise<void> {
	const db = getSql();
	await db.insert(learningChunks).values({
		...input,
		prerequisitesJson: encodeJsonArray(input.prerequisites),
		tagsJson: encodeJsonArray(input.tags),
	}).run();
}

export async function getChunk(id: string) {
	const db = getSql();
	const row = db.select().from(learningChunks).where(eq(learningChunks.id, id)).get();
	return row;
}

export type ListChunksFilter = {
	subject?: string;
	dueOnly?: boolean;
	limit?: number;
};

export async function listChunks(filter: ListChunksFilter = {}) {
	const db = getSql();
	const now = Date.now();
	const conditions: ReturnType<typeof eq>[] = [];
	if (filter.subject) conditions.push(eq(learningChunks.subject, filter.subject));
	if (filter.dueOnly) conditions.push(lte(learningChunks.nextReviewAt, now));
	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	let query = whereClause
		? db.select().from(learningChunks).where(whereClause)
		: db.select().from(learningChunks);

	if (filter.limit && filter.limit > 0) {
		query = query.limit(filter.limit) as typeof query;
	}

	return query.all();
}

function toIsoDate(epochMs: number): string {
	const d = new Date(epochMs);
	const y = d.getUTCFullYear();
	const m = String(d.getUTCMonth() + 1).padStart(2, "0");
	const day = String(d.getUTCDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

export function mapChunkRowToLearningItem(row: any): LearningItem {
	return {
		id: row.id,
		title: row.title,
		subject: row.subject,
		difficulty: row.difficulty,
		nextReviewDate: toIsoDate(row.nextReviewAt),
		easeFactor: row.easeFactor,
		repetitions: row.repetitions,
		lastReviewed: row.lastReviewedAt ? toIsoDate(row.lastReviewedAt) : undefined,
		estimatedDuration: row.estimatedDuration,
		chunkType: row.chunkType,
		prerequisites: decodeJsonArray(row.prerequisitesJson),
		tags: decodeJsonArray(row.tagsJson),
	};
}

export async function listChunksAsLearningItems(filter: ListChunksFilter = {}): Promise<LearningItem[]> {
	const rows = await listChunks(filter);
	return rows.map(mapChunkRowToLearningItem);
}

export async function updateChunk(id: string, changes: Partial<Omit<CreateChunkInput, "id" | "topicId" | "createdAt">>): Promise<number> {
	const db = getSql();
	const updatePayload: Record<string, unknown> = { ...changes };
	
	// Handle JSON fields
	if (changes.prerequisites) {
		updatePayload.prerequisitesJson = encodeJsonArray(changes.prerequisites);
	}
	if (changes.tags) {
		updatePayload.tagsJson = encodeJsonArray(changes.tags);
	}
	
	// Handle nullable lastReviewedAt field explicitly
	if (changes.lastReviewedAt !== undefined) {
		updatePayload.lastReviewedAt = changes.lastReviewedAt;
	}
	
	const res = db.update(learningChunks).set(updatePayload).where(eq(learningChunks.id, id)).run();
	return res.changes ?? 0;
}

export async function deleteChunk(id: string): Promise<number> {
	const db = getSql();
	const res = db.delete(learningChunks).where(eq(learningChunks.id, id)).run();
	return res.changes ?? 0;
}
