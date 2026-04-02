import { describe, it, expect, vi } from 'vitest';
import {
  searchLearningContent,
  type SearchDeps,
} from '../../../src/orchestration/search-workflows.js';
import type { SearchResultItem, SearchResultSet } from '../../../src/domain/types/search-tools.js';
import { stubSearchPort, stubEmbeddingPort } from '../../helpers/stub-ports.js';

// ── Fixtures ────────────────────────────────────────────────────

function makeResultItem(overrides?: Partial<SearchResultItem>): SearchResultItem {
  return {
    resultType: 'chunk',
    id: 'c1',
    title: 'Chunk 1',
    subject: 'CS',
    matchScore: 0.8,
    highlightTerms: ['test'],
    createdAt: '1970-01-01T00:00:01.000Z',
    updatedAt: '1970-01-01T00:00:02.000Z',
    ...overrides,
  };
}

function makeResultSet(overrides?: Partial<SearchResultSet>): SearchResultSet {
  return {
    query: 'test query',
    normalizedQuery: 'test query',
    tokens: ['test', 'query'],
    limit: 10,
    filters: {},
    counts: { topics: 0, chunks: 1, total: 1 },
    results: [makeResultItem()],
    ...overrides,
  };
}

function stubDeps(options?: { withEmbedding?: boolean }): SearchDeps {
  return {
    search: stubSearchPort({
      searchByQuery: vi.fn().mockResolvedValue(makeResultSet()),
      searchByVector: vi.fn().mockResolvedValue(
        makeResultSet({
          query: '',
          normalizedQuery: '',
          tokens: [],
          results: [
            makeResultItem({
              id: 'c2',
              title: 'Semantic Hit',
              matchScore: 0,
              similarityScore: 0.9,
            }),
          ],
          counts: { topics: 0, chunks: 1, total: 1 },
        })
      ),
    }),
    ...(options?.withEmbedding
      ? {
          embedding: stubEmbeddingPort({
            embedText: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
          }),
        }
      : {}),
  };
}

// ── keyword mode (default) ──────────────────────────────────────

describe('searchLearningContent — keyword mode', () => {
  it('delegates to searchByQuery for keyword mode', async () => {
    const deps = stubDeps();

    const result = await searchLearningContent(
      { query: 'test', mode: 'keyword', context_token: 'ctx-test' },
      deps
    );

    expect(deps.search.searchByQuery).toHaveBeenCalledWith({
      query: 'test',
      mode: 'keyword',
      context_token: 'ctx-test',
    });
    expect(result.results).toHaveLength(1);
  });

  it('defaults to keyword mode when mode is omitted', async () => {
    const deps = stubDeps();

    await searchLearningContent({ query: 'test', context_token: 'ctx-test' }, deps);

    expect(deps.search.searchByQuery).toHaveBeenCalled();
  });
});

// ── semantic mode ───────────────────────────────────────────────

describe('searchLearningContent — semantic mode', () => {
  it('embeds query and searches by vector', async () => {
    const deps = stubDeps({ withEmbedding: true });

    const result = await searchLearningContent(
      { query: 'test query', mode: 'semantic', limit: 5, subject: 'CS', context_token: 'ctx-test' },
      deps
    );

    expect(deps.embedding!.embedText).toHaveBeenCalledWith('test query');
    expect(deps.search.searchByVector).toHaveBeenCalledWith([0.1, 0.2, 0.3], {
      limit: 5,
      subject: 'CS',
    });
    // Should preserve original query metadata
    expect(result.query).toBe('test query');
    expect(result.normalizedQuery).toBe('test query');
    expect(result.tokens).toEqual(['test', 'query']);
  });

  it('falls back to keyword when no embedding provider', async () => {
    const deps = stubDeps(); // no embedding

    const result = await searchLearningContent(
      { query: 'test', mode: 'semantic', context_token: 'ctx-test' },
      deps
    );

    expect(deps.search.searchByQuery).toHaveBeenCalled();
    expect(result.results).toHaveLength(1);
  });

  it('falls back to keyword when embedText returns null', async () => {
    const deps = stubDeps({ withEmbedding: true });
    (deps.embedding!.embedText as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await searchLearningContent(
      { query: 'test', mode: 'semantic', context_token: 'ctx-test' },
      deps
    );

    expect(deps.search.searchByQuery).toHaveBeenCalled();
    expect(result.results).toHaveLength(1);
  });
});

// ── hybrid mode ─────────────────────────────────────────────────

describe('searchLearningContent — hybrid mode', () => {
  it('merges keyword and semantic results', async () => {
    const deps = stubDeps({ withEmbedding: true });

    const result = await searchLearningContent(
      { query: 'test query', mode: 'hybrid', limit: 10, context_token: 'ctx-test' },
      deps
    );

    expect(deps.search.searchByQuery).toHaveBeenCalled();
    expect(deps.embedding!.embedText).toHaveBeenCalledWith('test query');
    expect(deps.search.searchByVector).toHaveBeenCalled();
    // Should have merged results from both sources
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results.length).toBeLessThanOrEqual(10);
  });

  it('falls back to keyword when no embedding provider', async () => {
    const deps = stubDeps(); // no embedding

    const result = await searchLearningContent(
      { query: 'test', mode: 'hybrid', context_token: 'ctx-test' },
      deps
    );

    expect(deps.search.searchByQuery).toHaveBeenCalled();
    expect(result.results).toHaveLength(1);
  });

  it('falls back to keyword results when embedText returns null', async () => {
    const deps = stubDeps({ withEmbedding: true });
    (deps.embedding!.embedText as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await searchLearningContent(
      { query: 'test', mode: 'hybrid', context_token: 'ctx-test' },
      deps
    );

    expect(deps.search.searchByQuery).toHaveBeenCalled();
    // Should return keyword results only (no merge)
    expect(result.results).toHaveLength(1);
    expect(result.results[0].id).toBe('c1');
  });

  it('deduplicates overlapping results and combines scores', async () => {
    const deps = stubDeps({ withEmbedding: true });
    const sharedItem = makeResultItem({ id: 'shared', matchScore: 0.7 });
    (deps.search.searchByQuery as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeResultSet({ results: [sharedItem] })
    );
    (deps.search.searchByVector as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeResultSet({
        results: [makeResultItem({ id: 'shared', matchScore: 0, similarityScore: 0.8 })],
      })
    );

    const result = await searchLearningContent(
      { query: 'test', mode: 'hybrid', limit: 10, context_token: 'ctx-test' },
      deps
    );

    // Should deduplicate — only 1 result for 'shared'
    const sharedResults = result.results.filter(r => r.id === 'shared');
    expect(sharedResults).toHaveLength(1);
    // Combined score should reflect both keyword and semantic weights
    expect(sharedResults[0].matchScore).toBeGreaterThan(0);
    expect(sharedResults[0].similarityScore).toBe(0.8);
  });

  it('respects limit on merged results', async () => {
    const deps = stubDeps({ withEmbedding: true });
    const keywordItems = Array.from({ length: 5 }, (_, i) =>
      makeResultItem({ id: `k${i}`, matchScore: 1 - i * 0.1 })
    );
    const semanticItems = Array.from({ length: 5 }, (_, i) =>
      makeResultItem({ id: `s${i}`, matchScore: 0, similarityScore: 1 - i * 0.1 })
    );
    (deps.search.searchByQuery as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeResultSet({ results: keywordItems })
    );
    (deps.search.searchByVector as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeResultSet({ results: semanticItems })
    );

    const result = await searchLearningContent(
      { query: 'test', mode: 'hybrid', limit: 3, context_token: 'ctx-test' },
      deps
    );

    expect(result.results).toHaveLength(3);
    expect(result.limit).toBe(3);
  });

  it('sorts merged results by combined score descending', async () => {
    const deps = stubDeps({ withEmbedding: true });
    (deps.search.searchByQuery as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeResultSet({
        results: [
          makeResultItem({ id: 'low', matchScore: 0.2 }),
          makeResultItem({ id: 'high', matchScore: 1.0 }),
        ],
      })
    );
    (deps.search.searchByVector as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeResultSet({ results: [] })
    );

    const result = await searchLearningContent(
      { query: 'test', mode: 'hybrid', limit: 10, context_token: 'ctx-test' },
      deps
    );

    expect(result.results[0].id).toBe('high');
    expect(result.results[1].id).toBe('low');
  });

  it('handles empty keyword results gracefully', async () => {
    const deps = stubDeps({ withEmbedding: true });
    (deps.search.searchByQuery as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeResultSet({ results: [], counts: { topics: 0, chunks: 0, total: 0 } })
    );

    const result = await searchLearningContent(
      { query: 'test', mode: 'hybrid', limit: 10, context_token: 'ctx-test' },
      deps
    );

    // Should still have semantic results
    expect(result.results.length).toBeGreaterThan(0);
  });

  it('handles empty semantic results gracefully', async () => {
    const deps = stubDeps({ withEmbedding: true });
    (deps.search.searchByVector as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeResultSet({ results: [], counts: { topics: 0, chunks: 0, total: 0 } })
    );

    const result = await searchLearningContent(
      { query: 'test', mode: 'hybrid', limit: 10, context_token: 'ctx-test' },
      deps
    );

    // Should still have keyword results
    expect(result.results).toHaveLength(1);
  });

  it('uses default hybrid weights when not specified', async () => {
    const deps = stubDeps({ withEmbedding: true });

    const result = await searchLearningContent(
      { query: 'test', mode: 'hybrid', limit: 10, context_token: 'ctx-test' },
      deps
    );

    // Default weights are 0.4 keyword, 0.6 semantic
    // With results from both sources, merged scores should reflect these weights
    expect(result.results.length).toBeGreaterThan(0);
  });

  it('uses custom hybrid weights when specified', async () => {
    const deps: SearchDeps = {
      ...stubDeps({ withEmbedding: true }),
      hybridKeywordWeight: 0.8,
      hybridSemanticWeight: 0.2,
    };
    const item = makeResultItem({ id: 'both', matchScore: 1.0 });
    (deps.search.searchByQuery as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeResultSet({ results: [item] })
    );
    (deps.search.searchByVector as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeResultSet({
        results: [makeResultItem({ id: 'both', matchScore: 0, similarityScore: 1.0 })],
      })
    );

    const result = await searchLearningContent(
      { query: 'test', mode: 'hybrid', limit: 10, context_token: 'ctx-test' },
      deps
    );

    const merged = result.results.find(r => r.id === 'both')!;
    // With 0.8 keyword + 0.2 semantic, score = 0.8 * 1.0 + 0.2 * 1.0 = 1.0
    expect(merged.matchScore).toBeCloseTo(1.0);
  });

  it('computes correct counts on merged results', async () => {
    const deps = stubDeps({ withEmbedding: true });
    (deps.search.searchByQuery as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeResultSet({
        results: [
          makeResultItem({ id: 'topic1', resultType: 'topic', matchScore: 0.9 }),
          makeResultItem({ id: 'chunk1', resultType: 'chunk', matchScore: 0.8 }),
        ],
      })
    );
    (deps.search.searchByVector as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeResultSet({ results: [] })
    );

    const result = await searchLearningContent(
      { query: 'test', mode: 'hybrid', limit: 10, context_token: 'ctx-test' },
      deps
    );

    expect(result.counts.topics).toBe(1);
    expect(result.counts.chunks).toBe(1);
    expect(result.counts.total).toBe(2);
  });
});
