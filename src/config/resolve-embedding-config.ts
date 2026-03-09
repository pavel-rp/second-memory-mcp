// Composition root layer: reads process.env and merges with domain defaults
// This is the only place embedding config touches environment variables

import type { EmbeddingConfig } from '../domain/config/embedding.js';
import { SCHEMA_EMBEDDING_DIMENSIONS } from '../domain/config/embedding.js';
import {
  DEFAULT_EMBEDDING_CONFIG,
  DEFAULT_VECTOR_SIMILARITY_THRESHOLD,
  DEFAULT_HYBRID_KEYWORD_WEIGHT,
  DEFAULT_HYBRID_SEMANTIC_WEIGHT,
} from '../domain/config/embedding-defaults.js';
import { parseNumber, parseEmbeddingProvider } from '../shared/env-parsing.js';
import { logger } from '../shared/logger.js';

export type ResolvedEmbeddingConfig = {
  embedding: EmbeddingConfig;
  vectorSimilarityThreshold: number;
  hybridKeywordWeight: number;
  hybridSemanticWeight: number;
};

export function resolveEmbeddingConfig(
  env: Record<string, string | undefined> = process.env
): ResolvedEmbeddingConfig {
  const provider = parseEmbeddingProvider(env.EMBEDDING_PROVIDER);

  const embedding: EmbeddingConfig = {
    provider,
    dimensions: parseNumber(env.EMBEDDING_DIMENSIONS, SCHEMA_EMBEDDING_DIMENSIONS),
    model:
      env.EMBEDDING_MODEL ||
      (provider === 'ollama' ? 'nomic-embed-text' : DEFAULT_EMBEDDING_CONFIG.model),
    openaiApiKey: env.OPENAI_API_KEY || null,
    ollamaBaseUrl: env.OLLAMA_BASE_URL || DEFAULT_EMBEDDING_CONFIG.ollamaBaseUrl,
    maxRetries: parseNumber(env.EMBEDDING_MAX_RETRIES, DEFAULT_EMBEDDING_CONFIG.maxRetries),
    maxConcurrency: parseNumber(
      env.EMBEDDING_MAX_CONCURRENCY,
      DEFAULT_EMBEDDING_CONFIG.maxConcurrency
    ),
    timeout: parseNumber(env.EMBEDDING_TIMEOUT_MS, DEFAULT_EMBEDDING_CONFIG.timeout),
  };

  const hybridKeywordWeight = parseNumber(
    env.EMBEDDING_HYBRID_KEYWORD_WEIGHT,
    DEFAULT_HYBRID_KEYWORD_WEIGHT
  );
  const hybridSemanticWeight = parseNumber(
    env.EMBEDDING_HYBRID_SEMANTIC_WEIGHT,
    DEFAULT_HYBRID_SEMANTIC_WEIGHT
  );

  // Warn if hybrid weights don't sum to approximately 1.0
  const weightSum = hybridKeywordWeight + hybridSemanticWeight;
  if (Math.abs(weightSum - 1.0) > 0.01) {
    logger.warn(
      `Hybrid search weights sum to ${weightSum.toFixed(2)} (expected ~1.0). ` +
        `EMBEDDING_HYBRID_KEYWORD_WEIGHT=${hybridKeywordWeight}, EMBEDDING_HYBRID_SEMANTIC_WEIGHT=${hybridSemanticWeight}. ` +
        `This may produce unexpected ranking behavior.`
    );
  }

  return {
    embedding,
    vectorSimilarityThreshold: parseNumber(
      env.EMBEDDING_SIMILARITY_THRESHOLD,
      DEFAULT_VECTOR_SIMILARITY_THRESHOLD
    ),
    hybridKeywordWeight,
    hybridSemanticWeight,
  };
}
