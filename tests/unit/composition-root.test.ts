import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DB and adapter module-level so composition-root can be instantiated
// without a real connection. We don't need adapter internals — just verify
// the classifier wiring logic.

vi.mock('../../src/infrastructure/db/operations.js', () => ({
  getSql: vi.fn().mockReturnValue({}),
}));

function FakeCtor(this: unknown): void {
  // no-op
}

vi.mock('../../src/adapters/drizzle/chunk-repository.js', () => ({
  DrizzleChunkRepository: FakeCtor,
}));
vi.mock('../../src/adapters/drizzle/topic-repository.js', () => ({
  DrizzleTopicRepository: FakeCtor,
}));
vi.mock('../../src/adapters/drizzle/session-repository.js', () => ({
  DrizzleSessionRepository: FakeCtor,
}));
vi.mock('../../src/adapters/drizzle/search-adapter.js', () => ({
  DrizzleSearchAdapter: FakeCtor,
}));
vi.mock('../../src/adapters/drizzle/review-persistence-adapter.js', () => ({
  DrizzleReviewPersistenceAdapter: FakeCtor,
}));
vi.mock('../../src/adapters/drizzle/unit-of-work-adapter.js', () => ({
  DrizzleUnitOfWorkAdapter: FakeCtor,
}));
vi.mock('../../src/adapters/drizzle/session-question-repository.js', () => ({
  DrizzleSessionQuestionRepository: FakeCtor,
}));
vi.mock('../../src/adapters/drizzle/notes-repository.js', () => ({
  DrizzleNotesRepository: FakeCtor,
}));
vi.mock('../../src/adapters/drizzle/context-token-repository.js', () => ({
  DrizzleContextTokenRepository: FakeCtor,
}));
vi.mock('../../src/adapters/drizzle/linter-validation-repository.js', () => ({
  DrizzleLinterValidationRepository: FakeCtor,
}));

// Registered rules are controlled per test via `mockCreateTier1aRules` and
// `mockCreateTier1bRules` so we can verify both the happy path (every
// registered rule has a matching RULE_INTENT entry) and the parity-warn path
// (a registered rule with no intent produces a logged warning). The composition
// root concatenates both factories before threading them through
// `applyEligibilityToRules`.
const mockCreateTier1aRules = vi.fn();
const mockCreateTier1bRules = vi.fn();
vi.mock('../../src/domain/services/linter-rules/index.js', () => ({
  createTier1aRules: mockCreateTier1aRules,
  createTier1bRules: mockCreateTier1bRules,
}));

const mockLoggerWarn = vi.fn();
vi.mock('../../src/shared/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn(), debug: vi.fn() },
  getRequestLogger: () => ({
    info: vi.fn(),
    warn: mockLoggerWarn,
    error: vi.fn(),
    fatal: vi.fn(),
    debug: vi.fn(),
  }),
  logEvent: vi.fn(),
}));

const ClassifierAdapterMock = vi.fn(function FakeClassifier(this: { classify: () => void }): void {
  this.classify = () => undefined;
});
vi.mock('../../src/adapters/langchain/content-classifier-adapter.js', () => ({
  LangChainContentClassifierAdapter: ClassifierAdapterMock,
}));
vi.mock('../../src/adapters/langchain/embedding-adapter.js', () => ({
  LangChainEmbeddingAdapter: FakeCtor,
}));

const { createAppContext, loadInitialRuleReports } = await import('../../src/composition-root.js');
import type { LinterValidationRepository } from '../../src/ports/linter-validation-repository.js';

describe('createAppContext — classifier wiring', () => {
  beforeEach(() => {
    ClassifierAdapterMock.mockClear();
    mockLoggerWarn.mockClear();
    // Default: every registered rule name matches a RULE_INTENT entry, so the
    // parity check stays silent. Individual tests override as needed.
    mockCreateTier1bRules.mockReturnValue([
      {
        name: 'tier1b.phantom-prerequisite',
        tier: 'tier1b',
        blockingEligible: false,
        scope: 'chunk',
        run: () => [],
      },
    ]);
    mockCreateTier1aRules.mockReturnValue([
      {
        name: 'tier1a.code-fence-balance',
        tier: 'tier1a',
        blockingEligible: true,
        scope: 'chunk',
        run: () => [],
      },
      {
        name: 'tier1a.table-structure',
        tier: 'tier1a',
        blockingEligible: true,
        scope: 'chunk',
        run: () => [],
      },
      {
        name: 'tier1a.heading-hierarchy',
        tier: 'tier1a',
        blockingEligible: true,
        scope: 'chunk',
        run: () => [],
      },
      {
        name: 'tier1a.details-nesting',
        tier: 'tier1a',
        blockingEligible: true,
        scope: 'chunk',
        run: () => [],
      },
      {
        name: 'tier1a.duplicate-h1',
        tier: 'tier1a',
        blockingEligible: true,
        scope: 'chunk',
        run: () => [],
      },
    ]);
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('CLASSIFIER_')) {
        delete process.env[key];
      }
    }
  });

  it('does not construct the classifier adapter when CLASSIFIER_PROVIDER is unset', () => {
    createAppContext();
    expect(ClassifierAdapterMock).not.toHaveBeenCalled();
  });

  it('constructs the classifier adapter when CLASSIFIER_PROVIDER=openai', () => {
    process.env.CLASSIFIER_PROVIDER = 'openai';
    process.env.CLASSIFIER_OPENAI_API_KEY = 'sk-test';
    createAppContext();
    expect(ClassifierAdapterMock).toHaveBeenCalledTimes(1);
  });

  it('skips classifier construction when overrides explicitly set classifier: undefined', () => {
    process.env.CLASSIFIER_PROVIDER = 'openai';
    process.env.CLASSIFIER_OPENAI_API_KEY = 'sk-test';
    createAppContext({ classifier: undefined });
    expect(ClassifierAdapterMock).not.toHaveBeenCalled();
  });

  it('uses the override and skips construction when overrides provide a classifier', () => {
    process.env.CLASSIFIER_PROVIDER = 'openai';
    process.env.CLASSIFIER_OPENAI_API_KEY = 'sk-test';
    const stub = { classify: vi.fn() };
    createAppContext({ classifier: stub });
    expect(ClassifierAdapterMock).not.toHaveBeenCalled();
  });

  it('stays silent on the parity check when every registered rule has a RULE_INTENT entry', () => {
    createAppContext();
    expect(mockLoggerWarn).not.toHaveBeenCalled();
  });

  it('constructs the tier2CircuitBreaker when CLASSIFIER_BLOCKING_FIELDS is non-empty (NEU-686)', () => {
    // Triggers the truthy side of the conditional `tier2CircuitBreaker` spread
    // in both `chunkDeps` and `topicDeps`. Without `CLASSIFIER_BLOCKING_FIELDS`
    // the breaker stays `undefined` and the spread is a no-op (covered by every
    // other test in this file).
    process.env.CLASSIFIER_BLOCKING_FIELDS = 'rendering_clarity';
    const ctx = createAppContext();
    expect(ctx).toBeDefined();
    expect(typeof ctx.createTopicWithChunks).toBe('function');
    expect(typeof ctx.createChunkWithTopic).toBe('function');
  });

  it('warns when a registered rule has no RULE_INTENT entry', () => {
    // Defensive branch: simulate a future contributor registering a rule
    // without updating RULE_INTENT. The composition root must log (not throw)
    // so the CI run surfaces the drift on the next `pnpm lint:validate`.
    mockCreateTier1aRules.mockReturnValue([
      {
        name: 'tier1a.code-fence-balance',
        tier: 'tier1a',
        blockingEligible: true,
        scope: 'chunk',
        run: () => [],
      },
      {
        name: 'tier1a.ghost-rule',
        tier: 'tier1a',
        blockingEligible: true,
        scope: 'chunk',
        run: () => [],
      },
    ]);
    createAppContext();
    expect(mockLoggerWarn).toHaveBeenCalledTimes(1);
    const msg = mockLoggerWarn.mock.calls[0][0] as string;
    expect(msg).toContain('Rule intent parity check');
    expect(msg).toContain('tier1a.ghost-rule');
  });

  it('exposes SR calculators that run with the injected interval-fuzz source (NEU-838)', () => {
    // Exercises the calculateNextReview / calculateNextReviewAdvanced closures,
    // which pass `Math.random()` as the real fuzz source at this boundary.
    const ctx = createAppContext();

    const basic = ctx.calculateNextReview({
      quality: 5,
      repetitions: 5,
      easeFactor: 2.5,
      interval: 20,
    });
    expect(basic.interval).toBeGreaterThanOrEqual(1);
    expect(typeof basic.nextReview).toBe('string');

    const advanced = ctx.calculateNextReviewAdvanced({
      quality: 5,
      repetitions: 5,
      easeFactor: 2.5,
      interval: 20,
      daysOverdue: 0,
      consecutiveFailures: 0,
    });
    expect(advanced.interval).toBeGreaterThanOrEqual(1);
    expect(typeof advanced.leech).toBe('boolean');
  });
});

describe('loadInitialRuleReports', () => {
  function stubRepo(overrides: Partial<LinterValidationRepository>): LinterValidationRepository {
    return {
      listCorpusByRule: vi.fn().mockResolvedValue([]),
      upsertCorpusEntry: vi.fn().mockResolvedValue(undefined),
      deleteCorpusEntry: vi.fn().mockResolvedValue(1),
      getReport: vi.fn().mockResolvedValue(null),
      upsertReport: vi.fn().mockResolvedValue(undefined),
      listReports: vi.fn().mockResolvedValue([]),
      ...overrides,
    };
  }

  it("returns the repository's report list on success", async () => {
    const reports = [
      {
        ruleId: 'tier1b.phantom-chapter',
        computedAt: new Date(),
        precisionHeldOut: 0.95,
        recallHeldOut: 0.8,
        f1HeldOut: 0.87,
        precisionAdversarial: 0.85,
        heldOutCount: 60,
        adversarialCount: 25,
        blockingEligible: true,
        thresholdsVersion: 1,
      },
    ];
    const repo = stubRepo({ listReports: vi.fn().mockResolvedValue(reports) });
    await expect(loadInitialRuleReports(repo)).resolves.toEqual(reports);
  });

  it('fails open to an empty array when the repository throws', async () => {
    // Startup must not be blocked by a flaky DB read — the composition root
    // boots with Tier 1b defaulted to `blockingEligible: false` and the
    // next `pnpm lint:validate` run will refresh the report table.
    const repo = stubRepo({
      listReports: vi.fn().mockRejectedValue(new Error('transient DB outage')),
    });
    await expect(loadInitialRuleReports(repo)).resolves.toEqual([]);
  });
});
