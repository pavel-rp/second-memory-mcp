import { z } from 'zod';
import { toCamelCaseKeys } from '../../shared/case-convert.js';

/** Default limit for fetching recommendation candidates from the DB. */
export const DEFAULT_RECOMMENDATION_CANDIDATE_LIMIT = 50;

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
  nextReviewDate: string; // ISO date
  easeFactor: number;
  repetitions: number;
  lastReviewed?: string; // ISO date
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
  contentUpdatedAt?: number;
};

// Session constraints for composition
export type SessionConstraints = {
  maxDuration?: number; // minutes
  maxCognitiveLoad?: number; // cognitive load score
  maxNewItems?: number; // limit new content
  subjectFilter?: string;
  excludeIds?: string[];
};

// Learning recommendation with priority and reasoning
export type LearningRecommendation = {
  item: LearningItem;
  priority: number;
  reason: string; // "overdue", "optimal timing", "new content", etc.
  order: number; // sequence in session
};

// Session summary information
export type SessionSummary = {
  totalItems: number;
  totalDuration: number; // minutes
  newItems: number;
  reviewItems: number;
  remediationItems: number;
  subjects: string[]; // unique subjects in session
};

// Main recommendation input
export type RecommendationInput = {
  timeAvailable?: number; // minutes
  learningItems?: LearningItem[]; // candidate items from database
  constraints?: SessionConstraints; // additional filtering/limits (may include subjectFilter for broader subject-based rules)
  fetchFromDatabase?: boolean; // self-fetch mode: automatically fetch items from database (default: false)
  subjectFilter?: string; // subject filter applied when fetchFromDatabase is true
  dueOnly?: boolean; // filter to only due items when fetchFromDatabase is true
  limit?: number; // limit number of items fetched when fetchFromDatabase is true
  includeLeeches?: boolean; // when true, include leech items (chunkType='remediation') in results; default false excludes them
};

// Main recommendation output
export type RecommendationOutput = {
  recommendations: LearningRecommendation[];
  sessionSummary: SessionSummary;
  estimatedDuration: number; // minutes
  rationale: string; // why these items were chosen
  orchestrationHint?: string; // guidance for multi-server workflows when data is empty
  dependencyResolution?: {
    // info about automatically included prerequisites
    addedPrerequisites: string[]; // IDs of prerequisites that were automatically included
    resolvedOrder: string[]; // full topological order of all items
  };
};

// Zod schemas for runtime validation

export const ChunkTypeSchema = z.enum(['new', 'review', 'remediation']);

export const ContentStatusSchema = z.enum(['draft', 'final']);

const LearningItemObjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subject: z.string().min(1),
  difficulty: z.number().int().min(1).max(10),
  next_review_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be ISO date format YYYY-MM-DD'),
  ease_factor: z.number().min(1.3),
  repetitions: z.number().int().min(0),
  last_reviewed: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be ISO date format YYYY-MM-DD')
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

export const LearningItemWithContentSchema = LearningItemObjectSchema.extend({
  content: z.string().optional(),
  content_version: z.number().int().min(1).optional(),
  content_updated_at: z.number().int().min(0).optional(),
}).transform(toCamelCaseKeys);

export type PaginatedLearningItemsResponse = {
  items: LearningItemWithContent[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
};

const SessionConstraintsShape = {
  max_duration: z.number().min(0).optional(),
  max_cognitive_load: z.number().min(0).optional(),
  max_new_items: z.number().int().min(0).optional(),
  subject_filter: z.string().optional(),
  exclude_ids: z.array(z.string()).optional(),
} as const;

export const SessionConstraintsSchema = z
  .object(SessionConstraintsShape)
  .transform(toCamelCaseKeys);

export const LearningRecommendationSchema = z
  .object({
    item: LearningItemSchema,
    priority: z.number(),
    reason: z.string().min(1),
    order: z.number().int().min(1),
  })
  .transform(toCamelCaseKeys);

export const SessionSummarySchema = z.object({
  total_items: z.number().int().min(0),
  total_duration: z.number().min(0),
  new_items: z.number().int().min(0),
  review_items: z.number().int().min(0),
  remediation_items: z.number().int().min(0),
  subjects: z.array(z.string()),
});

export const RecommendationInputShape = {
  time_available: z.number().min(0).optional(),
  learning_items: z
    .array(LearningItemObjectSchema)
    .optional()
    .describe(
      'Legacy path: pass pre-fetched items directly. Prefer fetch_from_database: true instead.'
    ),
  constraints: z.object(SessionConstraintsShape).optional(),
  fetch_from_database: z.boolean().optional().default(false),
  subject_filter: z.string().optional(),
  due_only: z.boolean().optional(),
  limit: z.number().int().min(1).optional(),
  include_leeches: z
    .boolean()
    .optional()
    .describe('Include leech items (chunkType=remediation) in results; default excludes them'),
};

export const RecommendationInputSchema = z
  .object({
    ...RecommendationInputShape,
    learning_items: z
      .array(LearningItemSchema)
      .optional()
      .describe(
        'Legacy path: pass pre-fetched items directly. Prefer fetch_from_database: true instead.'
      ),
    constraints: SessionConstraintsSchema.optional(),
  })
  .superRefine((val, ctx) => {
    if (val.fetch_from_database && (val.learning_items?.length ?? 0) > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Invalid input: provide either fetch_from_database: true or a non-empty learning_items array, not both.',
      });
    } else if (!val.fetch_from_database && !val.learning_items) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide learning_items when fetch_from_database is false.',
      });
    }
  })
  .transform(toCamelCaseKeys);
