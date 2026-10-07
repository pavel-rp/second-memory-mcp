import { and, asc, eq, inArray, min, ne } from 'drizzle-orm';
import crypto from 'node:crypto';
import { getSql, type SqlDb, type SqlTx } from '../../infrastructure/db/operations.js';
import {
  sessionQuestions,
  sessionQuestionChunks,
  sessionQuestionAttempts,
  sessionQuestionAttemptRevisions,
  learningSessions,
  sessionChunks,
  learningChunks,
  learningTopics,
  canonicalAnswerIdentities,
  canonicalAnswerRevisions,
  canonicalAttemptAssociations,
  type NewSessionQuestionRow,
  type NewSessionQuestionChunkRow,
  type NewSessionQuestionAttemptRow,
  type NewSessionQuestionAttemptRevisionRow,
  type SessionQuestionAttemptRevisionRow,
} from '../../infrastructure/db/schema.js';
import type {
  SessionQuestion,
  SessionQuestionAttempt,
  SessionQuestionAttemptRevision,
  SessionQuestionAttemptRevisionReason,
  SessionQuestionStatus,
} from '../../domain/types/entities.js';
import type {
  SessionQuestionRepository,
  CreateQuestionAttemptInput,
  ReviseAttemptInput,
} from '../../ports/session-question-repository.js';

import type {
  CanonicalAnswer,
  CanonicalObservation,
  CanonicalReadRequest,
  CanonicalWriteRequest,
  CanonicalResult,
  CanonicalSourceSnapshot,
} from '../../domain/types/canonical-answer.js';
import { compareCanonicalSources } from '../../domain/types/canonical-answer.js';
import {
  validateCanonicalScope,
  validateCanonicalParts,
  canonicalScopeKey,
  canonicalFeedbackEligible,
  canonicalUnavailable,
  CANONICAL_PREPARATION_DIRECTIVE,
  CANONICAL_FEEDBACK_DIRECTIVE,
} from '../../domain/services/canonical-answer.js';

function mapRevisionRow(row: SessionQuestionAttemptRevisionRow): SessionQuestionAttemptRevision {
  return {
    id: row.id,
    attemptId: row.attemptId,
    originalQuality: row.originalQuality,
    originalAgentQuality: row.originalAgentQuality,
    originalPassed: row.originalPassed,
    originalFeedback: row.originalFeedback,
    newQuality: row.newQuality,
    newAgentQuality: row.newAgentQuality,
    newPassed: row.newPassed,
    newFeedback: row.newFeedback,
    reason: row.reason as SessionQuestionAttemptRevisionReason,
    revisedAt: row.revisedAt,
  };
}

export class DrizzleSessionQuestionRepository implements SessionQuestionRepository {
  readonly canonical = {
    read: (input: CanonicalReadRequest): Promise<CanonicalResult> => this.readCanonical(input),
    save: (input: CanonicalWriteRequest): Promise<CanonicalResult> => this.saveCanonical(input),
  };

  constructor(private db: Omit<SqlDb, '$client'> = getSql()) {}

  async createQuestions(
    sessionId: string,
    questions: { promptText: string; chunkIds: string[] }[],
    startIndex?: number
  ): Promise<SessionQuestion[]> {
    const now = Date.now();
    const base = startIndex ?? 1;
    const questionRows: NewSessionQuestionRow[] = questions.map((q, i) => ({
      id: crypto.randomUUID(),
      sessionId,
      questionIndex: base + i,
      promptText: q.promptText,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    }));
    // Insert junction rows for each question → chunk mapping
    const junctionRows: NewSessionQuestionChunkRow[] = [];
    questions.forEach((q, i) => {
      const questionId = questionRows[i]?.id;
      if (!questionId) return;
      for (const chunkId of q.chunkIds) {
        junctionRows.push({
          id: crypto.randomUUID(),
          sessionQuestionId: questionId,
          chunkId,
        });
      }
    });

    // Atomic: question rows + junction rows in a single transaction
    await this.db.transaction(async tx => {
      await tx.insert(sessionQuestions).values(questionRows);
      if (junctionRows.length > 0) {
        await tx.insert(sessionQuestionChunks).values(junctionRows);
      }
    });

    return questionRows as SessionQuestion[];
  }

  async getQuestionsForSession(sessionId: string): Promise<SessionQuestion[]> {
    return (await this.db
      .select()
      .from(sessionQuestions)
      .where(eq(sessionQuestions.sessionId, sessionId))
      .orderBy(asc(sessionQuestions.questionIndex))) as SessionQuestion[];
  }

  async getChunkIdsForQuestion(questionId: string): Promise<string[]> {
    const rows = await this.db
      .select({ chunkId: sessionQuestionChunks.chunkId })
      .from(sessionQuestionChunks)
      .where(eq(sessionQuestionChunks.sessionQuestionId, questionId));
    return rows.map(r => r.chunkId);
  }

  async getChunkIdsForQuestions(questionIds: string[]): Promise<Map<string, string[]>> {
    if (questionIds.length === 0) return new Map();
    const rows = await this.db
      .select({
        sessionQuestionId: sessionQuestionChunks.sessionQuestionId,
        chunkId: sessionQuestionChunks.chunkId,
      })
      .from(sessionQuestionChunks)
      .where(inArray(sessionQuestionChunks.sessionQuestionId, questionIds));

    const map = new Map<string, string[]>();
    for (const row of rows) {
      const list = map.get(row.sessionQuestionId) ?? [];
      list.push(row.chunkId);
      map.set(row.sessionQuestionId, list);
    }
    return map;
  }

  async getQuestionById(id: string): Promise<SessionQuestion | null> {
    const [row] = await this.db.select().from(sessionQuestions).where(eq(sessionQuestions.id, id));
    return (row as SessionQuestion | undefined) ?? null;
  }

  async updateQuestionStatus(id: string, status: SessionQuestionStatus): Promise<number> {
    const res = await this.db
      .update(sessionQuestions)
      .set({ status, updatedAt: Date.now() })
      .where(eq(sessionQuestions.id, id));
    return res.rowCount ?? 0;
  }

  async createAttempt(input: CreateQuestionAttemptInput): Promise<SessionQuestionAttempt> {
    const row: NewSessionQuestionAttemptRow = {
      id: input.id,
      sessionQuestionId: input.sessionQuestionId,
      attemptNumber: input.attemptNumber,
      actualPromptText: input.actualPromptText ?? null,
      questionScope: input.questionScope ?? null,
      response: input.response,
      passed: input.passed,
      feedback: input.feedback,
      quality: input.quality,
      agentQuality: input.agentQuality,
      questionType: input.questionType,
      timeSpentMs: input.timeSpentMs,
      createdAt: input.createdAt,
      snapshotBand: input.snapshotBand,
      snapshotPredictedRecall: input.snapshotPredictedRecall,
      snapshotIntervalDays: input.snapshotIntervalDays,
      snapshotDaysOverdue: input.snapshotDaysOverdue,
    };
    await this.db.insert(sessionQuestionAttempts).values(row);
    return row as SessionQuestionAttempt;
  }

  async getAttemptsForQuestion(sessionQuestionId: string): Promise<SessionQuestionAttempt[]> {
    return (await this.db
      .select()
      .from(sessionQuestionAttempts)
      .where(eq(sessionQuestionAttempts.sessionQuestionId, sessionQuestionId))
      .orderBy(asc(sessionQuestionAttempts.attemptNumber))) as SessionQuestionAttempt[];
  }

  async getAllAttemptsForSession(sessionId: string): Promise<SessionQuestionAttempt[]> {
    return (await this.db
      .select({
        id: sessionQuestionAttempts.id,
        sessionQuestionId: sessionQuestionAttempts.sessionQuestionId,
        attemptNumber: sessionQuestionAttempts.attemptNumber,
        actualPromptText: sessionQuestionAttempts.actualPromptText,
        questionScope: sessionQuestionAttempts.questionScope,
        response: sessionQuestionAttempts.response,
        passed: sessionQuestionAttempts.passed,
        feedback: sessionQuestionAttempts.feedback,
        quality: sessionQuestionAttempts.quality,
        agentQuality: sessionQuestionAttempts.agentQuality,
        questionType: sessionQuestionAttempts.questionType,
        timeSpentMs: sessionQuestionAttempts.timeSpentMs,
        createdAt: sessionQuestionAttempts.createdAt,
      })
      .from(sessionQuestionAttempts)
      .innerJoin(
        sessionQuestions,
        eq(sessionQuestionAttempts.sessionQuestionId, sessionQuestions.id)
      )
      .where(eq(sessionQuestions.sessionId, sessionId))
      .orderBy(
        asc(sessionQuestionAttempts.sessionQuestionId),
        asc(sessionQuestionAttempts.attemptNumber)
      )) as SessionQuestionAttempt[];
  }

  async reviseAttempt(input: ReviseAttemptInput): Promise<SessionQuestionAttemptRevision> {
    const revisionRow: NewSessionQuestionAttemptRevisionRow = {
      id: input.revisionId,
      attemptId: input.attemptId,
      originalQuality: input.original.quality,
      originalAgentQuality: input.original.agentQuality,
      originalPassed: input.original.passed,
      originalFeedback: input.original.feedback,
      newQuality: input.next.quality,
      newAgentQuality: input.next.agentQuality,
      newPassed: input.next.passed,
      newFeedback: input.next.feedback,
      reason: input.reason,
      revisedAt: input.revisedAt,
    };

    await this.db.transaction(async tx => {
      await tx
        .update(sessionQuestionAttempts)
        .set({
          quality: input.next.quality,
          agentQuality: input.next.agentQuality,
          passed: input.next.passed,
          feedback: input.next.feedback,
        })
        .where(eq(sessionQuestionAttempts.id, input.attemptId));
      await tx.insert(sessionQuestionAttemptRevisions).values(revisionRow);
    });

    return mapRevisionRow(revisionRow as SessionQuestionAttemptRevisionRow);
  }

  async getRevisionsForAttempt(attemptId: string): Promise<SessionQuestionAttemptRevision[]> {
    const rows = await this.db
      .select()
      .from(sessionQuestionAttemptRevisions)
      .where(eq(sessionQuestionAttemptRevisions.attemptId, attemptId))
      .orderBy(asc(sessionQuestionAttemptRevisions.revisedAt));
    return rows.map(mapRevisionRow);
  }

  private async observeCanonical(
    tx: SqlTx,
    input: CanonicalReadRequest
  ): Promise<CanonicalObservation | undefined> {
    const [session] = await tx
      .select({ id: learningSessions.id, mode: learningSessions.mode })
      .from(learningSessions)
      .where(
        and(
          eq(learningSessions.id, input.sessionId),
          eq(learningSessions.learnerKey, input.learnerKey)
        )
      )
      .for('share');
    if (!session || session.mode === 'assessment') return undefined;
    const members = await tx
      .select({ id: learningChunks.id, topicId: learningChunks.topicId })
      .from(sessionChunks)
      .innerJoin(learningChunks, eq(sessionChunks.chunkId, learningChunks.id))
      .where(eq(sessionChunks.sessionId, session.id));
    const allowedChunks = new Set(members.map(m => m.id));
    const allowedTopics = new Set(members.map(m => m.topicId));
    if (
      input.scope.sources.some(
        s => !(s.kind === 'chunk' ? allowedChunks : allowedTopics).has(s.sourceId)
      )
    ) {
      return undefined;
    }
    const snapshots: CanonicalSourceSnapshot[] = [];
    // Parent topics precede chunks: the same order as a topic-deletion cascade.
    for (const source of [...input.scope.sources].sort(
      (a, b) =>
        (a.kind === 'topic' ? 0 : 1) - (b.kind === 'topic' ? 0 : 1) || compareCanonicalSources(a, b)
    )) {
      if (source.kind === 'topic') {
        const [row] = await tx
          .select({
            id: learningTopics.id,
            title: learningTopics.title,
            summary: learningTopics.summary,
            version: learningTopics.summaryVersion,
          })
          .from(learningTopics)
          .where(eq(learningTopics.id, source.sourceId))
          .for('share');
        if (!row || !row.summary?.trim()) return undefined;
        snapshots.push({
          kind: 'topic',
          sourceId: row.id,
          version: row.version,
          digest: crypto
            .createHash('sha256')
            .update(JSON.stringify([row.title, row.summary]))
            .digest('hex'),
        });
      } else {
        const [row] = await tx
          .select({
            id: learningChunks.id,
            title: learningChunks.title,
            content: learningChunks.content,
            summary: learningChunks.condensedSummary,
            version: learningChunks.contentVersion,
          })
          .from(learningChunks)
          .where(eq(learningChunks.id, source.sourceId))
          .for('share');
        if (
          !row ||
          source.components.some(c => !(c === 'content' ? row.content : row.summary)?.trim())
        )
          return undefined;
        snapshots.push({
          kind: 'chunk',
          sourceId: row.id,
          version: row.version,
          digest: crypto
            .createHash('sha256')
            .update(JSON.stringify([row.title, row.content, row.summary]))
            .digest('hex'),
        });
      }
    }
    snapshots.sort(compareCanonicalSources);
    return {
      sources: snapshots,
      fingerprint: crypto.createHash('sha256').update(JSON.stringify(snapshots)).digest('hex'),
    };
  }

  private async feedbackAttempt(tx: SqlTx, input: CanonicalReadRequest): Promise<string | null> {
    if (!input.feedback) return null;
    const [row] = await tx
      .select({
        id: sessionQuestionAttempts.id,
        passed: sessionQuestionAttempts.passed,
        questionType: sessionQuestionAttempts.questionType,
        prompt: sessionQuestionAttempts.actualPromptText,
        scope: sessionQuestionAttempts.questionScope,
      })
      .from(sessionQuestionAttempts)
      .innerJoin(
        sessionQuestions,
        eq(sessionQuestionAttempts.sessionQuestionId, sessionQuestions.id)
      )
      .where(
        and(
          eq(sessionQuestions.sessionId, input.sessionId),
          eq(sessionQuestions.id, input.feedback.sessionQuestionId),
          eq(sessionQuestionAttempts.attemptNumber, input.feedback.attemptNumber)
        )
      )
      .for('share');
    if (
      !row ||
      !canonicalFeedbackEligible({
        mode: 'learning',
        questionType: row.questionType,
        attemptNumber: input.feedback.attemptNumber,
        passed: row.passed,
        actualPromptText: row.prompt,
      }) ||
      !row.scope ||
      canonicalScopeKey(row.scope) !== canonicalScopeKey(input.scope)
    )
      return null;
    return row.id;
  }

  private async canonicalRevision(
    tx: SqlTx,
    head: typeof canonicalAnswerIdentities.$inferSelect,
    observation: CanonicalObservation
  ): Promise<CanonicalAnswer | undefined> {
    if (!head.currentRevisionId) return undefined;
    const [revision] = await tx
      .select()
      .from(canonicalAnswerRevisions)
      .where(
        and(
          eq(canonicalAnswerRevisions.id, head.currentRevisionId),
          eq(canonicalAnswerRevisions.identityId, head.id)
        )
      );
    if (
      !revision ||
      revision.observation.fingerprint !== observation.fingerprint ||
      !validateCanonicalParts(head.scope, revision.parts).ok
    )
      return undefined;
    return {
      identityId: head.id,
      revisionId: revision.id,
      headVersion: head.headVersion,
      scope: head.scope,
      observation,
      parts: revision.parts,
    };
  }

  private async associateCanonical(
    tx: SqlTx,
    attemptId: string | null,
    revisionId: string
  ): Promise<void> {
    if (!attemptId) return;
    // Existing links are historical evidence: corrections do not retarget them.
    await tx
      .insert(canonicalAttemptAssociations)
      .values({ attemptId, revisionId, createdAt: Date.now() })
      .onConflictDoNothing({ target: canonicalAttemptAssociations.attemptId });
  }

  private async readCanonical(input: CanonicalReadRequest): Promise<CanonicalResult> {
    if (!validateCanonicalScope(input.scope)) return canonicalUnavailable('invalid_scope');
    return this.db.transaction(async tx => {
      const observation = await this.observeCanonical(tx, input);
      if (!observation) return canonicalUnavailable('source_or_session_unavailable');
      const attemptId = await this.feedbackAttempt(tx, input);
      if (input.feedback && !attemptId)
        return canonicalUnavailable('feedback_not_eligible_or_scope_unknown');
      const scopeHash = crypto
        .createHash('sha256')
        .update(canonicalScopeKey(input.scope))
        .digest('hex');
      const [head] = await tx
        .select()
        .from(canonicalAnswerIdentities)
        .where(
          and(
            eq(canonicalAnswerIdentities.learnerKey, input.learnerKey),
            eq(canonicalAnswerIdentities.language, input.scope.language),
            eq(canonicalAnswerIdentities.scopeHash, scopeHash),
            eq(canonicalAnswerIdentities.sourceFingerprint, observation.fingerprint)
          )
        )
        .for('share');
      const directive = input.feedback
        ? CANONICAL_FEEDBACK_DIRECTIVE
        : CANONICAL_PREPARATION_DIRECTIVE;
      if (!head) {
        if (input.revisionId) return canonicalUnavailable('revision_not_current');
        return { status: 'miss', observation, directive };
      }
      const state = { version: head.headVersion, revisionId: head.currentRevisionId };
      if (!head.currentRevisionId)
        return { ...canonicalUnavailable('invalidated'), observation, head: state };
      if (input.revisionId && input.revisionId !== head.currentRevisionId)
        return canonicalUnavailable('revision_not_current');
      const answer = await this.canonicalRevision(tx, head, observation);
      if (!answer) return canonicalUnavailable('invalid_stored_material');
      await this.associateCanonical(tx, attemptId, answer.revisionId);
      return { status: 'ready', answer, directive };
    });
  }

  private async saveCanonical(input: CanonicalWriteRequest): Promise<CanonicalResult> {
    if (!validateCanonicalScope(input.scope)) return canonicalUnavailable('invalid_scope');
    const parts = input.parts ?? [];
    if (input.operation !== 'invalidate') {
      const checked = validateCanonicalParts(input.scope, parts);
      if (!checked.ok) return canonicalUnavailable(checked.reason);
    }
    return this.db.transaction(async tx => {
      const observation = await this.observeCanonical(tx, input);
      if (!observation) return canonicalUnavailable('source_or_session_unavailable');
      if (input.expectedFingerprint !== observation.fingerprint)
        return canonicalUnavailable('source_observation_changed');
      const attemptId = await this.feedbackAttempt(tx, input);
      if (input.feedback && !attemptId)
        return canonicalUnavailable('feedback_not_eligible_or_scope_unknown');
      const scopeHash = crypto
        .createHash('sha256')
        .update(canonicalScopeKey(input.scope))
        .digest('hex');
      const key = and(
        eq(canonicalAnswerIdentities.learnerKey, input.learnerKey),
        eq(canonicalAnswerIdentities.language, input.scope.language),
        eq(canonicalAnswerIdentities.scopeHash, scopeHash),
        eq(canonicalAnswerIdentities.sourceFingerprint, observation.fingerprint)
      );
      const now = Date.now();
      if (input.operation === 'accept') {
        await tx
          .insert(canonicalAnswerIdentities)
          .values({
            id: crypto.randomUUID(),
            learnerKey: input.learnerKey,
            language: input.scope.language,
            scopeHash,
            scope: input.scope,
            sourceFingerprint: observation.fingerprint,
            headVersion: 0,
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoNothing();
      }
      const [head] = await tx.select().from(canonicalAnswerIdentities).where(key).for('update');
      if (!head) return canonicalUnavailable('identity_not_found');
      const state = { version: head.headVersion, revisionId: head.currentRevisionId };
      const directive = input.feedback
        ? CANONICAL_FEEDBACK_DIRECTIVE
        : CANONICAL_PREPARATION_DIRECTIVE;
      if (input.operation === 'accept' && head.currentRevisionId) {
        const answer = await this.canonicalRevision(tx, head, observation);
        if (!answer) return canonicalUnavailable('invalid_stored_material');
        await this.associateCanonical(tx, attemptId, answer.revisionId);
        return { status: 'ready', answer, directive };
      }
      if (input.operation === 'accept' && head.headVersion > 0) {
        return { ...canonicalUnavailable('invalidated'), observation, head: state };
      }
      if (
        input.operation !== 'accept' &&
        (head.headVersion === 0 ||
          input.expectedHeadVersion !== head.headVersion ||
          input.expectedRevisionId !== head.currentRevisionId ||
          !input.correctionReason?.trim())
      )
        return { ...canonicalUnavailable('revision_conflict'), observation, head: state };
      const headVersion = head.headVersion + 1;
      const revisionId = crypto.randomUUID();
      // Append evidence under the head lock, including invalidation with no replacement.
      const headHistory = [
        ...head.headHistory,
        {
          headVersion,
          operation: input.operation,
          previousRevisionId: head.currentRevisionId,
          revisionId: input.operation === 'invalidate' ? null : revisionId,
          reason: input.correctionReason ?? null,
          observation,
          createdAt: now,
        },
      ];
      if (input.operation === 'invalidate') {
        await tx
          .update(canonicalAnswerIdentities)
          .set({ currentRevisionId: null, headVersion, headHistory, updatedAt: now })
          .where(eq(canonicalAnswerIdentities.id, head.id));
        return {
          ...canonicalUnavailable('invalidated'),
          observation,
          head: { version: headVersion, revisionId: null },
        };
      }
      await tx.insert(canonicalAnswerRevisions).values({
        id: revisionId,
        identityId: head.id,
        headVersion,
        parts,
        observation,
        correctionReason: input.correctionReason ?? null,
        createdAt: now,
      });
      await tx
        .update(canonicalAnswerIdentities)
        .set({ currentRevisionId: revisionId, headVersion, headHistory, updatedAt: now })
        .where(eq(canonicalAnswerIdentities.id, head.id));
      await this.associateCanonical(tx, attemptId, revisionId);
      return {
        status: 'ready',
        directive,
        answer: {
          identityId: head.id,
          revisionId,
          headVersion,
          scope: head.scope,
          parts,
          observation,
        },
      };
    });
  }

  async getMinPriorQuality(
    sessionId: string,
    chunkIds: string[],
    excludeQuestionId?: string
  ): Promise<number | undefined> {
    if (chunkIds.length === 0) return undefined;

    const conditions = [
      eq(sessionQuestions.sessionId, sessionId),
      inArray(sessionQuestionChunks.chunkId, chunkIds),
    ];
    if (excludeQuestionId) {
      conditions.push(ne(sessionQuestions.id, excludeQuestionId));
    }

    const [row] = await this.db
      .select({ minQuality: min(sessionQuestionAttempts.quality) })
      .from(sessionQuestionAttempts)
      .innerJoin(
        sessionQuestions,
        eq(sessionQuestionAttempts.sessionQuestionId, sessionQuestions.id)
      )
      .innerJoin(
        sessionQuestionChunks,
        eq(sessionQuestionChunks.sessionQuestionId, sessionQuestions.id)
      )
      .where(and(...conditions));

    return row?.minQuality ?? undefined;
  }
}
