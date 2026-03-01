import type { SearchPort } from '../ports/search-port.js';
import type { EmbeddingPort } from '../ports/embedding-port.js';
import type {
  SearchLearningContentInput,
  SearchResultItem,
  SearchResultSet,
} from '../domain/types/search-tools.js';
import { HYBRID_KEYWORD_WEIGHT, HYBRID_SEMANTIC_WEIGHT } from '../domain/config/embedding.js';
import { logger } from '../shared/logger.js';

export type SearchDeps = {
  search: SearchPort;
  embedding?: EmbeddingPort;
};

export async function searchLearningContent(
  input: SearchLearningContentInput,
  deps: SearchDeps
): Promise<SearchResultSet> {
  const mode = input.mode ?? 'keyword';

  switch (mode) {
    case 'semantic':
      return searchSemantic(input, deps);
    case 'hybrid':
      return searchHybrid(input, deps);
    default:
      return deps.search.searchByQuery(input);
  }
}

async function searchSemantic(
  input: SearchLearningContentInput,
  deps: SearchDeps
): Promise<SearchResultSet> {
  if (!deps.embedding?.isAvailable()) {
    logger.warn(
      'Semantic search requested but no embedding provider configured — falling back to keyword'
    );
    return deps.search.searchByQuery(input);
  }

  const queryVector = await deps.embedding.embedText(input.query);
  if (!queryVector) {
    logger.warn('Failed to embed search query — falling back to keyword');
    return deps.search.searchByQuery(input);
  }

  const result = await deps.search.searchByVector(queryVector, {
    limit: input.limit,
    subject: input.subject,
  });

  // Preserve original query metadata — searchByVector returns empty query fields
  const normalizedQuery = input.query.trim().toLowerCase();
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  return {
    ...result,
    query: input.query,
    normalizedQuery,
    tokens,
  };
}

async function searchHybrid(
  input: SearchLearningContentInput,
  deps: SearchDeps
): Promise<SearchResultSet> {
  const keywordResults = await deps.search.searchByQuery(input);

  if (!deps.embedding?.isAvailable()) {
    logger.warn(
      'Hybrid search requested but no embedding provider — returning keyword results only'
    );
    return keywordResults;
  }

  const queryVector = await deps.embedding.embedText(input.query);
  if (!queryVector) {
    logger.warn('Failed to embed search query — returning keyword results only');
    return keywordResults;
  }

  const semanticResults = await deps.search.searchByVector(queryVector, {
    limit: input.limit,
    subject: input.subject,
  });

  return mergeHybridResults(keywordResults, semanticResults, input.limit ?? 10);
}

function mergeHybridResults(
  keyword: SearchResultSet,
  semantic: SearchResultSet,
  limit: number
): SearchResultSet {
  const scoreMap = new Map<
    string,
    { item: SearchResultItem; keywordScore: number; semanticScore: number }
  >();

  for (const item of keyword.results) {
    const key = `${item.resultType}:${item.id}`;
    scoreMap.set(key, { item, keywordScore: item.matchScore, semanticScore: 0 });
  }

  for (const item of semantic.results) {
    const key = `${item.resultType}:${item.id}`;
    const existing = scoreMap.get(key);
    if (existing) {
      existing.semanticScore = item.similarityScore ?? item.matchScore;
    } else {
      scoreMap.set(key, {
        item,
        keywordScore: 0,
        semanticScore: item.similarityScore ?? item.matchScore,
      });
    }
  }

  // Normalize scores to [0, 1] before weighting — keyword matchScore can exceed 1.0
  // (exact match + substring + token hits + similarity ratio) while semantic scores
  // are already in [0, 1] after cosine similarity thresholding.
  let maxKeywordScore = 0;
  let maxSemanticScore = 0;
  for (const { keywordScore, semanticScore } of scoreMap.values()) {
    if (keywordScore > maxKeywordScore) maxKeywordScore = keywordScore;
    if (semanticScore > maxSemanticScore) maxSemanticScore = semanticScore;
  }

  const merged = Array.from(scoreMap.values()).map(({ item, keywordScore, semanticScore }) => {
    const normalizedKeyword = maxKeywordScore > 0 ? keywordScore / maxKeywordScore : 0;
    const normalizedSemantic = maxSemanticScore > 0 ? semanticScore / maxSemanticScore : 0;
    return {
      ...item,
      matchScore:
        HYBRID_KEYWORD_WEIGHT * normalizedKeyword + HYBRID_SEMANTIC_WEIGHT * normalizedSemantic,
      similarityScore: semanticScore > 0 ? semanticScore : undefined,
    };
  });

  merged.sort((a, b) => b.matchScore - a.matchScore);
  const results = merged.slice(0, limit);

  return {
    query: keyword.query,
    normalizedQuery: keyword.normalizedQuery,
    tokens: keyword.tokens,
    limit,
    filters: keyword.filters,
    counts: {
      topics: results.filter(r => r.resultType === 'topic').length,
      chunks: results.filter(r => r.resultType === 'chunk').length,
      total: results.length,
    },
    results,
  };
}
