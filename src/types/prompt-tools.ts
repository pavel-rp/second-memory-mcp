import { z } from "zod";

export const DrillFormatSchema = z
  .enum(["multiple_choice", "open_ended", "coding_problem", "explanation", "application"])
  .describe("Desired drill or assessment format");

export type DrillFormat = z.infer<typeof DrillFormatSchema>;

export const ScaffoldingPromptInputShape = {
  problem: z.string().describe("Learning problem statement to scaffold"),
} as const;

export const ScaffoldingPromptInputSchema = z.object(ScaffoldingPromptInputShape);
export type ScaffoldingPromptInput = z.infer<typeof ScaffoldingPromptInputSchema>;

export const LearningPromptInputShape = {
  chunkNumber: z
    .number()
    .int()
    .optional()
    .describe("Optional chunk index within the session"),
  totalChunks: z
    .number()
    .int()
    .optional()
    .describe("Optional total number of chunks in the plan"),
  chunkTitle: z.string().optional().describe("Title of the learning chunk"),
  chunkContent: z
    .string()
    .optional()
    .describe("Content summary for the learning chunk"),
  prerequisites: z
    .string()
    .optional()
    .describe("Prerequisite knowledge or chunk identifiers"),
  drillFormat: DrillFormatSchema.optional(),
} as const;

export const LearningPromptInputSchema = z.object(LearningPromptInputShape);
export type LearningPromptInput = z.infer<typeof LearningPromptInputSchema>;

export const RetrievalPromptInputShape = {
  chunkTitle: z.string().optional().describe("Title of the chunk to retrieve"),
  drillFormat: DrillFormatSchema.optional(),
  masteryLevel: z
    .number()
    .int()
    .optional()
    .describe("Current mastery level estimate"),
} as const;

export const RetrievalPromptInputSchema = z.object(RetrievalPromptInputShape);
export type RetrievalPromptInput = z.infer<typeof RetrievalPromptInputSchema>;

export const ReviewPromptInputShape = {
  lastReviewed: z
    .string()
    .optional()
    .describe("Timestamp of the last review attempt"),
  masteryLevel: z
    .number()
    .int()
    .optional()
    .describe("Current mastery level estimate"),
  previousAttempts: z
    .number()
    .int()
    .optional()
    .describe("Number of previous attempts"),
  weakAreas: z
    .string()
    .optional()
    .describe("Summary of weak areas to address"),
} as const;

export const ReviewPromptInputSchema = z.object(ReviewPromptInputShape);
export type ReviewPromptInput = z.infer<typeof ReviewPromptInputSchema>;

export const ChunkGenerationInputShape = {
  topicTitle: z.string().describe("Topic title"),
  topicDescription: z
    .string()
    .optional()
    .describe("Optional description of the topic"),
  existingChunkTitles: z
    .array(z.string())
    .optional()
    .describe("Existing chunk titles to reference"),
  workflowContext: z
    .enum(["guided", "explicit"])
    .optional()
    .describe("Workflow context for downstream orchestration"),
} as const;

export const ChunkGenerationInputSchema = z.object(ChunkGenerationInputShape);
export type ChunkGenerationToolArgs = z.infer<typeof ChunkGenerationInputSchema>;

export const ChunkManagementInputShape = {
  operation: z
    .enum(["update", "merge", "split", "retire"])
    .optional()
    .describe("Management operation to perform"),
  managedChunk: z
    .object({
      title: z.string().describe("Title of the chunk being managed"),
      order: z.number().int().optional().describe("Optional order for the chunk"),
      content: z
        .string()
        .optional()
        .describe("Updated content or notes for the chunk"),
      prerequisites: z
        .string()
        .optional()
        .describe("Prerequisite relationships to highlight"),
    })
    .optional()
    .describe("Details about the chunk being managed"),
  intent: z
    .string()
    .optional()
    .describe("High-level intent for the management request"),
} as const;

export const ChunkManagementInputSchema = z.object(ChunkManagementInputShape);
export type ChunkManagementToolArgs = z.infer<typeof ChunkManagementInputSchema>;
