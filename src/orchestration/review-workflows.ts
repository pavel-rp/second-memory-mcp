import type { AlgorithmConfig } from '../domain/config/algorithm.js';
import type { ReviewPersistencePort } from '../ports/review-persistence-port.js';
import type { ReviewResultData } from '../ports/review-persistence-port.js';
import type { ChunkRepository, ChunkMinimalMetadata } from '../ports/chunk-repository.js';
import type { ServiceResult } from '../domain/types/service-result.js';
import { serviceOk, serviceFail } from '../domain/types/service-result.js';
import { calculateNextReviewAdvanced } from '../domain/algorithms/sr-calculator.js';
import { extractErrorMessage } from '../shared/errors.js';
import { logEvent } from '../shared/logger.js';

/** SM-2 default initial ease factor — used when resetting progress. */
const SM2_INITIAL_EASE_FACTOR = 2.5;
/** ~100 years in ms — effectively removes archived items from the review queue. */
const ARCHIVE_OFFSET_MS = 100 * 365.25 * 24 * 60 * 60 * 1000;

export type ReviewDeps = {
  reviewPersistence: ReviewPersistencePort;
  algorithmConfig: AlgorithmConfig;
};

export async function processReviewResult(
  itemId: string,
  quality: number,
  options: { timeSpentMs?: number; daysOverdue?: number },
  deps: ReviewDeps
): Promise<ServiceResult<ReviewResultData>> {
  try {
    const currentChunk = await deps.reviewPersistence.getChunk(itemId);
    if (!currentChunk) {
      return serviceFail({ type: 'not_found', message: `Learning item not found: ${itemId}` });
    }

    // Consecutive-failure count is sourced from the persisted on-chunk counter,
    // mirroring `repetitions`: a failing review (quality < 3) increments it, any
    // passing review resets it to 0. This is what makes leech detection reachable
    // through the MCP tool flow (callers no longer thread the count in).
    const newConsecutiveFailures = quality < 3 ? currentChunk.consecutiveFailures + 1 : 0;

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
        consecutiveFailures: newConsecutiveFailures,
      },
      deps.algorithmConfig,
      now
    );

    // Never downgrade an existing leech: once a chunk is 'remediation' it stays so
    // until explicitly cleared via resolveLeech. Otherwise a reviewed chunk is 'review'.
    const nextChunkType =
      sm2Result.leech || currentChunk.chunkType === 'remediation' ? 'remediation' : 'review';

    const updateData = {
      easeFactor: sm2Result.easeFactor,
      repetitions: sm2Result.repetitions,
      consecutiveFailures: newConsecutiveFailures,
      intervalDays: sm2Result.interval,
      nextReviewAt: new Date(sm2Result.nextReview).getTime(),
      lastReviewedAt: nowMs,
      updatedAt: nowMs,
      chunkType: nextChunkType,
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

    logEvent('processReview', 'review_processed', {
      chunkId: itemId,
      quality,
      easeFactor: updateData.easeFactor,
      repetitions: updateData.repetitions,
      intervalDays: updateData.intervalDays,
      nextReviewAt: updateData.nextReviewAt,
    });

    // A permanent scheduling change that must be auditable. Log only on the
    // transition into remediation — not on every later failing review of an
    // already-flagged leech (previous.chunkType guards against re-emitting).
    if (sm2Result.leech && previous.chunkType !== 'remediation') {
      logEvent('processReview', 'leech_flagged', {
        chunkId: itemId,
        repetitions: updateData.repetitions,
        easeFactor: updateData.easeFactor,
        consecutiveFailures: newConsecutiveFailures,
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
      consecutiveFailures: newConsecutiveFailures,
      isLeech: sm2Result.leech || false,
    });
  } catch (error) {
    logEvent('processReview', 'sr_update_failed', {
      chunkId: itemId,
      error: extractErrorMessage(error),
    });
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
    // Note: TOCTOU — getChunk → validate → persist has a small race window.
    // Acceptable for single-user MCP; the rowCount === 0 guard below catches concurrent deletes.
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
    // Clearing a leech also clears the failure counter — otherwise a single later
    // failure (count + 1 >= threshold) would immediately re-flag it as a leech.
    const baseUpdate = { chunkType: 'review' as const, consecutiveFailures: 0, updatedAt: nowMs };

    let rowCount: number;
    switch (resolution) {
      case 'reset_progress':
        rowCount = await deps.reviewPersistence.persistReviewUpdate(chunkId, {
          ...baseUpdate,
          easeFactor: SM2_INITIAL_EASE_FACTOR,
          repetitions: 0,
          intervalDays: null,
          nextReviewAt: nowMs,
          lastReviewedAt: null,
        });
        break;
      case 'archive':
        rowCount = await deps.reviewPersistence.persistReviewUpdate(chunkId, {
          ...baseUpdate,
          nextReviewAt: nowMs + ARCHIVE_OFFSET_MS,
        });
        break;
      case 'mark_reviewed':
        rowCount = await deps.reviewPersistence.persistReviewUpdate(chunkId, baseUpdate);
        break;
    }

    if (rowCount === 0) {
      return serviceFail({
        type: 'database',
        message: `Update affected 0 rows for chunk ${chunkId} — it may have been deleted concurrently`,
      });
    }

    logEvent('resolveLeech', 'leech_resolved', { chunkId, resolution });

    return serviceOk({ chunkId, resolution });
  } catch (error) {
    return serviceFail({
      type: 'database',
      message: extractErrorMessage(error),
    });
  }
}
