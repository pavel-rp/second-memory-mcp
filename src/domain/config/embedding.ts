// Configuration for embedding providers
// Domain layer: type definitions and schema constants only — no process.env reads

export type EmbeddingProvider = 'openai' | 'ollama';

/** The vector column dimension defined in the database schema/migration. */
export const SCHEMA_EMBEDDING_DIMENSIONS = 1536;

export type EmbeddingConfig = {
  provider: EmbeddingProvider | null;
  dimensions: number;
  model: string;
  openaiApiKey: string | null;
  ollamaBaseUrl: string;
};
