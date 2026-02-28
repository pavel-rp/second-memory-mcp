import type { Embeddings } from '@langchain/core/embeddings';
import type { EmbeddingPort } from '../../ports/embedding-port.js';
import type { EmbeddingConfig } from '../../domain/config/embedding.js';
import { logger } from '../../shared/logger.js';

export class LangChainEmbeddingAdapter implements EmbeddingPort {
  private embeddings: Embeddings | null = null;
  private initialized = false;
  private available = false;

  constructor(private config: EmbeddingConfig) {}

  async embedText(text: string): Promise<number[] | null> {
    await this.ensureInitialized();
    if (!this.available || !this.embeddings) return null;
    try {
      const [vector] = await this.embeddings.embedDocuments([text]);
      return vector ?? null;
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
      return vectors.map(v => v ?? null);
    } catch (err) {
      logger.warn('Batch embedding failed:', err);
      return texts.map(() => null);
    }
  }

  getDimensions(): number {
    return this.config.dimensions;
  }

  isAvailable(): boolean {
    // If not initialized yet, report available based on config (provider is set)
    if (!this.initialized) return !!this.config.provider;
    return this.available;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    if (!this.config.provider) {
      logger.info('No embedding provider configured — semantic search disabled');
      return;
    }

    try {
      if (this.config.provider === 'openai') {
        await this.initOpenAI();
      } else if (this.config.provider === 'ollama') {
        await this.initOllama();
      }
      this.available = true;
      logger.info(`Embedding provider initialized: ${this.config.provider} (${this.config.model})`);
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

  private async initOllama(): Promise<void> {
    const { OllamaEmbeddings } = await import('@langchain/ollama');
    this.embeddings = new OllamaEmbeddings({
      model: this.config.model,
      baseUrl: this.config.ollamaBaseUrl,
    });
  }
}
