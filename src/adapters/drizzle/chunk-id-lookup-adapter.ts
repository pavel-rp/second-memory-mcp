import { inArray } from 'drizzle-orm';
import { getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import { learningChunks } from '../../infrastructure/db/schema.js';
import type { ChunkIdLookupPort } from '../../ports/chunk-id-lookup-port.js';

export class DrizzleChunkIdLookupAdapter implements ChunkIdLookupPort {
  constructor(private db: SqlDb = getSql()) {}

  async getExistingIdsByIds(ids: string[]): Promise<Set<string>> {
    if (ids.length === 0) return new Set();
    const rows = await this.db
      .select({ id: learningChunks.id })
      .from(learningChunks)
      .where(inArray(learningChunks.id, ids));
    return new Set(rows.map(r => r.id));
  }

  async getAllIds(): Promise<Set<string>> {
    const rows = await this.db.select({ id: learningChunks.id }).from(learningChunks);
    return new Set(rows.map(r => r.id));
  }
}
