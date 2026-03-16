// ── Learning Topics ──────────────────────────────────────────────

export type LearningTopic = {
  id: string;
  title: string;
  subject: string;
  summary: string | null;
  summaryVersion: number | null;
  summaryUpdatedAt: number | null;
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
  timeSpentMs: number;
  createdAt: number;
  updatedAt: number;
};

// ── Session Questions ─────────────────────────────────────────

export type SessionQuestionStatus = 'pending' | 'answered' | 'skipped';

export type SessionQuestion = {
  id: string;
  sessionChunkId: string;
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
  timeSpentMs: number;
  createdAt: number;
};
