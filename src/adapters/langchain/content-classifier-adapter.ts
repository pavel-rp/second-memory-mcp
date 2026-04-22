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
import { logger } from '../../shared/logger.js';

/**
 * LangChain-backed OpenAI implementation of `ContentClassifierPort` (NEU-619).
 *
 * Fans out six parallel `ChatOpenAI.withStructuredOutput(VerdictFieldSchema)`
 * calls — one per verdict field — so a single field's failure does not
 * invalidate the other five. Each failure resolves to `null` in its slot and
 * produces a single aggregated `logger.warn` line; the adapter never throws.
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
      new this.humanMessageCtor(renderUserPayload(input, prompt.userPrompt)),
    ];

    const results = await Promise.allSettled(
      VERDICT_FIELDS.map(field => this.classifyField(field, messages))
    );

    const verdict = emptyVerdict();
    const failedFields: string[] = [];
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
      logger.warn(`Classifier fields failed: ${failedFields.join(', ')} (chunk ${input.chunkId})`);
    }

    return verdict;
  }

  private async classifyField(
    field: VerdictFieldName,
    messages: BaseMessage[]
  ): Promise<NullableVerdictField> {
    const model = this.modelsByField.get(field);
    if (!model) return null;
    const raw = await model.invoke(messages);
    // The runnable is bound with VerdictFieldSchema; re-parse defensively so a
    // schema drift in future LangChain versions becomes a null verdict rather
    // than a structurally invalid object.
    const parsed = VerdictFieldSchema.safeParse(raw);
    if (!parsed.success) {
      logger.warn(`Classifier field ${field} failed schema validation: ${parsed.error.message}`);
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
      logger.info('No classifier provider configured — Tier 2 classification disabled');
      return;
    }

    if (!this.config.openaiApiKey) {
      logger.warn(
        'CLASSIFIER_PROVIDER=openai but no API key available (neither CLASSIFIER_OPENAI_API_KEY nor OPENAI_API_KEY is set). Tier 2 classification disabled.'
      );
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
      logger.info(
        `Classifier initialized: openai (${this.config.model}, effort=${this.config.reasoningEffort}, ${VERDICT_FIELDS.length} fields)`
      );
    } catch (err) {
      logger.warn('Failed to initialize classifier adapter:', err);
      this.available = false;
    }
  }
}

function renderUserPayload(input: ChunkClassifierInput, userPrompt: string): string {
  // A small, stable serialization so NEU-620's prompt text can reference named
  // fields. No I/O; pure string assembly.
  const tags = input.tags.length > 0 ? input.tags.join(', ') : '(none)';
  const prerequisites = input.prerequisites.length > 0 ? input.prerequisites.join(', ') : '(none)';
  return [
    userPrompt,
    '',
    '--- CHUNK ---',
    `id: ${input.chunkId}`,
    `title: ${input.title}`,
    `chunkType: ${input.chunkType}`,
    `tags: ${tags}`,
    `prerequisites: ${prerequisites}`,
    '',
    'content:',
    input.content,
  ].join('\n');
}
