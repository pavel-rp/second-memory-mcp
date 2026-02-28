import { and, eq, or, sql, type SQL } from 'drizzle-orm';
import { getSql, type SqlDb } from '../db/operations.js';
import { learningChunks, learningTopics } from '../db/schema.js';
import {
  type SearchLearningContentInput,
  type SearchResultItem,
  type SearchResultSet,
} from '../domain/types/search-tools.js';
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
  content: string | null;
  createdAt: number;
  updatedAt: number;
  topicTitle: string | null;
};

// Fetch 3x the requested limit to allow for accurate relevance scoring and ranking
// before slicing to the final limit. This ensures we get the best matches after
// computing match scores for a larger candidate set.
const FETCH_MULTIPLIER = 3;

// Match score weighting factors (can sum > 1.0 but final score is bounded to [0, 1])
const SIMILARITY_WEIGHT = 0.6; // Overall string similarity using Levenshtein distance
const TOKEN_MATCH_WEIGHT = 0.3; // Fraction of search tokens present in candidate
const PREFIX_BONUS = 0.1; // Bonus for tokens matching at start of title
const EXACT_MATCH_BONUS = 0.2; // Bonus for exact query match after normalization

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
  column: typeof learningTopics.title | typeof learningChunks.title | typeof learningChunks.content,
  tokens: string[]
): SQL[] {
  return tokens.map(token => sql`lower(${column}) LIKE ${`%${token}%`}`);
}

function combineTokenConditions(conditions: SQL[]): SQL | undefined {
  if (conditions.length === 0) {
    return undefined;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return or(...conditions);
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

  const prefixBonus = query.tokens.some(token => candidateLower.startsWith(token))
    ? PREFIX_BONUS
    : 0;
  const exactMatchBonus = candidateLower === query.normalized ? EXACT_MATCH_BONUS : 0;

  const rawScore =
    similarity * SIMILARITY_WEIGHT +
    matchedTokens * TOKEN_MATCH_WEIGHT +
    prefixBonus +
    exactMatchBonus;
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
  const titleLower = row.title.toLowerCase();
  const contentLower = row.content?.toLowerCase() ?? '';
  const highlightTerms = query.tokens.filter(
    token => titleLower.includes(token) || contentLower.includes(token)
  );

  // Use best score from title or content, with a small boost for title matches
  const titleScore = computeMatchScore(row.title, query);
  const contentScore = row.content ? computeMatchScore(row.content, query) * 0.9 : 0;
  const matchScore = Math.max(titleScore, contentScore);

  return {
    resultType: 'chunk',
    id: row.id,
    title: row.title,
    subject: row.subject,
    matchScore,
    highlightTerms,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    topicId: row.topicId,
    topicTitle: row.topicTitle ?? undefined,
  };
}

async function fetchTopics(
  db: SqlDb,
  query: NormalizedQuery,
  subject: string | undefined,
  fetchLimit: number
): Promise<TopicRow[]> {
  const tokenCondition = combineTokenConditions(
    buildTokenConditions(learningTopics.title, query.tokens)
  );
  const conditions: SQL[] = tokenCondition ? [tokenCondition] : [];
  if (subject) conditions.push(eq(learningTopics.subject, subject));

  const baseQuery = db
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

async function fetchChunks(
  db: SqlDb,
  query: NormalizedQuery,
  subject: string | undefined,
  fetchLimit: number
): Promise<ChunkRow[]> {
  // Search both title and content columns
  const titleConditions = buildTokenConditions(learningChunks.title, query.tokens);
  const contentConditions = buildTokenConditions(learningChunks.content, query.tokens);
  const allTokenConditions = [...titleConditions, ...contentConditions];
  const tokenCondition = combineTokenConditions(allTokenConditions);

  const conditions: SQL[] = tokenCondition ? [tokenCondition] : [];
  if (subject) conditions.push(eq(learningChunks.subject, subject));

  const baseQuery = db
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

function rankAndSlice(results: SearchResultItem[], limit: number): SearchResultItem[] {
  return [...results]
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (a.resultType === b.resultType) return a.title.localeCompare(b.title);
      return a.resultType === 'topic' ? -1 : 1;
    })
    .slice(0, limit);
}

export async function searchLearningContent(
  input: SearchLearningContentInput,
  db: SqlDb = getSql()
): Promise<SearchResultSet> {
  const limit = Math.min(Math.max(input.limit ?? 10, 1), 50);
  const fetchLimit = Math.max(limit * FETCH_MULTIPLIER, limit);
  const normalizedQuery = normalizeSearchQuery(input.query);

  const topics = await fetchTopics(db, normalizedQuery, input.subject, fetchLimit);
  const chunks = await fetchChunks(db, normalizedQuery, input.subject, fetchLimit);

  const topicResults = topics.map(row => toTopicResult(row, normalizedQuery));
  const chunkResults = chunks.map(row => toChunkResult(row, normalizedQuery));
  const limitedResults = rankAndSlice([...topicResults, ...chunkResults], limit);

  let limitedTopicCount = 0;
  let limitedChunkCount = 0;
  for (const result of limitedResults) {
    if (result.resultType === 'topic') limitedTopicCount++;
    else if (result.resultType === 'chunk') limitedChunkCount++;
  }

  return {
    query: input.query,
    normalizedQuery: normalizedQuery.normalized,
    tokens: normalizedQuery.tokens,
    limit,
    filters: input.subject ? { subject: input.subject } : {},
    counts: { topics: limitedTopicCount, chunks: limitedChunkCount, total: limitedResults.length },
    results: limitedResults,
  };
}
