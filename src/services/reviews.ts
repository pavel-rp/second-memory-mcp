import { lte } from 'drizzle-orm';
import { getSql } from '../db/operations.js';
import { learningChunks } from '../db/schema.js';

export async function listDueReviews(now: number = Date.now()) {
  const db = getSql();
  return db.select().from(learningChunks).where(lte(learningChunks.nextReviewAt, now)).all();
}
