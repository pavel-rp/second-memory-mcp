import { z } from 'zod';

export const SearchLearningContentInputShape = {
  query: z
    .string()
    .trim()
    .min(2, 'Search query must be at least 2 characters')
    .max(120, 'Search query must be at most 120 characters')
    .describe('Keywords to search for across learning topics and chunk titles'),
  subject: z
    .string()
    .trim()
    .min(1, 'Subject cannot be empty')
    .max(32, 'Subject must be at most 32 characters')
    .optional()
    .describe('Optional subject filter to narrow the search scope'),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .optional()
    .describe('Maximum number of results to return (1-50)'),
  mode: z
    .enum(['keyword', 'semantic', 'hybrid'])
    .optional()
    .describe(
      'Search mode: "keyword" (default) — title/content text matching; "semantic" — cosine similarity on embeddings; "hybrid" — weighted combination of both'
    ),
} as const;

export const SearchLearningContentInputSchema = z.object(SearchLearningContentInputShape);
export type SearchLearningContentInput = z.infer<typeof SearchLearningContentInputSchema>;

export type SearchResultType = 'topic' | 'chunk';

export type SearchResultItem = {
  resultType: SearchResultType;
  id: string;
  title: string;
  subject: string;
  matchScore: number;
  similarityScore?: number;
  highlightTerms: string[];
  createdAt: string;
  updatedAt: string;
  topicId?: string;
  topicTitle?: string;
};

export type SearchResultSet = {
  query: string;
  normalizedQuery: string;
  tokens: string[];
  limit: number;
  filters: {
    subject?: string;
  };
  counts: {
    topics: number;
    chunks: number;
    total: number;
  };
  results: SearchResultItem[];
};
