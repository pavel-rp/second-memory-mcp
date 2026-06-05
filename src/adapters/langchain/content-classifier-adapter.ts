import type { Runnable, RunnableConfig } from '@langchain/core/runnables';
import type { BaseMessage } from '@langchain/core/messages';
import type { ContentClassifierPort } from '../../ports/content-classifier-port.js';
import {
  emptyVerdict,
  VerdictFieldSchema,
  VERDICT_FIELDS,
  type ChunkClassifierInput,
  type ChunkClassifierVerdict,
  type NullableVerdictField,
  type PerFieldClassifierPrompts,
  type VerdictField,
  type VerdictFieldName,
} from '../../domain/types/classifier.js';
import type { ClassifierConfig } from '../../domain/config/classifier.js';
import { renderClassifierUserPayload } from '../../domain/services/render-classifier-prompt.js';
import { aggregateVerdictSamples } from '../../domain/algorithms/aggregate-verdict-samples.js';
import { PERSISTED_TIER2_FIELD_NAMES } from '../../shared/prompts/classifier-prompts.js';
import { logEvent } from '../../shared/logger.js';

/**
 * Per-field structured-output runnable with `seed` exposed as a per-call option.
 * `seed` is a ChatOpenAI call option (`BaseChatOpenAICallOptions.seed`); widening
 * the runnable's call-options type lets `invoke(messages, { seed })` type-check
 * and forward the seed down to the model on each invoke (NEU-757).
 */
type SeededFieldRunnable = Runnable<
  BaseMessage[],
  VerdictField,
  RunnableConfig & { seed?: number }
>;

/**
 * LangChain-backed OpenAI implementation of `ContentClassifierPort` (NEU-619).
 *
 * Fans out six parallel `ChatOpenAI.withStructuredOutput(VerdictFieldSchema)`
 * calls — one per verdict field — so a single field's failure does not
 * invalidate the other five. Each failure resolves to `null` in its slot and
 * emits a `classifier.classify_aggregate_failed` event; per-field schema
 * rejections emit `classifier.field_parse_failed`. Init outcomes emit
 * `classifier.init`. The adapter never throws.
 *
 * Mirrors the lazy-init / dynamic-import / fail-open pattern of
 * `LangChainEmbeddingAdapter`.
 */
export class LangChainContentClassifierAdapter implements ContentClassifierPort {
  private modelsByField: Map<VerdictFieldName, SeededFieldRunnable> = new Map();
  private initPromise: Promise<void> | null = null;
  private available = false;
  private systemMessageCtor: new (content: string) => BaseMessage = null as unknown as new (
    content: string
  ) => BaseMessage;
  private humanMessageCtor: new (content: string) => BaseMessage = null as unknown as new (
    content: string
  ) => BaseMessage;

  constructor(private config: ClassifierConfig) {}

  async classify(
    input: ChunkClassifierInput,
    prompts: PerFieldClassifierPrompts
  ): Promise<ChunkClassifierVerdict> {
    await this.ensureInitialized();
    if (!this.available || this.modelsByField.size === 0) {
      return emptyVerdict();
    }

    const results = await Promise.allSettled(
      VERDICT_FIELDS.map(field => this.classifyFieldSelfConsistent(field, input, prompts[field]))
    );

    const verdict = emptyVerdict();
    const failedFields: VerdictFieldName[] = [];
    // NEU-757: each result here is the aggregate of `config.samples` samples for
    // one field. A per-sample failure is dropped inside `classifyFieldSelfConsistent`,
    // so `result.value === null` means EVERY sample for the field failed — not a
    // single invoke. `failedFields` (and the `classify_aggregate_failed` event
    // below) therefore track fully-failed fields, not individual sample failures.
    for (let i = 0; i < VERDICT_FIELDS.length; i += 1) {
      const field = VERDICT_FIELDS[i];
      const result = results[i];
      if (result && result.status === 'fulfilled' && result.value !== null) {
        verdict[field] = result.value;
      } else {
        verdict[field] = null;
        failedFields.push(field);
      }
    }

    if (failedFields.length > 0) {
      logEvent('classifier', 'classifier.classify_aggregate_failed', {
        chunk_id: input.chunkId,
        failed_fields: failedFields.map(f => PERSISTED_TIER2_FIELD_NAMES[f]),
      });
    }

    return verdict;
  }

  /**
   * Run `config.samples` independent calls for one field with deterministically
   * derived seeds (`seed + 0 … seed + samples-1`) and reduce the surviving
   * (non-null) samples to a single field via `aggregateVerdictSamples`. With
   * `samples === 1` this is exactly one call carrying the base seed — identical
   * cost and fan-out to the pre-NEU-757 path. Distinct seeds give genuine
   * variance to vote over; the fixed seed set keeps the verdict reproducible.
   * Per-sample failures resolve to null and are dropped before aggregation, so
   * a field is only null when every sample failed (fail-open preserved).
   */
  private async classifyFieldSelfConsistent(
    field: VerdictFieldName,
    input: ChunkClassifierInput,
    prompt: PerFieldClassifierPrompts[VerdictFieldName]
  ): Promise<NullableVerdictField> {
    const sampleCount = Math.max(1, this.config.samples);
    const seeds = Array.from({ length: sampleCount }, (_, i) => this.config.seed + i);
    const settled = await Promise.allSettled(
      seeds.map(seed => this.classifyField(field, input, prompt, seed))
    );
    const survivors: VerdictField[] = [];
    for (const outcome of settled) {
      if (outcome.status === 'fulfilled' && outcome.value !== null) {
        survivors.push(outcome.value);
      }
    }
    return aggregateVerdictSamples(survivors);
  }

  private async classifyField(
    field: VerdictFieldName,
    input: ChunkClassifierInput,
    prompt: PerFieldClassifierPrompts[VerdictFieldName],
    seed: number
  ): Promise<NullableVerdictField> {
    const model = this.modelsByField.get(field);
    if (!model) return null;
    const messages: BaseMessage[] = [
      new this.systemMessageCtor(prompt.systemPrompt),
      new this.humanMessageCtor(renderClassifierUserPayload(input, prompt.userPrompt)),
    ];
    // `seed` is a per-call ChatOpenAI option passed as the invoke call-options
    // (`BaseChatOpenAICallOptions.seed`). `ensureConfig`/`patchConfig` preserve
    // it through the structured-output sequence down to the model, so each
    // self-consistency sample runs with its own distinct seed (NEU-757).
    const raw = await model.invoke(messages, { seed });
    // The runnable is bound with VerdictFieldSchema; re-parse defensively so a
    // schema drift in future LangChain versions becomes a null verdict rather
    // than a structurally invalid object.
    const parsed = VerdictFieldSchema.safeParse(raw);
    if (!parsed.success) {
      logEvent('classifier', 'classifier.field_parse_failed', {
        chunk_id: input.chunkId,
        field: PERSISTED_TIER2_FIELD_NAMES[field],
        raw_response: raw,
        parse_error: parsed.error.message,
      });
      return null;
    }
    return parsed.data;
  }

  private ensureInitialized(): Promise<void> {
    if (!this.initPromise) this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    if (this.config.provider !== 'openai') {
      logEvent('classifier', 'classifier.init', {
        provider: this.config.provider,
        model: this.config.model,
        reasoning_effort: this.config.reasoningEffort,
        available: false,
        reason: 'no_provider_configured',
      });
      return;
    }

    if (!this.config.openaiApiKey) {
      logEvent('classifier', 'classifier.init', {
        provider: this.config.provider,
        model: this.config.model,
        reasoning_effort: this.config.reasoningEffort,
        available: false,
        reason: 'missing_api_key',
      });
      return;
    }

    try {
      const { ChatOpenAI } = await import('@langchain/openai');
      const { SystemMessage, HumanMessage } = await import('@langchain/core/messages');

      this.systemMessageCtor = SystemMessage as unknown as new (content: string) => BaseMessage;
      this.humanMessageCtor = HumanMessage as unknown as new (content: string) => BaseMessage;

      // Reasoning models (e.g. gpt-5.4-mini) reject any non-default `temperature`.
      // Only send the field when the caller explicitly configured an override.
      const base = new ChatOpenAI({
        apiKey: this.config.openaiApiKey,
        model: this.config.model,
        ...(this.config.temperature !== null ? { temperature: this.config.temperature } : {}),
        timeout: this.config.timeout,
        maxRetries: this.config.maxRetries,
        reasoning: { effort: this.config.reasoningEffort },
      });

      for (const field of VERDICT_FIELDS) {
        const bound = base.withStructuredOutput(VerdictFieldSchema, {
          name: field,
        }) as unknown as SeededFieldRunnable;
        this.modelsByField.set(field, bound);
      }

      this.available = true;
      logEvent('classifier', 'classifier.init', {
        provider: this.config.provider,
        model: this.config.model,
        reasoning_effort: this.config.reasoningEffort,
        available: true,
      });
    } catch (err) {
      this.available = false;
      logEvent('classifier', 'classifier.init', {
        provider: this.config.provider,
        model: this.config.model,
        reasoning_effort: this.config.reasoningEffort,
        available: false,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
