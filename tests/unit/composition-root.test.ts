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

const ClassifierAdapterMock = vi.fn(function FakeClassifier(this: { classify: () => void }): void {
  this.classify = () => undefined;
});
vi.mock('../../src/adapters/langchain/content-classifier-adapter.js', () => ({
  LangChainContentClassifierAdapter: ClassifierAdapterMock,
}));
vi.mock('../../src/adapters/langchain/embedding-adapter.js', () => ({
  LangChainEmbeddingAdapter: FakeCtor,
}));

const { createAppContext } = await import('../../src/composition-root.js');

describe('createAppContext — classifier wiring', () => {
  beforeEach(() => {
    ClassifierAdapterMock.mockClear();
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
});
