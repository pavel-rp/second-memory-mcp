import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ClassifierConfig } from '../../../src/domain/config/classifier.js';
import type {
  ChunkClassifierInput,
  PerFieldClassifierPrompts,
} from '../../../src/domain/types/classifier.js';
import { VERDICT_FIELDS } from '../../../src/domain/types/classifier.js';

// ── Mock LangChain modules ──────────────────────────────────────
// The adapter uses dynamic `await import(...)` — vi.mock intercepts those.

type VerdictField = { score: number; rationale: string; applicable: boolean };

// One invoke mock per field so tests can target individual fields.
const invokeMocks = new Map<string, ReturnType<typeof vi.fn>>();
const withStructuredOutputMock = vi.fn((_schema: unknown, opts: { name: string }) => {
  const invoke = vi.fn();
  invokeMocks.set(opts.name, invoke);
  return { invoke };
});

// ChatOpenAI is `new`-ed by the adapter, so the mock must be a constructor.
// vitest v4 warns and mis-handles `new vi.fn(() => ({...}))` patterns.
const ChatOpenAIMock = vi.fn(function FakeChatOpenAI(this: {
  withStructuredOutput: typeof withStructuredOutputMock;
}) {
  this.withStructuredOutput = withStructuredOutputMock;
});

class FakeSystemMessage {
  constructor(public content: string) {}
}
class FakeHumanMessage {
  constructor(public content: string) {}
}

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: ChatOpenAIMock,
}));

vi.mock('@langchain/core/messages', () => ({
  SystemMessage: FakeSystemMessage,
  HumanMessage: FakeHumanMessage,
}));

vi.mock('../../../src/shared/logger.js', () => ({
  logEvent: vi.fn(),
}));

const { LangChainContentClassifierAdapter } =
  await import('../../../src/adapters/langchain/content-classifier-adapter.js');
const { logEvent } = await import('../../../src/shared/logger.js');

// ── Helpers ─────────────────────────────────────────────────────

function makeConfig(overrides?: Partial<ClassifierConfig>): ClassifierConfig {
  return {
    provider: 'openai',
    model: 'gpt-5.4-mini',
    reasoningEffort: 'low',
    temperature: null,
    maxRetries: 2,
    timeout: 10_000,
    openaiApiKey: 'sk-test-key',
    enableAtCreate: true,
    blockingFields: new Set(),
    ...overrides,
  };
}

function makeInput(overrides?: Partial<ChunkClassifierInput>): ChunkClassifierInput {
  return {
    chunkId: 'c-1',
    title: 'Sample chunk',
    content: 'Some content',
    chunkType: 'E5',
    tags: ['alpha'],
    prerequisites: [],
    ...overrides,
  };
}

function makePrompt(
  overrides?: Partial<{ systemPrompt: string; userPrompt: string }>
): PerFieldClassifierPrompts {
  const base = {
    systemPrompt: 'You are a classifier.',
    userPrompt: 'Grade this chunk.',
    ...overrides,
  };
  return Object.fromEntries(
    VERDICT_FIELDS.map(field => [
      field,
      // Tag the per-field prompt so per-field threading assertions can verify
      // each fan-out call sees its own field's prompt rather than a shared one.
      {
        systemPrompt: `${base.systemPrompt} [${field}]`,
        userPrompt: `${base.userPrompt} [${field}]`,
      },
    ])
  ) as PerFieldClassifierPrompts;
}

function setAllFieldsFulfilled(): void {
  for (const field of VERDICT_FIELDS) {
    const invoke = invokeMocks.get(field);
    if (!invoke) throw new Error(`No invoke mock for ${field}`);
    const verdict: VerdictField = {
      score: 3,
      rationale: `rationale-${field}`,
      applicable: true,
    };
    invoke.mockResolvedValue(verdict);
  }
}

// ── Tests ───────────────────────────────────────────────────────

describe('LangChainContentClassifierAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invokeMocks.clear();
    withStructuredOutputMock.mockClear();
    ChatOpenAIMock.mockClear();
  });

  describe('initialization', () => {
    it('lazy-initializes on first classify call and binds withStructuredOutput once per field', async () => {
      const adapter = new LangChainContentClassifierAdapter(makeConfig());
      // Prime mocks after the adapter will call withStructuredOutput.
      // We must call classify once to trigger init; prime after init using the field names.
      // Instead, prime in advance: withStructuredOutputMock captures the invoke functions.
      // So we need to set invokes *after* the first init. Do it by pre-loading a default.
      withStructuredOutputMock.mockImplementation((_schema, opts) => {
        const invoke = vi
          .fn()
          .mockResolvedValue({ score: 4, rationale: `r-${opts.name}`, applicable: true });
        invokeMocks.set(opts.name, invoke);
        return { invoke };
      });

      const verdict = await adapter.classify(makeInput(), makePrompt());

      expect(ChatOpenAIMock).toHaveBeenCalledTimes(1);
      const firstCall = (
        ChatOpenAIMock.mock.calls as unknown as Array<[Record<string, unknown>]>
      )[0];
      const ctorArgs = firstCall![0];
      expect(ctorArgs).toEqual({
        apiKey: 'sk-test-key',
        model: 'gpt-5.4-mini',
        timeout: 10_000,
        maxRetries: 2,
        reasoning: { effort: 'low' },
      });
      expect(ctorArgs).not.toHaveProperty('temperature');
      expect(withStructuredOutputMock).toHaveBeenCalledTimes(VERDICT_FIELDS.length);
      for (const field of VERDICT_FIELDS) {
        expect(verdict[field]).toEqual({ score: 4, rationale: `r-${field}`, applicable: true });
      }
    });

    it('passes an explicit temperature to ChatOpenAI when config.temperature is not null', async () => {
      withStructuredOutputMock.mockImplementation((_schema, opts) => {
        const invoke = vi
          .fn()
          .mockResolvedValue({ score: 1, rationale: `r-${opts.name}`, applicable: true });
        invokeMocks.set(opts.name, invoke);
        return { invoke };
      });
      const adapter = new LangChainContentClassifierAdapter(makeConfig({ temperature: 0.5 }));

      await adapter.classify(makeInput(), makePrompt());

      expect(ChatOpenAIMock).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0.5 }));
    });

    it('reuses the initialized model across multiple classify calls', async () => {
      withStructuredOutputMock.mockImplementation((_schema, opts) => {
        const invoke = vi
          .fn()
          .mockResolvedValue({ score: 2, rationale: `r-${opts.name}`, applicable: true });
        invokeMocks.set(opts.name, invoke);
        return { invoke };
      });
      const adapter = new LangChainContentClassifierAdapter(makeConfig());

      await adapter.classify(makeInput(), makePrompt());
      await adapter.classify(makeInput({ chunkId: 'c-2' }), makePrompt());

      expect(ChatOpenAIMock).toHaveBeenCalledTimes(1);
      expect(withStructuredOutputMock).toHaveBeenCalledTimes(VERDICT_FIELDS.length);
    });

    it('stays unavailable and returns all-null verdict when provider is null', async () => {
      const adapter = new LangChainContentClassifierAdapter(makeConfig({ provider: null }));

      const verdict = await adapter.classify(makeInput(), makePrompt());

      expect(ChatOpenAIMock).not.toHaveBeenCalled();
      expect(withStructuredOutputMock).not.toHaveBeenCalled();
      for (const field of VERDICT_FIELDS) {
        expect(verdict[field]).toBeNull();
      }
      expect(logEvent).toHaveBeenCalledWith('classifier', 'classifier.init', {
        provider: null,
        model: 'gpt-5.4-mini',
        reasoning_effort: 'low',
        available: false,
        reason: 'no_provider_configured',
      });
    });

    it('stays unavailable when openaiApiKey is missing', async () => {
      const adapter = new LangChainContentClassifierAdapter(makeConfig({ openaiApiKey: null }));

      const verdict = await adapter.classify(makeInput(), makePrompt());

      expect(ChatOpenAIMock).not.toHaveBeenCalled();
      expect(verdict.renderingClarity).toBeNull();
      expect(logEvent).toHaveBeenCalledWith('classifier', 'classifier.init', {
        provider: 'openai',
        model: 'gpt-5.4-mini',
        reasoning_effort: 'low',
        available: false,
        reason: 'missing_api_key',
      });
    });

    it('catches ChatOpenAI constructor errors and stays unavailable', async () => {
      ChatOpenAIMock.mockImplementationOnce(function FailingCtor() {
        throw new Error('ctor boom');
      });
      const adapter = new LangChainContentClassifierAdapter(makeConfig());

      const verdict = await adapter.classify(makeInput(), makePrompt());

      for (const field of VERDICT_FIELDS) {
        expect(verdict[field]).toBeNull();
      }
      expect(logEvent).toHaveBeenCalledWith('classifier', 'classifier.init', {
        provider: 'openai',
        model: 'gpt-5.4-mini',
        reasoning_effort: 'low',
        available: false,
        reason: 'ctor boom',
      });
    });

    it('falls back to String(err) when init throws a non-Error value', async () => {
      // Covers the `: String(err)` branch of the init-catch ternary.
      ChatOpenAIMock.mockImplementationOnce(function FailingCtor() {
        throw 'ctor string boom';
      });
      const adapter = new LangChainContentClassifierAdapter(makeConfig());

      const verdict = await adapter.classify(makeInput(), makePrompt());

      for (const field of VERDICT_FIELDS) {
        expect(verdict[field]).toBeNull();
      }
      expect(logEvent).toHaveBeenCalledWith('classifier', 'classifier.init', {
        provider: 'openai',
        model: 'gpt-5.4-mini',
        reasoning_effort: 'low',
        available: false,
        reason: 'ctor string boom',
      });
    });

    it('emits classifier.init with available:true on successful init', async () => {
      withStructuredOutputMock.mockImplementation((_schema, opts) => {
        const invoke = vi
          .fn()
          .mockResolvedValue({ score: 3, rationale: `r-${opts.name}`, applicable: true });
        invokeMocks.set(opts.name, invoke);
        return { invoke };
      });
      const adapter = new LangChainContentClassifierAdapter(makeConfig());

      await adapter.classify(makeInput(), makePrompt());

      expect(logEvent).toHaveBeenCalledWith('classifier', 'classifier.init', {
        provider: 'openai',
        model: 'gpt-5.4-mini',
        reasoning_effort: 'low',
        available: true,
      });
    });
  });

  describe('classify', () => {
    it('returns a populated verdict when every field succeeds', async () => {
      withStructuredOutputMock.mockImplementation((_schema, opts) => {
        const invoke = vi.fn();
        invokeMocks.set(opts.name, invoke);
        return { invoke };
      });
      const adapter = new LangChainContentClassifierAdapter(makeConfig());
      await adapter.classify(makeInput(), makePrompt()); // trigger init
      setAllFieldsFulfilled();
      vi.mocked(logEvent).mockClear();

      const verdict = await adapter.classify(makeInput({ chunkId: 'c-2' }), makePrompt());

      for (const field of VERDICT_FIELDS) {
        expect(verdict[field]).toEqual({
          score: 3,
          rationale: `rationale-${field}`,
          applicable: true,
        });
      }
      expect(logEvent).not.toHaveBeenCalledWith(
        'classifier',
        'classifier.classify_aggregate_failed',
        expect.anything()
      );
    });

    it('sets a single failed field to null while others populate, and emits aggregate_failed event', async () => {
      withStructuredOutputMock.mockImplementation((_schema, opts) => {
        const invoke = vi.fn();
        invokeMocks.set(opts.name, invoke);
        return { invoke };
      });
      const adapter = new LangChainContentClassifierAdapter(makeConfig());
      await adapter.classify(makeInput(), makePrompt());
      setAllFieldsFulfilled();
      invokeMocks.get('vocabularyAppropriate')!.mockRejectedValueOnce(new Error('rate-limit'));
      vi.mocked(logEvent).mockClear();

      const verdict = await adapter.classify(makeInput({ chunkId: 'c-2' }), makePrompt());

      expect(verdict.vocabularyAppropriate).toBeNull();
      expect(verdict.renderingClarity).toEqual({
        score: 3,
        rationale: 'rationale-renderingClarity',
        applicable: true,
      });
      expect(logEvent).toHaveBeenCalledWith('classifier', 'classifier.classify_aggregate_failed', {
        chunk_id: 'c-2',
        failed_fields: ['vocabulary_appropriate'],
      });
    });

    it('returns all-null verdict when every field fails and emits one aggregate_failed event', async () => {
      withStructuredOutputMock.mockImplementation((_schema, opts) => {
        const invoke = vi.fn();
        invokeMocks.set(opts.name, invoke);
        return { invoke };
      });
      const adapter = new LangChainContentClassifierAdapter(makeConfig());
      await adapter.classify(makeInput(), makePrompt());
      for (const field of VERDICT_FIELDS) {
        invokeMocks.get(field)!.mockRejectedValue(new Error('boom'));
      }
      vi.mocked(logEvent).mockClear();

      const verdict = await adapter.classify(makeInput({ chunkId: 'c-2' }), makePrompt());

      for (const field of VERDICT_FIELDS) {
        expect(verdict[field]).toBeNull();
      }
      const aggregateCalls = vi
        .mocked(logEvent)
        .mock.calls.filter(c => c[1] === 'classifier.classify_aggregate_failed');
      expect(aggregateCalls).toHaveLength(1);
      const data = aggregateCalls[0][2] as { chunk_id: string; failed_fields: string[] };
      expect(data.chunk_id).toBe('c-2');
      expect(data.failed_fields).toHaveLength(VERDICT_FIELDS.length);
      expect(data.failed_fields).toEqual(
        expect.arrayContaining([
          'rendering_clarity',
          'vocabulary_appropriate',
          'math_notation_rendering_risk',
          'definition_constructive',
          'epistemic_consistency',
          'overall_fit',
        ])
      );
    });

    it('emits classifier.field_parse_failed when the runnable returns a schema-invalid verdict', async () => {
      withStructuredOutputMock.mockImplementation((_schema, opts) => {
        const invoke = vi.fn();
        invokeMocks.set(opts.name, invoke);
        return { invoke };
      });
      const adapter = new LangChainContentClassifierAdapter(makeConfig());
      await adapter.classify(makeInput(), makePrompt());
      setAllFieldsFulfilled();
      // Score 7 is outside [1,5] — defensive safeParse should reject it.
      invokeMocks.get('overallFit')!.mockResolvedValueOnce({ score: 7, rationale: 'too high' });
      vi.mocked(logEvent).mockClear();

      const verdict = await adapter.classify(makeInput({ chunkId: 'c-2' }), makePrompt());

      expect(verdict.overallFit).toBeNull();
      expect(verdict.renderingClarity).toEqual({
        score: 3,
        rationale: 'rationale-renderingClarity',
        applicable: true,
      });
      const parseFailedCalls = vi
        .mocked(logEvent)
        .mock.calls.filter(c => c[1] === 'classifier.field_parse_failed');
      expect(parseFailedCalls).toHaveLength(1);
      const data = parseFailedCalls[0][2] as {
        chunk_id: string;
        field: string;
        raw_response: unknown;
        parse_error: string;
      };
      expect(data.chunk_id).toBe('c-2');
      expect(data.field).toBe('overall_fit');
      expect(data.raw_response).toEqual({ score: 7, rationale: 'too high' });
      expect(data.parse_error).toEqual(expect.any(String));

      // Aggregate event also fires for the one failed field.
      expect(logEvent).toHaveBeenCalledWith('classifier', 'classifier.classify_aggregate_failed', {
        chunk_id: 'c-2',
        failed_fields: ['overall_fit'],
      });
    });

    it('threads per-field system + user prompts to each fan-out call (NEU-660)', async () => {
      withStructuredOutputMock.mockImplementation((_schema, opts) => {
        const invoke = vi.fn();
        invokeMocks.set(opts.name, invoke);
        return { invoke };
      });
      const adapter = new LangChainContentClassifierAdapter(makeConfig());
      await adapter.classify(makeInput(), makePrompt());
      setAllFieldsFulfilled();

      await adapter.classify(
        makeInput({
          chunkId: 'c-xyz',
          title: 'Alpha',
          content: 'beta gamma',
          chunkType: 'E5',
          tags: ['math'],
          prerequisites: ['basic-algebra'],
        }),
        makePrompt({ systemPrompt: 'SYS', userPrompt: 'USR' })
      );

      // Each field must receive its own field-tagged system + user prompt.
      for (const field of VERDICT_FIELDS) {
        const invoke = invokeMocks.get(field)!;
        const lastCallArgs = invoke.mock.calls[invoke.mock.calls.length - 1];
        const messages = lastCallArgs[0] as Array<{ content: string }>;
        expect(messages).toHaveLength(2);
        expect(messages[0].content).toBe(`SYS [${field}]`);
        expect(messages[1].content).toContain(`USR [${field}]`);
        expect(messages[1].content).toContain('id: c-xyz');
        expect(messages[1].content).toContain('title: Alpha');
        expect(messages[1].content).toContain('tags: math');
        expect(messages[1].content).toContain('prerequisites: basic-algebra');
        expect(messages[1].content).toContain('beta gamma');
      }
    });

    it('renders "(none)" when tags is empty', async () => {
      withStructuredOutputMock.mockImplementation((_schema, opts) => {
        const invoke = vi.fn();
        invokeMocks.set(opts.name, invoke);
        return { invoke };
      });
      const adapter = new LangChainContentClassifierAdapter(makeConfig());
      await adapter.classify(makeInput(), makePrompt());
      setAllFieldsFulfilled();

      await adapter.classify(makeInput({ chunkId: 'c-empty', tags: [] }), makePrompt());

      const invoke = invokeMocks.get('renderingClarity')!;
      const lastCallArgs = invoke.mock.calls[invoke.mock.calls.length - 1];
      const messages = lastCallArgs[0] as Array<{ content: string }>;
      expect(messages[1].content).toContain('tags: (none)');
    });
  });
});
