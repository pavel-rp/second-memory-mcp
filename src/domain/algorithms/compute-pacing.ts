import type { Pacing } from '../types/teaching.js';

const INCREMENTAL_THRESHOLD = 4;

const INCREMENTAL_DIRECTIVE =
  'Present ONE concept at a time. Wait for the learner to signal understanding before presenting the next. Do not dump the entire chunk content in one message.';

const FULL_DIRECTIVE =
  'This is simple factual content. You may present the full chunk in one message, but still check for understanding before moving on.';

export function computePacing(difficulty: number): Pacing {
  if (difficulty < INCREMENTAL_THRESHOLD) {
    return {
      delivery_mode: 'full',
      checkpoint_cadence: 'end_of_chunk',
      directive: FULL_DIRECTIVE,
    };
  }
  return {
    delivery_mode: 'incremental',
    checkpoint_cadence: 'after_each_concept',
    directive: INCREMENTAL_DIRECTIVE,
  };
}
