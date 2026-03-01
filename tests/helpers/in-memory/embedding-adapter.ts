import type { EmbeddingPort } from '../../../src/ports/embedding-port.js';

/**
 * Deterministic in-memory embedding adapter for testing.
 * Produces fixed-dimension vectors derived from a simple hash of the input text,
 * so identical inputs always produce identical vectors. This is a pseudo-random
 * hashing scheme for stable test embeddings and does not preserve semantic similarity.
 * No external API calls are made.
 */
export class InMemoryEmbeddingAdapter implements EmbeddingPort {
  constructor(private dimensions: number = 1536) {}

  async embedText(text: string): Promise<number[] | null> {
    return this.hashToVector(text);
  }

  async embedTexts(texts: string[]): Promise<(number[] | null)[]> {
    return texts.map(t => this.hashToVector(t));
  }

  getDimensions(): number {
    return this.dimensions;
  }

  private hashToVector(text: string): number[] {
    const vector: number[] = new Array(this.dimensions);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash * 31 + text.charCodeAt(i)) | 0;
    }
    for (let i = 0; i < this.dimensions; i++) {
      // Generate deterministic pseudo-random values in [-1, 1]
      hash = (hash * 1103515245 + 12345) | 0;
      vector[i] = ((hash >>> 0) / 0xffffffff) * 2 - 1;
    }
    return vector;
  }
}
