import { and, eq, sql, type SQL } from 'drizzle-orm';
import { getSql } from '../db/operations.js';
import { learningChunks, learningTopics } from '../db/schema.js';
import {
  type SearchLearningContentInput,
  type SearchResultItem,
  type SearchResultSet,
} from '../types/search-tools.js';
import { calculateSimilarityRatio } from '../utils/content-similarity.js';

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
  createdAt: number;
  updatedAt: number;
  topicTitle: string | null;
};

const FETCH_MULTIPLIER = 3;

type NormalizedQuery = {
  normalized: string;
  tokens: string[];
};

function normalizeSearchQuery(query: string): NormalizedQuery {
  const normalized = query.trim().toLowerCase();
  const tokenMatches = normalized.match(/[a-z0-9+#.]+/g);
  const tokens = tokenMatches ? Array.from(new Set(tokenMatches.filter(Boolean))) : [];

  if (tokens.length === 0 && normalized.length > 0) {
    tokens.push(normalized);
  }

  return {
    normalized,
    tokens,
  };
}

function buildTokenConditions(
  column: typeof learningTopics.title | typeof learningChunks.title,
  tokens: string[]
): SQL[] {
  return tokens.map(token => sql`lower(${column}) LIKE ${`%${token}%`}`);
}

function combineConditions(conditions: SQL[]): SQL | undefined {
  if (conditions.length === 0) {
    return undefined;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return and(...conditions);
}

function computeMatchScore(candidate: string, query: NormalizedQuery): number {
  const candidateLower = candidate.toLowerCase();
  const similarity = calculateSimilarityRatio(candidateLower, query.normalized);
  const matchedTokens =
    query.tokens.length === 0
      ? 0
      : query.tokens.filter(token => candidateLower.includes(token)).length / query.tokens.length;

  const prefixBonus = query.tokens.some(token => candidateLower.startsWith(token)) ? 0.1 : 0;
  const exactMatchBonus = candidateLower === query.normalized ? 0.2 : 0;

  const rawScore = similarity * 0.6 + matchedTokens * 0.3 + prefixBonus + exactMatchBonus;
  const boundedScore = Math.max(0, Math.min(1, rawScore));

  return Number(boundedScore.toFixed(4));
}

function toTopicResult(row: TopicRow, query: NormalizedQuery): SearchResultItem {
  const highlightTerms = query.tokens.filter(token => row.title.toLowerCase().includes(token));

  return {
    resultType: 'topic',
    id: row.id,
    title: row.title,
    subject: row.subject,
    matchScore: computeMatchScore(row.title, query),
    highlightTerms,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toChunkResult(row: ChunkRow, query: NormalizedQuery): SearchResultItem {
  const highlightTerms = query.tokens.filter(token => row.title.toLowerCase().includes(token));

  return {
    resultType: 'chunk',
    id: row.id,
    title: row.title,
    subject: row.subject,
    matchScore: computeMatchScore(row.title, query),
    highlightTerms,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    topicId: row.topicId,
    topicTitle: row.topicTitle ?? undefined,
  };
}

export async function searchLearningContent(
  input: SearchLearningContentInput
): Promise<SearchResultSet> {
  const db = getSql();
  const limit = Math.min(Math.max(input.limit ?? 10, 1), 50);
  const fetchLimit = Math.max(limit * FETCH_MULTIPLIER, limit);
  const normalizedQuery = normalizeSearchQuery(input.query);

  const topicTokenConditions = buildTokenConditions(learningTopics.title, normalizedQuery.tokens);
  const topicConditions: SQL[] = [...topicTokenConditions];
  if (input.subject) {
    topicConditions.push(eq(learningTopics.subject, input.subject));
  }

  const topicCondition = combineConditions(topicConditions);

  const topicQuery = db
    .select({
      id: learningTopics.id,
      title: learningTopics.title,
      subject: learningTopics.subject,
      createdAt: learningTopics.createdAt,
      updatedAt: learningTopics.updatedAt,
    })
    .from(learningTopics);

  const topics: TopicRow[] = topicCondition
    ? topicQuery.where(topicCondition).limit(fetchLimit).all()
    : topicQuery.limit(fetchLimit).all();

  const chunkTokenConditions = buildTokenConditions(learningChunks.title, normalizedQuery.tokens);
  const chunkConditions: SQL[] = [...chunkTokenConditions];
  if (input.subject) {
    chunkConditions.push(eq(learningChunks.subject, input.subject));
  }

  const chunkCondition = combineConditions(chunkConditions);

  const chunkQuery = db
    .select({
      id: learningChunks.id,
      topicId: learningChunks.topicId,
      title: learningChunks.title,
      subject: learningChunks.subject,
      createdAt: learningChunks.createdAt,
      updatedAt: learningChunks.updatedAt,
      topicTitle: learningTopics.title,
    })
    .from(learningChunks)
    .leftJoin(learningTopics, eq(learningChunks.topicId, learningTopics.id));

  const chunks: ChunkRow[] = chunkCondition
    ? chunkQuery.where(chunkCondition).limit(fetchLimit).all()
    : chunkQuery.limit(fetchLimit).all();

  const topicResults = topics.map(row => toTopicResult(row, normalizedQuery));
  const chunkResults = chunks.map(row => toChunkResult(row, normalizedQuery));

  const allResults = [...topicResults, ...chunkResults].sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }

    if (a.resultType === b.resultType) {
      return a.title.localeCompare(b.title);
    }

    return a.resultType === 'topic' ? -1 : 1;
  });

  const limitedResults = allResults.slice(0, limit);

  let limitedTopicCount = 0;
  let limitedChunkCount = 0;
  for (const result of limitedResults) {
    if (result.resultType === 'topic') {
      limitedTopicCount += 1;
    } else if (result.resultType === 'chunk') {
      limitedChunkCount += 1;
    }
  }

  return {
    query: input.query,
    normalizedQuery: normalizedQuery.normalized,
    tokens: normalizedQuery.tokens,
    limit,
    filters: input.subject ? { subject: input.subject } : {},
    counts: {
      topics: limitedTopicCount,
      chunks: limitedChunkCount,
      total: limitedResults.length,
    },
    results: limitedResults,
  };
}
