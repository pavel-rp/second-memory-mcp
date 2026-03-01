// Configuration for embedding providers
// Environment-based config following the same pattern as algorithm.ts

export type EmbeddingProvider = 'openai' | 'ollama';

/** The vector column dimension defined in the database schema/migration. */
export const SCHEMA_EMBEDDING_DIMENSIONS = 1536;

/** Minimum cosine similarity threshold for vector search results. */
export const VECTOR_SIMILARITY_THRESHOLD = parseNumber(
  process.env.EMBEDDING_SIMILARITY_THRESHOLD,
  0.3
);

/** Weight given to keyword scores in hybrid search (0-1). */
export const HYBRID_KEYWORD_WEIGHT = parseNumber(process.env.EMBEDDING_HYBRID_KEYWORD_WEIGHT, 0.4);

/** Weight given to semantic scores in hybrid search (0-1). */
export const HYBRID_SEMANTIC_WEIGHT = parseNumber(
  process.env.EMBEDDING_HYBRID_SEMANTIC_WEIGHT,
  0.6
);

// Warn if hybrid weights don't sum to approximately 1.0
const weightSum = HYBRID_KEYWORD_WEIGHT + HYBRID_SEMANTIC_WEIGHT;
if (Math.abs(weightSum - 1.0) > 0.01) {
  // Lazy import to avoid circular deps — logger may not be initialized at module load.
  // Use console.warn as a safe fallback at config-load time.
  console.warn(
    `[embedding-config] Hybrid search weights sum to ${weightSum.toFixed(2)} (expected ~1.0). ` +
      `EMBEDDING_HYBRID_KEYWORD_WEIGHT=${HYBRID_KEYWORD_WEIGHT}, EMBEDDING_HYBRID_SEMANTIC_WEIGHT=${HYBRID_SEMANTIC_WEIGHT}. ` +
      `This may produce unexpected ranking behavior.`
  );
}

export type EmbeddingConfig = {
  provider: EmbeddingProvider | null;
  dimensions: number;
  model: string;
  openaiApiKey: string | null;
  ollamaBaseUrl: string;
};

const provider = parseProvider(process.env.EMBEDDING_PROVIDER);

export const embeddingConfig: EmbeddingConfig = {
  provider,
  dimensions: parseNumber(process.env.EMBEDDING_DIMENSIONS, SCHEMA_EMBEDDING_DIMENSIONS),
  model:
    process.env.EMBEDDING_MODEL ||
    (provider === 'ollama' ? 'nomic-embed-text' : 'text-embedding-3-small'),
  openaiApiKey: process.env.OPENAI_API_KEY || null,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
};

function parseProvider(value: string | undefined): EmbeddingProvider | null {
  if (value === 'openai' || value === 'ollama') return value;
  return null;
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (value == null || value.trim() === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
