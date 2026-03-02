import type { ReviewPersistencePort } from '../../../src/ports/review-persistence-port.js';
import type { LearningChunk } from '../../../src/domain/types/entities.js';
import { InMemoryChunkRepository } from './chunk-repository.js';

export class InMemoryReviewPersistence implements ReviewPersistencePort {
  constructor(private chunkRepo: InMemoryChunkRepository) {}

  async getChunk(id: string): Promise<LearningChunk | undefined> {
    return this.chunkRepo.getById(id);
  }

  async persistReviewUpdate(
    chunkId: string,
    updates: Partial<
      Pick<
        LearningChunk,
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
