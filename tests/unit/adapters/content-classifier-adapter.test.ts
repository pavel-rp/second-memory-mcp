import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ClassifierConfig } from '../../../src/domain/config/classifier.js';
import type {
  ChunkClassifierInput,
  ClassifierPrompt,
} from '../../../src/domain/types/classifier.js';
import { VERDICT_FIELDS } from '../../../src/domain/types/classifier.js';

// ── Mock LangChain modules ──────────────────────────────────────
// The adapter uses dynamic `await import(...)` — vi.mock intercepts those.

type VerdictField = { score: number; rationale: string };

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
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

const { LangChainContentClassifierAdapter } =
  await import('../../../src/adapters/langchain/content-classifier-adapter.js');
const { logger } = await import('../../../src/shared/logger.js');

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
    blockingMode: false,
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

function makePrompt(overrides?: Partial<ClassifierPrompt>): ClassifierPrompt {
  return {
    systemPrompt: 'You are a classifier.',
    userPrompt: 'Grade this chunk.',
    ...overrides,
  };
}

function setAllFieldsFulfilled(): void {
  for (const field of VERDICT_FIELDS) {
    const invoke = invokeMocks.get(field);
    if (!invoke) throw new Error(`No invoke mock for ${field}`);
    const verdict: VerdictField = { score: 3, rationale: `rationale-${field}` };
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
        const invoke = vi.fn().mockResolvedValue({ score: 4, rationale: `r-${opts.name}` });
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
        expect(verdict[field]).toEqual({ score: 4, rationale: `r-${field}` });
      }
    });

    it('passes an explicit temperature to ChatOpenAI when config.temperature is not null', async () => {
      withStructuredOutputMock.mockImplementation((_schema, opts) => {
        const invoke = vi.fn().mockResolvedValue({ score: 1, rationale: `r-${opts.name}` });
        invokeMocks.set(opts.name, invoke);
        return { invoke };
      });
      const adapter = new LangChainContentClassifierAdapter(makeConfig({ temperature: 0.5 }));

      await adapter.classify(makeInput(), makePrompt());

      expect(ChatOpenAIMock).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0.5 }));
    });

    it('reuses the initialized model across multiple classify calls', async () => {
      withStructuredOutputMock.mockImplementation((_schema, opts) => {
        const invoke = vi.fn().mockResolvedValue({ score: 2, rationale: `r-${opts.name}` });
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
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('No classifier provider configured')
      );
    });

    it('stays unavailable when openaiApiKey is missing', async () => {
      const adapter = new LangChainContentClassifierAdapter(makeConfig({ openaiApiKey: null }));

      const verdict = await adapter.classify(makeInput(), makePrompt());

      expect(ChatOpenAIMock).not.toHaveBeenCalled();
      expect(verdict.renderingClarity).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('no API key available'));
    });

    it('catches ChatOpenAI constructor errors and stays unavailable', async () => {
      ChatOpenAIMock.mockImplementationOnce(() => {
        throw new Error('ctor boom');
      });
      const adapter = new LangChainContentClassifierAdapter(makeConfig());

      const verdict = await adapter.classify(makeInput(), makePrompt());

      for (const field of VERDICT_FIELDS) {
        expect(verdict[field]).toBeNull();
      }
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize classifier adapter'),
        expect.any(Error)
      );
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
      (logger.warn as unknown as { mockClear: () => void }).mockClear();

      const verdict = await adapter.classify(makeInput({ chunkId: 'c-2' }), makePrompt());

      for (const field of VERDICT_FIELDS) {
        expect(verdict[field]).toEqual({ score: 3, rationale: `rationale-${field}` });
      }
      expect(logger.warn).not.toHaveBeenCalledWith(expect.stringContaining('fields failed'));
    });

    it('sets a single failed field to null while others populate, and logs the failure', async () => {
      withStructuredOutputMock.mockImplementation((_schema, opts) => {
        const invoke = vi.fn();
        invokeMocks.set(opts.name, invoke);
        return { invoke };
      });
      const adapter = new LangChainContentClassifierAdapter(makeConfig());
      await adapter.classify(makeInput(), makePrompt());
      setAllFieldsFulfilled();
      invokeMocks.get('vocabularyAppropriate')!.mockRejectedValueOnce(new Error('rate-limit'));

      const verdict = await adapter.classify(makeInput({ chunkId: 'c-2' }), makePrompt());

      expect(verdict.vocabularyAppropriate).toBeNull();
      expect(verdict.renderingClarity).toEqual({
        score: 3,
        rationale: 'rationale-renderingClarity',
      });
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('vocabularyAppropriate'));
    });

    it('returns all-null verdict when every field fails and logs one aggregated warn', async () => {
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
      (logger.warn as unknown as { mockClear: () => void }).mockClear();

      const verdict = await adapter.classify(makeInput({ chunkId: 'c-2' }), makePrompt());

      for (const field of VERDICT_FIELDS) {
        expect(verdict[field]).toBeNull();
      }
      const failedWarnCalls = (
        logger.warn as unknown as { mock: { calls: string[][] } }
      ).mock.calls.filter(call => call[0]?.includes('fields failed'));
      expect(failedWarnCalls.length).toBe(1);
      for (const field of VERDICT_FIELDS) {
        expect(failedWarnCalls[0][0]).toContain(field);
      }
    });

    it('sets a field to null when the runnable returns a schema-invalid verdict, and logs it as failed', async () => {
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

      const verdict = await adapter.classify(makeInput({ chunkId: 'c-2' }), makePrompt());

      expect(verdict.overallFit).toBeNull();
      expect(verdict.renderingClarity).toEqual({
        score: 3,
        rationale: 'rationale-renderingClarity',
      });
      // Schema-invalid responses should be surfaced in the aggregated warn,
      // not silently nulled.
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('overallFit'));
    });

    it('passes SystemMessage(systemPrompt) and HumanMessage(userPrompt + chunk payload) to invoke', async () => {
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

      const invoke = invokeMocks.get('renderingClarity')!;
      const lastCallArgs = invoke.mock.calls[invoke.mock.calls.length - 1];
      const messages = lastCallArgs[0] as Array<{ content: string }>;
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('SYS');
      expect(messages[1].content).toContain('USR');
      expect(messages[1].content).toContain('id: c-xyz');
      expect(messages[1].content).toContain('title: Alpha');
      expect(messages[1].content).toContain('tags: math');
      expect(messages[1].content).toContain('prerequisites: basic-algebra');
      expect(messages[1].content).toContain('beta gamma');
    });
  });
});
