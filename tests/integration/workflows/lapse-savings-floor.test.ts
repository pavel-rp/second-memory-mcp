import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningTopics, learningChunks } from '../../../src/infrastructure/db/schema.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import * as reviewWorkflows from '../../../src/orchestration/review-workflows.js';
import { DrizzleReviewPersistenceAdapter } from '../../../src/adapters/drizzle/review-persistence-adapter.js';
import { resolveAlgorithmConfig } from '../../../src/config/resolve-algorithm-config.js';

// NEU-927: on a graded failure the persisted next interval must be floored at
// `coefficient × prior_interval` (spaced recovery) instead of a first-exposure
// reset, and clamped into `[floor, prior_interval]` after fuzz. A never-
// established prior (below the floor) returns exactly 1 day.
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const SAVINGS_COEFFICIENT = 0.2;

describe('post-lapse savings floor persistence (NEU-927)', () => {
  let reviewDeps: reviewWorkflows.ReviewDeps;
  const topicId = 'topic-lapse-floor';

  beforeAll(async () => {
    await setupTestDb();
    const db = getSql();
    reviewDeps = {
      reviewPersistence: new DrizzleReviewPersistenceAdapter(db),
      // No `random` source → deterministic neutral fuzz for stable assertions.
      algorithmConfig: resolveAlgorithmConfig(),
    };
  });

  beforeEach(async () => {
    await cleanupTestDb();
    const db = getSql();
    const now = Date.now();
    await db.insert(learningTopics).values({
      id: topicId,
      title: 'Lapse Floor Topic',
      subject: 'Math',
      createdAt: now,
      updatedAt: now,
    });
  });

  afterAll(teardownTestDb);

  it('floors a high-prior-interval lapse into [floor, prior] and is not a first-exposure reset', async () => {
    const db = getSql();
    const now = Date.now();
    const priorDays = 180;
    const chunkId = 'chunk-high-prior';

    // A chunk known for ~180 days: last reviewed 180 days ago, so the workflow
    // derives a ~180-day prior interval as the stability proxy.
    await db.insert(learningChunks).values({
      id: chunkId,
      topicId,
      title: 'Long-known chunk',
      subject: 'Math',
      difficulty: 5,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 8,
      consecutiveFailures: 0,
      intervalDays: priorDays,
      lastReviewedAt: now - priorDays * MS_PER_DAY,
      estimatedDuration: 15,
      chunkType: 'review',
      createdAt: now - priorDays * MS_PER_DAY,
      updatedAt: now,
    });

    const result = await reviewWorkflows.processReviewResult(chunkId, 1, {}, reviewDeps);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const savingsFloor = Math.round(SAVINGS_COEFFICIENT * priorDays); // 36
    const persistedInterval = result.data.updated.intervalDays;

    expect(persistedInterval).toBeGreaterThanOrEqual(savingsFloor);
    expect(persistedInterval).toBeLessThanOrEqual(priorDays);
    expect(persistedInterval).not.toBe(1); // not a first-exposure reset
    // reps still reset on failure, but the interval preserves accumulated learning.
    expect(result.data.updated.repetitions).toBe(0);

    // Assert it was actually committed, not merely computed.
    const reread = await reviewDeps.reviewPersistence.getChunk(chunkId);
    expect(reread?.intervalDays).toBe(persistedInterval);
  });

  it('returns exactly 1 day when the prior interval sits below the floor (never-established)', async () => {
    const db = getSql();
    const now = Date.now();
    const chunkId = 'chunk-fresh';

    // Freshly reviewed chunk: the derived prior interval is 1 day, at/below the
    // savings floor, so the lapse returns exactly 1 day — the bound is never
    // asked to floor above the prior it is also bounded by.
    await db.insert(learningChunks).values({
      id: chunkId,
      topicId,
      title: 'Fresh chunk',
      subject: 'Math',
      difficulty: 5,
      nextReviewAt: now,
      easeFactor: 2.5,
      repetitions: 1,
      consecutiveFailures: 0,
      intervalDays: 1,
      lastReviewedAt: now,
      estimatedDuration: 15,
      chunkType: 'review',
      createdAt: now,
      updatedAt: now,
    });

    const result = await reviewWorkflows.processReviewResult(chunkId, 0, {}, reviewDeps);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.updated.intervalDays).toBe(1);

    const reread = await reviewDeps.reviewPersistence.getChunk(chunkId);
    expect(reread?.intervalDays).toBe(1);
  });
});
