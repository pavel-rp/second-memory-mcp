import { eq } from 'drizzle-orm';
import { getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import { learningChunks } from '../../infrastructure/db/schema.js';
import { MS_PER_DAY } from '../../shared/constants/time.js';
import type { MasteryStatus } from '../../domain/types/prerequisite-validation.js';
import type { PrerequisiteMasteryPort } from '../../ports/prerequisite-mastery-port.js';
import { logger } from '../../shared/logger.js';

export class DrizzlePrerequisiteMasteryAdapter implements PrerequisiteMasteryPort {
  constructor(private db: SqlDb = getSql()) {}

  async checkItemMastery(itemId: string): Promise<MasteryStatus> {
    try {
      const chunk = await this.getChunkData(itemId);
      if (!chunk) {
        return {
          itemId,
          isMastered: false,
          attemptCount: 0,
          daysSinceLastReview: Infinity,
        };
      }
      const daysSinceLastReview = chunk.lastReviewedAt
        ? Math.floor((Date.now() - chunk.lastReviewedAt) / MS_PER_DAY)
        : Infinity;
      return {
        itemId,
        isMastered: chunk.repetitions >= 1,
        attemptCount: chunk.repetitions,
        daysSinceLastReview,
      };
    } catch (error) {
      logger.error(`Failed to check mastery for ${itemId}:`, error);
      return {
        itemId,
        isMastered: false,
        attemptCount: 0,
        daysSinceLastReview: Infinity,
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

  private async getChunkData(
    itemId: string
  ): Promise<{ repetitions: number; lastReviewedAt: number | null } | undefined> {
    try {
      const [row] = await this.db
        .select({
          repetitions: learningChunks.repetitions,
          lastReviewedAt: learningChunks.lastReviewedAt,
        })
        .from(learningChunks)
        .where(eq(learningChunks.id, itemId));
      return row;
    } catch (error) {
      logger.error(`Failed to fetch chunk data for ${itemId}:`, error);
      return undefined;
    }
  }
}
