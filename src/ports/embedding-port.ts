/**
 * Port interface for text embedding operations.
 *
 * Embedding is optional — the composition root only injects an EmbeddingPort
 * when a provider is configured. Callers check `deps.embedding` presence to
 * know if embedding is configured, and handle null returns from embed methods
 * for runtime failures (bad API key, dimension mismatch, network errors).
 *
 * This two-level contract (presence = configured, null = runtime failure)
 * avoids the need for an `isAvailable()` method that would be unreliable
 * with lazy initialization.
 */
export interface EmbeddingPort {
  /** Embed a single text string. Returns null on failure or if unavailable. */
  embedText(text: string): Promise<number[] | null>;

  /** Batch-embed multiple texts. Returns null per item on individual failure. */
  embedTexts(texts: string[]): Promise<(number[] | null)[]>;

  /** Return the dimension count of the configured embedding model. */
  getDimensions(): number;
}
