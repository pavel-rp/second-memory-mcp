import type { ChunkIdLookupPort } from '../../../src/ports/chunk-id-lookup-port.js';
import { InMemoryChunkRepository } from './chunk-repository.js';

export class InMemoryChunkIdLookup implements ChunkIdLookupPort {
  constructor(private chunkRepo: InMemoryChunkRepository) {}

  async getExistingIdsByIds(ids: string[]): Promise<Set<string>> {
    const store = this.chunkRepo.getStore();
    return new Set(ids.filter(id => store.has(id)));
  }

  async getAllIds(): Promise<Set<string>> {
    return new Set(this.chunkRepo.getStore().keys());
  }
}
