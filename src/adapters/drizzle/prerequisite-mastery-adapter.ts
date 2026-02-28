import { eq } from 'drizzle-orm';
import { getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import { learningChunks, type LearningChunkRow } from '../../infrastructure/db/schema.js';
import { MS_PER_DAY } from '../../shared/constants/time.js';
import type { MasteryCriteria, MasteryStatus } from '../../domain/types/prerequisite-validation.js';
import type { PrerequisiteMasteryPort } from '../../ports/prerequisite-mastery-port.js';
import { logger } from '../../shared/logger.js';

/** Default mastery criteria when none provided. */
const DEFAULT_MASTERY_CRITERIA: MasteryCriteria = {
  minimumQualityScore: 3,
  requiredAttempts: 2,
  recencyDays: 30,
  successRate: 0.6,
};

export class DrizzlePrerequisiteMasteryAdapter implements PrerequisiteMasteryPort {
  private masteryCriteria: MasteryCriteria;

  constructor(
    private db: SqlDb = getSql(),
    criteria?: MasteryCriteria
  ) {
    this.masteryCriteria = criteria ?? DEFAULT_MASTERY_CRITERIA;
  }

  async checkItemMastery(itemId: string): Promise<MasteryStatus> {
    try {
      const chunk = await this.getChunkData(itemId);
      if (!chunk) {
        return {
          itemId,
          isMastered: false,
          averageQuality: 0,
          attemptCount: 0,
          daysSinceLastReview: Infinity,
          successRate: 0,
        };
      }
      const metrics = this.calculateMasteryMetrics(chunk);
      const isMastered = this.evaluateMastery(metrics);
      return {
        itemId,
        isMastered,
        ...metrics,
      };
    } catch (error) {
      logger.error(`Failed to check mastery for ${itemId}:`, error);
      return {
        itemId,
        isMastered: false,
        averageQuality: 0,
        attemptCount: 0,
        daysSinceLastReview: Infinity,
        successRate: 0,
      };
    }
  }

  async checkMultipleItemsMastery(itemIds: string[]): Promise<Map<string, MasteryStatus>> {
    const results = new Map<string, MasteryStatus>();
    const masteryPromises = itemIds.map(async itemId => {
      const mastery = await this.checkItemMastery(itemId);
      return [itemId, mastery] as [string, MasteryStatus];
    });
    const masteryResults = await Promise.all(masteryPromises);
    for (const [itemId, mastery] of masteryResults) {
      results.set(itemId, mastery);
    }
    return results;
  }

  private async getChunkData(itemId: string): Promise<LearningChunkRow | undefined> {
    try {
      const [row] = await this.db
        .select()
        .from(learningChunks)
        .where(eq(learningChunks.id, itemId));
      return row;
    } catch (error) {
      logger.error(`Failed to fetch chunk data for ${itemId}:`, error);
      return undefined;
    }
  }

  private calculateMasteryMetrics(chunk: LearningChunkRow): {
    averageQuality: number;
    attemptCount: number;
    daysSinceLastReview: number;
    successRate: number;
  } {
    const daysSinceLastReview = chunk.lastReviewedAt
      ? Math.floor((Date.now() - chunk.lastReviewedAt) / MS_PER_DAY)
      : Infinity;

    let averageQuality: number;
    if (chunk.repetitions === 0) {
      averageQuality = 0;
    } else if (chunk.repetitions === 1) {
      averageQuality = Math.min(5, Math.max(0, (chunk.easeFactor - 1.3) * 2.5));
    } else {
      averageQuality = Math.min(5, Math.max(0, (chunk.easeFactor - 1.3) * 3 + 1));
    }

    let successRate: number;
    if (chunk.repetitions === 0) {
      successRate = 0;
    } else {
      successRate = Math.min(1, Math.max(0, (chunk.easeFactor - 1.3) / 1.7));
    }

    return {
      averageQuality,
      attemptCount: chunk.repetitions,
      daysSinceLastReview,
      successRate,
    };
  }

  private evaluateMastery(metrics: {
    averageQuality: number;
    attemptCount: number;
    daysSinceLastReview: number;
    successRate: number;
  }): boolean {
    const criteria = this.masteryCriteria;
    if (metrics.averageQuality < criteria.minimumQualityScore) return false;
    if (metrics.attemptCount < criteria.requiredAttempts) return false;

    const solidlyLearned =
      metrics.attemptCount >= criteria.requiredAttempts &&
      metrics.successRate >= criteria.successRate;
    if (!solidlyLearned && metrics.daysSinceLastReview > criteria.recencyDays) return false;
    if (metrics.successRate < criteria.successRate) return false;

    return true;
  }
}
