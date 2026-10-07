import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { PoolClient } from 'pg';
import { createAppContext, type AppContext } from '../../../src/composition-root.js';
import { DrizzleSessionQuestionRepository } from '../../../src/adapters/drizzle/session-question-repository.js';
import { DrizzleSessionRepository } from '../../../src/adapters/drizzle/session-repository.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { getPool } from '../../../src/infrastructure/db/client.js';
import {
  canonicalAnswerIdentities,
  canonicalAnswerRevisions,
  canonicalAttemptAssociations,
  learningChunks,
  learningTopics,
  sessionQuestionAttempts,
  sessionQuestions,
} from '../../../src/infrastructure/db/schema.js';
import {
  GetCanonicalAnswerInputSchema,
  SaveCanonicalAnswerInputSchema,
  type CanonicalAnswer,
  type CanonicalResult,
  type CanonicalScope,
} from '../../../src/domain/types/canonical-answer.js';
import type { SubmitAnswerInput } from '../../../src/domain/types/teaching.js';
import { withLearnerAuthContext } from '../../../src/shared/learner-context.js';
import { cleanupTestDb, setupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { rubricForQuality } from '../../helpers/grading.js';

const publicScope = {
  language: 'en',
  parts: [{ part_id: 'boiling', required_facts: ['water boils at 100 C at standard pressure'] }],
  sources: [{ kind: 'chunk' as const, source_id: 'c1', components: ['content' as const] }],
};
const sourceContent =
  'Water boils at 100 °C at standard atmospheric pressure. Reduced atmospheric pressure lowers its boiling point.';
const targetText = '  Water boils at 100 °C at standard atmospheric pressure.  ';
const targetParts = [{ part_id: 'boiling', text: targetText }];
const scope: CanonicalScope = GetCanonicalAnswerInputSchema.parse({
  session_id: 'placeholder',
  question_scope: publicScope,
  context_token: 'test',
}).scope;

function learner<T>(fn: () => T, key = 'learner-a'): T {
  return withLearnerAuthContext(key, fn);
}
function ready(result: CanonicalResult): CanonicalAnswer {
  expect(result.status).toBe('ready');
  if (result.status !== 'ready') throw new Error('Expected ready canonical material');
  return result.answer;
}
function readInput(sessionId: string, overrides: Record<string, unknown> = {}) {
  return GetCanonicalAnswerInputSchema.parse({
    session_id: sessionId,
    question_scope: publicScope,
    context_token: 'test',
    ...overrides,
  });
}
function writeInput(
  sessionId: string,
  fingerprint: string,
  overrides: Record<string, unknown> = {}
) {
  return SaveCanonicalAnswerInputSchema.parse({
    session_id: sessionId,
    question_scope: publicScope,
    context_token: 'test',
    operation: 'accept',
    expected_fingerprint: fingerprint,
    parts: targetParts,
    ...overrides,
  });
}

// These barriers observe real PostgreSQL lock waits on the named connections, not timing guesses.
async function waitForLock(observer: PoolClient, pid: number): Promise<void> {
  for (let i = 0; i < 200; i++) {
    const result = await observer.query<{ blocked: boolean }>(
      'SELECT cardinality(pg_blocking_pids($1)) > 0 AS blocked',
      [pid]
    );
    if (result.rows[0]?.blocked) return;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw new Error('Concurrent operation did not reach the database lock barrier');
}
async function independentConnections<T>(
  fn: (holder: PoolClient, first: PoolClient, second: PoolClient, pids: number[]) => Promise<T>
): Promise<T> {
  const clients = await Promise.all([
    getPool().connect(),
    getPool().connect(),
    getPool().connect(),
  ]);
  const [holder, first, second] = clients;
  if (!holder || !first || !second) throw new Error('Missing independent DB connections');
  try {
    const pids = await Promise.all(
      clients.map(async client => {
        await client.query('SET statement_timeout = 10000');
        const result = await client.query<{ pid: number }>('SELECT pg_backend_pid() AS pid');
        return result.rows[0]!.pid;
      })
    );
    return await fn(holder, first, second, pids);
  } finally {
    for (const client of clients) {
      await client.query('ROLLBACK');
      await client.query('RESET statement_timeout');
      client.release();
    }
  }
}

describe('durable canonical recall answers', () => {
  let ctx: AppContext;
  let questions: DrizzleSessionQuestionRepository;
  let sessions: DrizzleSessionRepository;

  beforeAll(setupTestDb);
  beforeEach(async () => {
    vi.restoreAllMocks();
    await cleanupTestDb();
    questions = new DrizzleSessionQuestionRepository(getSql());
    sessions = new DrizzleSessionRepository(getSql());
    ctx = createAppContext({
      sessionQuestions: questions,
      sessions,
      embedding: undefined,
      classifier: undefined,
    });
    const now = Date.now();
    await getSql().insert(learningTopics).values({
      id: 't1',
      title: 'Phase changes',
      subject: 'Physics',
      summary: 'Water boils at 100 °C at standard atmospheric pressure.',
      summaryVersion: 1,
      createdAt: now,
      updatedAt: now,
    });
    await getSql()
      .insert(learningChunks)
      .values(
        ['c1', 'c2'].map(id => ({
          id,
          topicId: 't1',
          title: id === 'c1' ? 'Boiling water' : 'Freezing water',
          subject: 'Physics',
          difficulty: 2,
          nextReviewAt: now,
          easeFactor: 2.5,
          repetitions: 3,
          lastReviewedAt: now - 86400000,
          intervalDays: 5,
          estimatedDuration: 5,
          chunkType: 'review',
          prerequisitesJson: [],
          tagsJson: [],
          content:
            id === 'c1' ? sourceContent : 'Water freezes at 0 °C at standard atmospheric pressure.',
          condensedSummary:
            id === 'c1'
              ? 'Water boils at 100 °C at standard atmospheric pressure. Reduced pressure lowers its boiling point.'
              : 'Water freezes at 0 °C at standard atmospheric pressure.',
          contentVersion: 1,
          createdAt: now,
          updatedAt: now,
        }))
      );
  });
  afterAll(teardownTestDb);

  async function start(key = 'learner-a', chunkIds = ['c1']): Promise<string> {
    const result = await learner(() => ctx.createSession({ chunkIds, mode: 'learning' }), key);
    if (!result.success) throw new Error('Could not create test session');
    const chunks = await learner(() => ctx.getSessionChunks(result.data.sessionId), key);
    await sessions.updateSessionChunk(chunks[0]!.id, { status: 'in_progress' });
    return result.data.sessionId;
  }
  async function prepare(sessionId: string, overrides: Record<string, unknown> = {}) {
    const result = await learner(() => ctx.getCanonicalAnswer(readInput(sessionId, overrides)));
    expect(result.status).toBe('miss');
    if (result.status !== 'miss') throw new Error('Expected a fresh preparation observation');
    return result.observation;
  }
  async function accept(sessionId: string): Promise<CanonicalAnswer> {
    const observation = await prepare(sessionId);
    return ready(
      await learner(() => ctx.saveCanonicalAnswer(writeInput(sessionId, observation.fingerprint)))
    );
  }
  async function question(sessionId: string, chunkId = 'c1'): Promise<string> {
    const result = await learner(() =>
      ctx.createSessionQuestions({
        sessionId,
        questions: [
          {
            promptText: 'At what temperature does water boil at standard pressure?',
            chunkIds: [chunkId],
          },
        ],
      })
    );
    if (result.action !== 'created') throw new Error('Could not create question');
    return result.questionIds[0]!;
  }
  function answerInput(questionId: string, quality = 5): SubmitAnswerInput {
    return {
      sessionQuestionId: questionId,
      response: 'At 100 °C under standard pressure.',
      grading: rubricForQuality(quality),
      questionType: 'recall',
      feedback: 'Rubric evidence recorded.',
      timeSpentMs: 1500,
      questionScope: scope,
    };
  }
  async function unchangedState() {
    const [chunk] = await getSql().select().from(learningChunks).where(eq(learningChunks.id, 'c1'));
    return {
      quality: chunk?.repetitions,
      ease: chunk?.easeFactor,
      nextReview: chunk?.nextReviewAt,
    };
  }

  it('executes both typed facade methods on the frozen context and reuses exact bytes across sessions and repository instances', async () => {
    expect(Object.isFrozen(ctx)).toBe(true);
    const sessionId = await start();
    const original = await accept(sessionId);
    expect(original.parts).toEqual([{ partId: 'boiling', text: targetText }]);
    expect(original.observation.sources[0]).toMatchObject({
      kind: 'chunk',
      sourceId: 'c1',
      version: 1,
    });
    expect((await learner(() => ctx.completeSession(sessionId, undefined))).success).toBe(true);
    const laterSession = await start();
    const restarted = createAppContext({
      sessionQuestions: new DrizzleSessionQuestionRepository(getSql()),
      embedding: undefined,
      classifier: undefined,
    });
    const reused = ready(
      await learner(() => restarted.getCanonicalAnswer(readInput(laterSession)))
    );
    expect(reused).toEqual(original);
    const losingVariant = ready(
      await learner(() =>
        restarted.saveCanonicalAnswer(
          writeInput(laterSession, original.observation.fingerprint, {
            parts: [
              {
                part_id: 'boiling',
                text: 'At standard pressure, the boiling point of water is 100 °C.',
              },
            ],
          })
        )
      )
    );
    expect(losingVariant).toEqual(original);
    expect(await getSql().select().from(canonicalAnswerRevisions)).toHaveLength(1);
  });

  it.each([
    ['language', { ...publicScope, language: 'fr' }],
    [
      'fact subset',
      { ...publicScope, parts: [{ part_id: 'boiling', required_facts: ['water boiling point'] }] },
    ],
    [
      'part identity',
      {
        ...publicScope,
        parts: [{ part_id: 'temperature', required_facts: publicScope.parts[0]!.required_facts }],
      },
    ],
    [
      'source identity',
      { ...publicScope, sources: [{ kind: 'chunk', source_id: 'c2', components: ['content'] }] },
    ],
  ])('does not reuse a changed %s scope', async (_label, changedScope) => {
    const sessionId = await start('learner-a', ['c1', 'c2']);
    await accept(sessionId);
    const result = await learner(() =>
      ctx.getCanonicalAnswer(readInput(sessionId, { question_scope: changedScope }))
    );
    expect(result.status).toBe('miss');
    expect(result).not.toHaveProperty('answer');
  });

  it('requires exact ordered multipart scope and returns a miss for reversed parts', async () => {
    const sessionId = await start();
    const multipart = {
      ...publicScope,
      parts: [
        publicScope.parts[0]!,
        { part_id: 'qualification', required_facts: ['pressure changes boiling point'] },
      ],
    };
    const observation = await prepare(sessionId, { question_scope: multipart });
    const saved = ready(
      await learner(() =>
        ctx.saveCanonicalAnswer(
          writeInput(sessionId, observation.fingerprint, {
            question_scope: multipart,
            parts: [
              ...targetParts,
              {
                part_id: 'qualification',
                text: 'Boiling temperature changes with atmospheric pressure.',
              },
            ],
          })
        )
      )
    );
    expect(saved.parts.map(part => part.partId)).toEqual(['boiling', 'qualification']);
    expect(
      await learner(() =>
        ctx.getCanonicalAnswer(
          readInput(sessionId, {
            question_scope: { ...multipart, parts: [...multipart.parts].reverse() },
          })
        )
      )
    ).toMatchObject({ status: 'miss' });
  });

  it('rejects ambiguous duplicate scope and inaccessible source associations without creating material', async () => {
    const sessionId = await start();
    const ambiguous: CanonicalScope = { ...scope, parts: [scope.parts[0]!, scope.parts[0]!] };
    expect(
      await learner(() => ctx.getCanonicalAnswer({ ...readInput(sessionId), scope: ambiguous }))
    ).toMatchObject({ status: 'unavailable', reason: 'invalid_scope' });
    expect(
      await learner(() =>
        ctx.getCanonicalAnswer(
          readInput(sessionId, {
            question_scope: {
              ...publicScope,
              sources: [{ kind: 'chunk', source_id: 'c2', components: ['content'] }],
            },
          })
        )
      )
    ).toMatchObject({ status: 'unavailable', reason: 'source_or_session_unavailable' });
    expect(await getSql().select().from(canonicalAnswerIdentities)).toHaveLength(0);
  });

  it('isolates sessions, revision references and corrections by the server-derived learner', async () => {
    const ownedSession = await start();
    const original = await accept(ownedSession);
    const foreignSession = await start('learner-b');
    const foreignRead = await learner(
      () => ctx.getCanonicalAnswer(readInput(ownedSession)),
      'learner-b'
    );
    expect(foreignRead).toMatchObject({
      status: 'unavailable',
      reason: 'source_or_session_unavailable',
    });
    expect(foreignRead).not.toHaveProperty('answer');
    const foreignReference = await learner(
      () => ctx.getCanonicalAnswer(readInput(foreignSession, { revision_id: original.revisionId })),
      'learner-b'
    );
    expect(foreignReference).toMatchObject({
      status: 'unavailable',
      reason: 'revision_not_current',
    });
    const foreignCorrection = await learner(
      () =>
        ctx.saveCanonicalAnswer(
          writeInput(foreignSession, original.observation.fingerprint, {
            operation: 'correct',
            expected_head_version: original.headVersion,
            expected_revision_id: original.revisionId,
            correction_reason: 'Not my revision',
          })
        ),
      'learner-b'
    );
    expect(foreignCorrection).toMatchObject({
      status: 'unavailable',
      reason: 'identity_not_found',
    });
    expect(foreignCorrection).not.toHaveProperty('answer');
    expect(ready(await learner(() => ctx.getCanonicalAnswer(readInput(ownedSession))))).toEqual(
      original
    );
  });

  it('refuses a principal without a usable sub before either material repository operation', async () => {
    const sessionId = await start();
    const read = vi.spyOn(questions.canonical, 'read');
    const save = vi.spyOn(questions.canonical, 'save');
    expect(() =>
      withLearnerAuthContext(undefined, () => ctx.getCanonicalAnswer(readInput(sessionId)))
    ).toThrow();
    expect(() =>
      withLearnerAuthContext(undefined, () =>
        ctx.saveCanonicalAnswer(writeInput(sessionId, 'a'.repeat(64)))
      )
    ).toThrow();
    expect(read).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it.each([
    'ordinary content',
    'same-version content',
    'title',
    'condensed summary',
    'topic summary',
    'source removal',
    'unusable content',
  ] as const)(
    'withholds old stored references and stale candidates after %s changes',
    async change => {
      const sessionId = await start();
      const chosenScope =
        change === 'topic summary'
          ? {
              ...publicScope,
              sources: [
                ...publicScope.sources,
                { kind: 'topic' as const, source_id: 't1', components: ['summary'] },
              ],
            }
          : publicScope;
      const observation = await prepare(sessionId, { question_scope: chosenScope });
      const original = ready(
        await learner(() =>
          ctx.saveCanonicalAnswer(
            writeInput(sessionId, observation.fingerprint, { question_scope: chosenScope })
          )
        )
      );
      const before = await unchangedState();
      if (change === 'ordinary content') {
        expect(
          await ctx.updateChunkContent('c1', {
            content: sourceContent.replace('100', '99'),
          })
        ).toMatchObject({ success: true });
      } else if (change === 'same-version content') {
        await getSql()
          .update(learningChunks)
          .set({ content: 'Water boils at 99 °C at this pressure.' })
          .where(eq(learningChunks.id, 'c1'));
      } else if (change === 'title') {
        await ctx.updateChunkMetadata('c1', { title: 'Boiling at altitude' });
      } else if (change === 'condensed summary') {
        await ctx.updateChunkContent('c1', {
          content: sourceContent,
          condensedSummary: 'At altitude, water boils at a lower temperature.',
        });
      } else if (change === 'topic summary') {
        await ctx.updateTopicSummary('t1', 'Water boils at 99 °C at the specified pressure.');
      } else if (change === 'source removal') {
        await getSql().delete(learningChunks).where(eq(learningChunks.id, 'c1'));
      } else {
        await getSql()
          .update(learningChunks)
          .set({ content: '  ' })
          .where(eq(learningChunks.id, 'c1'));
      }
      const reference = await learner(() =>
        ctx.getCanonicalAnswer(
          readInput(sessionId, { question_scope: chosenScope, revision_id: original.revisionId })
        )
      );
      expect(reference.status).toBe('unavailable');
      expect(reference).not.toHaveProperty('answer');
      const stale = await learner(() =>
        ctx.saveCanonicalAnswer(
          writeInput(sessionId, observation.fingerprint, { question_scope: chosenScope })
        )
      );
      expect(stale.status).toBe('unavailable');
      expect(stale).not.toHaveProperty('answer');
      const revisions = await getSql().select().from(canonicalAnswerRevisions);
      expect(revisions).toHaveLength(1);
      expect(revisions[0]!.observation).toEqual(original.observation);
      if (change !== 'source removal') expect(await unchangedState()).toEqual(before);
    }
  );

  it('fingerprints an actually used condensed summary and all additional source chunks', async () => {
    const sessionId = await start('learner-a', ['c1', 'c2']);
    const usedSources = {
      ...publicScope,
      sources: [
        { kind: 'chunk', source_id: 'c1', components: ['condensed_summary'] },
        { kind: 'chunk', source_id: 'c2', components: ['content'] },
      ],
    };
    const observation = await prepare(sessionId, { question_scope: usedSources });
    const accepted = ready(
      await learner(() =>
        ctx.saveCanonicalAnswer(
          writeInput(sessionId, observation.fingerprint, { question_scope: usedSources })
        )
      )
    );
    expect(accepted.observation.sources.map(source => source.sourceId)).toEqual(['c1', 'c2']);
    await getSql()
      .update(learningChunks)
      .set({ condensedSummary: 'A factual summary correction.' })
      .where(eq(learningChunks.id, 'c1'));
    expect(
      await learner(() =>
        ctx.getCanonicalAnswer(
          readInput(sessionId, { question_scope: usedSources, revision_id: accepted.revisionId })
        )
      )
    ).toMatchObject({ status: 'unavailable' });
    const fresh = await prepare(sessionId, { question_scope: usedSources });
    const updated = ready(
      await learner(() =>
        ctx.saveCanonicalAnswer(
          writeInput(sessionId, fresh.fingerprint, { question_scope: usedSources })
        )
      )
    );
    await getSql()
      .update(learningChunks)
      .set({ content: 'The additional fact was corrected.' })
      .where(eq(learningChunks.id, 'c2'));
    expect(
      await learner(() =>
        ctx.getCanonicalAnswer(
          readInput(sessionId, { question_scope: usedSources, revision_id: updated.revisionId })
        )
      )
    ).toMatchObject({ status: 'unavailable' });
  });

  it('records invalidation reason/source provenance, prevents resurrection and preserves historical attempts through correction', async () => {
    const sessionId = await start();
    const original = await accept(sessionId);
    const questionId = await question(sessionId);
    const submitted = await learner(() =>
      ctx.submitAnswer({
        ...answerInput(questionId),
        canonicalMaterial: { kind: 'reference', revision_id: original.revisionId },
      })
    );
    expect(submitted).toMatchObject({
      action: 'recorded',
      quality: 5,
      canonical_feedback: { status: 'ready' },
    });
    const beforeAttempts = await getSql().select().from(sessionQuestionAttempts);
    const beforeSchedule = await unchangedState();
    const invalidated = await learner(() =>
      ctx.saveCanonicalAnswer(
        writeInput(sessionId, original.observation.fingerprint, {
          operation: 'invalidate',
          parts: undefined,
          expected_head_version: 1,
          expected_revision_id: original.revisionId,
          correction_reason: 'Disputed pressure qualifier',
        })
      )
    );
    expect(invalidated).toMatchObject({
      status: 'unavailable',
      reason: 'invalidated',
      head: { version: 2, revisionId: null },
    });
    const [head] = await getSql().select().from(canonicalAnswerIdentities);
    expect(head!.headHistory).toHaveLength(2);
    expect(head!.headHistory[1]).toMatchObject({
      headVersion: 2,
      operation: 'invalidate',
      previousRevisionId: original.revisionId,
      revisionId: null,
      reason: 'Disputed pressure qualifier',
      observation: original.observation,
    });
    expect(
      await learner(() =>
        ctx.saveCanonicalAnswer(writeInput(sessionId, original.observation.fingerprint))
      )
    ).toMatchObject({ status: 'unavailable', reason: 'invalidated' });
    const corrected = ready(
      await learner(() =>
        ctx.saveCanonicalAnswer(
          writeInput(sessionId, original.observation.fingerprint, {
            operation: 'correct',
            expected_head_version: 2,
            expected_revision_id: null,
            correction_reason: 'State the reference pressure explicitly',
            parts: [
              {
                part_id: 'boiling',
                text: 'Water boils at 100 °C at a pressure of one atmosphere.',
              },
            ],
            purpose: 'feedback',
            session_question_id: questionId,
            attempt_number: 1,
          })
        )
      )
    );
    expect(corrected.headVersion).toBe(3);
    expect(corrected.revisionId).not.toBe(original.revisionId);
    expect(await getSql().select().from(canonicalAnswerRevisions)).toHaveLength(2);
    expect(await getSql().select().from(sessionQuestionAttempts)).toEqual(beforeAttempts);
    expect(await unchangedState()).toEqual(beforeSchedule);
    expect(await getSql().select().from(canonicalAttemptAssociations)).toMatchObject([
      { revisionId: original.revisionId },
    ]);
    expect(
      await learner(() =>
        ctx.getCanonicalAnswer(readInput(sessionId, { revision_id: original.revisionId }))
      )
    ).toMatchObject({ status: 'unavailable', reason: 'revision_not_current' });
    expect(
      await learner(() =>
        ctx.saveCanonicalAnswer(
          writeInput(sessionId, original.observation.fingerprint, {
            operation: 'correct',
            expected_head_version: 1,
            expected_revision_id: original.revisionId,
            correction_reason: 'Stale correction',
          })
        )
      )
    ).toMatchObject({ status: 'unavailable', reason: 'revision_conflict' });
    // A second null head is a different generation: old null-head CAS must not resurrect it.
    await learner(() =>
      ctx.saveCanonicalAnswer(
        writeInput(sessionId, original.observation.fingerprint, {
          operation: 'invalidate',
          parts: undefined,
          expected_head_version: 3,
          expected_revision_id: corrected.revisionId,
          correction_reason: 'Recheck the claim',
        })
      )
    );
    expect(
      await learner(() =>
        ctx.saveCanonicalAnswer(
          writeInput(sessionId, original.observation.fingerprint, {
            operation: 'correct',
            expected_head_version: 2,
            expected_revision_id: null,
            correction_reason: 'Stale null-head correction',
          })
        )
      )
    ).toMatchObject({
      status: 'unavailable',
      reason: 'revision_conflict',
      head: { version: 4, revisionId: null },
    });
  });

  it.each([undefined, '', '  ', 'word '.repeat(41)])(
    'rejects an invalid replacement (%j) without making it current',
    async text => {
      const sessionId = await start();
      const original = await accept(sessionId);
      const input = writeInput(sessionId, original.observation.fingerprint, {
        operation: 'correct',
        expected_head_version: 1,
        expected_revision_id: original.revisionId,
        correction_reason: 'Repair material',
      });
      const result = await learner(() =>
        ctx.saveCanonicalAnswer({
          ...input,
          parts: text === undefined ? undefined : [{ partId: 'boiling', text }],
        })
      );
      expect(result.status).toBe('unavailable');
      expect(ready(await learner(() => ctx.getCanonicalAnswer(readInput(sessionId))))).toEqual(
        original
      );
      expect(await getSql().select().from(canonicalAnswerRevisions)).toHaveLength(1);
    }
  );

  it.each([
    ['malformed envelope', { kind: 'candidate' }],
    ['blank answer', { kind: 'candidate', parts: [{ part_id: 'boiling', text: '' }] }],
    ['whitespace answer', { kind: 'candidate', parts: [{ part_id: 'boiling', text: '   ' }] }],
    [
      'Unicode whitespace answer',
      { kind: 'candidate', parts: [{ part_id: 'boiling', text: '\u0085' }] },
    ],
    [
      'infeasible budget',
      { kind: 'candidate', parts: [{ part_id: 'boiling', text: 'word '.repeat(41) }] },
    ],
    [
      'wrong part scope',
      { kind: 'candidate', parts: [{ part_id: 'foreign', text: 'Some target.' }] },
    ],
    ['invalid reference', { kind: 'reference', revision_id: 'missing' }],
    [
      'source clarification',
      { kind: 'unavailable', reason: 'Source facts contradict each other.' },
    ],
  ])(
    'records the valid attempt despite %s with no partial canonical target',
    async (_label, material) => {
      const sessionId = await start();
      const observation = await prepare(sessionId);
      const questionId = await question(sessionId);
      const before = await unchangedState();
      const result = await learner(() =>
        ctx.submitAnswer({
          ...answerInput(questionId),
          canonicalMaterial:
            material.kind === 'candidate'
              ? { expected_fingerprint: observation.fingerprint, ...material }
              : material,
        })
      );
      expect(result).toMatchObject({
        action: 'recorded',
        quality: 5,
        attempt: 1,
        canonical_feedback: { status: 'unavailable' },
      });
      const attempts = await getSql().select().from(sessionQuestionAttempts);
      expect(attempts).toHaveLength(1);
      expect(attempts[0]).toMatchObject({
        response: 'At 100 °C under standard pressure.',
        quality: 5,
        agentQuality: 5,
        passed: true,
        questionScope: scope,
      });
      expect(await unchangedState()).toEqual(before);
      expect((await learner(() => ctx.getSessionChunks(sessionId)))[0]!.status).toBe('in_progress');
      expect(await getSql().select().from(canonicalAnswerIdentities)).toHaveLength(0);
      expect(await getSql().select().from(canonicalAnswerRevisions)).toHaveLength(0);
    }
  );

  it('records the attempt when prepared source material becomes unavailable before submission', async () => {
    const sessionId = await start();
    const observation = await prepare(sessionId);
    const questionId = await question(sessionId);
    const before = await unchangedState();
    await getSql().update(learningChunks).set({ content: null }).where(eq(learningChunks.id, 'c1'));
    expect(
      await learner(() =>
        ctx.submitAnswer({
          ...answerInput(questionId),
          canonicalMaterial: {
            kind: 'candidate',
            expected_fingerprint: observation.fingerprint,
            parts: targetParts,
          },
        })
      )
    ).toMatchObject({
      action: 'recorded',
      quality: 5,
      canonical_feedback: { status: 'unavailable', reason: 'source_or_session_unavailable' },
    });
    expect(await getSql().select().from(sessionQuestionAttempts)).toHaveLength(1);
    expect(await getSql().select().from(canonicalAnswerRevisions)).toHaveLength(0);
    expect(await unchangedState()).toEqual(before);
  });

  it.each(['candidate', 'reference'] as const)(
    'withholds stale %s material at feedback time without relabelling it with current sources',
    async kind => {
      const sessionId = await start();
      const original = await accept(sessionId);
      const questionId = await question(sessionId);
      const before = await unchangedState();
      await getSql()
        .update(learningChunks)
        .set({ content: 'The boiling point is 99 °C at the specified pressure.' })
        .where(eq(learningChunks.id, 'c1'));
      const canonicalMaterial =
        kind === 'candidate'
          ? { kind, expected_fingerprint: original.observation.fingerprint, parts: targetParts }
          : { kind, revision_id: original.revisionId };
      expect(
        await learner(() => ctx.submitAnswer({ ...answerInput(questionId), canonicalMaterial }))
      ).toMatchObject({
        action: 'recorded',
        quality: 5,
        canonical_feedback: {
          status: 'unavailable',
          reason: kind === 'candidate' ? 'source_observation_changed' : 'revision_not_current',
        },
      });
      expect(await getSql().select().from(sessionQuestionAttempts)).toHaveLength(1);
      expect(await getSql().select().from(canonicalAttemptAssociations)).toHaveLength(0);
      const revisions = await getSql().select().from(canonicalAnswerRevisions);
      expect(revisions).toHaveLength(1);
      expect(revisions[0]!.observation).toEqual(original.observation);
      expect(await unchangedState()).toEqual(before);
    }
  );

  it.each(['lookup', 'storage', 'assembly'] as const)(
    'keeps a real recorded attempt after a thrown optional %s failure',
    async failure => {
      const sessionId = await start();
      const observation = await prepare(sessionId);
      const questionId = await question(sessionId);
      const before = await unchangedState();
      const input = answerInput(questionId);
      if (failure === 'lookup')
        vi.spyOn(questions.canonical, 'read').mockRejectedValueOnce(new Error('Lookup failure'));
      if (failure === 'storage') {
        input.canonicalMaterial = {
          kind: 'candidate',
          expected_fingerprint: observation.fingerprint,
          parts: targetParts,
        };
        vi.spyOn(questions.canonical, 'save').mockRejectedValueOnce(new Error('Storage failure'));
      }
      if (failure === 'assembly')
        Object.defineProperty(input, 'canonicalMaterial', {
          get: () => {
            throw new Error('Assembly failure');
          },
        });
      expect(await learner(() => ctx.submitAnswer(input))).toMatchObject({
        action: 'recorded',
        quality: 5,
        canonical_feedback: { status: 'unavailable' },
      });
      expect(await getSql().select().from(sessionQuestionAttempts)).toMatchObject([
        { quality: 5, passed: true },
      ]);
      expect(await getSql().select().from(sessionQuestionAttempts)).toHaveLength(1);
      expect(await getSql().select().from(canonicalAnswerRevisions)).toHaveLength(0);
      expect(await unchangedState()).toEqual(before);
      expect((await learner(() => ctx.getSessionChunks(sessionId)))[0]!.status).toBe('in_progress');
    }
  );

  it('rolls back material writes when the required DB association fails, without rolling back the recorded attempt', async () => {
    const sessionId = await start();
    const observation = await prepare(sessionId);
    const questionId = await question(sessionId);
    const before = await unchangedState();
    await getSql().execute(
      sql`CREATE FUNCTION reject_canonical_association_for_test() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'association failure fixture'; END; $$`
    );
    try {
      await getSql().execute(
        sql`CREATE TRIGGER reject_canonical_association_for_test BEFORE INSERT ON canonical_attempt_associations FOR EACH ROW EXECUTE FUNCTION reject_canonical_association_for_test()`
      );
      const result = await learner(() =>
        ctx.submitAnswer({
          ...answerInput(questionId),
          canonicalMaterial: {
            kind: 'candidate',
            expected_fingerprint: observation.fingerprint,
            parts: targetParts,
          },
        })
      );
      expect(result).toMatchObject({
        action: 'recorded',
        quality: 5,
        canonical_feedback: { status: 'unavailable', reason: 'storage_unavailable' },
      });
      expect(await getSql().select().from(sessionQuestionAttempts)).toHaveLength(1);
      expect(await getSql().select().from(canonicalAnswerIdentities)).toHaveLength(0);
      expect(await getSql().select().from(canonicalAnswerRevisions)).toHaveLength(0);
      expect(await getSql().select().from(canonicalAttemptAssociations)).toHaveLength(0);
      expect(await unchangedState()).toEqual(before);
    } finally {
      await getSql().execute(
        sql`DROP TRIGGER IF EXISTS reject_canonical_association_for_test ON canonical_attempt_associations`
      );
      await getSql().execute(sql`DROP FUNCTION reject_canonical_association_for_test()`);
    }
    // Material-only repair neither duplicates the attempt nor changes its evidence.
    const beforeAttempts = await getSql().select().from(sessionQuestionAttempts);
    ready(
      await learner(() =>
        ctx.saveCanonicalAnswer(
          writeInput(sessionId, observation.fingerprint, {
            purpose: 'feedback',
            session_question_id: questionId,
            attempt_number: 1,
          })
        )
      )
    );
    expect(await getSql().select().from(sessionQuestionAttempts)).toEqual(beforeAttempts);
    expect(await unchangedState()).toEqual(before);
  });

  it.each([2, 5])(
    'withholds first-failure material and reveals only the actual second scope at quality %i',
    async quality => {
      const sessionId = await start();
      const initialObservation = await prepare(sessionId);
      const questionId = await question(sessionId);
      const before = await unchangedState();
      const failed = await learner(() =>
        ctx.submitAnswer({
          ...answerInput(questionId, 1),
          canonicalMaterial: {
            kind: 'candidate',
            expected_fingerprint: initialObservation.fingerprint,
            parts: targetParts,
          },
        })
      );
      expect(failed).toMatchObject({
        action: 'retry',
        attempt: 1,
        canonical_feedback: { status: 'withheld' },
      });
      expect(await getSql().select().from(canonicalAnswerRevisions)).toHaveLength(0);
      expect(
        await learner(() =>
          ctx.getCanonicalAnswer(
            readInput(sessionId, {
              purpose: 'feedback',
              session_question_id: questionId,
              attempt_number: 1,
            })
          )
        )
      ).toMatchObject({ status: 'unavailable', reason: 'feedback_not_eligible_or_scope_unknown' });
      const retryScope = {
        ...publicScope,
        parts: [
          { part_id: 'pressure', required_facts: ['pressure changes the boiling temperature'] },
        ],
      };
      const retryContext = readInput(sessionId, { question_scope: retryScope });
      const observation = await prepare(sessionId, { question_scope: retryScope });
      const completed = await learner(() =>
        ctx.submitAnswer({
          ...answerInput(questionId, quality),
          retryPromptText:
            'How does reduced atmospheric pressure affect the boiling point of water?',
          questionScope: retryContext.scope,
          canonicalMaterial: {
            kind: 'candidate',
            expected_fingerprint: observation.fingerprint,
            parts: [
              {
                part_id: 'pressure',
                text: 'Reduced atmospheric pressure lowers the boiling point of water.',
              },
            ],
          },
        })
      );
      expect(completed).toMatchObject({
        action: 'recorded',
        quality,
        attempt: 2,
        canonical_feedback: {
          status: 'ready',
          answer: {
            scope: retryContext.scope,
            parts: [
              {
                partId: 'pressure',
                text: 'Reduced atmospheric pressure lowers the boiling point of water.',
              },
            ],
          },
        },
      });
      const attempts = await questions.getAttemptsForQuestion(questionId);
      expect(attempts).toHaveLength(2);
      expect(attempts[0]!.questionScope).toEqual(scope);
      expect(attempts[1]!.questionScope).toEqual(retryContext.scope);
      expect(attempts[1]!.actualPromptText).toBe(
        'How does reduced atmospheric pressure affect the boiling point of water?'
      );
      expect(
        await learner(() =>
          ctx.getCanonicalAnswer(
            readInput(sessionId, {
              purpose: 'feedback',
              session_question_id: questionId,
              attempt_number: 2,
            })
          )
        )
      ).toMatchObject({ status: 'unavailable', reason: 'feedback_not_eligible_or_scope_unknown' });
      expect(await getSql().select().from(sessionQuestions)).toHaveLength(1);
      expect(await unchangedState()).toEqual(before);
      expect((await learner(() => ctx.getSessionChunks(sessionId)))[0]!.status).toBe('in_progress');
    }
  );

  it('rejects foreign, completed-session and third-attempt submissions before any extra writes', async () => {
    const sessionId = await start();
    const observation = await prepare(sessionId);
    const questionId = await question(sessionId);
    const input = {
      ...answerInput(questionId),
      canonicalMaterial: {
        kind: 'candidate',
        expected_fingerprint: observation.fingerprint,
        parts: targetParts,
      },
    };
    expect(await learner(() => ctx.submitAnswer(input), 'learner-b')).toMatchObject({
      action: 'error',
    });
    expect(await getSql().select().from(sessionQuestionAttempts)).toHaveLength(0);
    expect(await getSql().select().from(canonicalAnswerRevisions)).toHaveLength(0);
    await learner(() => ctx.submitAnswer({ ...answerInput(questionId, 1) }));
    await learner(() =>
      ctx.submitAnswer({
        ...input,
        retryPromptText: 'Give the standard-pressure boiling point of water.',
      })
    );
    const beforeAttempts = await getSql().select().from(sessionQuestionAttempts);
    const beforeRevisions = await getSql().select().from(canonicalAnswerRevisions);
    expect(
      await learner(() => ctx.submitAnswer({ ...input, retryPromptText: 'A third question?' }))
    ).toMatchObject({ action: 'error' });
    await learner(() => ctx.completeSession(sessionId, undefined));
    expect(await learner(() => ctx.submitAnswer(input))).toMatchObject({ action: 'error' });
    expect(await getSql().select().from(sessionQuestionAttempts)).toEqual(beforeAttempts);
    expect(await getSql().select().from(canonicalAnswerRevisions)).toEqual(beforeRevisions);
    expect(await getSql().select().from(sessionQuestions)).toHaveLength(1);
  });

  it('serializes competing initial variants across independent transactions and returns one unchanged target', async () => {
    const sessionId = await start();
    const observation = await prepare(sessionId);
    await independentConnections(async (holder, first, second, pids) => {
      await holder.query('BEGIN');
      await holder.query("SELECT id FROM learning_chunks WHERE id = 'c1' FOR UPDATE");
      const inputs = [
        writeInput(sessionId, observation.fingerprint),
        writeInput(sessionId, observation.fingerprint, {
          parts: [
            {
              part_id: 'boiling',
              text: 'Water has a boiling point of 100 °C at standard pressure.',
            },
          ],
        }),
      ];
      const repositories = [
        new DrizzleSessionQuestionRepository(drizzle(first)),
        new DrizzleSessionQuestionRepository(drizzle(second)),
      ];
      const pending = repositories.map((repository, index) =>
        repository.canonical.save({ ...inputs[index]!, learnerKey: 'learner-a' })
      );
      await Promise.all([waitForLock(holder, pids[1]!), waitForLock(holder, pids[2]!)]);
      await holder.query('COMMIT');
      const answers = (await Promise.all(pending)).map(ready);
      expect(answers[0]).toEqual(answers[1]);
      expect([targetText, inputs[1]!.parts![0]!.text]).toContain(answers[0]!.parts[0]!.text);
    });
    expect(await getSql().select().from(canonicalAnswerRevisions)).toHaveLength(1);
    expect((await getSql().select().from(canonicalAnswerIdentities))[0]!.headHistory).toHaveLength(
      1
    );
  });

  it('allows only one competing CAS correction and retains its reason without overwrite', async () => {
    const sessionId = await start();
    const original = await accept(sessionId);
    await independentConnections(async (holder, first, second, pids) => {
      await holder.query('BEGIN');
      await holder.query('SELECT id FROM canonical_answer_identities WHERE id = $1 FOR UPDATE', [
        original.identityId,
      ]);
      const pending = [first, second].map((connection, index) =>
        new DrizzleSessionQuestionRepository(drizzle(connection)).canonical.save({
          ...writeInput(sessionId, original.observation.fingerprint, {
            operation: 'correct',
            expected_head_version: 1,
            expected_revision_id: original.revisionId,
            correction_reason: `Correction ${index}`,
            parts: [{ part_id: 'boiling', text: `Corrected target variant ${index}.` }],
          }),
          learnerKey: 'learner-a',
        })
      );
      await Promise.all([waitForLock(holder, pids[1]!), waitForLock(holder, pids[2]!)]);
      await holder.query('COMMIT');
      const outcomes = await Promise.all(pending);
      expect(outcomes.filter(result => result.status === 'ready')).toHaveLength(1);
      expect(outcomes.filter(result => result.status !== 'ready')).toMatchObject([
        { status: 'unavailable', reason: 'revision_conflict' },
      ]);
    });
    expect(await getSql().select().from(canonicalAnswerRevisions)).toHaveLength(2);
    const [head] = await getSql().select().from(canonicalAnswerIdentities);
    expect(head!.headHistory).toHaveLength(2);
    expect(head!.headHistory[1]!.reason).toMatch(/^Correction [01]$/);
  });

  it('does not let ordinary competing acceptance overwrite a correction', async () => {
    const sessionId = await start();
    const original = await accept(sessionId);
    await independentConnections(async (holder, first, second, pids) => {
      await holder.query('BEGIN');
      await holder.query('SELECT id FROM canonical_answer_identities WHERE id = $1 FOR UPDATE', [
        original.identityId,
      ]);
      const correction = new DrizzleSessionQuestionRepository(drizzle(first)).canonical.save({
        ...writeInput(sessionId, original.observation.fingerprint, {
          operation: 'correct',
          expected_head_version: 1,
          expected_revision_id: original.revisionId,
          correction_reason: 'Correct the qualification',
          parts: [{ part_id: 'boiling', text: 'The corrected durable target.' }],
        }),
        learnerKey: 'learner-a',
      });
      const acceptance = new DrizzleSessionQuestionRepository(drizzle(second)).canonical.save({
        ...writeInput(sessionId, original.observation.fingerprint, {
          parts: [{ part_id: 'boiling', text: 'A losing stylistic variant.' }],
        }),
        learnerKey: 'learner-a',
      });
      await Promise.all([waitForLock(holder, pids[1]!), waitForLock(holder, pids[2]!)]);
      await holder.query('COMMIT');
      const [corrected, accepted] = (await Promise.all([correction, acceptance])).map(ready);
      expect([original.revisionId, corrected!.revisionId]).toContain(accepted!.revisionId);
      expect(
        ready(await learner(() => ctx.getCanonicalAnswer(readInput(sessionId)))).parts
      ).toEqual([{ partId: 'boiling', text: 'The corrected durable target.' }]);
    });
    expect(await getSql().select().from(canonicalAnswerRevisions)).toHaveLength(2);
  });

  it('re-observes changed source bytes at the shared lock boundary before a concurrent correction or reference read', async () => {
    const sessionId = await start();
    const original = await accept(sessionId);
    await independentConnections(async (holder, first, second, pids) => {
      await holder.query('BEGIN');
      await holder.query(
        "UPDATE learning_chunks SET content = 'New fact at the same source version.' WHERE id = 'c1'"
      );
      const correction = new DrizzleSessionQuestionRepository(drizzle(first)).canonical.save({
        ...writeInput(sessionId, original.observation.fingerprint, {
          operation: 'correct',
          expected_head_version: 1,
          expected_revision_id: original.revisionId,
          correction_reason: 'Prepared before the source changed',
        }),
        learnerKey: 'learner-a',
      });
      const reference = new DrizzleSessionQuestionRepository(drizzle(second)).canonical.read({
        ...readInput(sessionId, { revision_id: original.revisionId }),
        learnerKey: 'learner-a',
      });
      await Promise.all([waitForLock(holder, pids[1]!), waitForLock(holder, pids[2]!)]);
      await holder.query('COMMIT');
      expect(await correction).toMatchObject({
        status: 'unavailable',
        reason: 'source_observation_changed',
      });
      expect(await reference).toMatchObject({
        status: 'unavailable',
        reason: 'revision_not_current',
      });
    });
    expect(await getSql().select().from(canonicalAnswerRevisions)).toHaveLength(1);
    expect((await getSql().select().from(canonicalAnswerIdentities))[0]!.headVersion).toBe(1);
  });

  it('leaves deferred SRS and progression identical to a control attempt after material failure', async () => {
    const scheduleOf = async (chunkId: string) => {
      const [row] = await getSql()
        .select()
        .from(learningChunks)
        .where(eq(learningChunks.id, chunkId));
      return {
        repetitions: row?.repetitions,
        easeFactor: row?.easeFactor,
        failures: row?.consecutiveFailures,
      };
    };
    const runOn = async (chunkId: string, canonicalMaterial?: unknown) => {
      const sessionId = await start('learner-a', [chunkId]);
      const questionId = await question(sessionId, chunkId);
      const recorded = await learner(() =>
        ctx.submitAnswer({ ...answerInput(questionId), canonicalMaterial })
      );
      const next = await learner(() => ctx.getNextTeachingStep());
      expect((await learner(() => ctx.completeSession(sessionId, undefined))).success).toBe(true);
      return { recorded, next };
    };
    const control = await runOn('c1');
    const failedMaterial = await runOn('c2', {
      kind: 'candidate',
      expected_fingerprint: 'a'.repeat(64),
      parts: [{ part_id: 'boiling', text: 'word '.repeat(41) }],
    });
    expect(control.recorded).toMatchObject({ action: 'recorded', quality: 5, passed: true });
    expect(failedMaterial.recorded).toMatchObject({
      action: 'recorded',
      quality: 5,
      passed: true,
      canonical_feedback: { status: 'unavailable' },
    });
    expect(control.next.action).toBe('complete');
    expect(failedMaterial.next.action).toBe(control.next.action);
    expect(await scheduleOf('c2')).toEqual(await scheduleOf('c1'));
    expect((await scheduleOf('c2')).repetitions).toBe(4);
    expect(await getSql().select().from(canonicalAnswerRevisions)).toHaveLength(0);
  });
});
