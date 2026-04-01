import { z } from 'zod';
import { toCamelCaseKeys } from '../../shared/case-convert.js';

// Learning item chunk types
export type ChunkType = 'new' | 'review' | 'remediation';

// Content readiness status
export type ContentStatus = 'draft' | 'final';

// Learning item from database
export type LearningItem = {
  id: string;
  title: string;
  subject: string;
  difficulty: number; // 1-10
  nextReviewDate: string; // ISO 8601 timestamp
  easeFactor: number;
  repetitions: number;
  lastReviewed?: string; // ISO 8601 timestamp
  estimatedDuration: number; // minutes
  chunkType: ChunkType;
  prerequisites?: string[];
  tags?: string[];
  topicId?: string; // UUID of parent topic
  topicTitle?: string; // Human-readable topic title
  contentStatus?: ContentStatus;
};

// Learning item with optional content fields
export type LearningItemWithContent = LearningItem & {
  content?: string;
  contentVersion?: number;
  contentUpdatedAt?: string;
};

// Recommendation type classification
export type RecommendationType = 'continue_learning' | 'overdue_review' | 'new_material';

// Topic-level recommendation
export type TopicRecommendation = {
  topicId: string;
  topicTitle: string;
  urgencyScore: number; // 0.0–1.0
  urgencyReason: string; // human-readable dominant factor
  recommendationType: RecommendationType; // classification for agent presentation
  dueChunkIds: string[]; // ordered by createdAt within topic
  dueChunkCount: number;
  totalChunkCount: number;
  estimatedDuration: number; // sum of chunk durations (minutes)
  hasNewChunks: boolean; // true if any chunk has never been reviewed
};

// Topic-level recommendation output
export type TopicRecommendationOutput = {
  recommendations: TopicRecommendation[];
  totalDueTopics: number;
  totalDueChunks: number;
};

// Main recommendation input (stripped to minimal)
export type RecommendationInput = {
  subjectFilter?: string;
  limit?: number; // max topics returned, default 10
  recommendationType?: RecommendationType; // filter results to a specific category
};

// Zod schemas for runtime validation

const ChunkTypeSchema = z.enum(['new', 'review', 'remediation']);

const ContentStatusSchema = z.enum(['draft', 'final']);

const LearningItemObjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subject: z.string().min(1),
  difficulty: z.number().int().min(1).max(10),
  next_review_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/, 'Must be ISO 8601 timestamp'),
  ease_factor: z.number().min(1.3),
  repetitions: z.number().int().min(0),
  last_reviewed: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/, 'Must be ISO 8601 timestamp')
    .optional(),
  estimated_duration: z.number().min(0),
  chunk_type: ChunkTypeSchema,
  prerequisites: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  topic_id: z.string().min(1).optional(),
  topic_title: z.string().min(1).optional(),
  content_status: ContentStatusSchema.optional(),
});

export const LearningItemSchema = LearningItemObjectSchema.transform(toCamelCaseKeys);

export type PaginatedLearningItemsResponse = {
  items: LearningItemWithContent[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
};

export const RecommendationInputShape = {
  subject_filter: z.string().optional().describe('Filter topics by subject'),
  limit: z.number().int().min(1).max(100).optional().describe('Max topics returned (default 10)'),
  recommendation_type: z
    .enum(['continue_learning', 'overdue_review', 'new_material'])
    .optional()
    .describe(
      'Filter to a specific recommendation category: continue_learning (recent session + new chunks), overdue_review (past SRS date), new_material (unstudied, no recent activity)'
    ),
};

export const RecommendationInputSchema = z
  .object(RecommendationInputShape)
  .transform(toCamelCaseKeys);
