import { describe, it, expect } from 'vitest';
import { mapChunkRowToLearningItem } from '../../../src/shared/chunk-mapping.js';
import type { ChunkWithTopicTitle } from '../../../src/ports/chunk-repository.js';

const NOW_MS = new Date('2025-06-15T12:00:00.000Z').getTime();

function makeRow(overrides: Partial<ChunkWithTopicTitle> = {}): ChunkWithTopicTitle {
  return {
    id: 'chunk-1',
    topicId: 'topic-1',
    title: 'Arrays',
    subject: 'CS',
    difficulty: 5,
    nextReviewAt: NOW_MS,
    easeFactor: 2.5,
    repetitions: 2,
    lastReviewedAt: NOW_MS - 86_400_000, // 1 day ago
    estimatedDuration: 10,
    intervalDays: 3,
    chunkType: 'review',
    contentStatus: 'final',
    condensedSummary: null,
    prerequisitesJson: ['prereq-1'],
    tagsJson: ['data-structures'],
    content: 'Arrays are contiguous memory blocks.',
    contentVersion: 2,
    contentUpdatedAt: NOW_MS - 3_600_000,
    createdAt: NOW_MS - 172_800_000,
    updatedAt: NOW_MS - 86_400_000,
    topicTitle: 'Data Structures',
    ...overrides,
  };
}

describe('mapChunkRowToLearningItem', () => {
  it('maps row to LearningItem without content by default', () => {
    const row = makeRow();
    const result = mapChunkRowToLearningItem(row);

    expect(result.id).toBe('chunk-1');
    expect(result.title).toBe('Arrays');
    expect(result.subject).toBe('CS');
    expect(result.difficulty).toBe(5);
    expect(result.easeFactor).toBe(2.5);
    expect(result.repetitions).toBe(2);
    expect(result.estimatedDuration).toBe(10);
    expect(result.chunkType).toBe('review');
    expect(result.prerequisites).toEqual(['prereq-1']);
    expect(result.tags).toEqual(['data-structures']);
    expect(result.topicId).toBe('topic-1');
    expect(result.topicTitle).toBe('Data Structures');
    expect(result.nextReviewDate).toBe('2025-06-15T12:00:00.000Z');
    expect(result.lastReviewed).toBe('2025-06-14T12:00:00.000Z');
    // Content fields should NOT be present
    expect('content' in result).toBe(false);
    expect('contentVersion' in result).toBe(false);
    expect('contentUpdatedAt' in result).toBe(false);
  });

  it('includes content fields when includeContent option is true', () => {
    const row = makeRow();
    const result = mapChunkRowToLearningItem(row, { includeContent: true });

    expect(result.id).toBe('chunk-1');
    expect(result.chunkType).toBe('review');
    // Content fields should be present
    expect('content' in result).toBe(true);
    expect((result as Record<string, unknown>).content).toBe(
      'Arrays are contiguous memory blocks.'
    );
    expect((result as Record<string, unknown>).contentVersion).toBe(2);
    expect((result as Record<string, unknown>).contentUpdatedAt).toBe(NOW_MS - 3_600_000);
  });

  it('maps "remediation" chunkType correctly', () => {
    const row = makeRow({ chunkType: 'remediation' });
    const result = mapChunkRowToLearningItem(row);
    expect(result.chunkType).toBe('remediation');
  });

  it('defaults unrecognized chunkType to "new"', () => {
    const row = makeRow({ chunkType: 'unknown-type' });
    const result = mapChunkRowToLearningItem(row);
    expect(result.chunkType).toBe('new');
  });

  it('defaults empty string chunkType to "new"', () => {
    const row = makeRow({ chunkType: '' });
    const result = mapChunkRowToLearningItem(row);
    expect(result.chunkType).toBe('new');
  });

  it('handles null prerequisitesJson and tagsJson', () => {
    const row = makeRow({ prerequisitesJson: null, tagsJson: null });
    const result = mapChunkRowToLearningItem(row);
    expect(result.prerequisites).toEqual([]);
    expect(result.tags).toEqual([]);
  });

  it('handles null lastReviewedAt', () => {
    const row = makeRow({ lastReviewedAt: null });
    const result = mapChunkRowToLearningItem(row);
    expect(result.lastReviewed).toBeUndefined();
  });

  it('omits topicId and topicTitle when topicTitle is null', () => {
    const row = makeRow({ topicTitle: null });
    const result = mapChunkRowToLearningItem(row);
    expect(result.topicId).toBeUndefined();
    expect(result.topicTitle).toBeUndefined();
  });

  it('omits topicId and topicTitle when topicTitle is undefined', () => {
    const row = makeRow({ topicTitle: undefined });
    const result = mapChunkRowToLearningItem(row);
    expect(result.topicId).toBeUndefined();
    expect(result.topicTitle).toBeUndefined();
  });

  it('handles null content fields with includeContent true', () => {
    const row = makeRow({ content: null, contentVersion: null, contentUpdatedAt: null });
    const result = mapChunkRowToLearningItem(row, { includeContent: true });
    expect((result as Record<string, unknown>).content).toBeUndefined();
    expect((result as Record<string, unknown>).contentVersion).toBeUndefined();
    expect((result as Record<string, unknown>).contentUpdatedAt).toBeUndefined();
  });
});
