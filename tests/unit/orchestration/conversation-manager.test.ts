import { describe, it, expect, vi } from 'vitest';
import { ConversationManager } from '../../../src/orchestration/conversation-manager.js';
import { RecommendationEngine } from '../../../src/domain/services/recommendation-engine.js';
import { PrerequisiteValidator } from '../../../src/domain/services/prerequisite-validator.js';
import { DependencyResolver } from '../../../src/domain/algorithms/dependency-resolver.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../src/domain/config/algorithm-defaults.js';

const TEST_NOW = new Date('2025-06-15T12:00:00Z');

function createTestConversationManager() {
  const validator = new PrerequisiteValidator({
    referenceValidator: {
      validateChunkPrerequisites: vi.fn().mockReturnValue({ isValid: true, invalidReferences: [] }),
    },
    masteryService: {
      checkItemMastery: vi.fn().mockResolvedValue({ isMastered: true }),
    },
    algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
    clock: () => TEST_NOW.getTime(),
  });
  const dependencyResolver = new DependencyResolver(
    DEFAULT_ALGORITHM_CONFIG.prerequisiteConfig.validation.maxDependencyDepth
  );
  const engine = new RecommendationEngine({
    chunkLookupFn: async () => undefined,
    prerequisiteValidator: validator,
    dependencyResolver,
    algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
  });
  return new ConversationManager({
    recommendationEngine: engine,
    listChunksAsLearningItems: vi.fn().mockResolvedValue([]),
    getActiveSession: vi.fn().mockResolvedValue(null),
    convertSessionToInput: vi.fn().mockResolvedValue(null),
  });
}

describe('ConversationManager', () => {
  it('handles start learning with no items by prompting setup', async () => {
    const cm = createTestConversationManager();
    const out = await cm.conductLearningSession({
      intent: 'start_learning',
      context: { learningItems: [] },
    } as any);
    expect(out.message.toLowerCase()).toContain("don't see any learning items");
    expect(out.needsInput).toBe(false);
  });

  it('produces guidance when items exist (guided)', async () => {
    const cm = createTestConversationManager();
    const out = await cm.conductLearningSession({
      intent: 'start_learning',
      context: {
        learningItems: [
          {
            id: 'a',
            title: 'Intro',
            subject: 'CS',
            difficulty: 5,
            nextReviewDate: new Date().toISOString().slice(0, 10),
            easeFactor: 2.3,
            repetitions: 1,
            estimatedDuration: 10,
            chunkType: 'review',
          },
        ],
      },
    } as any);

    expect(out.needsInput).toBe(false);
    expect(out.message.length).toBeGreaterThan(0);
    if (out.recommendations) {
      expect(out.recommendations.recommendations.length).toBeGreaterThan(0);
    }
  });

  it('continues session and indicates final item when at end', async () => {
    const cm = createTestConversationManager();
    const out = await cm.conductLearningSession({
      intent: 'continue_session',
      sessionState: {
        currentItemIndex: 1,
        currentRecommendations: [
          {
            item: { ...minimalItem('1') },
            priority: 10,
            reason: 'overdue',
            order: 1,
            cognitiveLoad: 5,
          },
        ],
      },
    } as any);

    expect(out.message.toLowerCase()).toContain('session');
    expect(out.needsInput).toBe(true);
  });

  it('asks clarifying question for time', async () => {
    const cm = createTestConversationManager();
    const out = await cm.conductLearningSession({
      intent: 'need_clarification',
      userInput: 'how long should i study?',
    } as any);
    expect(out.needsInput).toBe(true);
    expect(out.message.toLowerCase()).toContain('how much time');
  });

  describe('Topic Creation with Instruction-Based Workflow', () => {
    it('provides instruction-based guidance for topic creation', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'I want to learn React',
        userInput: 'I want to learn React',
      } as any);

      expect(out.needsInput).toBe(false);
      expect(out.sessionUpdated).toBe(true);
      expect(out.message).toContain('react');
      expect(out.message).toContain('create_topic_with_chunks');
      expect(out.message).toContain('chunk_generation');
      expect(out.message).toContain('search_learning_content');
    });

    it('handles empty topic title gracefully', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'I want to learn',
        userInput: 'I want to learn',
      } as any);

      expect(out.needsInput).toBe(true);
      expect(out.message).toContain("I'd be happy to help you learn!");
      expect(out.suggestedInputs).toContain('I have 30 minutes');
    });

    it('provides workflow guidance with inferred subject', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'I want to learn JavaScript',
        userInput: 'teach me JavaScript',
      } as any);

      expect(out.message).toContain('javascript');
      expect(out.message).toContain('subject: "SWE"'); // Should infer Software Engineering
      expect(out.recommendations?.nextActions).toContain(
        'Call search_learning_content tool with topic keywords'
      );
      expect(out.recommendations?.nextActions).toContain(
        'Call chunk_generation prompt with topic details'
      );
    });

    it('includes comprehensive instruction steps', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'I want to learn Machine Learning',
        userInput: 'I want to learn Machine Learning',
      } as any);

      expect(out.message).toContain('chunk_generation');
      expect(out.message).toContain('create_topic_with_chunks');
      expect(out.message).toContain('5-9 scaffolded learning chunks');
      expect(out.message).toContain('search_learning_content');
    });

    it('provides context-aware subject inference', async () => {
      const cm = createTestConversationManager();

      // Test CS topic
      const csOut = await cm.conductLearningSession({
        intent: 'I want to learn algorithms',
        userInput: 'teach me algorithms',
      } as any);
      expect(csOut.message).toContain('subject: "CS"');

      // Test Math topic
      const mathOut = await cm.conductLearningSession({
        intent: 'I want to learn calculus',
        userInput: 'teach me calculus',
      } as any);
      expect(mathOut.message).toContain('subject: "Math"');
    });

    it('maintains conversation flow with proper suggested inputs', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'I want to learn Python',
        userInput: 'I want to learn Python programming',
      } as any);

      expect(out.suggestedInputs).toContain('Run search for existing content');
      expect(out.suggestedInputs).toContain('Call chunk_generation prompt now');
      expect(out.suggestedInputs).toContain('Tell me more about the chunk generation process');
      expect(out.suggestedInputs).toContain('Choose a different topic');
    });

    it('handles user preferences from context', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'I want to learn React',
        userInput: 'teach me React',
        context: {
          preferredDifficulty: 7,
          learningStyle: 'visual',
          maxChunkDuration: 25,
        },
      } as any);

      // Should still provide direct workflow guidance regardless of preferences
      expect(out.message).toContain('chunk_generation');
      expect(out.message).toContain('react');
    });

    it('provides rationale in recommendations', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'I want to learn Data Structures',
        userInput: 'I want to learn Data Structures',
      } as any);

      expect(out.recommendations?.rationale).toContain(
        'duplicate check and chunk generation workflow'
      );
      expect(out.recommendations?.rationale).toContain('data structures');
      expect(out.recommendations?.nextActions).toHaveLength(5);
    });
  });
});

function minimalItem(id: string) {
  return {
    id,
    title: 'T',
    subject: 'CS',
    difficulty: 5,
    nextReviewDate: new Date().toISOString().slice(0, 10),
    easeFactor: 2,
    repetitions: 1,
    estimatedDuration: 5,
    chunkType: 'review',
  };
}
