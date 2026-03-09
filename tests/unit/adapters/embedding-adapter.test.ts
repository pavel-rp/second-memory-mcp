import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { EmbeddingConfig } from '../../../src/domain/config/embedding.js';
import { SCHEMA_EMBEDDING_DIMENSIONS } from '../../../src/domain/config/embedding.js';

// ── Mock LangChain modules ─────────────────────────────────────
// The adapter uses dynamic `await import(...)` — vi.mock intercepts those.

const mockEmbedQuery = vi.fn();
const mockEmbedDocuments = vi.fn();

function FakeEmbeddings() {
  return { embedQuery: mockEmbedQuery, embedDocuments: mockEmbedDocuments };
}

vi.mock('@langchain/openai', () => ({
  OpenAIEmbeddings: vi.fn().mockImplementation(FakeEmbeddings),
}));

vi.mock('@langchain/ollama', () => ({
  OllamaEmbeddings: vi.fn().mockImplementation(FakeEmbeddings),
}));

vi.mock('../../../src/shared/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Import after mocks are set up
const { LangChainEmbeddingAdapter } =
  await import('../../../src/adapters/langchain/embedding-adapter.js');
const { OpenAIEmbeddings } = await import('@langchain/openai');
const { OllamaEmbeddings } = await import('@langchain/ollama');
const { logger } = await import('../../../src/shared/logger.js');

// ── Helpers ─────────────────────────────────────────────────────

function makeConfig(overrides?: Partial<EmbeddingConfig>): EmbeddingConfig {
  return {
    provider: 'openai',
    dimensions: SCHEMA_EMBEDDING_DIMENSIONS,
    model: 'text-embedding-3-small',
    openaiApiKey: 'sk-test-key',
    ollamaBaseUrl: 'http://localhost:11434',
    maxRetries: 3,
    maxConcurrency: 10,
    timeout: 30_000,
    ...overrides,
  };
}

function fakeVector(dims = SCHEMA_EMBEDDING_DIMENSIONS): number[] {
  return Array.from({ length: dims }, (_, i) => i * 0.001);
}

// ── Tests ───────────────────────────────────────────────────────

describe('LangChainEmbeddingAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Initialization ──────────────────────────────────────────

  describe('initialization', () => {
    it('lazy-initializes on first embedText call', async () => {
      const vec = fakeVector();
      mockEmbedQuery.mockResolvedValueOnce(vec);
      const adapter = new LangChainEmbeddingAdapter(makeConfig());

      const result = await adapter.embedText('hello');

      expect(OpenAIEmbeddings).toHaveBeenCalledTimes(1);
      expect(result).toEqual(vec);
    });

    it('reuses the same instance on subsequent calls', async () => {
      mockEmbedQuery.mockResolvedValue(fakeVector());
      const adapter = new LangChainEmbeddingAdapter(makeConfig());

      await adapter.embedText('first');
      await adapter.embedText('second');

      expect(OpenAIEmbeddings).toHaveBeenCalledTimes(1);
    });

    it('does not initialize when no provider is configured', async () => {
      const adapter = new LangChainEmbeddingAdapter(makeConfig({ provider: null }));

      const result = await adapter.embedText('hello');

      expect(OpenAIEmbeddings).not.toHaveBeenCalled();
      expect(OllamaEmbeddings).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('does not initialize when dimensions mismatch schema', async () => {
      const adapter = new LangChainEmbeddingAdapter(makeConfig({ dimensions: 768 }));

      const result = await adapter.embedText('hello');

      expect(OpenAIEmbeddings).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('dimension'));
      expect(result).toBeNull();
    });
  });

  // ── OpenAI path ─────────────────────────────────────────────

  describe('OpenAI provider', () => {
    it('creates OpenAIEmbeddings with correct config', async () => {
      mockEmbedQuery.mockResolvedValueOnce(fakeVector());
      const cfg = makeConfig();
      const adapter = new LangChainEmbeddingAdapter(cfg);

      await adapter.embedText('test');

      expect(OpenAIEmbeddings).toHaveBeenCalledWith({
        apiKey: 'sk-test-key',
        model: 'text-embedding-3-small',
        dimensions: SCHEMA_EMBEDDING_DIMENSIONS,
        maxRetries: 3,
        maxConcurrency: 10,
        timeout: 30_000,
      });
    });

    it('forwards custom resilience config to OpenAIEmbeddings', async () => {
      mockEmbedQuery.mockResolvedValueOnce(fakeVector());
      const cfg = makeConfig({ maxRetries: 5, maxConcurrency: 20, timeout: 60_000 });
      const adapter = new LangChainEmbeddingAdapter(cfg);

      await adapter.embedText('test');

      expect(OpenAIEmbeddings).toHaveBeenCalledWith(
        expect.objectContaining({
          maxRetries: 5,
          maxConcurrency: 20,
          timeout: 60_000,
        })
      );
    });

    it('fails gracefully when API key is missing', async () => {
      const adapter = new LangChainEmbeddingAdapter(
        makeConfig({ provider: 'openai', openaiApiKey: null })
      );

      const result = await adapter.embedText('test');

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize'),
        expect.any(Error)
      );
    });
  });

  // ── Ollama path ─────────────────────────────────────────────

  describe('Ollama provider', () => {
    it('creates OllamaEmbeddings with correct config', async () => {
      mockEmbedQuery.mockResolvedValueOnce(fakeVector());
      const adapter = new LangChainEmbeddingAdapter(
        makeConfig({ provider: 'ollama', model: 'nomic-embed-text' })
      );

      await adapter.embedText('test');

      expect(OllamaEmbeddings).toHaveBeenCalledWith({
        model: 'nomic-embed-text',
        baseUrl: 'http://localhost:11434',
        dimensions: SCHEMA_EMBEDDING_DIMENSIONS,
        maxRetries: 3,
        maxConcurrency: 10,
      });
    });
  });

  // ── embedText ───────────────────────────────────────────────

  describe('embedText', () => {
    it('returns vector from embedQuery', async () => {
      const vec = fakeVector();
      mockEmbedQuery.mockResolvedValueOnce(vec);
      const adapter = new LangChainEmbeddingAdapter(makeConfig());

      const result = await adapter.embedText('hello');

      expect(result).toEqual(vec);
    });

    it('returns null when embedQuery returns null', async () => {
      mockEmbedQuery.mockResolvedValueOnce(null);
      const adapter = new LangChainEmbeddingAdapter(makeConfig());

      const result = await adapter.embedText('hello');

      expect(result).toBeNull();
    });

    it('returns null on embedQuery error (fail-open)', async () => {
      mockEmbedQuery.mockRejectedValueOnce(new Error('API error'));
      const adapter = new LangChainEmbeddingAdapter(makeConfig());

      const result = await adapter.embedText('hello');

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Embedding failed'),
        expect.any(Error)
      );
    });
  });

  // ── embedTexts ──────────────────────────────────────────────

  describe('embedTexts', () => {
    it('returns vectors from embedDocuments', async () => {
      const vecs = [fakeVector(), fakeVector()];
      mockEmbedDocuments.mockResolvedValueOnce(vecs);
      const adapter = new LangChainEmbeddingAdapter(makeConfig());

      const result = await adapter.embedTexts(['a', 'b']);

      expect(result).toEqual(vecs);
    });

    it('returns all nulls when not available', async () => {
      const adapter = new LangChainEmbeddingAdapter(makeConfig({ provider: null }));

      const result = await adapter.embedTexts(['a', 'b', 'c']);

      expect(result).toEqual([null, null, null]);
    });

    it('returns all nulls on embedDocuments error', async () => {
      mockEmbedDocuments.mockRejectedValueOnce(new Error('batch fail'));
      const adapter = new LangChainEmbeddingAdapter(makeConfig());

      const result = await adapter.embedTexts(['a', 'b']);

      expect(result).toEqual([null, null]);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Batch embedding failed'),
        expect.any(Error)
      );
    });

    it('returns null for individual vectors with wrong dimensions', async () => {
      const goodVec = fakeVector();
      const badVec = fakeVector(512);
      mockEmbedDocuments.mockResolvedValueOnce([goodVec, badVec]);
      const adapter = new LangChainEmbeddingAdapter(makeConfig());

      const result = await adapter.embedTexts(['a', 'b']);

      expect(result[0]).toEqual(goodVec);
      expect(result[1]).toBeNull();
    });
  });

  // ── Dimension validation ────────────────────────────────────

  describe('dimension validation', () => {
    it('returns null and permanently disables on wrong vector length', async () => {
      mockEmbedQuery.mockResolvedValueOnce(fakeVector(512));
      const adapter = new LangChainEmbeddingAdapter(makeConfig());

      const first = await adapter.embedText('hello');
      expect(first).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('dimension mismatch'));

      // Subsequent calls return null without calling embedQuery again
      mockEmbedQuery.mockResolvedValueOnce(fakeVector());
      const second = await adapter.embedText('world');
      expect(second).toBeNull();
    });
  });

  // ── getDimensions ───────────────────────────────────────────

  describe('getDimensions', () => {
    it('returns configured dimensions', () => {
      const adapter = new LangChainEmbeddingAdapter(makeConfig({ dimensions: 1536 }));
      expect(adapter.getDimensions()).toBe(1536);
    });
  });
});
