import type { ReviewPersistencePort } from '../../../src/ports/review-persistence-port.js';
import type { LearningChunkRow } from '../../../src/infrastructure/db/schema.js';
import { InMemoryChunkRepository } from './chunk-repository.js';

export class InMemoryReviewPersistence implements ReviewPersistencePort {
  constructor(private chunkRepo: InMemoryChunkRepository) {}

  async getChunk(id: string): Promise<LearningChunkRow | undefined> {
    return this.chunkRepo.getById(id);
  }

  async persistReviewUpdate(
    chunkId: string,
    updates: Partial<
      Pick<
        LearningChunkRow,
        | 'easeFactor'
        | 'repetitions'
        | 'intervalDays'
        | 'nextReviewAt'
        | 'chunkType'
        | 'lastReviewedAt'
        | 'updatedAt'
      >
    >
  ): Promise<number> {
    return this.chunkRepo.update(chunkId, updates);
  }
}
