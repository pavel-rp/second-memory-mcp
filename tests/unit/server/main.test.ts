import { describe, it, expect } from 'vitest';
import { promptPack } from '../../../src/shared/prompts/prompt-pack.js';

/**
 * Tests for the main.ts bootstrap logic.
 * We cannot test the full bootstrap() (it connects to stdio transport),
 * but we test the prompt generation logic that main.ts delegates to.
 */
describe('main.ts prompt registrations', () => {
  describe('scaffolding prompt', () => {
    it('generates scaffolding prompt text', () => {
      const text = promptPack.getPrompt('scaffolding', { problem: 'Learn algebra' });
      expect(text).toBeDefined();
      expect(text.length).toBeGreaterThan(0);
    });
  });

  describe('learning prompt', () => {
    it('generates learning prompt with numeric conversion', () => {
      const text = promptPack.getPrompt('learning', {
        chunkNumber: 2,
        totalChunks: 5,
        chunkTitle: 'Variables',
        chunkContent: 'About variables',
      });
      expect(text).toBeDefined();
      expect(text.length).toBeGreaterThan(0);
    });
  });

  describe('retrieval prompt', () => {
    it('generates retrieval prompt with masteryLevel', () => {
      const text = promptPack.getPrompt('retrieval', {
        chunkTitle: 'Equations',
        masteryLevel: 3,
      });
      expect(text).toBeDefined();
      expect(text.length).toBeGreaterThan(0);
    });
  });

  describe('review prompt', () => {
    it('generates review prompt with args', () => {
      const text = promptPack.getPrompt('review', {
        masteryLevel: 4,
        previousAttempts: 2,
      });
      expect(text).toBeDefined();
      expect(text.length).toBeGreaterThan(0);
    });
  });

  describe('workflow_guidance prompt', () => {
    it('generates workflow guidance prompt', () => {
      const text = promptPack.getPrompt('workflow_guidance', {});
      expect(text).toBeDefined();
      expect(text.length).toBeGreaterThan(0);
    });
  });

  describe('chunk_generation prompt', () => {
    it('generates chunk generation prompt', () => {
      const text = promptPack.getPrompt('chunk_generation', {
        topicTitle: 'Algebra',
      });
      expect(text).toBeDefined();
      expect(text.length).toBeGreaterThan(0);
    });

    it('handles comma-separated existingChunkTitles', () => {
      const text = promptPack.getPrompt('chunk_generation', {
        topicTitle: 'Algebra',
        existingChunkTitles: ['Variables', 'Equations'],
      });
      expect(text).toBeDefined();
    });
  });

  describe('chunk_management prompt', () => {
    it('generates chunk management prompt', () => {
      const text = promptPack.getPrompt('chunk_management', {
        operation: 'update',
        managedChunk: { title: 'Test Chunk' },
      });
      expect(text).toBeDefined();
      expect(text.length).toBeGreaterThan(0);
    });

    it('handles unknown operation gracefully', () => {
      const text = promptPack.getPrompt('chunk_management', {
        operation: undefined,
        managedChunk: { title: '<untitled>' },
      });
      expect(text).toBeDefined();
    });
  });
});
