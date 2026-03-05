import { describe, it, expect, vi } from 'vitest';
import {
  createTopicWithChunks,
  updateTopicSummary,
  updateTopicMetadata,
  validateTopicCreationInput,
  type TopicCreationInput,
  type TopicDeps,
} from '../../../src/orchestration/topic-workflows.js';
import type { TransactionPorts } from '../../../src/ports/unit-of-work-port.js';
import type { EmbeddingPort } from '../../../src/ports/embedding-port.js';
import type { LearningTopic } from '../../../src/domain/types/entities.js';

function validInput(): TopicCreationInput {
  return {
    topicTitle: 'Valid Title',
    subject: 'Math',
    chunks: [
      {
        id: 'chunk-1',
        title: 'Chunk One',
        difficulty: 5,
        estimatedDuration: 30,
        chunkType: 'concept',
      },
    ],
  };
}

describe('validateTopicCreationInput', () => {
  describe('topic title', () => {
    it('rejects empty title', () => {
      const input = { ...validInput(), topicTitle: '' };
      expect(validateTopicCreationInput(input)).toEqual({
        valid: false,
        error: 'Invalid topic title',
      });
    });

    it('rejects title exceeding 200 characters', () => {
      const input = { ...validInput(), topicTitle: 'a'.repeat(201) };
      expect(validateTopicCreationInput(input)).toEqual({
        valid: false,
        error: 'Invalid topic title',
      });
    });

    it('accepts title at 200 characters', () => {
      const input = { ...validInput(), topicTitle: 'a'.repeat(200) };
      expect(validateTopicCreationInput(input)).toEqual({ valid: true });
    });
  });

  describe('subject', () => {
    it('rejects empty subject', () => {
      const input = { ...validInput(), subject: '' };
      expect(validateTopicCreationInput(input)).toEqual({
        valid: false,
        error: 'Invalid subject',
      });
    });

    it('rejects subject exceeding 100 characters', () => {
      const input = { ...validInput(), subject: 'a'.repeat(101) };
      expect(validateTopicCreationInput(input)).toEqual({
        valid: false,
        error: 'Invalid subject',
      });
    });

    it('accepts subject at 100 characters', () => {
      const input = { ...validInput(), subject: 'a'.repeat(100) };
      expect(validateTopicCreationInput(input)).toEqual({ valid: true });
    });
  });

  describe('chunks array', () => {
    it('rejects undefined chunks', () => {
      const input = { ...validInput(), chunks: undefined } as unknown as TopicCreationInput;
      expect(validateTopicCreationInput(input)).toEqual({
        valid: false,
        error: 'At least one chunk is required',
      });
    });

    it('rejects empty chunks', () => {
      const input = { ...validInput(), chunks: [] };
      expect(validateTopicCreationInput(input)).toEqual({
        valid: false,
        error: 'At least one chunk is required',
      });
    });

    it('rejects more than 20 chunks', () => {
      const chunks = Array.from({ length: 21 }, (_, i) => ({
        id: `chunk-${i}`,
        title: `Chunk ${i}`,
        difficulty: 5,
        estimatedDuration: 10,
        chunkType: 'concept',
      }));
      const input = { ...validInput(), chunks };
      expect(validateTopicCreationInput(input)).toEqual({
        valid: false,
        error: 'Maximum 20 chunks per topic',
      });
    });

    it('accepts exactly 20 chunks', () => {
      const chunks = Array.from({ length: 20 }, (_, i) => ({
        id: `chunk-${i}`,
        title: `Chunk ${i}`,
        difficulty: 5,
        estimatedDuration: 10,
        chunkType: 'concept',
      }));
      const input = { ...validInput(), chunks };
      expect(validateTopicCreationInput(input)).toEqual({ valid: true });
    });
  });

  describe('per-chunk validation', () => {
    it('rejects chunk with empty title', () => {
      const input = validInput();
      input.chunks[0].title = '';
      expect(validateTopicCreationInput(input)).toEqual({
        valid: false,
        error: 'Invalid chunk title',
      });
    });

    it('rejects chunk with title exceeding 200 characters', () => {
      const input = validInput();
      input.chunks[0].title = 'a'.repeat(201);
      expect(validateTopicCreationInput(input)).toEqual({
        valid: false,
        error: 'Invalid chunk title',
      });
    });

    it('rejects chunk with difficulty below 1', () => {
      const input = validInput();
      input.chunks[0].difficulty = 0;
      expect(validateTopicCreationInput(input)).toEqual({
        valid: false,
        error: 'Invalid chunk difficulty',
      });
    });

    it('rejects chunk with difficulty above 10', () => {
      const input = validInput();
      input.chunks[0].difficulty = 11;
      expect(validateTopicCreationInput(input)).toEqual({
        valid: false,
        error: 'Invalid chunk difficulty',
      });
    });

    it('rejects chunk with estimatedDuration below 1', () => {
      const input = validInput();
      input.chunks[0].estimatedDuration = 0;
      expect(validateTopicCreationInput(input)).toEqual({
        valid: false,
        error: 'Invalid chunk duration',
      });
    });

    it('rejects chunk with estimatedDuration above 120', () => {
      const input = validInput();
      input.chunks[0].estimatedDuration = 121;
      expect(validateTopicCreationInput(input)).toEqual({
        valid: false,
        error: 'Invalid chunk duration',
      });
    });

    it('accepts chunk title at 200 characters', () => {
      const input = validInput();
      input.chunks[0].title = 'a'.repeat(200);
      expect(validateTopicCreationInput(input)).toEqual({ valid: true });
    });

    it('accepts chunk difficulty at boundaries (1 and 10)', () => {
      const input = validInput();
      input.chunks[0].difficulty = 1;
      expect(validateTopicCreationInput(input)).toEqual({ valid: true });
      input.chunks[0].difficulty = 10;
      expect(validateTopicCreationInput(input)).toEqual({ valid: true });
    });

    it('accepts chunk estimatedDuration at boundaries (1 and 120)', () => {
      const input = validInput();
      input.chunks[0].estimatedDuration = 1;
      expect(validateTopicCreationInput(input)).toEqual({ valid: true });
      input.chunks[0].estimatedDuration = 120;
      expect(validateTopicCreationInput(input)).toEqual({ valid: true });
    });
  });

  describe('ordering', () => {
    it('returns first validation error when multiple chunks are invalid', () => {
      const input = validInput();
      input.chunks = [
        { id: 'c1', title: '', difficulty: 5, estimatedDuration: 10, chunkType: 'concept' },
        { id: 'c2', title: 'OK', difficulty: 0, estimatedDuration: 10, chunkType: 'concept' },
      ];
      expect(validateTopicCreationInput(input)).toEqual({
        valid: false,
        error: 'Invalid chunk title',
      });
    });
  });

  it('accepts fully valid input', () => {
    expect(validateTopicCreationInput(validInput())).toEqual({ valid: true });
  });
});

// --- createTopicWithChunks ---

function stubTxPorts() {
  return {
    topics: { create: vi.fn().mockResolvedValue({ success: true, data: undefined }) },
    chunks: { create: vi.fn().mockResolvedValue(undefined) },
    sessions: {},
  } as unknown as TransactionPorts;
}

function stubDeps(options?: { embedding?: EmbeddingPort }): {
  deps: TopicDeps;
  txPorts: TransactionPorts;
} {
  const txPorts = stubTxPorts();
  return {
    deps: {
      topics: {
        saveSummaryEmbedding: vi.fn().mockResolvedValue(1),
      } as unknown as TopicDeps['topics'],
      chunks: {
        saveContentEmbedding: vi.fn().mockResolvedValue(1),
      } as unknown as TopicDeps['chunks'],
      unitOfWork: {
        execute: vi.fn(async (cb: (ports: TransactionPorts) => Promise<unknown>) => cb(txPorts)),
      } as unknown as TopicDeps['unitOfWork'],
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

  it('skips embedding when no summary and no chunk content', async () => {
    const embedding: EmbeddingPort = {
      embedText: vi.fn(),
      embedTexts: vi.fn(),
      getDimensions: vi.fn().mockReturnValue(3),
    };
    const { deps } = stubDeps({ embedding });
    const input: TopicCreationInput = {
      topicTitle: 'No Content Topic',
      subject: 'Science',
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
    expect(embedding.embedText).not.toHaveBeenCalled();
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
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  };
}

function summaryDeps(options?: { embedding?: EmbeddingPort }): TopicDeps {
  return {
    topics: {
      getById: vi.fn().mockResolvedValue(stubTopic()),
      update: vi.fn().mockResolvedValue({ success: true, data: { changesApplied: 1 } }),
      saveSummaryEmbedding: vi.fn().mockResolvedValue(1),
    } as unknown as TopicDeps['topics'],
    chunks: {
      saveContentEmbedding: vi.fn().mockResolvedValue(1),
    } as unknown as TopicDeps['chunks'],
    unitOfWork: {
      execute: vi.fn(),
    } as unknown as TopicDeps['unitOfWork'],
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
    topics: {
      update: vi.fn().mockResolvedValue({ success: true, data: { changesApplied: 1 } }),
    },
    chunks: {
      list: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockResolvedValue(undefined),
    },
    sessions: {},
  } as unknown as TransactionPorts;
  return {
    deps: {
      topics: {
        getById: vi.fn().mockResolvedValue(stubTopic()),
        update: vi.fn().mockResolvedValue({ success: true, data: { changesApplied: 1 } }),
        saveSummaryEmbedding: vi.fn(),
      } as unknown as TopicDeps['topics'],
      chunks: {
        saveContentEmbedding: vi.fn(),
      } as unknown as TopicDeps['chunks'],
      unitOfWork: {
        execute: vi.fn(async (cb: (ports: TransactionPorts) => Promise<unknown>) => cb(txPorts)),
      } as unknown as TopicDeps['unitOfWork'],
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
});
