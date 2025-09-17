import { and, eq, lte } from "drizzle-orm";
import { getSql } from "../db/operations.js";
import { learningChunks, reviewSchedule, sessionLogs, performanceAnalytics } from "../db/schema.js";

export async function scheduleReview(params: {
	id: string;
	chunkId: string;
	nextReviewAt: number;
	intervalDays: number;
	repetitions: number;
	easeFactor: number;
	createdAt: number;
	updatedAt: number;
}): Promise<void> {
	const db = getSql();
	await db.insert(reviewSchedule).values(params).run();
}

export async function listDueReviews(now: number = Date.now()) {
	const db = getSql();
	return db
		.select()
		.from(reviewSchedule)
		.where(lte(reviewSchedule.nextReviewAt, now))
		.all();
}

export async function logSession(entry: {
	id: string;
	date: number;
	duration: number;
	itemsCompleted: number;
	averageQuality: number;
	cognitiveLoad: number;
	createdAt: number;
}): Promise<void> {
	const db = getSql();
	await db.insert(sessionLogs).values(entry).run();
}

export async function getPerformanceStats(date?: number) {
	const db = getSql();
	let query = db.select().from(performanceAnalytics);
	if (date) {
		query = query.where(eq(performanceAnalytics.date, date)) as typeof query;
	}
	return query.all();
}
