import { eq } from 'drizzle-orm';
import { getSql } from '../db/operations.js';
import { learningChunks, type LearningChunkRow } from '../db/schema.js';
import { calculateNextReviewAdvanced } from '../algorithms/sr-calculator.js';
import { type ServiceResult, serviceOk, serviceFail } from '../domain/types/service-result.js';
import { getChunk } from './chunks.js';

export type ReviewResultData = {
  chunk: LearningChunkRow;
  isLeech: boolean;
};

// Process review result with SM-2 calculations
export async function processReviewResult(
  itemId: string,
  quality: number,
  options: {
    timeSpentMs?: number;
    consecutiveFailures?: number;
    daysOverdue?: number;
  }
): Promise<ServiceResult<ReviewResultData>> {
  try {
    const db = getSql();

    // Get current chunk data
    const currentChunk = await getChunk(itemId, db);
    if (!currentChunk) {
      return serviceFail({
        type: 'not_found',
        message: `Learning item not found: ${itemId}`,
      });
    }

    // Calculate new SM-2 values
    const lastReviewedAt = currentChunk.lastReviewedAt || currentChunk.createdAt;
    const intervalDays = Math.floor((Date.now() - lastReviewedAt) / (1000 * 60 * 60 * 24)) || 1;

    const sm2Result = calculateNextReviewAdvanced({
      quality,
      repetitions: currentChunk.repetitions,
      easeFactor: currentChunk.easeFactor,
      interval: intervalDays,
      daysOverdue: options.daysOverdue || 0,
      consecutiveFailures: options.consecutiveFailures || 0,
    });

    // Update chunk with new SM-2 values
    const now = Date.now();
    const updateData = {
      easeFactor: sm2Result.easeFactor,
      repetitions: sm2Result.repetitions,
      intervalDays: sm2Result.interval,
      nextReviewAt: new Date(sm2Result.nextReview).getTime(),
      lastReviewedAt: now,
      updatedAt: now,
      chunkType: sm2Result.leech ? 'remediation' : 'review',
    };

    await db.update(learningChunks).set(updateData).where(eq(learningChunks.id, itemId));

    // Return updated chunk with leech information
    const updatedChunk = await getChunk(itemId, db);
    if (!updatedChunk) {
      return serviceFail({
        type: 'database',
        message: `Failed to retrieve chunk after update: ${itemId}`,
      });
    }

    return serviceOk({
      chunk: updatedChunk,
      isLeech: sm2Result.leech || false,
    });
  } catch {
    return serviceFail({
      type: 'database',
      message: 'Failed to process review result',
    });
  }
}
