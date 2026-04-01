import { describe, it, expect, vi } from 'vitest';
import {
  searchLearningContent,
  type SearchDeps,
} from '../../../src/orchestration/search-workflows.js';
import type { SearchPort } from '../../../src/ports/search-port.js';
import type { EmbeddingPort } from '../../../src/ports/embedding-port.js';
import type { SearchResultSet } from '../../../src/domain/types/search-tools.js';
import {
  DEFAULT_HYBRID_KEYWORD_WEIGHT,
  DEFAULT_HYBRID_SEMANTIC_WEIGHT,
} from '../../../src/domain/config/embedding-defaults.js';

// --- Helpers ---

function makeResult(
  overrides: Partial<{
    query: string;
    results: Array<{
      resultType: 'topic' | 'chunk';
      id: string;
      title: string;
      matchScore: number;
      similarityScore?: number;
    }>;
  }> = {}
): SearchResultSet {
  const results = (overrides.results ?? []).map(r => ({
    resultType: r.resultType,
    id: r.id,
    title: r.title,
    subject: 'CS',
    matchScore: r.matchScore,
    similarityScore: r.similarityScore,
    highlightTerms: [],
    createdAt: '1970-01-01T00:00:01.000Z',
    updatedAt: '1970-01-01T00:00:01.000Z',
  }));
  return {
    query: overrides.query ?? 'test',
    normalizedQuery: (overrides.query ?? 'test').toLowerCase(),
    tokens: (overrides.query ?? 'test').split(' '),
    limit: 10,
    filters: {},
    counts: {
      topics: results.filter(r => r.resultType === 'topic').length,
      chunks: results.filter(r => r.resultType === 'chunk').length,
      total: results.length,
    },
    results,
  };
}

function makeSearchPort(overrides?: Partial<SearchPort>): SearchPort {
  return {
    searchByQuery: vi.fn().mockResolvedValue(makeResult()),
    searchByVector: vi.fn().mockResolvedValue(makeResult()),
    ...overrides,
  } as SearchPort;
}

function makeEmbeddingPort(overrides?: Partial<EmbeddingPort>): EmbeddingPort {
  return {
    embedText: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    embedTexts: vi
      .fn()
      .mockImplementation((texts: string[]) => Promise.resolve(texts.map(() => [0.1, 0.2, 0.3]))),
    getDimensions: vi.fn().mockReturnValue(1536),
    ...overrides,
  } as EmbeddingPort;
}

// --- Tests ---

describe('searchLearningContent — mode dispatch', () => {
  it('defaults to keyword mode when mode is omitted', async () => {
    const search = makeSearchPort();
    const deps: SearchDeps = { search };

    await searchLearningContent({ query: 'trees' }, deps);

    expect(search.searchByQuery).toHaveBeenCalledWith({ query: 'trees' });
    expect(search.searchByVector).not.toHaveBeenCalled();
  });

  it('uses keyword mode explicitly', async () => {
    const search = makeSearchPort();
    const deps: SearchDeps = { search };

    await searchLearningContent({ query: 'trees', mode: 'keyword' }, deps);

    expect(search.searchByQuery).toHaveBeenCalled();
    expect(search.searchByVector).not.toHaveBeenCalled();
  });
});

describe('searchSemantic', () => {
  it('embeds query and calls searchByVector', async () => {
    const vectorResult = makeResult({
      results: [
        {
          resultType: 'chunk',
          id: 'c1',
          title: 'Tree Traversal',
          matchScore: 0.9,
          similarityScore: 0.9,
        },
      ],
    });
    const search = makeSearchPort({
      searchByVector: vi.fn().mockResolvedValue(vectorResult),
    });
    const embedding = makeEmbeddingPort();
    const deps: SearchDeps = { search, embedding };

    const result = await searchLearningContent({ query: 'recursion', mode: 'semantic' }, deps);

    expect(embedding.embedText).toHaveBeenCalledWith('recursion');
    expect(search.searchByVector).toHaveBeenCalledWith([0.1, 0.2, 0.3], {
      limit: undefined,
      subject: undefined,
    });
    expect(result.results).toHaveLength(1);
    expect(result.results[0].id).toBe('c1');
  });

  it('falls back to keyword when no embedding port provided', async () => {
    const keywordResult = makeResult({
      results: [{ resultType: 'topic', id: 't1', title: 'Recursion', matchScore: 0.8 }],
    });
    const search = makeSearchPort({
      searchByQuery: vi.fn().mockResolvedValue(keywordResult),
    });
    const deps: SearchDeps = { search };

    const result = await searchLearningContent({ query: 'recursion', mode: 'semantic' }, deps);

    expect(search.searchByQuery).toHaveBeenCalled();
    expect(search.searchByVector).not.toHaveBeenCalled();
    expect(result.results[0].id).toBe('t1');
  });

  it('falls back to keyword when embedText returns null', async () => {
    const search = makeSearchPort();
    const embedding = makeEmbeddingPort({
      embedText: vi.fn().mockResolvedValue(null),
    });
    const deps: SearchDeps = { search, embedding };

    await searchLearningContent({ query: 'recursion', mode: 'semantic' }, deps);

    expect(search.searchByQuery).toHaveBeenCalled();
    expect(search.searchByVector).not.toHaveBeenCalled();
  });
});

describe('searchHybrid', () => {
  it('merges keyword and semantic results with weighted scores', async () => {
    const keywordResult = makeResult({
      query: 'tree',
      results: [
        { resultType: 'topic', id: 't1', title: 'Binary Tree', matchScore: 0.9 },
        { resultType: 'chunk', id: 'c1', title: 'Tree Sort', matchScore: 0.7 },
      ],
    });
    const semanticResult = makeResult({
      query: 'tree',
      results: [
        {
          resultType: 'topic',
          id: 't1',
          title: 'Binary Tree',
          matchScore: 0.8,
          similarityScore: 0.8,
        },
        {
          resultType: 'chunk',
          id: 'c2',
          title: 'Recursion',
          matchScore: 0.85,
          similarityScore: 0.85,
        },
      ],
    });
    const search = makeSearchPort({
      searchByQuery: vi.fn().mockResolvedValue(keywordResult),
      searchByVector: vi.fn().mockResolvedValue(semanticResult),
    });
    const embedding = makeEmbeddingPort();
    const deps: SearchDeps = { search, embedding };

    const result = await searchLearningContent({ query: 'tree', mode: 'hybrid' }, deps);

    // Scores are normalized to [0,1] before weighting (maxKeyword=0.9, maxSemantic=0.85)
    // Uses the default hybrid weight constants from embedding-defaults for deterministic expectations.
    const KW = DEFAULT_HYBRID_KEYWORD_WEIGHT;
    const SM = DEFAULT_HYBRID_SEMANTIC_WEIGHT;

    // t1 appears in both: KW*(0.9/0.9) + SM*(0.8/0.85)
    const t1 = result.results.find(r => r.id === 't1');
    expect(t1).toBeDefined();
    expect(t1!.matchScore).toBeCloseTo(KW + SM * (0.8 / 0.85), 5);
    expect(t1!.similarityScore).toBe(0.8);

    // c1 only in keyword: KW*(0.7/0.9) + SM*0
    const c1 = result.results.find(r => r.id === 'c1');
    expect(c1).toBeDefined();
    expect(c1!.matchScore).toBeCloseTo(KW * (0.7 / 0.9), 5);
    expect(c1!.similarityScore).toBeUndefined();

    // c2 only in semantic: KW*0 + SM*(0.85/0.85) = SM
    const c2 = result.results.find(r => r.id === 'c2');
    expect(c2).toBeDefined();
    expect(c2!.matchScore).toBeCloseTo(SM, 5);
    expect(c2!.similarityScore).toBe(0.85);

    // Sorted by matchScore descending
    expect(result.results[0].id).toBe('t1');
  });

  it('returns keyword-only results when embedding is unavailable', async () => {
    const keywordResult = makeResult({
      results: [{ resultType: 'topic', id: 't1', title: 'Test', matchScore: 0.5 }],
    });
    const search = makeSearchPort({
      searchByQuery: vi.fn().mockResolvedValue(keywordResult),
    });
    const deps: SearchDeps = { search };

    const result = await searchLearningContent({ query: 'test', mode: 'hybrid' }, deps);

    expect(result.results).toHaveLength(1);
    expect(result.results[0].id).toBe('t1');
    expect(search.searchByVector).not.toHaveBeenCalled();
  });

  it('respects limit in merged results', async () => {
    const keywordResult = makeResult({
      results: [
        { resultType: 'topic', id: 't1', title: 'A', matchScore: 0.9 },
        { resultType: 'topic', id: 't2', title: 'B', matchScore: 0.8 },
        { resultType: 'topic', id: 't3', title: 'C', matchScore: 0.7 },
      ],
    });
    const semanticResult = makeResult({
      results: [
        { resultType: 'chunk', id: 'c1', title: 'D', matchScore: 0.95, similarityScore: 0.95 },
        { resultType: 'chunk', id: 'c2', title: 'E', matchScore: 0.85, similarityScore: 0.85 },
      ],
    });
    const search = makeSearchPort({
      searchByQuery: vi.fn().mockResolvedValue(keywordResult),
      searchByVector: vi.fn().mockResolvedValue(semanticResult),
    });
    const embedding = makeEmbeddingPort();
    const deps: SearchDeps = { search, embedding };

    const result = await searchLearningContent({ query: 'test', mode: 'hybrid', limit: 2 }, deps);

    expect(result.results).toHaveLength(2);
  });
});
