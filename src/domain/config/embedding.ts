// Configuration for embedding providers
// Environment-based config following the same pattern as algorithm.ts

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
