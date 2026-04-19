import { describe, it, expect } from 'vitest';
import {
  computeRoadblockState,
  evaluateRoadblock,
  getRequiredFollowups,
} from '../../../../src/domain/algorithms/roadblock-gate.js';
import type {
  SessionQuestion,
  SessionQuestionAttempt,
} from '../../../../src/domain/types/entities.js';

const NOW = 1_700_000_000_000;
const FOLLOWUP_MAP: Record<number, number> = { 0: 3, 1: 3, 2: 2, 3: 1, 4: 1, 5: 0 };

function makeQuestion(id: string): SessionQuestion {
  return {
    id,
    sessionId: 'sess-1',
    questionIndex: 1,
    promptText: 'What is X?',
    status: 'answered',
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function makeAttempt(
  questionId: string,
  opts: { quality: number | null; createdAt?: number }
): SessionQuestionAttempt {
  return {
    id: `a-${questionId}-${opts.createdAt ?? NOW}`,
    sessionQuestionId: questionId,
    attemptNumber: 1,
    response: 'test',
    passed: (opts.quality ?? 0) >= 3,
    feedback: 'feedback',
    quality: opts.quality,
    agentQuality: null,
    questionType: null,
    timeSpentMs: 1000,
    createdAt: opts.createdAt ?? NOW,
  };
}

describe('getRequiredFollowups', () => {
  it.each([
    [0, 3],
    [1, 3],
    [2, 2],
    [3, 1],
    [4, 1],
    [5, 0],
  ])('quality %d → %d follow-ups', (quality, expected) => {
    expect(getRequiredFollowups(quality, FOLLOWUP_MAP)).toBe(expected);
  });
});

describe('evaluateRoadblock', () => {
  const CHUNK_ID = 'chunk-1';

  function run(opts: {
    attempts: { questionId: string; quality: number | null; createdAt?: number }[];
    chunkMapping?: Map<string, string[]>;
  }) {
    const questionIds = [...new Set(opts.attempts.map(a => a.questionId))];
    const questions = questionIds.map(id => makeQuestion(id));

    const attemptsByQuestion = new Map<string, SessionQuestionAttempt[]>();
    for (const a of opts.attempts) {
      const list = attemptsByQuestion.get(a.questionId) ?? [];
      list.push(makeAttempt(a.questionId, { quality: a.quality, createdAt: a.createdAt }));
      attemptsByQuestion.set(a.questionId, list);
    }

    const chunkMapping = opts.chunkMapping ?? new Map(questionIds.map(id => [id, [CHUNK_ID]]));

    return evaluateRoadblock(CHUNK_ID, questions, attemptsByQuestion, chunkMapping, FOLLOWUP_MAP);
  }

  it('quality 1 → requires 3 follow-ups', () => {
    const result = run({ attempts: [{ questionId: 'q1', quality: 1 }] });
    expect(result).not.toBeNull();
    expect(result!.trigger_quality).toBe(1);
    expect(result!.required_followups).toBe(3);
    expect(result!.completed_followups).toBe(0);
    expect(result!.remaining).toBe(3);
  });

  it('quality 2 → requires 2 follow-ups', () => {
    const result = run({ attempts: [{ questionId: 'q1', quality: 2 }] });
    expect(result).not.toBeNull();
    expect(result!.trigger_quality).toBe(2);
    expect(result!.required_followups).toBe(2);
    expect(result!.remaining).toBe(2);
  });

  it('quality 3 → requires 1 follow-up', () => {
    const result = run({ attempts: [{ questionId: 'q1', quality: 3 }] });
    expect(result).not.toBeNull();
    expect(result!.required_followups).toBe(1);
    expect(result!.remaining).toBe(1);
  });

  it('quality 4 → requires 1 follow-up', () => {
    const result = run({ attempts: [{ questionId: 'q1', quality: 4 }] });
    expect(result).not.toBeNull();
    expect(result!.required_followups).toBe(1);
    expect(result!.remaining).toBe(1);
  });

  it('quality 5 → no roadblock', () => {
    const result = run({ attempts: [{ questionId: 'q1', quality: 5 }] });
    expect(result).toBeNull();
  });

  it('qualifying follow-up (quality ≥ 3, after trigger) is counted', () => {
    const result = run({
      attempts: [
        { questionId: 'q1', quality: 2, createdAt: NOW },
        { questionId: 'q2', quality: 3, createdAt: NOW + 1000 },
      ],
    });
    expect(result).not.toBeNull();
    expect(result!.completed_followups).toBe(1);
    expect(result!.remaining).toBe(1);
  });

  it('follow-up with quality < 3 does not count', () => {
    const result = run({
      attempts: [
        { questionId: 'q1', quality: 2, createdAt: NOW },
        { questionId: 'q2', quality: 2, createdAt: NOW + 1000 },
      ],
    });
    expect(result).not.toBeNull();
    expect(result!.completed_followups).toBe(0);
    expect(result!.remaining).toBe(2);
  });

  it('follow-up before trigger attempt does not count', () => {
    const result = run({
      attempts: [
        { questionId: 'q1', quality: 4, createdAt: NOW },
        { questionId: 'q2', quality: 1, createdAt: NOW + 1000 },
      ],
    });
    // min quality is 1 (trigger at NOW + 1000), q1 is before trigger → doesn't count
    expect(result).not.toBeNull();
    expect(result!.trigger_quality).toBe(1);
    expect(result!.completed_followups).toBe(0);
    expect(result!.remaining).toBe(3);
  });

  it('null-quality attempts excluded from min calculation', () => {
    const result = run({
      attempts: [
        { questionId: 'q1', quality: null },
        { questionId: 'q2', quality: 5 },
      ],
    });
    // min quality is 5 (null excluded) → no roadblock
    expect(result).toBeNull();
  });

  it('all-null quality → no roadblock (legacy data)', () => {
    const result = run({
      attempts: [
        { questionId: 'q1', quality: null },
        { questionId: 'q2', quality: null },
      ],
    });
    expect(result).toBeNull();
  });

  it('auto-clear: qualifying count ≥ required → returns null', () => {
    const result = run({
      attempts: [
        { questionId: 'q1', quality: 2, createdAt: NOW },
        { questionId: 'q2', quality: 4, createdAt: NOW + 1000 },
        { questionId: 'q3', quality: 3, createdAt: NOW + 2000 },
      ],
    });
    // min quality 2 → needs 2 follow-ups, has 2 qualifying (q2=4, q3=3) → clears
    expect(result).toBeNull();
  });

  it('uses minimum quality across multiple questions', () => {
    const result = run({
      attempts: [
        { questionId: 'q1', quality: 4, createdAt: NOW },
        { questionId: 'q2', quality: 1, createdAt: NOW + 100 },
      ],
    });
    expect(result).not.toBeNull();
    expect(result!.trigger_quality).toBe(1);
    expect(result!.required_followups).toBe(3);
  });

  it('includes trigger_question text in result', () => {
    const result = run({ attempts: [{ questionId: 'q1', quality: 2 }] });
    expect(result).not.toBeNull();
    expect(result!.trigger_question).toBe('What is X?');
  });

  it('includes chunk_ids in result', () => {
    const result = run({ attempts: [{ questionId: 'q1', quality: 2 }] });
    expect(result).not.toBeNull();
    expect(result!.chunk_ids).toEqual([CHUNK_ID]);
  });

  it('includes prescriptive instruction in result', () => {
    const result = run({ attempts: [{ questionId: 'q1', quality: 2 }] });
    expect(result).not.toBeNull();
    expect(result!.instruction).toContain('ROADBLOCK');
    expect(result!.instruction).toContain('scored 2');
    expect(result!.instruction).toContain('2 diagnostic questions');
  });

  it('includes Socratic DO guidance in instruction', () => {
    const result = run({ attempts: [{ questionId: 'q1', quality: 2 }] });
    expect(result).not.toBeNull();
    expect(result!.instruction).toContain('why/how questions');
    expect(result!.instruction).toContain('scaffolded difficulty');
    expect(result!.instruction).toContain('compare/contrast');
  });

  it("includes Socratic DON'T guidance in instruction", () => {
    const result = run({ attempts: [{ questionId: 'q1', quality: 2 }] });
    expect(result).not.toBeNull();
    expect(result!.instruction).toContain('DO NOT');
    expect(result!.instruction).toContain('tests memory, not understanding');
    expect(result!.instruction).toContain('too easy to guess');
  });

  it('retry on trigger question does not count as follow-up', () => {
    const result = run({
      attempts: [
        { questionId: 'q1', quality: 1, createdAt: NOW },
        { questionId: 'q1', quality: 4, createdAt: NOW + 1000 },
      ],
    });
    // q1 retry is same question as trigger → excluded
    expect(result).not.toBeNull();
    expect(result!.completed_followups).toBe(0);
    expect(result!.remaining).toBe(3);
  });

  it('multiple qualifying attempts on same follow-up question count as 1', () => {
    const result = run({
      attempts: [
        { questionId: 'q1', quality: 2, createdAt: NOW },
        { questionId: 'q2', quality: 3, createdAt: NOW + 1000 },
        { questionId: 'q2', quality: 4, createdAt: NOW + 2000 },
      ],
    });
    // q2 has 2 qualifying attempts but counts as 1 distinct question
    expect(result).not.toBeNull();
    expect(result!.completed_followups).toBe(1);
    expect(result!.remaining).toBe(1);
  });

  it('follow-up on different chunk_ids is not counted', () => {
    const chunkMapping = new Map([
      ['q1', ['chunk-1']],
      ['q2', ['chunk-other']], // different chunk
    ]);
    const result = run({
      attempts: [
        { questionId: 'q1', quality: 2, createdAt: NOW },
        { questionId: 'q2', quality: 4, createdAt: NOW + 1000 },
      ],
      chunkMapping,
    });
    // q2 targets 'chunk-other', not 'chunk-1' → doesn't share chunk → not counted
    expect(result).not.toBeNull();
    expect(result!.completed_followups).toBe(0);
    expect(result!.remaining).toBe(2);
  });

  it('handles missing chunkMapping entries with fallback to chunkId', () => {
    // Empty chunkMapping → all fallbacks to [CHUNK_ID]
    const result = run({
      attempts: [
        { questionId: 'q1', quality: 2, createdAt: NOW },
        { questionId: 'q2', quality: 3, createdAt: NOW + 1000 },
      ],
      chunkMapping: new Map(),
    });
    // Both fall back to [CHUNK_ID], so they share chunk → q2 counts as follow-up
    expect(result).not.toBeNull();
    expect(result!.completed_followups).toBe(1);
  });

  it('quality outside 0-5 range falls back to 0 required follow-ups', () => {
    expect(getRequiredFollowups(6, FOLLOWUP_MAP)).toBe(0);
    expect(getRequiredFollowups(-1, FOLLOWUP_MAP)).toBe(0);
  });

  it('empty chunkQuestions array returns null', () => {
    const result = evaluateRoadblock('chunk-1', [], new Map(), new Map(), FOLLOWUP_MAP);
    expect(result).toBeNull();
  });

  it('tie-breaks by earliest createdAt when min quality is equal', () => {
    const result = run({
      attempts: [
        { questionId: 'q1', quality: 2, createdAt: NOW + 1000 },
        { questionId: 'q2', quality: 2, createdAt: NOW },
        { questionId: 'q3', quality: 3, createdAt: NOW + 500 },
      ],
    });
    // Both q1 and q2 have quality 2, but q2 is earliest → trigger is q2 at NOW
    // q3 at NOW+500 is after trigger and quality ≥ 3 → counts as 1 follow-up
    // q1 at NOW+1000 has quality 2 < 3 → doesn't count
    expect(result).not.toBeNull();
    expect(result!.trigger_quality).toBe(2);
    expect(result!.completed_followups).toBe(1);
    expect(result!.remaining).toBe(1);
  });
});

describe('computeRoadblockState', () => {
  const CHUNK_ID = 'chunk-1';

  function run(opts: {
    attempts: { questionId: string; quality: number | null; createdAt?: number }[];
    chunkMapping?: Map<string, string[]>;
    followupMap?: Record<number, number>;
  }) {
    const questionIds = [...new Set(opts.attempts.map(a => a.questionId))];
    const questions = questionIds.map(id => makeQuestion(id));

    const attemptsByQuestion = new Map<string, SessionQuestionAttempt[]>();
    for (const a of opts.attempts) {
      const list = attemptsByQuestion.get(a.questionId) ?? [];
      list.push(makeAttempt(a.questionId, { quality: a.quality, createdAt: a.createdAt }));
      attemptsByQuestion.set(a.questionId, list);
    }

    const chunkMapping = opts.chunkMapping ?? new Map(questionIds.map(id => [id, [CHUNK_ID]]));
    const followupMap = opts.followupMap ?? FOLLOWUP_MAP;

    return computeRoadblockState(
      CHUNK_ID,
      questions,
      attemptsByQuestion,
      chunkMapping,
      followupMap
    );
  }

  it('returns null when no scored attempts exist', () => {
    const result = run({
      attempts: [
        { questionId: 'q1', quality: null },
        { questionId: 'q2', quality: null },
      ],
    });
    expect(result).toBeNull();
  });

  it('returns null when required_followups for trigger quality is 0', () => {
    const result = run({ attempts: [{ questionId: 'q1', quality: 5 }] });
    expect(result).toBeNull();
  });

  it('reports prior min as trigger_quality when current attempt quality is higher', () => {
    const result = run({
      attempts: [
        { questionId: 'q1', quality: 3, createdAt: NOW },
        { questionId: 'q2', quality: 4, createdAt: NOW + 1000 },
      ],
    });
    expect(result).not.toBeNull();
    expect(result!.trigger_quality).toBe(3);
    expect(result!.required_followups).toBe(1);
  });

  it('counts current attempt as qualifying follow-up for a prior trigger', () => {
    const result = run({
      attempts: [
        { questionId: 'q1', quality: 3, createdAt: NOW },
        { questionId: 'q2', quality: 4, createdAt: NOW + 1000 },
      ],
    });
    expect(result).not.toBeNull();
    expect(result!.completed_followups).toBe(1);
    expect(result!.remaining).toBe(0);
  });

  it('surfaces remaining: 0 when enough qualifying follow-ups exist (no early-null)', () => {
    const result = run({
      attempts: [
        { questionId: 'q1', quality: 2, createdAt: NOW },
        { questionId: 'q2', quality: 3, createdAt: NOW + 1000 },
        { questionId: 'q3', quality: 4, createdAt: NOW + 2000 },
      ],
    });
    // min quality 2 → required 2; q2 and q3 qualify → completed 2 → remaining 0
    expect(result).not.toBeNull();
    expect(result!.required_followups).toBe(2);
    expect(result!.completed_followups).toBe(2);
    expect(result!.remaining).toBe(0);
  });

  it('counts multiple attempts on the same follow-up question as 1', () => {
    const result = run({
      attempts: [
        { questionId: 'q1', quality: 2, createdAt: NOW },
        { questionId: 'q2', quality: 3, createdAt: NOW + 1000 },
        { questionId: 'q2', quality: 4, createdAt: NOW + 2000 },
      ],
    });
    expect(result).not.toBeNull();
    expect(result!.completed_followups).toBe(1);
  });

  it('tie-breaks by earliest createdAt when min quality is equal', () => {
    const result = run({
      attempts: [
        { questionId: 'q1', quality: 2, createdAt: NOW + 1000 },
        { questionId: 'q2', quality: 2, createdAt: NOW },
        { questionId: 'q3', quality: 3, createdAt: NOW + 500 },
      ],
    });
    // q2 is the trigger (earliest with min quality 2); q3 is after trigger and qualifies
    expect(result).not.toBeNull();
    expect(result!.trigger_quality).toBe(2);
    expect(result!.completed_followups).toBe(1);
  });

  it('uses configured required_followups for the min quality (config-sensitive)', () => {
    const result = run({
      attempts: [
        { questionId: 'q1', quality: 3, createdAt: NOW },
        { questionId: 'q2', quality: 4, createdAt: NOW + 1000 },
      ],
      followupMap: { 3: 2, 4: 1, 5: 0 },
    });
    // min quality 3 → required 2 (not 1, which would be the value for current quality 4)
    expect(result).not.toBeNull();
    expect(result!.required_followups).toBe(2);
    expect(result!.completed_followups).toBe(1);
    expect(result!.remaining).toBe(1);
  });

  it('omits trigger_question_id from public state shape (only the original fields)', () => {
    const result = run({ attempts: [{ questionId: 'q1', quality: 2 }] });
    expect(result).not.toBeNull();
    expect(Object.keys(result!).sort()).toEqual(
      [
        'chunk_ids',
        'completed_followups',
        'remaining',
        'required_followups',
        'trigger_quality',
        'trigger_question',
      ].sort()
    );
  });
});
