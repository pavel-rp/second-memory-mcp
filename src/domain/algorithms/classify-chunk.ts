/**
 * Pure retrievability estimation and teaching-tier assignment.
 * No I/O — takes chunk scheduling fields + current time, returns a TeachingDecision.
 *
 * Uses the FSRS power-law model: R(t) = (1 + (19/81) · t / S)^(-0.5)
 */

import { MS_PER_DAY } from '../../shared/constants/time.js';

// ── Types ──────────────────────────────────────────────────────────────────

export type TeachingApproach = 'recall' | 'cued_recall' | 'reteach' | 'scaffold';

export type ClassifyChunkInput = {
  easeFactor: number;
  repetitions: number;
  nextReviewAt: number; // epoch ms
  intervalDays: number | null;
};

export type TeachingDecision = {
  teachingApproach: TeachingApproach;
  estimatedRetrievability: number; // 0.0–1.0
  storageStrengthEstimate: number;
  reteachCompression: number; // 0.2–0.8
  daysOverdue: number;
};

// ── Tier thresholds ────────────────────────────────────────────────────────

export const RECALL_THRESHOLD = 0.7;
export const CUED_RECALL_THRESHOLD = 0.5;
const RETEACH_THRESHOLD = 0.3;

// ── Core function ──────────────────────────────────────────────────────────

export function classifyChunk(input: ClassifyChunkInput, now: Date): TeachingDecision {
  const nowMs = now.getTime();
  const daysOverdue = Math.max(0, (nowMs - input.nextReviewAt) / MS_PER_DAY);

  // Fresh item or null interval → treat as fully retrievable
  const intervalDays = input.intervalDays ?? 0;
  let estimatedRetrievability: number;

  if (intervalDays <= 0) {
    // No established interval — R is near-perfect
    estimatedRetrievability = 1.0;
  } else {
    // FSRS power-law: R(t) = (1 + (19/81) * t / S)^(-0.5)
    // where t = daysOverdue, S = intervalDays (stability proxy)
    estimatedRetrievability = Math.pow(1 + (19 / 81) * (daysOverdue / intervalDays), -0.5);
  }

  const storageStrengthEstimate = input.repetitions * (input.easeFactor / 2.5);
  const reteachCompression = Math.min(0.8, 0.2 + storageStrengthEstimate * 0.1);

  const teachingApproach = mapTier(estimatedRetrievability);

  return {
    teachingApproach,
    estimatedRetrievability,
    storageStrengthEstimate,
    reteachCompression,
    daysOverdue,
  };
}

function mapTier(r: number): TeachingApproach {
  if (r >= RECALL_THRESHOLD) return 'recall';
  if (r >= CUED_RECALL_THRESHOLD) return 'cued_recall';
  if (r >= RETEACH_THRESHOLD) return 'reteach';
  return 'scaffold';
}
