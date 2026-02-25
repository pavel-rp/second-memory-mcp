import { eq } from 'drizzle-orm';
import { getSql, type SqlDb } from '../db/operations.js';
import { learningChunks, type LearningChunkRow } from '../db/schema.js';
import { algorithmConfig } from '../config/algorithm.js';
import type { MasteryCriteria, MasteryStatus } from '../types/prerequisite-validation.js';
import { logger } from '../utils/logger.js';

/**
 * Service for determining prerequisite mastery based on learning performance data
 * Integrates with existing database and spaced repetition tracking
 */
export class PrerequisiteMasteryService {
  private masteryCriteria: MasteryCriteria;

  constructor(customCriteria?: Partial<MasteryCriteria>) {
    const config = algorithmConfig.prerequisiteConfig.mastery;
    this.masteryCriteria = {
      minimumQualityScore: customCriteria?.minimumQualityScore ?? config.minimumQualityScore,
      requiredAttempts: customCriteria?.requiredAttempts ?? config.requiredAttempts,
      recencyDays: customCriteria?.recencyDays ?? config.recencyDays,
      successRate: customCriteria?.successRate ?? config.successRate,
    };
  }

  /**
   * Determine mastery status for a prerequisite item
   * @param itemId Chunk ID to check mastery for
   * @returns Detailed mastery status with metrics
   */
  async checkItemMastery(itemId: string, db: SqlDb = getSql()): Promise<MasteryStatus> {
    try {
      // Get chunk data from database
      const chunk = await this.getChunkData(itemId, db);
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

      // Calculate metrics based on chunk data and friction metrics
      const metrics = await this.calculateMasteryMetrics(itemId, chunk);

      // Determine mastery based on criteria
      const isMastered = this.evaluateMastery(metrics);

      return {
        itemId,
        isMastered,
        ...metrics,
      };
    } catch (error) {
      // Return safe defaults on error
      logger.error(`Error checking mastery for item ${itemId}:`, error);
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

  /**
   * Check mastery for multiple items efficiently
   * @param itemIds Array of chunk IDs to check
   * @returns Map of item ID to mastery status
   */
  async checkMultipleItemsMastery(
    itemIds: string[],
    db: SqlDb = getSql()
  ): Promise<Map<string, MasteryStatus>> {
    const results = new Map<string, MasteryStatus>();

    // Process items in parallel for better performance
    const masteryPromises = itemIds.map(async itemId => {
      const mastery = await this.checkItemMastery(itemId, db);
      return [itemId, mastery] as [string, MasteryStatus];
    });

    const masteryResults = await Promise.all(masteryPromises);

    for (const [itemId, mastery] of masteryResults) {
      results.set(itemId, mastery);
    }

    return results;
  }

  /**
   * Get chunk data from database
   * @param itemId Chunk ID
   * @returns Chunk data or null if not found
   */
  private async getChunkData(
    itemId: string,
    db: SqlDb = getSql()
  ): Promise<LearningChunkRow | undefined> {
    const chunk = db.select().from(learningChunks).where(eq(learningChunks.id, itemId)).get();

    return chunk;
  }

  /**
   * Calculate mastery metrics from database data
   * @param itemId Chunk ID
   * @param chunk Chunk data from database
   * @returns Calculated metrics
   */
  private async calculateMasteryMetrics(itemId: string, chunk: LearningChunkRow) {
    // Calculate days since last review
    const daysSinceLastReview = chunk.lastReviewedAt
      ? Math.floor((Date.now() - chunk.lastReviewedAt) / (24 * 60 * 60 * 1000))
      : Infinity;

    // Calculate average quality based on repetitions and ease factor
    // Higher ease factor and more repetitions indicate better performance
    let averageQuality: number;
    if (chunk.repetitions === 0) {
      averageQuality = 0; // Never reviewed
    } else if (chunk.repetitions === 1) {
      // First review - estimate quality from ease factor
      averageQuality = Math.min(5, Math.max(0, (chunk.easeFactor - 1.3) * 2.5));
    } else {
      // Multiple reviews - use ease factor to estimate historical performance
      // Ease factor 2.5 = ~4 quality, 1.3 = ~2 quality, 3.0+ = ~5 quality
      averageQuality = Math.min(5, Math.max(0, (chunk.easeFactor - 1.3) * 3 + 1));
    }

    // Calculate success rate from ease factor and repetitions
    let successRate: number;
    if (chunk.repetitions === 0) {
      successRate = 0;
    } else {
      // Higher ease factor suggests better success rate
      successRate = Math.min(1, Math.max(0, (chunk.easeFactor - 1.3) / 1.7));
    }

    return {
      averageQuality,
      attemptCount: chunk.repetitions,
      daysSinceLastReview,
      successRate,
    };
  }

  /**
   * Evaluate whether metrics meet mastery criteria
   * @param metrics Calculated metrics
   * @returns True if item is considered mastered
   */
  private evaluateMastery(metrics: {
    averageQuality: number;
    attemptCount: number;
    daysSinceLastReview: number;
    successRate: number;
  }): boolean {
    const criteria = this.masteryCriteria;

    // Check minimum quality score
    if (metrics.averageQuality < criteria.minimumQualityScore) {
      return false;
    }

    // Check minimum attempts
    if (metrics.attemptCount < criteria.requiredAttempts) {
      return false;
    }

    // Check recency (if item was reviewed too long ago, not considered mastered)
    if (metrics.daysSinceLastReview > criteria.recencyDays) {
      return false;
    }

    // Check success rate
    if (metrics.successRate < criteria.successRate) {
      return false;
    }

    return true;
  }

  /**
   * Update mastery criteria
   * @param newCriteria New criteria to apply
   */
  updateMasteryCriteria(newCriteria: Partial<MasteryCriteria>): void {
    this.masteryCriteria = {
      ...this.masteryCriteria,
      ...newCriteria,
    };
  }

  /**
   * Get current mastery criteria
   * @returns Current criteria
   */
  getMasteryCriteria(): MasteryCriteria {
    return { ...this.masteryCriteria };
  }

  /**
   * Get mastery statistics for debugging/analytics
   * @param itemId Chunk ID
   * @returns Detailed mastery breakdown
   */
  async getMasteryBreakdown(
    itemId: string,
    db: SqlDb = getSql()
  ): Promise<{
    itemId: string;
    metrics: {
      averageQuality: number;
      attemptCount: number;
      daysSinceLastReview: number;
      successRate: number;
    };
    criteria: MasteryCriteria;
    evaluations: {
      qualityMet: boolean;
      attemptsMet: boolean;
      recencyMet: boolean;
      successRateMet: boolean;
    };
    isMastered: boolean;
  }> {
    const chunk = await this.getChunkData(itemId, db);

    if (!chunk) {
      const defaultMetrics = {
        averageQuality: 0,
        attemptCount: 0,
        daysSinceLastReview: Infinity,
        successRate: 0,
      };

      return {
        itemId,
        metrics: defaultMetrics,
        criteria: this.masteryCriteria,
        evaluations: {
          qualityMet: false,
          attemptsMet: false,
          recencyMet: false,
          successRateMet: false,
        },
        isMastered: false,
      };
    }

    const metrics = await this.calculateMasteryMetrics(itemId, chunk);

    const evaluations = {
      qualityMet: metrics.averageQuality >= this.masteryCriteria.minimumQualityScore,
      attemptsMet: metrics.attemptCount >= this.masteryCriteria.requiredAttempts,
      recencyMet: metrics.daysSinceLastReview <= this.masteryCriteria.recencyDays,
      successRateMet: metrics.successRate >= this.masteryCriteria.successRate,
    };

    return {
      itemId,
      metrics,
      criteria: this.masteryCriteria,
      evaluations,
      isMastered: Object.values(evaluations).every(met => met),
    };
  }
}

// Export singleton instance
export const prerequisiteMasteryService = new PrerequisiteMasteryService();
