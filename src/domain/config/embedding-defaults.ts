// Hardcoded default values for embedding configuration
// No I/O, no process.env reads

import { type EmbeddingConfig, SCHEMA_EMBEDDING_DIMENSIONS } from './embedding.js';

export const DEFAULT_EMBEDDING_CONFIG: EmbeddingConfig = {
  provider: null,
  dimensions: SCHEMA_EMBEDDING_DIMENSIONS,
  model: 'text-embedding-3-small',
  openaiApiKey: null,
  ollamaBaseUrl: 'http://localhost:11434',
  maxRetries: 3,
  maxConcurrency: 10,
  timeout: 30_000,
};

/** Minimum cosine similarity threshold for vector search results. */
export const DEFAULT_VECTOR_SIMILARITY_THRESHOLD = 0.3;

/** Weight given to keyword scores in hybrid search (0-1). */
export const DEFAULT_HYBRID_KEYWORD_WEIGHT = 0.4;

/** Weight given to semantic scores in hybrid search (0-1). */
export const DEFAULT_HYBRID_SEMANTIC_WEIGHT = 0.6;
