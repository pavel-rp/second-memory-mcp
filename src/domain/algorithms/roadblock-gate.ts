import type { RoadblockDetail } from '../types/teaching.js';
import type { SessionQuestion, SessionQuestionAttempt } from '../types/entities.js';

export function getRequiredFollowups(quality: number, followupMap: Record<number, number>): number {
  return followupMap[quality] ?? 0;
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
  chunkMapping: Map<string, string[]>,
  followupMap: Record<number, number>
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

  // Find the minimum quality and its triggering attempt.
  // Tie-break by earliest createdAt to maximize the qualifying follow-up window.
  // scoredAttempts is non-empty (checked above), so reduce is safe.
  const trigger = scoredAttempts.reduce((min, curr) => {
    const currQ = curr.attempt.quality as number;
    const minQ = min.attempt.quality as number;
    if (currQ < minQ) return curr;
    if (currQ === minQ && curr.attempt.createdAt < min.attempt.createdAt) return curr;
    return min;
  });
  const minQuality = trigger.attempt.quality as number;

  const required = getRequiredFollowups(minQuality, followupMap);
  if (required === 0) return null;

  // Count qualifying follow-ups by distinct question:
  // recorded after trigger, same chunk_ids, quality ≥ 3, excluding the trigger question.
  const triggerChunkIds = chunkMapping.get(trigger.question.id) ?? [chunkId];
  const triggerTime = trigger.attempt.createdAt;
  const qualifyingQuestionIds = new Set<string>();

  for (const q of chunkQuestions) {
    if (q.id === trigger.question.id) continue;

    const qChunkIds = chunkMapping.get(q.id) ?? [chunkId];
    const sharesChunk = qChunkIds.some(cid => triggerChunkIds.includes(cid));
    if (!sharesChunk) continue;

    const qAttempts = attemptsByQuestion.get(q.id) ?? [];
    const hasQualifying = qAttempts.some(
      a =>
        a.createdAt > triggerTime && a.quality !== null && a.quality !== undefined && a.quality >= 3
    );
    if (hasQualifying) {
      qualifyingQuestionIds.add(q.id);
    }
  }

  const qualifyingCount = qualifyingQuestionIds.size;

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
  const verb = remaining === 1 ? 'is' : 'are';
  return `ROADBLOCK: The learner scored ${quality} on this chunk. \
You MUST re-explain the misunderstood concept, then ask ${remaining} diagnostic ${plural} \
that test the SAME concept from different angles. \
Each question must require the learner to demonstrate understanding in their own words. \
You cannot proceed until ${remaining} ${plural} ${verb} answered with quality ≥ 3.
Follow-up question principles:
DO: Ask why/how questions that probe understanding. Test the same concept from a different angle \
or application context. Build scaffolded difficulty. Ask the learner to compare/contrast, \
give examples, or apply the concept to a new scenario.
DO NOT: Rephrase the original question with simpler wording (tests memory, not understanding). \
Ask yes/no or true/false questions (too easy to guess). Ask unrelated questions to pad the count.`;
}
