import { lte } from "drizzle-orm";
import { getSql } from "../db/operations.js";
import { reviewSchedule } from "../db/schema.js";

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
