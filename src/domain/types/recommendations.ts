import { z } from 'zod';
import { toCamelCaseKeys } from '../../shared/case-convert.js';

// Recommendation mode types
export type RecommendationMode = 'guided' | 'explicit';

// Learning item chunk types
export type ChunkType = 'new' | 'review' | 'remediation';

// Subject preference types
export type SubjectPreference = 'CS' | 'Math' | 'SWE' | 'Language' | 'Any';

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
  cognitiveLoad: number; // estimated mental effort
};

// Session summary information
export type SessionSummary = {
  totalItems: number;
  totalDuration: number; // minutes
  totalCognitiveLoad: number;
  newItems: number;
  reviewItems: number;
  remediationItems: number;
  subjects: string[]; // unique subjects in session
};

// Conversation guidance for guided mode
export type ConversationGuidance = {
  nextAction: string; // what user should do next
  clarifyingQuestions?: string[]; // questions to ask if needed
  encouragement?: string; // motivational message
  progressUpdate?: string; // where they are in learning journey
};

// Historical learning patterns for personalization
export type LearningPatterns = {
  averageSessionDuration: number; // minutes
  preferredDifficulty: number; // 1-10 average
  successRate: number; // 0-1
  fatigueThreshold: number; // cognitive load before fatigue
  subjectPreferences: Record<string, number>; // subject -> preference score
  optimalSessionTime?: string; // preferred time of day
};

// Session history for personalization
export type SessionHistory = {
  recentSessions: Array<{
    date: string; // ISO date
    duration: number; // minutes
    itemsCompleted: number;
    averageQuality: number; // 0-5
    cognitiveLoad: number;
  }>;
  patterns: LearningPatterns;
};

// Session context interface for better type safety
export interface SessionContext {
  currentSessionId?: string;
  activeItems?: string[];
  sessionStartTime?: number;
  lastActivity?: number;
  userPreferences?: Record<string, unknown>;
  currentRecommendations?: LearningRecommendation[];
  currentItemIndex?: number;
}

// Main recommendation input
export type RecommendationInput = {
  mode?: RecommendationMode; // "guided" for zero-friction, "explicit" for specified params
  timeAvailable?: number; // minutes
  subjectPreference?: SubjectPreference; // general subject preference (e.g., "Any" or specific SubjectPreference). Used for non-fetch modes or as a fallback.
  learningItems?: LearningItem[]; // candidate items from database
  userHistory?: SessionHistory; // recent learning patterns
  sessionContext?: SessionContext; // current session state if continuing
  constraints?: SessionConstraints; // additional filtering/limits (may include subjectFilter for broader subject-based rules)
  fetchFromDatabase?: boolean; // self-fetch mode: automatically fetch items from database (default: false)
  subjectFilter?: string; // subject filter applied when fetchFromDatabase is true. Overrides general preferences for precise database querying.
  dueOnly?: boolean; // filter to only due items when fetchFromDatabase is true
  limit?: number; // limit number of items fetched when fetchFromDatabase is true
};

// Main recommendation output
export type RecommendationOutput = {
  recommendations: LearningRecommendation[];
  sessionSummary: SessionSummary;
  conversationGuidance?: ConversationGuidance; // for guided mode
  estimatedDuration: number; // minutes
  rationale: string; // why these items were chosen
  alternatives?: LearningRecommendation[]; // backup options
  nextActions?: string[]; // suggested follow-up actions
  orchestrationHint?: string; // guidance for multi-server workflows when data is empty
  dependencyResolution?: {
    // info about automatically included prerequisites
    addedPrerequisites: string[]; // IDs of prerequisites that were automatically included
    resolvedOrder: string[]; // full topological order of all items
  };
};

// Conversation request for guided mode
export type ConversationRequest = {
  intent: string; // "start_learning", "continue_session", "get_recommendations"
  context?: Record<string, unknown>; // conversation context
  userInput?: string; // user's message/request
  sessionState?: SessionContext; // current learning session state
};

// Conversation response for guided mode
export type ConversationResponse = {
  message: string; // response to user
  recommendations?: RecommendationOutput; // if recommendations are ready
  needsInput: boolean; // whether more user input is required
  suggestedInputs?: string[]; // example responses user could give
  sessionUpdated?: boolean; // whether session state was modified
};

// Zod schemas for runtime validation

export const RecommendationModeSchema = z.enum(['guided', 'explicit']);

export const ChunkTypeSchema = z.enum(['new', 'review', 'remediation']);

export const SubjectPreferenceSchema = z.enum(['CS', 'Math', 'SWE', 'Language', 'Any']);

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

export const SessionConstraintsSchema = z
  .object({
    max_duration: z.number().min(0).optional(),
    max_cognitive_load: z.number().min(0).optional(),
    max_new_items: z.number().int().min(0).optional(),
    subject_filter: z.string().optional(),
    exclude_ids: z.array(z.string()).optional(),
  })
  .transform(toCamelCaseKeys);

export const LearningRecommendationSchema = z
  .object({
    item: LearningItemSchema,
    priority: z.number(),
    reason: z.string().min(1),
    order: z.number().int().min(1),
    cognitive_load: z.number().min(0),
  })
  .transform(toCamelCaseKeys);

export const SessionSummarySchema = z.object({
  total_items: z.number().int().min(0),
  total_duration: z.number().min(0),
  total_cognitive_load: z.number().min(0),
  new_items: z.number().int().min(0),
  review_items: z.number().int().min(0),
  remediation_items: z.number().int().min(0),
  subjects: z.array(z.string()),
});

export const ConversationGuidanceSchema = z.object({
  next_action: z.string().min(1),
  clarifying_questions: z.array(z.string()).optional(),
  encouragement: z.string().optional(),
  progress_update: z.string().optional(),
});

export const LearningPatternsSchema = z
  .object({
    average_session_duration: z.number().min(0),
    preferred_difficulty: z.number().min(1).max(10),
    success_rate: z.number().min(0).max(1),
    fatigue_threshold: z.number().min(0),
    subject_preferences: z.record(z.number()),
    optimal_session_time: z.string().optional(),
  })
  .transform(toCamelCaseKeys);

export const SessionHistorySchema = z
  .object({
    recent_sessions: z.array(
      z
        .object({
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be ISO date format YYYY-MM-DD'),
          duration: z.number().min(0),
          items_completed: z.number().int().min(0),
          average_quality: z.number().min(0).max(5),
          cognitive_load: z.number().min(0),
        })
        .transform(toCamelCaseKeys)
    ),
    patterns: LearningPatternsSchema,
  })
  .transform(toCamelCaseKeys);

export const SessionContextSchema = z
  .object({
    current_session_id: z.string().optional(),
    active_items: z.array(z.string()).optional(),
    session_start_time: z.number().optional(),
    last_activity: z.number().optional(),
    user_preferences: z.record(z.unknown()).optional(),
    current_recommendations: z.array(LearningRecommendationSchema).optional(),
    current_item_index: z.number().optional(),
  })
  .transform(toCamelCaseKeys);

export const RecommendationInputShape = {
  mode: RecommendationModeSchema.optional(),
  time_available: z.number().min(0).optional(),
  subject_preference: SubjectPreferenceSchema.optional(),
  learning_items: z.array(LearningItemSchema).optional(),
  user_history: SessionHistorySchema.optional(),
  session_context: SessionContextSchema.optional(),
  constraints: SessionConstraintsSchema.optional(),
  fetch_from_database: z.boolean().optional().default(false),
  subject_filter: z.string().optional(),
  due_only: z.boolean().optional(),
  limit: z.number().int().min(1).optional(),
};

export const RecommendationInputSchema = z
  .object(RecommendationInputShape)
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

export const ConversationRequestShape = {
  intent: z.string().min(1).describe('User intent driving the guided learning conversation'),
  context: z
    .record(z.unknown())
    .optional()
    .describe('Optional contextual metadata for the conversation'),
  user_input: z.string().optional().describe('Raw user utterance or request'),
  session_state: z
    .record(z.unknown())
    .optional()
    .describe('Opaque session state blob from prior interactions'),
} as const;

export const ConversationRequestSchema = z
  .object(ConversationRequestShape)
  .transform(toCamelCaseKeys);
