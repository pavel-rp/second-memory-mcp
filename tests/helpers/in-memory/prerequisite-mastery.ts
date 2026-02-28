import type { PrerequisiteMasteryPort } from '../../../src/ports/prerequisite-mastery-port.js';
import type { MasteryStatus } from '../../../src/domain/types/prerequisite-validation.js';
import { InMemoryChunkRepository } from './chunk-repository.js';
import { MS_PER_DAY } from '../../../src/shared/constants/time.js';

/** Simple in-memory mastery checker: mastered if repetitions >= 2 and easeFactor >= 2.0 */
export class InMemoryPrerequisiteMastery implements PrerequisiteMasteryPort {
  constructor(private chunkRepo: InMemoryChunkRepository) {}

  async checkItemMastery(itemId: string): Promise<MasteryStatus> {
    const chunk = this.chunkRepo.getStore().get(itemId);
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
    const daysSinceLastReview = chunk.lastReviewedAt
      ? Math.floor((Date.now() - chunk.lastReviewedAt) / MS_PER_DAY)
      : Infinity;
    const isMastered = chunk.repetitions >= 2 && chunk.easeFactor >= 2.0;
    return {
      itemId,
      isMastered,
      averageQuality: Math.min(5, (chunk.easeFactor - 1.3) * 3 + 1),
      attemptCount: chunk.repetitions,
      daysSinceLastReview,
      successRate: chunk.repetitions > 0 ? Math.min(1, (chunk.easeFactor - 1.3) / 1.7) : 0,
    };
  }

  async checkMultipleItemsMastery(itemIds: string[]): Promise<Map<string, MasteryStatus>> {
    const results = new Map<string, MasteryStatus>();
    for (const id of itemIds) {
      results.set(id, await this.checkItemMastery(id));
    }
    return results;
  }
}
