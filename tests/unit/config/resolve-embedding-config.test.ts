import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SCHEMA_EMBEDDING_DIMENSIONS } from '../../../src/domain/config/embedding.js';
import {
  DEFAULT_EMBEDDING_CONFIG,
  DEFAULT_VECTOR_SIMILARITY_THRESHOLD,
  DEFAULT_HYBRID_KEYWORD_WEIGHT,
  DEFAULT_HYBRID_SEMANTIC_WEIGHT,
} from '../../../src/domain/config/embedding-defaults.js';

vi.mock('../../../src/shared/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

const { resolveEmbeddingConfig } = await import('../../../src/config/resolve-embedding-config.js');
const { logger } = await import('../../../src/shared/logger.js');

describe('resolveEmbeddingConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Defaults ────────────────────────────────────────────────

  it('returns all defaults with empty env', () => {
    const result = resolveEmbeddingConfig({});

    expect(result.embedding).toEqual({
      provider: null,
      dimensions: SCHEMA_EMBEDDING_DIMENSIONS,
      model: DEFAULT_EMBEDDING_CONFIG.model,
      openaiApiKey: null,
      ollamaBaseUrl: DEFAULT_EMBEDDING_CONFIG.ollamaBaseUrl,
    });
    expect(result.vectorSimilarityThreshold).toBe(DEFAULT_VECTOR_SIMILARITY_THRESHOLD);
    expect(result.hybridKeywordWeight).toBe(DEFAULT_HYBRID_KEYWORD_WEIGHT);
    expect(result.hybridSemanticWeight).toBe(DEFAULT_HYBRID_SEMANTIC_WEIGHT);
  });

  // ── OpenAI provider ─────────────────────────────────────────

  it('resolves openai provider with API key', () => {
    const result = resolveEmbeddingConfig({
      EMBEDDING_PROVIDER: 'openai',
      OPENAI_API_KEY: 'sk-test-123',
    });

    expect(result.embedding.provider).toBe('openai');
    expect(result.embedding.openaiApiKey).toBe('sk-test-123');
    expect(result.embedding.model).toBe(DEFAULT_EMBEDDING_CONFIG.model);
  });

  // ── Ollama provider ─────────────────────────────────────────

  it('resolves ollama provider with default model', () => {
    const result = resolveEmbeddingConfig({
      EMBEDDING_PROVIDER: 'ollama',
    });

    expect(result.embedding.provider).toBe('ollama');
    expect(result.embedding.model).toBe('nomic-embed-text');
  });

  it('uses custom OLLAMA_BASE_URL when provided', () => {
    const result = resolveEmbeddingConfig({
      EMBEDDING_PROVIDER: 'ollama',
      OLLAMA_BASE_URL: 'http://gpu-box:11434',
    });

    expect(result.embedding.ollamaBaseUrl).toBe('http://gpu-box:11434');
  });

  // ── Custom overrides ────────────────────────────────────────

  it('uses custom EMBEDDING_MODEL', () => {
    const result = resolveEmbeddingConfig({
      EMBEDDING_PROVIDER: 'openai',
      EMBEDDING_MODEL: 'text-embedding-3-large',
    });

    expect(result.embedding.model).toBe('text-embedding-3-large');
  });

  it('uses custom dimensions', () => {
    const result = resolveEmbeddingConfig({
      EMBEDDING_DIMENSIONS: '768',
    });

    expect(result.embedding.dimensions).toBe(768);
  });

  it('uses custom similarity threshold', () => {
    const result = resolveEmbeddingConfig({
      EMBEDDING_SIMILARITY_THRESHOLD: '0.5',
    });

    expect(result.vectorSimilarityThreshold).toBe(0.5);
  });

  it('uses custom hybrid weights', () => {
    const result = resolveEmbeddingConfig({
      EMBEDDING_HYBRID_KEYWORD_WEIGHT: '0.7',
      EMBEDDING_HYBRID_SEMANTIC_WEIGHT: '0.3',
    });

    expect(result.hybridKeywordWeight).toBe(0.7);
    expect(result.hybridSemanticWeight).toBe(0.3);
  });

  // ── Weight validation ───────────────────────────────────────

  it('warns when hybrid weights do not sum to ~1.0', () => {
    resolveEmbeddingConfig({
      EMBEDDING_HYBRID_KEYWORD_WEIGHT: '0.5',
      EMBEDDING_HYBRID_SEMANTIC_WEIGHT: '0.8',
    });

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('weights sum to 1.30'));
  });

  it('does not warn when weights sum to exactly 1.0', () => {
    resolveEmbeddingConfig({
      EMBEDDING_HYBRID_KEYWORD_WEIGHT: '0.4',
      EMBEDDING_HYBRID_SEMANTIC_WEIGHT: '0.6',
    });

    expect(logger.warn).not.toHaveBeenCalled();
  });

  // ── Invalid / missing env values ────────────────────────────

  it('returns null provider for unknown EMBEDDING_PROVIDER', () => {
    const result = resolveEmbeddingConfig({
      EMBEDDING_PROVIDER: 'unknown-provider',
    });

    expect(result.embedding.provider).toBeNull();
  });

  it('falls back to default dimensions for non-numeric value', () => {
    const result = resolveEmbeddingConfig({
      EMBEDDING_DIMENSIONS: 'not-a-number',
    });

    expect(result.embedding.dimensions).toBe(SCHEMA_EMBEDDING_DIMENSIONS);
  });

  it('returns null openaiApiKey when not set', () => {
    const result = resolveEmbeddingConfig({
      EMBEDDING_PROVIDER: 'openai',
    });

    expect(result.embedding.openaiApiKey).toBeNull();
  });
});
