import { describe, it, expect } from 'vitest';
import { promptPack } from '../../../../src/shared/prompts/prompt-pack.js';

describe('promptPack', () => {
  it('returns workflow guidance with tool names', () => {
    const text = promptPack.getPrompt('workflow_guidance', {});
    expect(text).toContain('calculate_next_review');
    expect(text).toContain('calculate_priority_score');
  });

  it('learning prompt includes chunk metadata', () => {
    const text = promptPack.getPrompt('learning', {
      chunkNumber: 2,
      totalChunks: 5,
      chunkTitle: 'Intro',
      drillFormat: 'open_ended',
    });
    expect(text).toContain('(2/5)');
    expect(text).toContain('Intro');
  });

  it('retrieval and review prompts include key constraints', () => {
    const r = promptPack.getPrompt('retrieval', { chunkTitle: 'X', masteryLevel: 3 });
    expect(r).toContain('two-attempt');
    const v = promptPack.getPrompt('review', {
      lastReviewed: '2025-01-01',
      masteryLevel: 2,
      previousAttempts: 1,
      weakAreas: 'y',
    });
    expect(v).toContain('LAST REVIEWED');
  });

  it('chunk generation prompt lists required fields', () => {
    const text = promptPack.getPrompt('chunk_generation', {
      topicTitle: 'Graphs',
      topicDescription: 'Basics',
      existingChunkTitles: ['Intro'],
    });
    expect(text).toContain('Produce 5–9 proposed chunks');
    expect(text).toContain('title');
    expect(text).toContain('order');
    expect(text).toContain('content');
    expect(text).toContain('prerequisites');
  });

  it('chunk management prompt mentions operation and resulting chunks', () => {
    const text = promptPack.getPrompt('chunk_management', {
      operation: 'merge',
      managedChunk: { title: 'Intro' },
      intent: 'deduplicate',
    });
    expect(text).toContain('OPERATION: merge');
    expect(text).toContain('TARGET CHUNK: Intro');
    expect(text).toContain('resulting chunk(s)');
  });

  describe('web search enhancements', () => {
    it('scaffolding prompt includes research instructions by default', () => {
      const text = promptPack.getPrompt('scaffolding', { problem: 'React Hooks' });
      expect(text).toContain('## RESEARCH FIRST');
      expect(text).toContain('search the web for current information about React Hooks');
      expect(text).toContain('official documentation');
      expect(text).toContain('Peer-reviewed');
      expect(text).toContain('multiple perspectives');
      expect(text).toContain('You are an expert tutor'); // Original content preserved
    });

    it('scaffolding prompt can disable research when explicitly set', () => {
      const text = promptPack.getPrompt('scaffolding', {
        problem: 'React Hooks',
        researchRequired: false,
      });
      expect(text).not.toContain('## RESEARCH FIRST');
      expect(text).toContain('You are an expert tutor'); // Original content still present
    });

    it('scaffolding prompt uses different search emphasis', () => {
      const currentYear = new Date().getFullYear();
      const currentText = promptPack.getPrompt('scaffolding', {
        problem: 'React Hooks',
        searchEmphasis: 'current',
      });
      expect(currentText).toContain(`recent information (${currentYear - 1}-${currentYear})`);

      const authText = promptPack.getPrompt('scaffolding', {
        problem: 'React Hooks',
        searchEmphasis: 'authoritative',
      });
      expect(authText).toContain('official documentation, recognized experts');
    });

    it('chunk generation prompt includes research instructions by default', () => {
      const text = promptPack.getPrompt('chunk_generation', {
        topicTitle: 'Node.js APIs',
        topicDescription: 'Modern APIs',
      });
      expect(text).toContain('## RESEARCH FIRST');
      expect(text).toContain('search the web for current information about Node.js APIs');
      expect(text).toContain('current examples and best practices');
      expect(text).toContain('You are assisting with chunk generation'); // Original content preserved
    });

    it('chunk generation prompt can disable research when explicitly set', () => {
      const text = promptPack.getPrompt('chunk_generation', {
        topicTitle: 'Node.js APIs',
        researchRequired: false,
      });
      expect(text).not.toContain('## RESEARCH FIRST');
      expect(text).toContain('You are assisting with chunk generation'); // Original content still present
    });

    it('chunk generation prompt uses current search emphasis by default', () => {
      const currentYear = new Date().getFullYear();
      const text = promptPack.getPrompt('chunk_generation', { topicTitle: 'Node.js APIs' });
      expect(text).toContain(`recent information (${currentYear - 1}-${currentYear})`);
    });

    it('workflow guidance includes research step', () => {
      const text = promptPack.getPrompt('workflow_guidance');
      expect(text).toContain('1) Research phase');
      expect(text).toContain('Search web for current information');
      expect(text).toContain('authoritative sources');
      expect(text).toContain('Web search performed by client');
      expect(text).toContain('2) Intake problem'); // Workflow steps renumbered
    });

    it('workflow guidance includes session enforcement for recall/review', () => {
      const text = promptPack.getPrompt('workflow_guidance');
      expect(text).toContain('CRITICAL: Session Requirement for Recall/Review');
      expect(text).toContain('MANDATORY: For ANY recall, review, or retrieval practice');
      expect(text).toContain('Create a session BEFORE teaching');
      expect(text).toContain('historical feedback');
      expect(text).toContain('Review/Recall Flow');
      expect(text).toContain('Session Completion Best Practices');
    });

    it('enhanced prompts preserve all original content', () => {
      // Test that all key elements from original prompts are still present
      const scaffolding = promptPack.getPrompt('scaffolding', { problem: 'Test Problem' });
      expect(scaffolding).toContain('HIGH-LEVEL OVERVIEW');
      expect(scaffolding).toContain('CHUNK BREAKDOWN');
      expect(scaffolding).toContain('PREREQUISITE MAPPING');
      expect(scaffolding).toContain('DIFFICULTY ASSESSMENT');
      expect(scaffolding).toContain('ESTIMATED TIMELINE');

      const chunkGen = promptPack.getPrompt('chunk_generation', { topicTitle: 'Test Topic' });
      expect(chunkGen).toContain('Produce 5–9 proposed chunks');
      expect(chunkGen).toContain('title');
      expect(chunkGen).toContain('order');
      expect(chunkGen).toContain('content');
      expect(chunkGen).toContain('prerequisites');
    });

    it('search query suggestions include topic-specific terms', () => {
      const currentYear = new Date().getFullYear();
      const text = promptPack.getPrompt('scaffolding', { problem: 'GraphQL' });
      expect(text).toContain(`"GraphQL" best practices ${currentYear - 1} ${currentYear}`);
      expect(text).toContain('"GraphQL" tutorial guide comprehensive');
      expect(text).toContain('"GraphQL" official documentation');
      expect(text).toContain('"GraphQL" examples real world applications');
    });

    it('source quality guidance is comprehensive', () => {
      const text = promptPack.getPrompt('scaffolding', { problem: 'Test' });
      expect(text).toContain('Prioritize:');
      expect(text).toContain('Official documentation and authoritative sources');
      expect(text).toContain('Peer-reviewed articles');
      expect(text).toContain('Recognized industry experts');
      expect(text).toContain('When conflicting information is found:');
      expect(text).toContain('Present multiple perspectives');
      expect(text).toContain('Explicitly state limitations');
    });

    it('prompts without research context work normally', () => {
      // Test that prompts not enhanced with research still work normally
      const learning = promptPack.getPrompt('learning', { chunkTitle: 'Test Chunk' });
      expect(learning).not.toContain('## RESEARCH FIRST');
      expect(learning).toContain('You are teaching with cognitive load awareness');

      const retrieval = promptPack.getPrompt('retrieval', { chunkTitle: 'Test Chunk' });
      expect(retrieval).not.toContain('## RESEARCH FIRST');
      expect(retrieval).toContain('You are generating a retrieval practice drill');

      const review = promptPack.getPrompt('review', { masteryLevel: 3 });
      expect(review).not.toContain('## RESEARCH FIRST');
      expect(review).toContain('You are conducting a spaced review session');
    });

    it('uses additional topic search terms when provided', () => {
      const text = promptPack.getPrompt('scaffolding', {
        problem: 'React Hooks',
        topicSearchTerms: ['useState', 'useEffect', 'custom hooks'],
      });
      expect(text).toContain('"React Hooks" useState');
      expect(text).toContain('"React Hooks" useEffect');
      expect(text).toContain('"React Hooks" custom hooks');
    });

    it('chunk generation excludes research constraint when research disabled', () => {
      const withResearch = promptPack.getPrompt('chunk_generation', { topicTitle: 'Test' });
      expect(withResearch).toContain(
        'Base chunks on current examples and best practices found through research'
      );

      const withoutResearch = promptPack.getPrompt('chunk_generation', {
        topicTitle: 'Test',
        researchRequired: false,
      });
      expect(withoutResearch).not.toContain(
        'Base chunks on current examples and best practices found through research'
      );
    });
  });
});
