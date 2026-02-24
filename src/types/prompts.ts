export type LearningPromptArgs = {
  chunkNumber?: string;
  totalChunks?: string;
  chunkTitle?: string;
  chunkContent?: string;
  prerequisites?: string;
  drillFormat?: string;
};

export type RetrievalPromptArgs = {
  chunkTitle?: string;
  drillFormat?: string;
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

export type ChunkManagementPromptArgs = {
  operation?: string;
  managedChunkTitle?: string;
  managedChunkOrder?: string;
  managedChunkContent?: string;
  managedChunkPrerequisites?: string;
  intent?: string;
};
