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
  let maxIndex = 0;
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i].difficulty > maxDifficulty) {
      maxDifficulty = chunks[i].difficulty;
      maxIndex = i;
    }
  }
  const secondHalfStart = Math.ceil(chunks.length / 2);
  if (maxIndex < secondHalfStart) {
    findings.push({
      chunkId: chunks[maxIndex].chunkId,
      rule: DIFFICULTY_PROGRESSION_RULE_NAME,
      severity: 'warning',
      category: 'difficulty_progression',
      detail: `Max difficulty chunk at position ${maxIndex + 1}/${chunks.length} — expected in second half`,
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
