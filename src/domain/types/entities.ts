import type { ContentStatus } from './recommendations.js';
import type { QuestionType, ReviseGradeReason } from './teaching.js';
import type { ValidatorReport } from './validator-report.js';

export type KnowledgeType = 'fact' | 'concept' | 'procedure' | 'principle';
export type DependencyGraphType = 'linear_chain' | 'convergent' | 'divergent' | 'single_root';

// ── Learning Topics ──────────────────────────────────────────────

export type LearningTopic = {
  id: string;
  title: string;
  subject: string;
  summary: string | null;
  summaryVersion: number | null;
  summaryUpdatedAt: number | null;
  dependencyGraphType: DependencyGraphType | null;
  // summaryEmbedding is omitted: it is an infrastructure concern
  // managed exclusively by adapters (symmetric with contentEmbedding on chunks).
  createdAt: number;
  updatedAt: number;
};

export type NewLearningTopic = {
  id: string;
  title: string;
  subject: string;
  summary?: string | null;
  summaryVersion?: number | null;
  summaryUpdatedAt?: number | null;
  dependencyGraphType?: DependencyGraphType | null;
  createdAt: number;
  updatedAt: number;
};

// ── Learning Chunks ──────────────────────────────────────────────
// contentEmbedding is omitted: it is an infrastructure concern
// managed exclusively by adapters.

export type LearningChunk = {
  id: string;
  topicId: string;
  title: string;
  subject: string;
  difficulty: number;
  nextReviewAt: number;
  easeFactor: number;
  repetitions: number;
  lastReviewedAt: number | null;
  estimatedDuration: number;
  intervalDays: number | null;
  chunkType: string;
  prerequisitesJson: string[] | null;
  tagsJson: string[] | null;
  content: string | null;
  contentVersion: number | null;
  contentUpdatedAt: number | null;
  contentStatus: ContentStatus;
  condensedSummary: string | null;
  knowledgeType: KnowledgeType | null;
  /**
   * Optional because most SELECT projections omit this JSONB column for
   * payload size reasons. `getById` reads it. Persisted inline by the create
   * path and via the `writeValidatorReport` / `mergeValidatorReport` adapter
   * methods (NEU-629).
   */
  validatorReport?: ValidatorReport | null;
  createdAt: number;
  updatedAt: number;
};

export type NewLearningChunk = {
  id: string;
  topicId: string;
  title: string;
  subject: string;
  difficulty: number;
  nextReviewAt: number;
  easeFactor: number;
  repetitions: number;
  lastReviewedAt?: number | null;
  estimatedDuration: number;
  intervalDays?: number | null;
  chunkType: string;
  prerequisitesJson?: string[] | null;
  tagsJson?: string[] | null;
  content?: string | null;
  contentVersion?: number | null;
  contentUpdatedAt?: number | null;
  contentStatus?: ContentStatus;
  condensedSummary?: string | null;
  knowledgeType?: KnowledgeType | null;
  validatorReport?: ValidatorReport | null;
  createdAt: number;
  updatedAt: number;
};

// ── Learning Sessions ────────────────────────────────────────────

export type LearningSession = {
  id: string;
  topicId: string | null;
  chunkIds: string[] | null;
  mode: string;
  estimatedDuration: number | null;
  status: string;
  startTime: number;
  endTime: number | null;
  feedback: string | null;
  createdAt: number;
  updatedAt: number;
};

// ── Session Chunks ───────────────────────────────────────────────

export type SessionChunk = {
  id: string;
  sessionId: string;
  chunkId: string;
  status: string;
  teachingApproach: string | null;
  timeSpentMs: number;
  createdAt: number;
  updatedAt: number;
};

// ── Session Questions ─────────────────────────────────────────

export type SessionQuestionStatus = 'pending' | 'answered' | 'skipped';

export type SessionQuestion = {
  id: string;
  sessionId: string;
  questionIndex: number;
  promptText: string;
  status: SessionQuestionStatus;
  createdAt: number;
  updatedAt: number;
};

export type SessionQuestionAttempt = {
  id: string;
  sessionQuestionId: string;
  attemptNumber: 1 | 2;
  response: string;
  passed: boolean;
  feedback: string;
  quality: number | null;
  agentQuality: number | null;
  questionType: QuestionType | null;
  timeSpentMs: number;
  createdAt: number;
};

export type SessionQuestionAttemptRevisionReason = ReviseGradeReason;

export type SessionQuestionAttemptRevision = {
  id: string;
  attemptId: string;
  originalQuality: number | null;
  originalAgentQuality: number | null;
  originalPassed: boolean;
  originalFeedback: string;
  newQuality: number | null;
  newAgentQuality: number | null;
  newPassed: boolean;
  newFeedback: string;
  reason: SessionQuestionAttemptRevisionReason;
  revisedAt: number;
};
