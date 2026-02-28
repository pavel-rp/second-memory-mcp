/**
 * Port interface for text embedding operations.
 *
 * Embedding is optional — when no provider is configured, isAvailable()
 * returns false and embed methods return null. Write operations proceed
 * normally; only semantic search requires embeddings.
 */
export interface EmbeddingPort {
  /** Embed a single text string. Returns null on failure or if unavailable. */
  embedText(text: string): Promise<number[] | null>;

  /** Batch-embed multiple texts. Returns null per item on individual failure. */
  embedTexts(texts: string[]): Promise<(number[] | null)[]>;

  /** Return the dimension count of the configured embedding model. */
  getDimensions(): number;

  /** Whether the embedding provider is configured and operational. */
  isAvailable(): boolean;
}
