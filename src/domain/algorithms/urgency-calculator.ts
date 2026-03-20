/**
 * Pure urgency scoring for topic-level recommendations.
 * No I/O — takes pre-computed per-topic aggregates, returns score + reason.
 */

export type UrgencyInput = {
  maxOverdueDays: number;
  dueCount: number;
  minEaseFactor: number;
};

export type UrgencyResult = {
  score: number; // 0.0–1.0
  reason: string; // human-readable dominant factor
};

/** Clamp value to [0, 1]. */
function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** Linearly normalize `value` from [min, max] into [0, 1], clamped. */
function normalize(value: number, min: number, max: number): number {
  return clamp01((value - min) / (max - min));
}

/**
 * Calculate urgency score for a topic.
 *
 * Formula: `clamp01(0.5 * normalize(maxOverdueDays, 0, 30) + 0.3 * normalize(dueCount, 1, 10) + 0.2 * (1 - normalize(minEase, 1.3, 2.5)))`
 *
 * A single chunk due today with normal ease scores 0.00. Multiple due chunks or overdue days push the score higher.
 */
export function calculateUrgencyScore(input: UrgencyInput): UrgencyResult {
  const overdueComponent = normalize(input.maxOverdueDays, 0, 30);
  const countComponent = normalize(input.dueCount, 1, 10);
  const easeComponent = 1 - normalize(input.minEaseFactor, 1.3, 2.5);

  const score = clamp01(0.5 * overdueComponent + 0.3 * countComponent + 0.2 * easeComponent);

  const reason = generateReason(input, overdueComponent, countComponent, easeComponent);

  return { score: Math.round(score * 100) / 100, reason };
}

function generateReason(
  input: UrgencyInput,
  overdueWeight: number,
  countWeight: number,
  easeWeight: number
): string {
  const maxWeight = Math.max(overdueWeight * 0.5, countWeight * 0.3, easeWeight * 0.2);

  if (input.maxOverdueDays > 0 && overdueWeight * 0.5 >= maxWeight) {
    const chunkLabel = input.dueCount === 1 ? 'chunk' : 'chunks';
    const dayLabel = input.maxOverdueDays === 1 ? 'day' : 'days';
    return `${input.dueCount} ${chunkLabel} overdue (max ${input.maxOverdueDays} ${dayLabel})`;
  }

  if (countWeight * 0.3 >= maxWeight && input.dueCount > 1) {
    return `${input.dueCount} chunks due for review`;
  }

  if (easeWeight * 0.2 >= maxWeight && input.minEaseFactor < 2.0) {
    return `struggling material (ease ${input.minEaseFactor.toFixed(1)})`;
  }

  // Fallback: describe the most salient fact
  if (input.maxOverdueDays > 0) {
    const dayLabel = input.maxOverdueDays === 1 ? 'day' : 'days';
    return `${input.dueCount} chunk${input.dueCount === 1 ? '' : 's'} overdue (max ${input.maxOverdueDays} ${dayLabel})`;
  }

  return `${input.dueCount} chunk${input.dueCount === 1 ? '' : 's'} ready to learn`;
}
