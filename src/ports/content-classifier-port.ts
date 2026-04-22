import type {
  ChunkClassifierInput,
  ChunkClassifierVerdict,
  ClassifierPrompt,
} from '../domain/types/classifier.js';

/**
 * Port interface for Tier 2 content classification (NEU-619).
 *
 * Classification is optional — the composition root only injects a
 * `ContentClassifierPort` when `CLASSIFIER_PROVIDER` is configured.
 * Callers check `deps.classifier` presence to know if classification is
 * configured, and inspect per-field `null` values in the returned verdict
 * for runtime failures (timeout, schema parse error, rate limit).
 *
 * This two-level contract (port presence = configured; nullable verdict
 * fields = runtime failure) mirrors `EmbeddingPort`.
 *
 * **Fail-open guarantee.** `classify()` never throws. On total adapter
 * unavailability it returns an all-null verdict; on per-field failure it
 * returns a verdict with that field set to `null` and the others populated.
 */
export interface ContentClassifierPort {
  /**
   * Produce a six-field verdict for the given chunk snapshot.
   *
   * @param input  Chunk data the classifier evaluates.
   * @param prompt System + user prompt supplied by the caller. NEU-620 owns
   *               the rubric/few-shots; the adapter remains prompt-agnostic.
   */
  classify(input: ChunkClassifierInput, prompt: ClassifierPrompt): Promise<ChunkClassifierVerdict>;
}
