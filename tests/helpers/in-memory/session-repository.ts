import crypto from 'node:crypto';
import type {
  SessionRepository,
  CreateSessionInput,
  UpdateSessionInput,
  CreateSessionChunkInput,
  UpdateSessionChunkInput,
  ChunkValidationResult,
  BatchSessionChunkResult,
} from '../../../src/ports/session-repository.js';
import type { LearningSession, SessionChunk } from '../../../src/domain/types/entities.js';
import type {
  SessionInput,
  HistoricalFeedback,
  BatchOperation,
  ChunkAttempt,
} from '../../../src/domain/types/session.js';
import { InMemoryChunkRepository } from './chunk-repository.js';

export class InMemorySessionRepository implements SessionRepository {
  private sessions = new Map<string, LearningSession>();
  private sessionChunks = new Map<string, SessionChunk>();
  private chunkRepo?: InMemoryChunkRepository;

  constructor(chunkRepo?: InMemoryChunkRepository) {
    this.chunkRepo = chunkRepo;
  }

  seed(session: LearningSession): void {
    this.sessions.set(session.id, session);
  }

  seedSessionChunk(sc: SessionChunk): void {
    this.sessionChunks.set(sc.id, sc);
  }

  getSessionStore(): Map<string, LearningSession> {
    return this.sessions;
  }

  getSessionChunkStore(): Map<string, SessionChunk> {
    return this.sessionChunks;
  }

  clear(): void {
    this.sessions.clear();
    this.sessionChunks.clear();
  }

  async createSession(input: CreateSessionInput): Promise<void> {
    const row: LearningSession = {
      id: input.id,
      topicId: input.topicId || null,
      chunkIds: input.chunkIds || null,
      mode: input.mode,
      estimatedDuration: input.estimatedDuration || null,
      status: 'active',
      startTime: input.startTime,
      endTime: null,
      feedback: null,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    };
    this.sessions.set(row.id, row);

    if (input.chunkIds && input.chunkIds.length > 0) {
      for (const chunkId of input.chunkIds) {
        const sc: SessionChunk = {
          id: crypto.randomUUID(),
          sessionId: input.id,
          chunkId,
          status: 'pending',
          attemptsJson: null,
          qualityScoresJson: null,
          timeSpentMs: 0,
          createdAt: input.createdAt,
          updatedAt: input.updatedAt,
        };
        this.sessionChunks.set(sc.id, sc);
      }
    }
  }

  async getSessionById(id: string): Promise<LearningSession | null> {
    return this.sessions.get(id) || null;
  }

  async getActiveSession(): Promise<LearningSession | null> {
    const active = [...this.sessions.values()]
      .filter(s => s.status === 'active')
      .sort((a, b) => b.createdAt - a.createdAt);
    return active[0] || null;
  }

  async updateSession(id: string, changes: UpdateSessionInput): Promise<number> {
    const existing = this.sessions.get(id);
    if (!existing) return 0;
    this.sessions.set(id, { ...existing, ...changes } as LearningSession);
    return 1;
  }

  async completeSession(id: string, feedback?: string): Promise<number> {
    const now = Date.now();
    return this.updateSession(id, {
      status: 'completed',
      endTime: now,
      feedback: feedback || null,
      updatedAt: now,
    });
  }

  async deleteSession(id: string): Promise<number> {
    return this.sessions.delete(id) ? 1 : 0;
  }

  async listSessions(options?: {
    status?: 'active' | 'completed';
    limit?: number;
  }): Promise<LearningSession[]> {
    let rows = [...this.sessions.values()];
    if (options?.status) rows = rows.filter(r => r.status === options.status);
    rows.sort((a, b) => b.createdAt - a.createdAt);
    if (options?.limit && options.limit > 0) rows = rows.slice(0, options.limit);
    return rows;
  }

  async createSessionChunk(input: CreateSessionChunkInput): Promise<SessionChunk> {
    const row: SessionChunk = {
      id: input.id,
      sessionId: input.sessionId,
      chunkId: input.chunkId,
      status: input.status || 'pending',
      attemptsJson: null,
      qualityScoresJson: null,
      timeSpentMs: 0,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    };
    this.sessionChunks.set(row.id, row);
    return row;
  }

  async getSessionChunks(sessionId: string): Promise<SessionChunk[]> {
    return [...this.sessionChunks.values()].filter(sc => sc.sessionId === sessionId);
  }

  async getSessionChunkById(id: string): Promise<SessionChunk | null> {
    return this.sessionChunks.get(id) || null;
  }

  async updateSessionChunk(id: string, changes: UpdateSessionChunkInput): Promise<number> {
    const existing = this.sessionChunks.get(id);
    if (!existing) return 0;
    this.sessionChunks.set(id, { ...existing, ...changes } as SessionChunk);
    return 1;
  }

  async deleteSessionChunk(id: string): Promise<number> {
    return this.sessionChunks.delete(id) ? 1 : 0;
  }

  async batchCreateSessionChunks(inputs: CreateSessionChunkInput[]): Promise<void> {
    for (const input of inputs) {
      await this.createSessionChunk(input);
    }
  }

  async getSessionWithChunks(
    sessionId: string
  ): Promise<{ session: LearningSession | null; chunks: SessionChunk[] }> {
    const session = await this.getSessionById(sessionId);
    const chunks = session ? await this.getSessionChunks(sessionId) : [];
    return { session, chunks };
  }

  async convertSessionToSessionInput(
    sessionId: string,
    options?: { includeHistoricalFeedback?: boolean; historicalFeedbackLimit?: number }
  ): Promise<SessionInput | null> {
    const session = await this.getSessionById(sessionId);
    if (!session) return null;

    const scRows = await this.getSessionChunks(sessionId);
    const chunks = scRows.map(sc => {
      let title = 'Unknown';
      if (this.chunkRepo) {
        const chunk = this.chunkRepo.getStore().get(sc.chunkId);
        if (chunk) title = chunk.title;
      }
      return {
        chunk_id: sc.chunkId,
        title,
        status: sc.status as 'pending' | 'in_progress' | 'completed',
        attempts: (sc.attemptsJson as ChunkAttempt[]) || [],
        quality_scores: (sc.qualityScoresJson as number[]) || [],
        time_spent_ms: sc.timeSpentMs,
      };
    });

    let historical_feedback: HistoricalFeedback[] = [];
    if (options?.includeHistoricalFeedback) {
      const chunkIds = scRows.map(sc => sc.chunkId);
      historical_feedback = await this.getHistoricalFeedbackForChunks(chunkIds, {
        limit: options.historicalFeedbackLimit,
        excludeSessionId: sessionId,
      });
    }

    return {
      session_id: session.id,
      mode: session.mode as SessionInput['mode'],
      start_time: new Date(session.startTime).toISOString(),
      chunks,
      historical_feedback,
    };
  }

  async getHistoricalFeedbackForChunks(
    chunkIds: string[],
    options?: { limit?: number; excludeSessionId?: string }
  ): Promise<HistoricalFeedback[]> {
    if (chunkIds.length === 0) return [];
    const completed = [...this.sessions.values()]
      .filter(s => s.status === 'completed')
      .sort((a, b) => b.createdAt - a.createdAt);

    const feedback: HistoricalFeedback[] = [];
    for (const session of completed) {
      if (options?.excludeSessionId && session.id === options.excludeSessionId) continue;
      const sessionChunkIds = (session.chunkIds as string[]) || [];
      const overlap = sessionChunkIds.filter(id => chunkIds.includes(id));
      if (overlap.length === 0) continue;
      if (session.feedback) {
        feedback.push({
          session_id: session.id,
          session_mode: session.mode as HistoricalFeedback['session_mode'],
          completed_at: new Date(session.endTime || session.updatedAt).toISOString(),
          feedback: session.feedback,
          chunk_ids: overlap,
        });
      }
      if (options?.limit && feedback.length >= options.limit) break;
    }
    return feedback;
  }

  async persistBatchSessionChunkOperations(args: {
    sessionId: string;
    operations: BatchOperation[];
    existingChunks: SessionChunk[];
  }): Promise<BatchSessionChunkResult> {
    const { sessionId, operations, existingChunks } = args;
    const existingMap = new Map(existingChunks.map(c => [c.chunkId, c]));
    let created = 0;
    let updated = 0;
    let unchanged = 0;
    const affectedChunkIds: string[] = [];
    const now = Date.now();

    for (const op of operations) {
      const existing = existingMap.get(op.chunkId);
      if (existing) {
        let hasChanges = false;
        const changes: Partial<SessionChunk> = { updatedAt: now };
        if (op.status && op.status !== existing.status) {
          changes.status = op.status;
          hasChanges = true;
        }
        if (op.attempts) {
          changes.attemptsJson = op.attempts;
          hasChanges = true;
        }
        if (op.qualityScores) {
          changes.qualityScoresJson = op.qualityScores;
          hasChanges = true;
        }
        if (op.timeSpentMs !== undefined) {
          changes.timeSpentMs = op.timeSpentMs;
          hasChanges = true;
        }
        if (hasChanges) {
          this.sessionChunks.set(existing.id, { ...existing, ...changes } as SessionChunk);
          updated++;
          affectedChunkIds.push(op.chunkId);
        } else {
          unchanged++;
        }
      } else {
        const sc: SessionChunk = {
          id: crypto.randomUUID(),
          sessionId,
          chunkId: op.chunkId,
          status: op.status || 'pending',
          attemptsJson: op.attempts || null,
          qualityScoresJson: op.qualityScores || null,
          timeSpentMs: op.timeSpentMs || 0,
          createdAt: now,
          updatedAt: now,
        };
        this.sessionChunks.set(sc.id, sc);
        created++;
        affectedChunkIds.push(op.chunkId);
      }
    }

    return { created, updated, unchanged, affectedChunkIds };
  }

  async validateChunkIds(chunkIds: string[]): Promise<ChunkValidationResult> {
    if (!chunkIds || chunkIds.length === 0) {
      return { valid: true, invalidIds: [], validIds: [] };
    }
    if (!this.chunkRepo) {
      return { valid: true, invalidIds: [], validIds: chunkIds };
    }
    const validIds: string[] = [];
    const invalidIds: string[] = [];
    for (const id of chunkIds) {
      if (this.chunkRepo.getStore().has(id)) validIds.push(id);
      else invalidIds.push(id);
    }
    return { valid: invalidIds.length === 0, invalidIds, validIds };
  }
}
