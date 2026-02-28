import type { SearchLearningContentInput, SearchResultSet } from '../domain/types/search-tools.js';

/**
 * Port interface for search operations.
 *
 * Split into query-based and vector-based search per ADR-04:
 * - searchByQuery: keyword/text search (implemented today)
 * - searchByVector: vector-similarity search with pre-computed embeddings (future)
 *
 * This separation enables 0-token CI: integration tests for vector search
 * seed the DB with pre-computed embeddings, no embedding API calls.
 */
export interface SearchPort {
  searchByQuery(input: SearchLearningContentInput): Promise<SearchResultSet>;
  searchByVector(
    vector: number[],
    options?: { limit?: number; subject?: string }
  ): Promise<SearchResultSet>;
}
