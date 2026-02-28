import type { ChunkRepository } from '../ports/chunk-repository.js';
import type { PrerequisiteMasteryPort } from '../ports/prerequisite-mastery-port.js';
import type { ChunkIdLookupPort } from '../ports/chunk-id-lookup-port.js';
import type {
  LearningItem,
  RecommendationInput,
  RecommendationOutput,
} from '../domain/types/recommendations.js';
import { RecommendationEngine } from '../domain/services/recommendation-engine.js';
import { PrerequisiteValidator } from '../domain/services/prerequisite-validator.js';
import { mapChunkRowToLearningItem } from '../shared/chunk-mapping.js';

export type RecommendationDeps = {
  chunks: ChunkRepository;
  mastery: PrerequisiteMasteryPort;
  chunkIdLookup: ChunkIdLookupPort;
};

export async function generateRecommendations(
  input: RecommendationInput,
  deps: RecommendationDeps
): Promise<RecommendationOutput> {
  let items = input.learningItems;
  if (!items || items.length === 0) {
    const rows = await deps.chunks.list({
      dueOnly: input.dueOnly ?? true,
      limit: 50,
      subjectFilter: input.subjectFilter,
    });
    items = rows.map(r => mapChunkRowToLearningItem(r) as LearningItem);
  }

  const chunkLookupFn = async (id: string): Promise<LearningItem | undefined> => {
    const row = await deps.chunks.getWithContent(id);
    return row ? (mapChunkRowToLearningItem(row) as LearningItem) : undefined;
  };

  const prerequisiteValidator = new PrerequisiteValidator({
    referenceValidator: {
      validateChunkPrerequisites: async (_chunkId: string, prerequisites: string[]) => {
        const existing = await deps.chunkIdLookup.getExistingIdsByIds(prerequisites);
        const invalidReferences = prerequisites.filter(id => !existing.has(id));
        return { isValid: invalidReferences.length === 0, invalidReferences };
      },
    },
    masteryService: {
      checkItemMastery: (id: string) => deps.mastery.checkItemMastery(id),
    },
  });

  const engine = new RecommendationEngine({ chunkLookupFn, prerequisiteValidator });
  return engine.generateRecommendations({
    ...input,
    learningItems: items,
  });
}
