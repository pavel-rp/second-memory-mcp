import type { ReviewPersistencePort } from '../ports/review-persistence-port.js';
import type { ReviewResultData } from '../ports/review-persistence-port.js';
import type { ServiceResult } from '../domain/types/service-result.js';
import { serviceOk, serviceFail } from '../domain/types/service-result.js';
import { calculateNextReviewAdvanced } from '../domain/algorithms/sr-calculator.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../domain/config/algorithm-defaults.js';
import { extractErrorMessage } from '../shared/errors.js';

export type ReviewDeps = {
  reviewPersistence: ReviewPersistencePort;
};

export async function processReviewResult(
  itemId: string,
  quality: number,
  options: { timeSpentMs?: number; consecutiveFailures?: number; daysOverdue?: number },
  deps: ReviewDeps
): Promise<ServiceResult<ReviewResultData>> {
  try {
    const currentChunk = await deps.reviewPersistence.getChunk(itemId);
    if (!currentChunk) {
      return serviceFail({ type: 'not_found', message: `Learning item not found: ${itemId}` });
    }

    const lastReviewedAt = currentChunk.lastReviewedAt || currentChunk.createdAt;
    const intervalDays = Math.floor((Date.now() - lastReviewedAt) / (1000 * 60 * 60 * 24)) || 1;

    const sm2Result = calculateNextReviewAdvanced(
      {
        quality,
        repetitions: currentChunk.repetitions,
        easeFactor: currentChunk.easeFactor,
        interval: intervalDays,
        daysOverdue: options.daysOverdue || 0,
        consecutiveFailures: options.consecutiveFailures || 0,
      },
      DEFAULT_ALGORITHM_CONFIG
    );

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

    const previous = {
      easeFactor: currentChunk.easeFactor,
      repetitions: currentChunk.repetitions,
      intervalDays: currentChunk.intervalDays,
      nextReviewAt: currentChunk.nextReviewAt,
      chunkType: currentChunk.chunkType,
    };

    await deps.reviewPersistence.persistReviewUpdate(itemId, updateData);

    const updatedChunk = await deps.reviewPersistence.getChunk(itemId);
    if (!updatedChunk) {
      return serviceFail({
        type: 'database',
        message: `Failed to retrieve chunk after update: ${itemId}`,
      });
    }

    return serviceOk({
      previous,
      updated: {
        easeFactor: updateData.easeFactor,
        repetitions: updateData.repetitions,
        intervalDays: updateData.intervalDays,
        nextReviewAt: updateData.nextReviewAt,
        chunkType: updateData.chunkType,
        lastReviewedAt: now,
      },
      quality,
      isLapse: quality < 3,
      consecutiveFailures: options.consecutiveFailures || 0,
      isLeech: sm2Result.leech || false,
    });
  } catch (error) {
    return serviceFail({
      type: 'database',
      message: `Failed to process review result: ${extractErrorMessage(error)}`,
    });
  }
}
