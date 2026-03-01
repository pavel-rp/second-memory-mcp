import type { Embeddings } from '@langchain/core/embeddings';
import type { EmbeddingPort } from '../../ports/embedding-port.js';
import {
  type EmbeddingConfig,
  SCHEMA_EMBEDDING_DIMENSIONS,
} from '../../domain/config/embedding.js';
import { logger } from '../../shared/logger.js';

export class LangChainEmbeddingAdapter implements EmbeddingPort {
  private embeddings: Embeddings | null = null;
  private initPromise: Promise<void> | null = null;
  private available = false;

  constructor(private config: EmbeddingConfig) {}

  async embedText(text: string): Promise<number[] | null> {
    await this.ensureInitialized();
    if (!this.available || !this.embeddings) return null;
    try {
      const vector = await this.embeddings.embedQuery(text);
      if (!vector) return null;
      return this.validateDimensions(vector);
    } catch (err) {
      logger.warn('Embedding failed for single text:', err);
      return null;
    }
  }

  async embedTexts(texts: string[]): Promise<(number[] | null)[]> {
    await this.ensureInitialized();
    if (!this.available || !this.embeddings) return texts.map(() => null);
    try {
      const vectors = await this.embeddings.embedDocuments(texts);
      return vectors.map(v => (v ? this.validateDimensions(v) : null));
    } catch (err) {
      logger.warn('Batch embedding failed:', err);
      return texts.map(() => null);
    }
  }

  getDimensions(): number {
    return this.config.dimensions;
  }

  isAvailable(): boolean {
    // Before lazy init, optimistically report based on config.
    // After init, report actual availability. Note: callers on the write path
    // should call embedText() directly (which triggers init) rather than gating
    // on isAvailable(), since this may be inaccurate before the first embed call.
    if (!this.initPromise) return !!this.config.provider;
    return this.available;
  }

  private ensureInitialized(): Promise<void> {
    if (!this.initPromise) this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    if (!this.config.provider) {
      logger.info('No embedding provider configured — semantic search disabled');
      return;
    }

    if (this.config.dimensions !== SCHEMA_EMBEDDING_DIMENSIONS) {
      logger.error(
        `Embedding dimensions mismatch: configured ${this.config.dimensions}, schema requires ${SCHEMA_EMBEDDING_DIMENSIONS}. ` +
          `Set EMBEDDING_DIMENSIONS=${SCHEMA_EMBEDDING_DIMENSIONS} or use a model that produces ${SCHEMA_EMBEDDING_DIMENSIONS}-dim vectors. ` +
          `Semantic search disabled.`
      );
      return;
    }

    try {
      if (this.config.provider === 'openai') {
        await this.initOpenAI();
      } else if (this.config.provider === 'ollama') {
        await this.initOllama();
      }
      this.available = true;
      logger.info(
        `Embedding provider initialized: ${this.config.provider} (${this.config.model}, ${this.config.dimensions} dims)`
      );
    } catch (err) {
      logger.warn(`Failed to initialize embedding provider "${this.config.provider}":`, err);
      this.available = false;
    }
  }

  private async initOpenAI(): Promise<void> {
    if (!this.config.openaiApiKey) {
      throw new Error('OPENAI_API_KEY is required for OpenAI embedding provider');
    }
    const { OpenAIEmbeddings } = await import('@langchain/openai');
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: this.config.openaiApiKey,
      modelName: this.config.model,
      dimensions: this.config.dimensions,
    });
  }

  private validateDimensions(vector: number[]): number[] | null {
    if (vector.length !== SCHEMA_EMBEDDING_DIMENSIONS) {
      if (this.available) {
        logger.error(
          `Embedding dimension mismatch: model produced ${vector.length}-dim vector, schema requires ${SCHEMA_EMBEDDING_DIMENSIONS}. ` +
            `Set EMBEDDING_DIMENSIONS=${SCHEMA_EMBEDDING_DIMENSIONS} and use a compatible model. Disabling semantic search.`
        );
        this.available = false;
      }
      return null;
    }
    return vector;
  }

  private async initOllama(): Promise<void> {
    const { OllamaEmbeddings } = await import('@langchain/ollama');
    this.embeddings = new OllamaEmbeddings({
      model: this.config.model,
      baseUrl: this.config.ollamaBaseUrl,
    });
  }
}
