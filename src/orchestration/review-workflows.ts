import type { AlgorithmConfig } from '../domain/config/algorithm.js';
import type { ReviewPersistencePort } from '../ports/review-persistence-port.js';
import type { ReviewResultData } from '../ports/review-persistence-port.js';
import type { ChunkRepository, ChunkMinimalMetadata } from '../ports/chunk-repository.js';
import type { ServiceResult } from '../domain/types/service-result.js';
import { serviceOk, serviceFail } from '../domain/types/service-result.js';
import { calculateNextReviewAdvanced } from '../domain/algorithms/sr-calculator.js';
import { extractErrorMessage } from '../shared/errors.js';

export type ReviewDeps = {
  reviewPersistence: ReviewPersistencePort;
  algorithmConfig: AlgorithmConfig;
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
    const now = new Date();
    const nowMs = now.getTime();
    const intervalDays = Math.floor((nowMs - lastReviewedAt) / (1000 * 60 * 60 * 24)) || 1;
    const sm2Result = calculateNextReviewAdvanced(
      {
        quality,
        repetitions: currentChunk.repetitions,
        easeFactor: currentChunk.easeFactor,
        interval: intervalDays,
        daysOverdue: options.daysOverdue || 0,
        consecutiveFailures: options.consecutiveFailures || 0,
      },
      deps.algorithmConfig,
      now
    );

    const updateData = {
      easeFactor: sm2Result.easeFactor,
      repetitions: sm2Result.repetitions,
      intervalDays: sm2Result.interval,
      nextReviewAt: new Date(sm2Result.nextReview).getTime(),
      lastReviewedAt: nowMs,
      updatedAt: nowMs,
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
        lastReviewedAt: nowMs,
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

export type LeechDeps = {
  chunks: ChunkRepository;
  reviewPersistence: ReviewPersistencePort;
};

export type LeechResolution = 'reset_progress' | 'archive' | 'mark_reviewed';

export async function getLeeches(
  options: { subjectFilter?: string; limit?: number },
  deps: LeechDeps
): Promise<ChunkMinimalMetadata[]> {
  return deps.chunks.batchFetchMinimal({
    subject: options.subjectFilter,
    limit: options.limit,
    isLeech: true,
  });
}

export async function resolveLeech(
  chunkId: string,
  resolution: LeechResolution,
  deps: LeechDeps
): Promise<ServiceResult<{ chunkId: string; resolution: LeechResolution }>> {
  try {
    const chunk = await deps.reviewPersistence.getChunk(chunkId);
    if (!chunk) {
      return serviceFail({ type: 'not_found', message: `Chunk not found: ${chunkId}` });
    }
    if (chunk.chunkType !== 'remediation') {
      return serviceFail({
        type: 'validation',
        message: `Chunk ${chunkId} is not a leech (chunkType=${chunk.chunkType})`,
      });
    }

    const nowMs = Date.now();

    let rowCount: number;
    switch (resolution) {
      case 'reset_progress':
        rowCount = await deps.reviewPersistence.persistReviewUpdate(chunkId, {
          easeFactor: 2.5,
          repetitions: 0,
          intervalDays: null,
          nextReviewAt: nowMs,
          chunkType: 'review',
          updatedAt: nowMs,
        });
        break;
      case 'archive':
        rowCount = await deps.reviewPersistence.persistReviewUpdate(chunkId, {
          chunkType: 'review',
          nextReviewAt: nowMs + 100 * 365.25 * 24 * 60 * 60 * 1000, // ~100 years
          updatedAt: nowMs,
        });
        break;
      case 'mark_reviewed':
        rowCount = await deps.reviewPersistence.persistReviewUpdate(chunkId, {
          chunkType: 'review',
          updatedAt: nowMs,
        });
        break;
    }

    if (rowCount === 0) {
      return serviceFail({
        type: 'database',
        message: `Update affected 0 rows for chunk ${chunkId} — it may have been deleted concurrently`,
      });
    }

    return serviceOk({ chunkId, resolution });
  } catch (error) {
    return serviceFail({
      type: 'database',
      message: `Failed to resolve leech: ${extractErrorMessage(error)}`,
    });
  }
}
