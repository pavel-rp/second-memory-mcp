import { describe, it, expect, vi } from 'vitest';
import {
  createTopicWithChunks,
  updateTopicSummary,
  updateTopicMetadata,
  type TopicCreationInput,
  type TopicDeps,
} from '../../../src/orchestration/topic-workflows.js';
import type { TransactionPorts } from '../../../src/ports/unit-of-work-port.js';
import type { EmbeddingPort } from '../../../src/ports/embedding-port.js';
import type { LearningTopic } from '../../../src/domain/types/entities.js';
import type { LinterRule } from '../../../src/domain/services/chunk-linter.js';
import {
  stubChunkRepository,
  stubTopicRepository,
  stubSessionRepository,
  stubUnitOfWork,
} from '../../helpers/stub-ports.js';

// --- createTopicWithChunks ---

function stubTxPorts(): TransactionPorts {
  return {
    topics: stubTopicRepository({
      create: vi.fn().mockResolvedValue({ success: true, data: undefined }),
    }),
    chunks: stubChunkRepository({
      create: vi.fn().mockResolvedValue(undefined),
    }),
    sessions: stubSessionRepository(),
  };
}

function stubDeps(options?: { embedding?: EmbeddingPort }): {
  deps: TopicDeps;
  txPorts: TransactionPorts;
} {
  const txPorts = stubTxPorts();
  return {
    deps: {
      topics: stubTopicRepository({
        saveSummaryEmbedding: vi.fn().mockResolvedValue(1),
      }),
      chunks: stubChunkRepository({
        saveContentEmbedding: vi.fn().mockResolvedValue(1),
      }),
      unitOfWork: stubUnitOfWork(undefined, txPorts),
      ...(options?.embedding ? { embedding: options.embedding } : {}),
    },
    txPorts,
  };
}

function inputWithContent(): TopicCreationInput {
  return {
    topicTitle: 'Algebra Basics',
    subject: 'Math',
    topicSummary: 'An introduction to algebra',
    topicDescription: 'Describes algebra basics',
    chunks: [
      {
        id: 'chunk-a',
        title: 'Variables',
        content: 'Variables are symbols representing numbers',
        difficulty: 3,
        estimatedDuration: 15,
        chunkType: 'concept',
      },
    ],
  };
}

describe('createTopicWithChunks', () => {
  it('creates topic and chunks without embedding', async () => {
    const { deps, txPorts } = stubDeps();
    const input = inputWithContent();

    const result = await createTopicWithChunks(input, deps);

    expect(result.success).toBe(true);
    expect(result.topic).toBeDefined();
    expect(result.topic!.topicTitle).toBe('Algebra Basics');
    expect(result.topic!.subject).toBe('Math');
    expect(result.topic!.topicSummary).toBe('An introduction to algebra');
    expect(result.topic!.chunks).toHaveLength(1);
    expect(result.topic!.chunks[0].title).toBe('Variables');
    expect(txPorts.topics.create as ReturnType<typeof vi.fn>).toHaveBeenCalledOnce();
    expect(txPorts.chunks.create as ReturnType<typeof vi.fn>).toHaveBeenCalledOnce();
    // No embedding port → saveSummaryEmbedding should not be called
    expect(deps.topics.saveSummaryEmbedding).not.toHaveBeenCalled();
  });

  it('generates embeddings when embedding port is provided', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
      embedTexts: vi.fn().mockResolvedValue([[0.4, 0.5, 0.6]]),
      getDimensions: vi.fn().mockReturnValue(3),
    };
    const { deps } = stubDeps({ embedding });
    const input = inputWithContent();

    const result = await createTopicWithChunks(input, deps);

    expect(result.success).toBe(true);
    // Summary embedding
    expect(embedding.embedText).toHaveBeenCalledWith('An introduction to algebra');
    expect(deps.topics.saveSummaryEmbedding).toHaveBeenCalledOnce();
    // Chunk content embedding
    expect(embedding.embedTexts).toHaveBeenCalledWith([
      'Variables are symbols representing numbers',
    ]);
    expect(deps.chunks.saveContentEmbedding).toHaveBeenCalledOnce();
  });

  it('returns success when embedding fails (fail-open)', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn().mockRejectedValue(new Error('provider down')),
      embedTexts: vi.fn().mockRejectedValue(new Error('provider down')),
      getDimensions: vi.fn().mockReturnValue(3),
    };
    const { deps } = stubDeps({ embedding });
    const input = inputWithContent();

    const result = await createTopicWithChunks(input, deps);

    expect(result.success).toBe(true);
    expect(result.topic).toBeDefined();
  });

  it('skips chunk embedding when chunks have no content', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn().mockResolvedValue([0.1, 0.2]),
      embedTexts: vi.fn(),
      getDimensions: vi.fn().mockReturnValue(2),
    };
    const { deps } = stubDeps({ embedding });
    const input: TopicCreationInput = {
      topicTitle: 'No Content Topic',
      subject: 'Science',
      topicSummary: 'A topic with no chunk content',
      chunks: [
        {
          id: 'c1',
          title: 'Empty Chunk',
          difficulty: 3,
          estimatedDuration: 10,
          chunkType: 'concept',
        },
      ],
    };

    const result = await createTopicWithChunks(input, deps);

    expect(result.success).toBe(true);
    expect(embedding.embedText).toHaveBeenCalledWith('A topic with no chunk content');
    expect(embedding.embedTexts).not.toHaveBeenCalled();
  });

  it('skips saveSummaryEmbedding when embedText returns null', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn().mockResolvedValue(null),
      embedTexts: vi.fn().mockResolvedValue([]),
      getDimensions: vi.fn().mockReturnValue(3),
    };
    const { deps } = stubDeps({ embedding });
    const input: TopicCreationInput = {
      topicTitle: 'Null Vector Topic',
      subject: 'Math',
      topicSummary: 'A summary that yields null vector',
      chunks: [
        { id: 'c1', title: 'Chunk', difficulty: 5, estimatedDuration: 10, chunkType: 'concept' },
      ],
    };

    const result = await createTopicWithChunks(input, deps);

    expect(result.success).toBe(true);
    expect(embedding.embedText).toHaveBeenCalledWith('A summary that yields null vector');
    expect(deps.topics.saveSummaryEmbedding).not.toHaveBeenCalled();
  });

  it('succeeds when saveSummaryEmbedding returns 0 rows', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn().mockResolvedValue([0.1, 0.2]),
      embedTexts: vi.fn().mockResolvedValue([]),
      getDimensions: vi.fn().mockReturnValue(2),
    };
    const { deps } = stubDeps({ embedding });
    (deps.topics.saveSummaryEmbedding as ReturnType<typeof vi.fn>).mockResolvedValue(0);
    const input: TopicCreationInput = {
      topicTitle: 'Zero Row Topic',
      subject: 'Math',
      topicSummary: 'Summary text',
      chunks: [
        { id: 'c1', title: 'Chunk', difficulty: 5, estimatedDuration: 10, chunkType: 'concept' },
      ],
    };

    const result = await createTopicWithChunks(input, deps);

    expect(result.success).toBe(true);
    expect(deps.topics.saveSummaryEmbedding).toHaveBeenCalledOnce();
  });

  it('skips saveContentEmbedding when embedTexts returns null vector', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn().mockResolvedValue(null),
      embedTexts: vi.fn().mockResolvedValue([null]),
      getDimensions: vi.fn().mockReturnValue(3),
    };
    const { deps } = stubDeps({ embedding });
    const input: TopicCreationInput = {
      topicTitle: 'Null Chunk Vector',
      subject: 'Math',
      topicSummary: 'Summary for null chunk vector test',
      chunks: [
        {
          id: 'c1',
          title: 'Chunk',
          content: 'Some content',
          difficulty: 5,
          estimatedDuration: 10,
          chunkType: 'concept',
        },
      ],
    };

    const result = await createTopicWithChunks(input, deps);

    expect(result.success).toBe(true);
    expect(embedding.embedTexts).toHaveBeenCalledWith(['Some content']);
    expect(deps.chunks.saveContentEmbedding).not.toHaveBeenCalled();
  });

  it('succeeds when saveContentEmbedding returns 0 rows', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn().mockResolvedValue(null),
      embedTexts: vi.fn().mockResolvedValue([[0.1, 0.2]]),
      getDimensions: vi.fn().mockReturnValue(2),
    };
    const { deps } = stubDeps({ embedding });
    (deps.chunks.saveContentEmbedding as ReturnType<typeof vi.fn>).mockResolvedValue(0);
    const input: TopicCreationInput = {
      topicTitle: 'Zero Row Chunk',
      subject: 'Math',
      topicSummary: 'Summary for zero row chunk test',
      chunks: [
        {
          id: 'c1',
          title: 'Chunk',
          content: 'Content here',
          difficulty: 5,
          estimatedDuration: 10,
          chunkType: 'concept',
        },
      ],
    };

    const result = await createTopicWithChunks(input, deps);

    expect(result.success).toBe(true);
    expect(deps.chunks.saveContentEmbedding).toHaveBeenCalledOnce();
  });

  it('returns retryable database error when unitOfWork throws', async () => {
    const { deps } = stubDeps();
    deps.unitOfWork.execute = vi.fn().mockRejectedValue(new Error('connection lost'));
    const input = inputWithContent();

    const result = await createTopicWithChunks(input, deps);

    expect(result.success).toBe(false);
    expect(result.error).toEqual({
      type: 'database',
      message: 'connection lost',
      retryable: true,
    });
  });

  it('persists condensedSummary when provided in chunk definitions', async () => {
    const { deps, txPorts } = stubDeps();
    const input: TopicCreationInput = {
      topicTitle: 'Algebra',
      subject: 'Math',
      topicSummary: 'Algebra summary',
      chunks: [
        {
          id: 'chunk-a',
          title: 'Variables',
          content: 'Variables content',
          difficulty: 3,
          estimatedDuration: 15,
          chunkType: 'new',
          condensedSummary: 'Variables represent unknown values.',
        },
      ],
    };

    const result = await createTopicWithChunks(input, deps);

    expect(result.success).toBe(true);
    const createCall = (txPorts.chunks.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(createCall.condensedSummary).toBe('Variables represent unknown values.');
  });

  it('persists null condensedSummary when omitted from chunk definitions', async () => {
    const { deps, txPorts } = stubDeps();
    const input = inputWithContent();

    const result = await createTopicWithChunks(input, deps);

    expect(result.success).toBe(true);
    const createCall = (txPorts.chunks.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(createCall.condensedSummary).toBeNull();
  });

  it('persists dependencyGraphType on topic when provided', async () => {
    const { deps, txPorts } = stubDeps();
    const input: TopicCreationInput = {
      ...inputWithContent(),
      dependencyGraphType: 'convergent',
    };

    const result = await createTopicWithChunks(input, deps);

    expect(result.success).toBe(true);
    const topicCreate = (txPorts.topics.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(topicCreate.dependencyGraphType).toBe('convergent');
    expect(result.topic!.dependencyGraphType).toBe('convergent');
  });

  it('persists null dependencyGraphType when omitted', async () => {
    const { deps, txPorts } = stubDeps();
    const input = inputWithContent();

    const result = await createTopicWithChunks(input, deps);

    expect(result.success).toBe(true);
    const topicCreate = (txPorts.topics.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(topicCreate.dependencyGraphType).toBeNull();
    expect(result.topic!.dependencyGraphType).toBeNull();
  });

  it('persists knowledgeType on chunks when provided', async () => {
    const { deps, txPorts } = stubDeps();
    const input: TopicCreationInput = {
      ...inputWithContent(),
      chunks: [
        {
          ...inputWithContent().chunks[0],
          knowledgeType: 'concept',
        },
      ],
    };

    const result = await createTopicWithChunks(input, deps);

    expect(result.success).toBe(true);
    const chunkCreate = (txPorts.chunks.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(chunkCreate.knowledgeType).toBe('concept');
    expect(result.topic!.chunks[0].knowledgeType).toBe('concept');
  });

  it('persists null knowledgeType on chunks when omitted', async () => {
    const { deps, txPorts } = stubDeps();
    const input = inputWithContent();

    const result = await createTopicWithChunks(input, deps);

    expect(result.success).toBe(true);
    const chunkCreate = (txPorts.chunks.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(chunkCreate.knowledgeType).toBeNull();
    expect(result.topic!.chunks[0].knowledgeType).toBeNull();
  });

  it('short-circuits on blocking linter finding without invoking unitOfWork.execute', async () => {
    const { deps, txPorts } = stubDeps();
    const blockingRule: LinterRule = {
      name: 'no-empty-content',
      scope: 'chunk',
      run: chunk => [
        {
          chunkId: chunk.chunkId,
          rule: 'no-empty-content',
          severity: 'blocking',
          category: 'content',
          detail: 'content is too short',
        },
      ],
    };
    deps.linterRules = [blockingRule];

    const result = await createTopicWithChunks(inputWithContent(), deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('content_quality');
    expect(result.error?.retryable).toBe(false);
    expect(result.error?.findings).toHaveLength(1);
    expect(result.error?.findings?.[0].severity).toBe('blocking');
    expect(deps.unitOfWork.execute).not.toHaveBeenCalled();
    expect(txPorts.topics.create).not.toHaveBeenCalled();
    expect(txPorts.chunks.create).not.toHaveBeenCalled();
  });

  it('proceeds to creation when linter returns only warnings', async () => {
    const { deps, txPorts } = stubDeps();
    const warningRule: LinterRule = {
      name: 'soft-check',
      scope: 'chunk',
      run: chunk => [
        {
          chunkId: chunk.chunkId,
          rule: 'soft-check',
          severity: 'warning',
          category: 'style',
          detail: 'could be clearer',
        },
      ],
    };
    deps.linterRules = [warningRule];

    const result = await createTopicWithChunks(inputWithContent(), deps);

    expect(result.success).toBe(true);
    expect(deps.unitOfWork.execute).toHaveBeenCalledOnce();
    expect(txPorts.topics.create as ReturnType<typeof vi.fn>).toHaveBeenCalledOnce();
  });

  it('preserves pre-NEU-613 behavior when linterRules is undefined', async () => {
    const { deps } = stubDeps();
    expect(deps.linterRules).toBeUndefined();

    const result = await createTopicWithChunks(inputWithContent(), deps);

    expect(result.success).toBe(true);
    expect(deps.unitOfWork.execute).toHaveBeenCalledOnce();
  });

  it('preserves pre-NEU-613 behavior when linterRules is an empty array', async () => {
    const { deps } = stubDeps();
    deps.linterRules = [];

    const result = await createTopicWithChunks(inputWithContent(), deps);

    expect(result.success).toBe(true);
    expect(deps.unitOfWork.execute).toHaveBeenCalledOnce();
  });

  it('routes throwing linter rules through the onRuleError plumb without aborting creation', async () => {
    const { deps } = stubDeps();
    const throwingRule: LinterRule = {
      name: 'boom-rule',
      scope: 'chunk',
      run: () => {
        throw new Error('rule exploded');
      },
    };
    deps.linterRules = [throwingRule];

    const result = await createTopicWithChunks(inputWithContent(), deps);

    expect(result.success).toBe(true);
    expect(deps.unitOfWork.execute).toHaveBeenCalledOnce();
  });

  it('includes blocking count in error message for content_quality', async () => {
    const { deps } = stubDeps();
    deps.linterRules = [
      {
        name: 'multi',
        scope: 'chunk',
        run: chunk => [
          {
            chunkId: chunk.chunkId,
            rule: 'multi',
            severity: 'blocking',
            category: 'content',
            detail: 'bad',
          },
        ],
      },
    ];
    const input: TopicCreationInput = {
      ...inputWithContent(),
      chunks: [
        { ...inputWithContent().chunks[0], id: 'c1' },
        { ...inputWithContent().chunks[0], id: 'c2' },
      ],
    };

    const result = await createTopicWithChunks(input, deps);

    expect(result.error?.message).toContain('2');
    expect(result.error?.message).toContain('findings');
  });
});

// --- updateTopicSummary ---

function stubTopic(overrides?: Partial<LearningTopic>): LearningTopic {
  return {
    id: 'topic-1',
    title: 'Test Topic',
    subject: 'Math',
    summary: 'Old summary',
    summaryVersion: 1,
    summaryUpdatedAt: 1000,
    dependencyGraphType: null,
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  };
}

function summaryDeps(options?: { embedding?: EmbeddingPort }): TopicDeps {
  return {
    topics: stubTopicRepository({
      getById: vi.fn().mockResolvedValue(stubTopic()),
      update: vi.fn().mockResolvedValue({ success: true, data: { changesApplied: 1 } }),
      saveSummaryEmbedding: vi.fn().mockResolvedValue(1),
    }),
    chunks: stubChunkRepository({
      saveContentEmbedding: vi.fn().mockResolvedValue(1),
    }),
    unitOfWork: stubUnitOfWork(),
    ...(options?.embedding ? { embedding: options.embedding } : {}),
  };
}

describe('updateTopicSummary', () => {
  it('updates summary and re-embeds on happy path', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn().mockResolvedValue([0.1, 0.2]),
      embedTexts: vi.fn(),
      getDimensions: vi.fn().mockReturnValue(2),
    };
    const deps = summaryDeps({ embedding });

    const result = await updateTopicSummary('topic-1', 'New summary text', deps);

    expect(result.success).toBe(true);
    expect(result.topic).toBeDefined();
    // Stale embedding cleared first
    expect(deps.topics.saveSummaryEmbedding).toHaveBeenCalledWith('topic-1', null);
    // Then update called with incremented version
    expect(deps.topics.update).toHaveBeenCalledWith(
      'topic-1',
      expect.objectContaining({
        summary: 'New summary text',
        summaryVersion: 2,
      })
    );
    // New embedding saved
    expect(deps.topics.saveSummaryEmbedding).toHaveBeenCalledWith('topic-1', [0.1, 0.2]);
  });

  it('returns not_found when topic does not exist', async () => {
    const deps = summaryDeps();
    (deps.topics.getById as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const result = await updateTopicSummary('missing-id', 'Summary', deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('not_found');
  });

  it('returns validation error when summary exceeds MAX_SUMMARY_SIZE', async () => {
    const deps = summaryDeps();

    const result = await updateTopicSummary('topic-1', 'x'.repeat(5001), deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('validation');
    expect(result.error?.field).toBe('summary');
  });

  it('returns validation error when summary is empty', async () => {
    const deps = summaryDeps();

    const result = await updateTopicSummary('topic-1', '', deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('validation');
    expect(result.error?.field).toBe('summary');
  });

  it('clears stale embedding but skips save when embedText returns null', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn().mockResolvedValue(null),
      embedTexts: vi.fn(),
      getDimensions: vi.fn().mockReturnValue(2),
    };
    const deps = summaryDeps({ embedding });

    const result = await updateTopicSummary('topic-1', 'Valid summary', deps);

    expect(result.success).toBe(true);
    // Called once with null (stale clear), never with a vector
    expect(deps.topics.saveSummaryEmbedding).toHaveBeenCalledWith('topic-1', null);
    expect(deps.topics.saveSummaryEmbedding).toHaveBeenCalledTimes(1);
  });

  it('returns success when embedText throws (fail-open)', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn().mockRejectedValue(new Error('provider down')),
      embedTexts: vi.fn(),
      getDimensions: vi.fn().mockReturnValue(2),
    };
    const deps = summaryDeps({ embedding });

    const result = await updateTopicSummary('topic-1', 'Valid summary', deps);

    expect(result.success).toBe(true);
  });

  it('returns database error when getById throws', async () => {
    const deps = summaryDeps();
    (deps.topics.getById as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('db crash'));

    const result = await updateTopicSummary('topic-1', 'Valid summary', deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('database');
  });
});

// --- updateTopicMetadata ---

function metadataDeps(): { deps: TopicDeps; txPorts: TransactionPorts } {
  const txPorts: TransactionPorts = {
    topics: stubTopicRepository({
      update: vi.fn().mockResolvedValue({ success: true, data: { changesApplied: 1 } }),
    }),
    chunks: stubChunkRepository({
      list: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockResolvedValue(undefined),
    }),
    sessions: stubSessionRepository(),
  };
  return {
    deps: {
      topics: stubTopicRepository({
        getById: vi.fn().mockResolvedValue(stubTopic()),
        update: vi.fn().mockResolvedValue({ success: true, data: { changesApplied: 1 } }),
        saveSummaryEmbedding: vi.fn(),
      }),
      chunks: stubChunkRepository({
        saveContentEmbedding: vi.fn(),
      }),
      unitOfWork: stubUnitOfWork(undefined, txPorts),
    },
    txPorts,
  };
}

describe('updateTopicMetadata', () => {
  it('updates title without transaction when no subject change', async () => {
    const { deps } = metadataDeps();
    const updatedTopic = stubTopic({ title: 'New Title' });
    (deps.topics.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubTopic()) // first call: current
      .mockResolvedValueOnce(updatedTopic); // second call: after update

    const result = await updateTopicMetadata('topic-1', { title: 'New Title' }, deps);

    expect(result.success).toBe(true);
    expect(result.topic?.title).toBe('New Title');
    // Should call topics.update directly, not unitOfWork
    expect(deps.topics.update).toHaveBeenCalledWith(
      'topic-1',
      expect.objectContaining({
        title: 'New Title',
      })
    );
    expect(deps.unitOfWork.execute).not.toHaveBeenCalled();
  });

  it('returns not_found when topic does not exist', async () => {
    const { deps } = metadataDeps();
    (deps.topics.getById as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const result = await updateTopicMetadata('missing-id', { title: 'New' }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('not_found');
  });

  it('returns validation error for empty title', async () => {
    const { deps } = metadataDeps();

    const result = await updateTopicMetadata('topic-1', { title: '' }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('validation');
    expect(result.error?.field).toBe('title');
  });

  it('cascades subject change to chunks via unitOfWork', async () => {
    const { deps, txPorts } = metadataDeps();
    const chunk = { id: 'c1', topicId: 'topic-1', subject: 'Math' };
    (txPorts.chunks.list as ReturnType<typeof vi.fn>).mockResolvedValue([chunk]);
    const updatedTopic = stubTopic({ subject: 'Science' });
    (deps.topics.getById as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(stubTopic())
      .mockResolvedValueOnce(updatedTopic);

    const result = await updateTopicMetadata('topic-1', { subject: 'Science' }, deps);

    expect(result.success).toBe(true);
    expect(deps.unitOfWork.execute).toHaveBeenCalledOnce();
    // Topic updated inside transaction
    expect(txPorts.topics.update).toHaveBeenCalledWith(
      'topic-1',
      expect.objectContaining({
        subject: 'Science',
      })
    );
    // Chunk subject cascaded
    expect(txPorts.chunks.update).toHaveBeenCalledWith(
      'c1',
      expect.objectContaining({
        subject: 'Science',
      })
    );
  });

  it('returns error when title-only update fails', async () => {
    const { deps } = metadataDeps();
    (deps.topics.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: { type: 'database', message: 'update failed' },
    });

    const result = await updateTopicMetadata('topic-1', { title: 'New Title' }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('update failed');
  });

  it('returns database error when getById throws', async () => {
    const { deps } = metadataDeps();
    (deps.topics.getById as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('db crash'));

    const result = await updateTopicMetadata('topic-1', { title: 'New' }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('database');
  });

  it('returns validation error for empty subject', async () => {
    const { deps } = metadataDeps();

    const result = await updateTopicMetadata('topic-1', { subject: '' }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('validation');
    expect(result.error?.field).toBe('subject');
  });

  it('returns database error when subject-change transaction fails', async () => {
    const { deps } = metadataDeps();
    (deps.unitOfWork.execute as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('tx failure')
    );

    const result = await updateTopicMetadata('topic-1', { subject: 'Science' }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('database');
    expect(result.error?.message).toContain('tx failure');
  });

  it('returns validation error for title exceeding max length', async () => {
    const { deps } = metadataDeps();

    const result = await updateTopicMetadata('topic-1', { title: 'a'.repeat(201) }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('validation');
    expect(result.error?.field).toBe('title');
  });

  it('returns validation error for subject exceeding max length', async () => {
    const { deps } = metadataDeps();

    const result = await updateTopicMetadata('topic-1', { subject: 'a'.repeat(101) }, deps);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('validation');
    expect(result.error?.field).toBe('subject');
  });
});
