import { z } from 'zod';

// Recommendation mode types
export type RecommendationMode = 'guided' | 'explicit';

// Learning item chunk types
export type ChunkType = 'new' | 'review' | 'remediation';

// Subject preference types
export type SubjectPreference = 'CS' | 'Math' | 'SWE' | 'Language' | 'Any';

// Learning item from SQLite database
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
  learningItems?: LearningItem[]; // candidate items from SQLite database
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

export const LearningItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subject: z.string().min(1),
  difficulty: z.number().int().min(1).max(10),
  nextReviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be ISO date format YYYY-MM-DD'),
  easeFactor: z.number().min(1.3),
  repetitions: z.number().int().min(0),
  lastReviewed: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be ISO date format YYYY-MM-DD')
    .optional(),
  estimatedDuration: z.number().min(0),
  chunkType: ChunkTypeSchema,
  prerequisites: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  topicId: z.string().min(1).optional(),
  topicTitle: z.string().min(1).optional(),
});

export const LearningItemWithContentSchema = LearningItemSchema.extend({
  content: z.string().optional(),
  contentVersion: z.number().int().min(1).optional(),
  contentUpdatedAt: z.number().int().min(0).optional(),
});

export const PaginatedLearningItemsResponseSchema = z.object({
  items: z.array(LearningItemWithContentSchema),
  pagination: z.object({
    total: z.number().int().min(0),
    limit: z.number().int().min(1),
    offset: z.number().int().min(0),
    hasMore: z.boolean(),
  }),
});

export type PaginatedLearningItemsResponse = z.infer<typeof PaginatedLearningItemsResponseSchema>;

export const SessionConstraintsSchema = z.object({
  maxDuration: z.number().min(0).optional(),
  maxCognitiveLoad: z.number().min(0).optional(),
  maxNewItems: z.number().int().min(0).optional(),
  subjectFilter: z.string().optional(),
  excludeIds: z.array(z.string()).optional(),
});

export const LearningRecommendationSchema = z.object({
  item: LearningItemSchema,
  priority: z.number(),
  reason: z.string().min(1),
  order: z.number().int().min(1),
  cognitiveLoad: z.number().min(0),
});

export const SessionSummarySchema = z.object({
  totalItems: z.number().int().min(0),
  totalDuration: z.number().min(0),
  totalCognitiveLoad: z.number().min(0),
  newItems: z.number().int().min(0),
  reviewItems: z.number().int().min(0),
  remediationItems: z.number().int().min(0),
  subjects: z.array(z.string()),
});

export const ConversationGuidanceSchema = z.object({
  nextAction: z.string().min(1),
  clarifyingQuestions: z.array(z.string()).optional(),
  encouragement: z.string().optional(),
  progressUpdate: z.string().optional(),
});

export const LearningPatternsSchema = z.object({
  averageSessionDuration: z.number().min(0),
  preferredDifficulty: z.number().min(1).max(10),
  successRate: z.number().min(0).max(1),
  fatigueThreshold: z.number().min(0),
  subjectPreferences: z.record(z.number()),
  optimalSessionTime: z.string().optional(),
});

export const SessionHistorySchema = z.object({
  recentSessions: z.array(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be ISO date format YYYY-MM-DD'),
      duration: z.number().min(0),
      itemsCompleted: z.number().int().min(0),
      averageQuality: z.number().min(0).max(5),
      cognitiveLoad: z.number().min(0),
    })
  ),
  patterns: LearningPatternsSchema,
});

export const SessionContextSchema = z.object({
  currentSessionId: z.string().optional(),
  activeItems: z.array(z.string()).optional(),
  sessionStartTime: z.number().optional(),
  lastActivity: z.number().optional(),
  userPreferences: z.record(z.unknown()).optional(),
  currentRecommendations: z.array(LearningRecommendationSchema).optional(),
  currentItemIndex: z.number().optional(),
});

export const RecommendationInputShape = {
  mode: RecommendationModeSchema.optional(),
  timeAvailable: z.number().min(0).optional(),
  subjectPreference: SubjectPreferenceSchema.optional(),
  learningItems: z.array(LearningItemSchema).optional(),
  userHistory: SessionHistorySchema.optional(),
  sessionContext: SessionContextSchema.optional(),
  constraints: SessionConstraintsSchema.optional(),
  fetchFromDatabase: z.boolean().optional().default(false),
  subjectFilter: z.string().optional(),
  dueOnly: z.boolean().optional(),
  limit: z.number().int().min(1).optional(),
};

export const RecommendationInputSchema = z
  .object(RecommendationInputShape)
  .superRefine((val, ctx) => {
    if (val.fetchFromDatabase && (val.learningItems?.length ?? 0) > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Invalid input: provide either fetchFromDatabase: true or a non-empty learningItems array, not both.',
      });
    } else if (!val.fetchFromDatabase && !val.learningItems) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide learningItems when fetchFromDatabase is false.',
      });
    }
  });

export const RecommendationOutputSchema = z.object({
  recommendations: z.array(LearningRecommendationSchema),
  sessionSummary: SessionSummarySchema,
  conversationGuidance: ConversationGuidanceSchema.optional(),
  estimatedDuration: z.number().min(0),
  rationale: z.string().min(1),
  alternatives: z.array(LearningRecommendationSchema).optional(),
  nextActions: z.array(z.string()).optional(),
  dependencyResolution: z
    .object({
      addedPrerequisites: z.array(z.string()),
      resolvedOrder: z.array(z.string()),
    })
    .optional(),
});

export const ConversationRequestShape = {
  intent: z.string().min(1).describe('User intent driving the guided learning conversation'),
  context: z
    .record(z.unknown())
    .optional()
    .describe('Optional contextual metadata for the conversation'),
  userInput: z.string().optional().describe('Raw user utterance or request'),
  sessionState: z
    .record(z.unknown())
    .optional()
    .describe('Opaque session state blob from prior interactions'),
} as const;

export const ConversationRequestSchema = z.object(ConversationRequestShape);
export type ConversationRequestInput = z.infer<typeof ConversationRequestSchema>;

export const ConversationResponseSchema = z.object({
  message: z.string().min(1),
  recommendations: RecommendationOutputSchema.optional(),
  needsInput: z.boolean(),
  suggestedInputs: z.array(z.string()).optional(),
  sessionUpdated: z.boolean().optional(),
});
