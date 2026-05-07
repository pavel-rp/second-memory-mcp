import { DIFFICULTY_RETROGRADE_THRESHOLD } from '../../../shared/linter/section-thresholds.js';
import type { LinterFinding, LinterRule, TopicLintInput } from '../chunk-linter.js';

export const DIFFICULTY_PROGRESSION_RULE_NAME = 'tier1b.difficulty-progression';

function runDifficultyProgression(input: TopicLintInput): LinterFinding[] {
  const { chunks } = input;
  if (chunks.length < 2) return [];

  const findings: LinterFinding[] = [];

  for (let i = 0; i < chunks.length - 1; i++) {
    const drop = chunks[i].difficulty - chunks[i + 1].difficulty;
    if (drop >= DIFFICULTY_RETROGRADE_THRESHOLD) {
      findings.push({
        chunkId: chunks[i + 1].chunkId,
        rule: DIFFICULTY_PROGRESSION_RULE_NAME,
        severity: 'warning',
        category: 'difficulty_progression',
        detail: `Difficulty drops from ${chunks[i].difficulty} to ${chunks[i + 1].difficulty} (threshold: ${DIFFICULTY_RETROGRADE_THRESHOLD})`,
      });
    }
  }

  let maxDifficulty = -1;
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i].difficulty > maxDifficulty) {
      maxDifficulty = chunks[i].difficulty;
    }
  }
  const secondHalfStart = Math.ceil(chunks.length / 2);
  const hasMaxInSecondHalf = chunks
    .slice(secondHalfStart)
    .some(c => c.difficulty === maxDifficulty);
  if (!hasMaxInSecondHalf) {
    const firstMaxIndex = chunks.findIndex(c => c.difficulty === maxDifficulty);
    findings.push({
      chunkId: chunks[firstMaxIndex].chunkId,
      rule: DIFFICULTY_PROGRESSION_RULE_NAME,
      severity: 'warning',
      category: 'difficulty_progression',
      detail: `Max difficulty chunk at position ${firstMaxIndex + 1}/${chunks.length} — expected in second half`,
    });
  }

  return findings;
}

export const difficultyProgressionRule = {
  name: DIFFICULTY_PROGRESSION_RULE_NAME,
  scope: 'topic',
  tier: 'tier1b',
  blockingEligible: false,
  run: runDifficultyProgression,
} satisfies LinterRule;
