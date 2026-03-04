import { describe, it, expect } from 'vitest';
import {
  validateTopicCreationInput,
  type TopicCreationInput,
} from '../../../src/orchestration/topic-workflows.js';

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
  });

  describe('chunks array', () => {
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
