import type { DrillFormat } from '../../shared/prompts/prompt-pack.js';

export type LearningPromptArgs = {
  chunkNumber?: string;
  totalChunks?: string;
  chunkTitle?: string;
  chunkContent?: string;
  prerequisites?: string;
  drillFormat?: DrillFormat;
};

export type RetrievalPromptArgs = {
  chunkTitle?: string;
  drillFormat?: DrillFormat;
  masteryLevel?: string;
};

export type ReviewPromptArgs = {
  lastReviewed?: string;
  masteryLevel?: string;
  previousAttempts?: string;
  weakAreas?: string;
};

export type ChunkGenerationPromptArgs = {
  topicTitle: string;
  topicDescription?: string;
  existingChunkTitles?: string | string[];
};

export type LearningSessionPromptArgs = {
  sessionMode?: string;
  timeAvailable?: string;
  subject?: string;
};

export type ChunkManagementPromptArgs = {
  operation?: string;
  managedChunkTitle?: string;
  managedChunkOrder?: string;
  managedChunkContent?: string;
  managedChunkPrerequisites?: string;
  intent?: string;
};
