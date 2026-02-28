import type { SearchPort } from '../../../src/ports/search-port.js';
import type {
  SearchLearningContentInput,
  SearchResultItem,
  SearchResultSet,
} from '../../../src/domain/types/search-tools.js';
import { InMemoryChunkRepository } from './chunk-repository.js';
import { InMemoryTopicRepository } from './topic-repository.js';

export class InMemorySearchAdapter implements SearchPort {
  constructor(
    private chunkRepo: InMemoryChunkRepository,
    private topicRepo: InMemoryTopicRepository
  ) {}

  async searchByQuery(input: SearchLearningContentInput): Promise<SearchResultSet> {
    const query = input.query.toLowerCase().trim();
    const tokens = query.split(/\s+/).filter(t => t.length > 0);
    const limit = input.limit || 10;

    if (tokens.length === 0) {
      return this.emptyResult(input.query, query, tokens, limit, input.subject);
    }

    const topicResults: SearchResultItem[] = [];
    for (const topic of this.topicRepo.getStore().values()) {
      if (input.subject && topic.subject !== input.subject) continue;
      const title = topic.title.toLowerCase();
      const matchingTokens = tokens.filter(t => title.includes(t));
      if (matchingTokens.length > 0) {
        topicResults.push({
          resultType: 'topic',
          id: topic.id,
          title: topic.title,
          subject: topic.subject,
          matchScore: matchingTokens.length / tokens.length,
          highlightTerms: matchingTokens,
          createdAt: topic.createdAt,
          updatedAt: topic.updatedAt,
        });
      }
    }

    const chunkResults: SearchResultItem[] = [];
    for (const chunk of this.chunkRepo.getStore().values()) {
      if (input.subject && chunk.subject !== input.subject) continue;
      const text = (chunk.title + ' ' + (chunk.content || '')).toLowerCase();
      const matchingTokens = tokens.filter(t => text.includes(t));
      if (matchingTokens.length > 0) {
        chunkResults.push({
          resultType: 'chunk',
          id: chunk.id,
          title: chunk.title,
          subject: chunk.subject,
          matchScore: matchingTokens.length / tokens.length,
          highlightTerms: matchingTokens,
          topicId: chunk.topicId,
          createdAt: chunk.createdAt,
          updatedAt: chunk.updatedAt,
        });
      }
    }

    const all = [...topicResults, ...chunkResults];
    all.sort((a, b) => b.matchScore - a.matchScore);
    const results = all.slice(0, limit);

    return {
      query: input.query,
      normalizedQuery: query,
      tokens,
      limit,
      filters: { subject: input.subject },
      counts: { topics: topicResults.length, chunks: chunkResults.length, total: all.length },
      results,
    };
  }

  async searchByVector(
    _vector: number[],
    _options?: { limit?: number; subject?: string }
  ): Promise<SearchResultSet> {
    const limit = _options?.limit || 10;
    return {
      query: '',
      normalizedQuery: '',
      tokens: [],
      limit,
      filters: { subject: _options?.subject },
      counts: { topics: 0, chunks: 0, total: 0 },
      results: [],
    };
  }

  private emptyResult(
    query: string,
    normalizedQuery: string,
    tokens: string[],
    limit: number,
    subject?: string
  ): SearchResultSet {
    return {
      query,
      normalizedQuery,
      tokens,
      limit,
      filters: { subject },
      counts: { topics: 0, chunks: 0, total: 0 },
      results: [],
    };
  }
}
