import { z } from "zod";

export const GetChunkContentInputShape = {
  chunkId: z
    .string()
    .min(1, "Chunk ID cannot be empty")
    .describe("ID of the chunk to retrieve content for"),
} as const;

export const GetChunkContentInputSchema = z.object(GetChunkContentInputShape);
export type GetChunkContentInput = z.infer<typeof GetChunkContentInputSchema>;

export const GetTopicSummaryInputShape = {
  topicId: z
    .string()
    .min(1, "Topic ID cannot be empty")
    .describe("ID of the topic to retrieve summary for"),
} as const;

export const GetTopicSummaryInputSchema = z.object(GetTopicSummaryInputShape);
export type GetTopicSummaryInput = z.infer<typeof GetTopicSummaryInputSchema>;

export const ListItemsWithContentInputShape = {
  subjectFilter: z
    .string()
    .optional()
    .describe("Filter by subject/category"),
  dueOnly: z
    .boolean()
    .optional()
    .describe("Only return items due for review"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Maximum number of items to return (1-100)"),
  offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(0)
    .describe("Number of items to skip for pagination"),
  includeContent: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Whether to include content fields (content, contentVersion, contentUpdatedAt) in the response",
    ),
} as const;

export const ListItemsWithContentInputSchema = z.object(
  ListItemsWithContentInputShape,
);
export type ListItemsWithContentInput = z.infer<
  typeof ListItemsWithContentInputSchema
>;
