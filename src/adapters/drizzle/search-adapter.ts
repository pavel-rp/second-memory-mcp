import { and, eq, or, sql, type SQL } from 'drizzle-orm';
import { getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import { learningChunks, learningTopics } from '../../infrastructure/db/schema.js';
import type {
  SearchLearningContentInput,
  SearchResultItem,
  SearchResultSet,
} from '../../domain/types/search-tools.js';
import type { SearchPort } from '../../ports/search-port.js';
import { calculateSimilarityRatio } from '../../shared/content-similarity.js';

type NormalizedQuery = { original: string; normalized: string; tokens: string[] };

function normalizeSearchQuery(query: string): NormalizedQuery {
  const normalized = query.toLowerCase().trim();
  const tokens = normalized
    .split(/\s+/)
    .filter(t => t.length > 0)
    .slice(0, 10);
  return { original: query, normalized, tokens };
}

function buildTokenConditions(
  column: typeof learningTopics.title | typeof learningChunks.title | typeof learningChunks.content,
  tokens: string[]
): SQL[] {
  return tokens.map(token => sql`lower(${column}) LIKE ${`%${token}%`}`);
}

function combineTokenConditions(conditions: SQL[]): SQL | undefined {
  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return or(...conditions);
}

function combineConditions(conditions: SQL[]): SQL | undefined {
  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return and(...conditions);
}

function computeMatchScore(candidate: string, query: NormalizedQuery): number {
  const lower = candidate.toLowerCase();
  let score = 0;
  if (lower === query.normalized) score += 1.0;
  if (lower.includes(query.normalized)) score += 0.5;
  for (const token of query.tokens) {
    if (lower.includes(token)) score += 0.2;
  }
  score += calculateSimilarityRatio(lower, query.normalized) * 0.3;
  return score;
}

type TopicRow = {
  id: string;
  title: string;
  subject: string;
  createdAt: number;
  updatedAt: number;
};

type ChunkRow = {
  id: string;
  topicId: string;
  title: string;
  subject: string;
  content: string | null;
  createdAt: number;
  updatedAt: number;
  topicTitle: string | null;
};

export class DrizzleSearchAdapter implements SearchPort {
  constructor(private db: SqlDb = getSql()) {}

  async searchByQuery(input: SearchLearningContentInput): Promise<SearchResultSet> {
    const query = normalizeSearchQuery(input.query);
    const limit = input.limit || 10;
    if (query.tokens.length === 0) {
      return this.emptyResult(input.query, query, limit, input.subject);
    }

    const fetchLimit = limit * 3;
    const [topics, chunks] = await Promise.all([
      this.fetchTopics(query, input.subject, fetchLimit),
      this.fetchChunks(query, input.subject, fetchLimit),
    ]);

    const topicResults: SearchResultItem[] = topics.map(row => ({
      resultType: 'topic' as const,
      id: row.id,
      title: row.title,
      subject: row.subject,
      matchScore: computeMatchScore(row.title, query),
      highlightTerms: query.tokens.filter(t => row.title.toLowerCase().includes(t)),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    const chunkResults: SearchResultItem[] = chunks.map(row => {
      const titleScore = computeMatchScore(row.title, query);
      const contentScore = row.content ? computeMatchScore(row.content, query) * 0.8 : 0;
      const allText = row.title + (row.content || '');
      return {
        resultType: 'chunk' as const,
        id: row.id,
        title: row.title,
        subject: row.subject,
        matchScore: Math.max(titleScore, contentScore),
        highlightTerms: query.tokens.filter(t => allText.toLowerCase().includes(t)),
        topicId: row.topicId,
        topicTitle: row.topicTitle ?? undefined,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    });

    const all = [...topicResults, ...chunkResults];
    all.sort((a, b) => b.matchScore - a.matchScore);
    const results = all.slice(0, limit);

    return {
      query: input.query,
      normalizedQuery: query.normalized,
      tokens: query.tokens,
      limit,
      filters: { subject: input.subject },
      counts: {
        topics: topicResults.length,
        chunks: chunkResults.length,
        total: all.length,
      },
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
    nq: NormalizedQuery,
    limit: number,
    subject?: string
  ): SearchResultSet {
    return {
      query,
      normalizedQuery: nq.normalized,
      tokens: nq.tokens,
      limit,
      filters: { subject },
      counts: { topics: 0, chunks: 0, total: 0 },
      results: [],
    };
  }

  private async fetchTopics(
    query: NormalizedQuery,
    subject: string | undefined,
    fetchLimit: number
  ): Promise<TopicRow[]> {
    const tokenCondition = combineTokenConditions(
      buildTokenConditions(learningTopics.title, query.tokens)
    );
    const conditions: SQL[] = tokenCondition ? [tokenCondition] : [];
    if (subject) conditions.push(eq(learningTopics.subject, subject));

    const baseQuery = this.db
      .select({
        id: learningTopics.id,
        title: learningTopics.title,
        subject: learningTopics.subject,
        createdAt: learningTopics.createdAt,
        updatedAt: learningTopics.updatedAt,
      })
      .from(learningTopics);

    const combined = combineConditions(conditions);
    return combined
      ? await baseQuery.where(combined).limit(fetchLimit)
      : await baseQuery.limit(fetchLimit);
  }

  private async fetchChunks(
    query: NormalizedQuery,
    subject: string | undefined,
    fetchLimit: number
  ): Promise<ChunkRow[]> {
    const titleConditions = buildTokenConditions(learningChunks.title, query.tokens);
    const contentConditions = buildTokenConditions(learningChunks.content, query.tokens);
    const tokenCondition = combineTokenConditions([...titleConditions, ...contentConditions]);

    const conditions: SQL[] = tokenCondition ? [tokenCondition] : [];
    if (subject) conditions.push(eq(learningChunks.subject, subject));

    const baseQuery = this.db
      .select({
        id: learningChunks.id,
        topicId: learningChunks.topicId,
        title: learningChunks.title,
        subject: learningChunks.subject,
        content: learningChunks.content,
        createdAt: learningChunks.createdAt,
        updatedAt: learningChunks.updatedAt,
        topicTitle: learningTopics.title,
      })
      .from(learningChunks)
      .leftJoin(learningTopics, eq(learningChunks.topicId, learningTopics.id));

    const combined = combineConditions(conditions);
    return combined
      ? await baseQuery.where(combined).limit(fetchLimit)
      : await baseQuery.limit(fetchLimit);
  }
}
