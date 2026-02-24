import { RecommendationEngine } from '../tools/recommendation-engine.js';
import { PrerequisiteValidator } from '../tools/prerequisite-validator.js';
import { getChunk } from '../services/chunks.js';
import { mapChunkRowToLearningItem } from '../services/chunk-queries.js';
import { prerequisiteReferenceValidator } from '../services/chunk-prerequisites.js';
import { prerequisiteMasteryService } from '../services/prerequisite-mastery.js';

// Shared instances — hoisted to preserve instance-level caching (e.g. DB availability check)
export const chunkLookupFn = async (id: string) => {
  const row = await getChunk(id);
  return row ? mapChunkRowToLearningItem(row) : undefined;
};
export const sharedValidator = new PrerequisiteValidator({
  referenceValidator: prerequisiteReferenceValidator,
  masteryService: prerequisiteMasteryService,
});
export function createRecommendationEngine() {
  return new RecommendationEngine({
    chunkLookupFn,
    prerequisiteValidator: sharedValidator,
  });
}
