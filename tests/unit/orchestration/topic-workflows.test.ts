import { describe, it, expect, vi } from 'vitest';
import {
  createTopicWithChunks,
  validateTopicCreationInput,
  type TopicCreationInput,
  type TopicDeps,
} from '../../../src/orchestration/topic-workflows.js';
import type { TransactionPorts } from '../../../src/ports/unit-of-work-port.js';
import type { EmbeddingPort } from '../../../src/ports/embedding-port.js';

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
        execute: vi.fn(async <T>(cb: (ports: TransactionPorts) => Promise<T>) => cb(txPorts)),
      },
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
