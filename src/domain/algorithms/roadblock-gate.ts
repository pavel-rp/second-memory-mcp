import type { RoadblockDetail } from '../types/teaching.js';
import type { SessionQuestion, SessionQuestionAttempt } from '../types/entities.js';

/** Quality → required follow-up count mapping. */
const QUALITY_FOLLOWUP_MAP: Record<number, number> = {
  0: 3,
  1: 3,
  2: 2,
  3: 1,
  4: 1,
  5: 0,
};

export function getRequiredFollowups(quality: number): number {
  return QUALITY_FOLLOWUP_MAP[quality] ?? 0;
}

/**
 * Evaluate whether a chunk is roadblocked based on attempt quality.
 *
 * Returns a RoadblockDetail if the chunk should be blocked, or null if it can proceed.
 * Pure function — no I/O.
 */
export function evaluateRoadblock(
  chunkId: string,
  chunkQuestions: SessionQuestion[],
  attemptsByQuestion: Map<string, SessionQuestionAttempt[]>,
  chunkMapping: Map<string, string[]>
): RoadblockDetail | null {
  // Collect all attempts with non-null quality for this chunk's questions
  const scoredAttempts: { attempt: SessionQuestionAttempt; question: SessionQuestion }[] = [];

  for (const q of chunkQuestions) {
    const qAttempts = attemptsByQuestion.get(q.id) ?? [];
    for (const a of qAttempts) {
      if (a.quality !== null && a.quality !== undefined) {
        scoredAttempts.push({ attempt: a, question: q });
      }
    }
  }

  // No scored attempts → skip roadblock (legacy data or no quality info)
  if (scoredAttempts.length === 0) return null;

  // Find the minimum quality and its triggering attempt
  // scoredAttempts is non-empty (checked above), so reduce is safe
  const trigger = scoredAttempts.reduce((min, curr) =>
    (curr.attempt.quality as number) < (min.attempt.quality as number) ? curr : min
  );
  const minQuality = trigger.attempt.quality as number;

  const required = getRequiredFollowups(minQuality);
  if (required === 0) return null;

  // Count qualifying follow-ups: recorded after trigger, same chunk_ids, quality ≥ 3
  const triggerChunkIds = chunkMapping.get(trigger.question.id) ?? [chunkId];
  const triggerTime = trigger.attempt.createdAt;

  let qualifyingCount = 0;
  for (const q of chunkQuestions) {
    const qChunkIds = chunkMapping.get(q.id) ?? [chunkId];
    const sharesChunk = qChunkIds.some(cid => triggerChunkIds.includes(cid));
    if (!sharesChunk) continue;

    const qAttempts = attemptsByQuestion.get(q.id) ?? [];
    for (const a of qAttempts) {
      if (
        a.createdAt > triggerTime &&
        a.quality !== null &&
        a.quality !== undefined &&
        a.quality >= 3
      ) {
        qualifyingCount++;
      }
    }
  }

  if (qualifyingCount >= required) return null;

  const remaining = required - qualifyingCount;

  return {
    trigger_quality: minQuality,
    trigger_question: trigger.question.promptText,
    required_followups: required,
    completed_followups: qualifyingCount,
    remaining,
    chunk_ids: triggerChunkIds,
    instruction: buildRoadblockInstruction(minQuality, remaining),
  };
}

function buildRoadblockInstruction(quality: number, remaining: number): string {
  const plural = remaining === 1 ? 'question' : 'questions';
  return (
    `ROADBLOCK: The learner scored ${quality} on this chunk. ` +
    `You MUST re-explain the misunderstood concept, then ask ${remaining} diagnostic ${plural} ` +
    `that test the SAME concept from different angles. ` +
    `Do NOT rephrase the original question trivially. Do NOT ask yes/no questions. ` +
    `Each question must require the learner to demonstrate understanding in their own words. ` +
    `You cannot proceed until ${remaining} ${plural} ${remaining === 1 ? 'is' : 'are'} answered with quality ≥ 3.`
  );
}
