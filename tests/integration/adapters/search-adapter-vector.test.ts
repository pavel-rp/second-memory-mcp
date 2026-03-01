import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { DrizzleSearchAdapter } from '../../../src/adapters/drizzle/search-adapter.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { learningChunks, learningTopics } from '../../../src/infrastructure/db/schema.js';
import { VECTOR_SIMILARITY_THRESHOLD } from '../../../src/domain/config/embedding.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';

// --- Helpers ---

/** Create a 1536-dim vector with value at a given index, rest zeros. */
function sparseVector(index: number, value = 1): number[] {
  const v = new Array(1536).fill(0);
  v[index] = value;
  return v;
}

/** Create a 1536-dim vector with values at multiple indices. */
function multiSparseVector(entries: Array<[index: number, value: number]>): number[] {
  const v = new Array(1536).fill(0);
  for (const [i, val] of entries) v[i] = val;
  return v;
}

// --- Test data ---

const now = Date.now();

function seedTopic(id: string, title: string, opts?: { subject?: string; embedding?: number[] }) {
  return {
    id,
    title,
    subject: opts?.subject ?? 'CS',
    summary: null,
    summaryVersion: null,
    summaryUpdatedAt: null,
    summaryEmbedding: opts?.embedding ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

function seedChunk(
  id: string,
  topicId: string,
  title: string,
  opts?: { subject?: string; embedding?: number[]; content?: string }
) {
  return {
    id,
    topicId,
    title,
    subject: opts?.subject ?? 'CS',
    difficulty: 3,
    nextReviewAt: now,
    easeFactor: 2.5,
    repetitions: 0,
    lastReviewedAt: null,
    estimatedDuration: 10,
    chunkType: 'new' as const,
    prerequisitesJson: [],
    tagsJson: [],
    content: opts?.content ?? 'content',
    contentVersion: 1,
    contentUpdatedAt: now,
    contentEmbedding: opts?.embedding ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

// --- Tests ---

describe('DrizzleSearchAdapter — searchByVector (integration)', () => {
  let adapter: DrizzleSearchAdapter;

  beforeAll(async () => {
    await setupTestDb();
    adapter = new DrizzleSearchAdapter();
  });
  beforeEach(cleanupTestDb);
  afterAll(teardownTestDb);

  it('returns results ordered by descending cosine similarity', async () => {
    const db = getSql();
    const queryVector = sparseVector(0); // [1, 0, 0, ...]

    // chunk-close: mostly aligned with query vector → high similarity
    // chunk-far: partially aligned → lower similarity
    const closeEmbedding = multiSparseVector([
      [0, 0.95],
      [1, 0.05],
    ]);
    const farEmbedding = multiSparseVector([
      [0, 0.5],
      [1, 0.5],
    ]);

    await db.insert(learningTopics).values([seedTopic('t1', 'Topic 1')]);
    await db
      .insert(learningChunks)
      .values([
        seedChunk('chunk-far', 't1', 'Far Chunk', { embedding: farEmbedding }),
        seedChunk('chunk-close', 't1', 'Close Chunk', { embedding: closeEmbedding }),
      ]);

    const result = await adapter.searchByVector(queryVector);

    const chunkResults = result.results.filter(r => r.resultType === 'chunk');
    expect(chunkResults.length).toBeGreaterThanOrEqual(2);
    expect(chunkResults[0].id).toBe('chunk-close');
    expect(chunkResults[1].id).toBe('chunk-far');
    expect(chunkResults[0].similarityScore!).toBeGreaterThan(chunkResults[1].similarityScore!);
  });

  it('excludes results below VECTOR_SIMILARITY_THRESHOLD', async () => {
    const db = getSql();
    const queryVector = sparseVector(0); // [1, 0, 0, ...]

    // Orthogonal vector → cosine similarity ≈ 0 → below threshold
    const orthogonalEmbedding = sparseVector(1); // [0, 1, 0, ...]

    await db.insert(learningTopics).values([seedTopic('t1', 'Topic 1')]);
    await db
      .insert(learningChunks)
      .values([seedChunk('chunk-ortho', 't1', 'Orthogonal', { embedding: orthogonalEmbedding })]);

    const result = await adapter.searchByVector(queryVector);

    const chunkResults = result.results.filter(r => r.resultType === 'chunk');
    // Cosine similarity of orthogonal vectors is 0, which is below any reasonable threshold
    expect(chunkResults.every(r => (r.similarityScore ?? 0) >= VECTOR_SIMILARITY_THRESHOLD)).toBe(
      true
    );
    expect(chunkResults.find(r => r.id === 'chunk-ortho')).toBeUndefined();
  });

  it('filters results by subject', async () => {
    const db = getSql();
    const queryVector = sparseVector(0);
    const embedding = multiSparseVector([
      [0, 0.9],
      [1, 0.1],
    ]);

    await db
      .insert(learningTopics)
      .values([
        seedTopic('t-cs', 'CS Topic', { subject: 'CS' }),
        seedTopic('t-math', 'Math Topic', { subject: 'Math' }),
      ]);
    await db
      .insert(learningChunks)
      .values([
        seedChunk('chunk-cs', 't-cs', 'CS Chunk', { subject: 'CS', embedding }),
        seedChunk('chunk-math', 't-math', 'Math Chunk', { subject: 'Math', embedding }),
      ]);

    const result = await adapter.searchByVector(queryVector, { subject: 'Math' });

    const chunkResults = result.results.filter(r => r.resultType === 'chunk');
    expect(chunkResults).toHaveLength(1);
    expect(chunkResults[0].id).toBe('chunk-math');
  });

  it('excludes rows with null embeddings', async () => {
    const db = getSql();
    const queryVector = sparseVector(0);
    const embedding = multiSparseVector([
      [0, 0.9],
      [1, 0.1],
    ]);

    await db.insert(learningTopics).values([seedTopic('t1', 'Topic')]);
    await db.insert(learningChunks).values([
      seedChunk('chunk-with', 't1', 'With Embedding', { embedding }),
      seedChunk('chunk-without', 't1', 'No Embedding'), // null embedding
    ]);

    const result = await adapter.searchByVector(queryVector);

    const chunkIds = result.results.filter(r => r.resultType === 'chunk').map(r => r.id);
    expect(chunkIds).toContain('chunk-with');
    expect(chunkIds).not.toContain('chunk-without');
  });

  it('returns empty results when no embeddings match', async () => {
    const db = getSql();
    const queryVector = sparseVector(0);

    // Only chunks without embeddings
    await db.insert(learningTopics).values([seedTopic('t1', 'Topic')]);
    await db.insert(learningChunks).values([seedChunk('chunk-no-emb', 't1', 'No Embedding')]);

    const result = await adapter.searchByVector(queryVector);

    expect(result.results).toHaveLength(0);
    expect(result.counts.total).toBe(0);
  });

  it('includes topic results from summaryEmbedding', async () => {
    const db = getSql();
    const queryVector = sparseVector(0);
    const topicEmbedding = multiSparseVector([
      [0, 0.85],
      [2, 0.15],
    ]);

    await db
      .insert(learningTopics)
      .values([seedTopic('t-emb', 'Embedded Topic', { embedding: topicEmbedding })]);

    const result = await adapter.searchByVector(queryVector);

    const topicResults = result.results.filter(r => r.resultType === 'topic');
    expect(topicResults).toHaveLength(1);
    expect(topicResults[0].id).toBe('t-emb');
    expect(topicResults[0].similarityScore).toBeGreaterThan(VECTOR_SIMILARITY_THRESHOLD);
  });

  it('respects limit parameter', async () => {
    const db = getSql();
    const queryVector = sparseVector(0);

    await db.insert(learningTopics).values([seedTopic('t1', 'Topic')]);
    // Insert multiple chunks with embeddings
    const chunks = Array.from({ length: 5 }, (_, i) =>
      seedChunk(`chunk-${i}`, 't1', `Chunk ${i}`, {
        embedding: multiSparseVector([
          [0, 0.9 - i * 0.05],
          [1, 0.1 + i * 0.05],
        ]),
      })
    );
    await db.insert(learningChunks).values(chunks);

    const result = await adapter.searchByVector(queryVector, { limit: 2 });

    expect(result.results.length).toBeLessThanOrEqual(2);
  });
});
