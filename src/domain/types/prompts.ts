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
