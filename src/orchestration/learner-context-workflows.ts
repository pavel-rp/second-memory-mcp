import type { AlgorithmConfig } from '../domain/config/algorithm.js';
import type { ChunkRepository, ChunkMinimalMetadata } from '../ports/chunk-repository.js';
import type { TopicRepository } from '../ports/topic-repository.js';
import type { SessionRepository } from '../ports/session-repository.js';
import type { ReviewPersistencePort } from '../ports/review-persistence-port.js';

export type LearnerContextDeps = {
  chunks: ChunkRepository;
  topics: TopicRepository;
  sessions: SessionRepository;
  reviewPersistence: ReviewPersistencePort;
  algorithmConfig: AlgorithmConfig;
};

export type LearnerContext = {
  totalTopics: number;
  totalChunks: number;
  dueToday: number;
  overdue: number;
  overdueTopics: Array<{ title: string; daysOverdue: number; chunkCount: number }>;
  recentSubjects: string[];
  recentSessionSummary: {
    lastSessionDate: string;
    mode: string;
    chunksReviewed: number;
    averageQuality: number;
    feedbackExcerpt: string | null;
  } | null;
  flaggedWeakAreas: Array<{ topic: string; chunk: string; reason: string }>;
  streakDays: number;
  leechCount: number;
  activeSession: { id: string; mode: string; startedAt: string } | null;
};

const MAX_OVERDUE_TOPICS = 5;
const MAX_WEAK_AREAS = 5;
const MAX_RECENT_SUBJECTS = 5;
const FEEDBACK_EXCERPT_MAX = 200;
// Max streak = STREAK_LOOKBACK_DAYS + 1 (includes today)
const STREAK_LOOKBACK_DAYS = 7;

function startOfDayUtc(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86_400_000;
  return Math.floor((b.getTime() - a.getTime()) / msPerDay);
}

/**
 * Count consecutive days (ending today) that have at least one review.
 * Reviews are PersistedReviewEntry with ISO 8601 `date` strings.
 */
function computeStreakDays(reviews: Array<{ date: string }>, now: Date): number {
  if (reviews.length === 0) return 0;

  // Collect unique date strings (YYYY-MM-DD in UTC)
  const reviewDates = new Set<string>();
  for (const r of reviews) {
    reviewDates.add(r.date.slice(0, 10));
  }

  const todayStr = now.toISOString().slice(0, 10);
  if (!reviewDates.has(todayStr)) return 0;

  let streak = 1;
  for (let i = 1; i <= STREAK_LOOKBACK_DAYS; i++) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    if (reviewDates.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export async function buildLearnerContext(
  deps: LearnerContextDeps,
  now: Date
): Promise<LearnerContext> {
  const todayStart = startOfDayUtc(now);
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - STREAK_LOOKBACK_DAYS);
  const tomorrow = new Date(todayStart);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  // Fire all port queries in parallel
  const [allChunks, allTopics, activeSession, recentSessions, qualityWeakAreas, recentReviews] =
    await Promise.all([
      deps.chunks.batchFetchMinimal(),
      deps.topics.batchFetchMinimal(),
      deps.sessions.getActiveSession(),
      deps.sessions.listSessions({ status: 'completed', limit: 1 }),
      deps.reviewPersistence.getWeakAreas(),
      deps.reviewPersistence.getReviewsByDateRange(sevenDaysAgo, tomorrow),
    ]);

  // Partition all chunks into dueToday vs overdue using day boundaries
  // (avoids relying on dueOnly filter which uses Date.now() and misses items due later today)
  const todayStartMs = todayStart.getTime();
  const tomorrowMs = tomorrow.getTime();
  let dueToday = 0;
  let overdue = 0;
  const overdueChunksByTopic = new Map<string, ChunkMinimalMetadata[]>();

  for (const chunk of allChunks) {
    if (chunk.nextReviewAt < todayStartMs) {
      overdue++;
      const arr = overdueChunksByTopic.get(chunk.topicId) ?? [];
      arr.push(chunk);
      overdueChunksByTopic.set(chunk.topicId, arr);
    } else if (chunk.nextReviewAt < tomorrowMs) {
      dueToday++;
    }
  }

  // Build topic title lookup
  const topicTitleMap = new Map<string, string>();
  for (const t of allTopics) {
    topicTitleMap.set(t.id, t.title);
  }

  // Build overdueTopics: group overdue chunks by topic, sort by max days overdue, cap at 5
  const overdueTopics: LearnerContext['overdueTopics'] = [];
  for (const [topicId, chunks] of overdueChunksByTopic) {
    const oldestReviewAt = Math.min(...chunks.map(c => c.nextReviewAt));
    const daysOverdue = daysBetween(new Date(oldestReviewAt), todayStart);
    overdueTopics.push({
      title: topicTitleMap.get(topicId) ?? topicId,
      daysOverdue,
      chunkCount: chunks.length,
    });
  }
  overdueTopics.sort((a, b) => b.daysOverdue - a.daysOverdue);
  overdueTopics.splice(MAX_OVERDUE_TOPICS);

  // Build recentSubjects: deduplicate subjects from due chunks (overdue + due today), cap at 5.
  // Order is DB-dependent (batchFetchMinimal return order); no urgency sorting applied.
  const seenSubjects = new Set<string>();
  const recentSubjects: string[] = [];
  for (const chunk of allChunks) {
    if (chunk.nextReviewAt < tomorrowMs && chunk.subject && !seenSubjects.has(chunk.subject)) {
      seenSubjects.add(chunk.subject);
      recentSubjects.push(chunk.subject);
      if (recentSubjects.length >= MAX_RECENT_SUBJECTS) break;
    }
  }

  // Build recentSessionSummary
  let recentSessionSummary: LearnerContext['recentSessionSummary'] = null;
  if (recentSessions.length > 0) {
    const session = recentSessions[0];
    const sessionChunks = await deps.sessions.getSessionChunks(session.id);
    const completedChunks = sessionChunks.filter(sc => sc.status === 'completed');
    const feedbackExcerpt = session.feedback
      ? session.feedback.slice(0, FEEDBACK_EXCERPT_MAX)
      : null;

    recentSessionSummary = {
      lastSessionDate: new Date(session.startTime).toISOString(),
      mode: session.mode,
      chunksReviewed: completedChunks.length,
      averageQuality: 0, // TODO: not yet computed — quality lives in sessionQuestionAttempts, not sessionChunks
      feedbackExcerpt,
    };
  }

  // Build flaggedWeakAreas: merge ease-factor-based + quality-based, dedupe by chunkId, cap at 5
  const weakAreaMap = new Map<string, LearnerContext['flaggedWeakAreas'][number]>();

  // Signal 1: low ease factor chunks
  const easeThreshold = deps.algorithmConfig.weakAreaEaseThreshold;
  for (const chunk of allChunks) {
    if (chunk.easeFactor < easeThreshold) {
      weakAreaMap.set(chunk.id, {
        topic: topicTitleMap.get(chunk.topicId) ?? chunk.topicId,
        chunk: chunk.title,
        reason: `Ease factor ${chunk.easeFactor.toFixed(2)} — approaching leech threshold`,
      });
    }
  }

  // Signal 2: quality-based weak areas from getWeakAreas()
  for (const wa of qualityWeakAreas) {
    if (!weakAreaMap.has(wa.chunkId)) {
      weakAreaMap.set(wa.chunkId, {
        topic: wa.topicTitle,
        chunk: wa.chunkTitle,
        reason: `${wa.lowCount} of last ${wa.recentAttempts} reviews scored ≤ 2`,
      });
    }
  }

  const flaggedWeakAreas = [...weakAreaMap.values()].slice(0, MAX_WEAK_AREAS);

  // Compute streakDays
  const streakDays = computeStreakDays(recentReviews, now);

  // Map activeSession
  const activeSessionResult: LearnerContext['activeSession'] = activeSession
    ? {
        id: activeSession.id,
        mode: activeSession.mode,
        startedAt: new Date(activeSession.startTime).toISOString(),
      }
    : null;

  return {
    totalTopics: allTopics.length,
    totalChunks: allChunks.length,
    dueToday,
    overdue,
    overdueTopics,
    recentSubjects,
    recentSessionSummary,
    flaggedWeakAreas,
    streakDays,
    leechCount: allChunks.filter(c => c.chunkType === 'remediation').length,
    activeSession: activeSessionResult,
  };
}
