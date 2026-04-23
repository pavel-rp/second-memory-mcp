import type { Runnable } from '@langchain/core/runnables';
import type { BaseMessage } from '@langchain/core/messages';
import type { ContentClassifierPort } from '../../ports/content-classifier-port.js';
import {
  emptyVerdict,
  VerdictFieldSchema,
  VERDICT_FIELDS,
  type ChunkClassifierInput,
  type ChunkClassifierVerdict,
  type ClassifierPrompt,
  type NullableVerdictField,
  type VerdictField,
  type VerdictFieldName,
} from '../../domain/types/classifier.js';
import type { ClassifierConfig } from '../../domain/config/classifier.js';
import { renderClassifierUserPayload } from '../../domain/services/render-classifier-prompt.js';
import { PERSISTED_TIER2_FIELD_NAMES } from '../../shared/prompts/classifier-prompts.js';
import { logEvent } from '../../shared/logger.js';

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
  private modelsByField: Map<VerdictFieldName, Runnable<BaseMessage[], VerdictField>> = new Map();
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
    prompt: ClassifierPrompt
  ): Promise<ChunkClassifierVerdict> {
    await this.ensureInitialized();
    if (!this.available || this.modelsByField.size === 0) {
      return emptyVerdict();
    }

    const messages: BaseMessage[] = [
      new this.systemMessageCtor(prompt.systemPrompt),
      new this.humanMessageCtor(renderClassifierUserPayload(input, prompt.userPrompt)),
    ];

    const results = await Promise.allSettled(
      VERDICT_FIELDS.map(field => this.classifyField(field, messages, input.chunkId))
    );

    const verdict = emptyVerdict();
    const failedFields: VerdictFieldName[] = [];
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

  private async classifyField(
    field: VerdictFieldName,
    messages: BaseMessage[],
    chunkId: string
  ): Promise<NullableVerdictField> {
    const model = this.modelsByField.get(field);
    if (!model) return null;
    const raw = await model.invoke(messages);
    // The runnable is bound with VerdictFieldSchema; re-parse defensively so a
    // schema drift in future LangChain versions becomes a null verdict rather
    // than a structurally invalid object.
    const parsed = VerdictFieldSchema.safeParse(raw);
    if (!parsed.success) {
      logEvent('classifier', 'classifier.field_parse_failed', {
        chunk_id: chunkId,
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
        }) as unknown as Runnable<BaseMessage[], VerdictField>;
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
