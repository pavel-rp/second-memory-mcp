import { describe, it, expect, vi } from 'vitest';
import { ConversationManager } from '../../../src/orchestration/conversation-manager.js';
import { RecommendationEngine } from '../../../src/domain/services/recommendation-engine.js';
import { PrerequisiteValidator } from '../../../src/domain/services/prerequisite-validator.js';
import { DependencyResolver } from '../../../src/domain/algorithms/dependency-resolver.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../src/domain/config/algorithm-defaults.js';
import type { LearningItem } from '../../../src/domain/types/recommendations.js';

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

  // ── STEP-002: parseIntent pattern tests ──────────────────────────

  describe('parseIntent routing', () => {
    it('routes "i wanna learn React" to topic creation', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'i wanna learn React',
        userInput: 'i wanna learn React',
      });
      expect(out.message.toLowerCase()).toContain('react');
      expect(out.sessionUpdated).toBe(true);
    });

    it('routes "start learning algorithms" to topic creation', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'start learning algorithms',
        userInput: 'start learning algorithms',
      });
      expect(out.message).toContain('algorithms');
      expect(out.sessionUpdated).toBe(true);
    });

    it('routes "next" to continue_session', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'next',
        userInput: 'next',
      });
      // No session state → prompts to start new session
      expect(out.message.toLowerCase()).toContain("don't have an active session");
      expect(out.needsInput).toBe(true);
    });

    it('routes "keep going" to continue_session', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'keep going',
        userInput: 'keep going',
      });
      expect(out.message.toLowerCase()).toContain("don't have an active session");
    });

    it('routes "done" to session_feedback', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'done',
        userInput: 'done',
      });
      expect(out.message.toLowerCase()).toContain('feedback');
      expect(out.needsInput).toBe(true);
    });

    it('routes "finished" to session_feedback', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'finished',
        userInput: 'finished',
      });
      expect(out.message.toLowerCase()).toContain('feedback');
    });

    it('routes "help" to get_help', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'help',
        userInput: 'help',
      });
      expect(out.message.toLowerCase()).toContain('learning assistant');
    });

    it('routes "?" to get_help', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: '?',
        userInput: '?',
      });
      expect(out.message.toLowerCase()).toContain('learning assistant');
    });

    it('routes "explain this to me" to get_help', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'explain this to me',
        userInput: 'explain this to me',
      });
      expect(out.message.toLowerCase()).toContain('learning assistant');
    });

    it('routes unmatched input to general_learning', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'hello there',
        userInput: 'hello there',
      });
      expect(out.message.toLowerCase()).toContain('happy to help you learn');
      expect(out.needsInput).toBe(true);
    });
  });

  // ── STEP-003: extractTimeHints, extractSubjectHints, inferSubject ──

  describe('extractTimeHints via general learning', () => {
    it('extracts "30 minutes" and proceeds to start_learning', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'general_learning',
        userInput: '30 minutes',
      });
      // Time hint extracted → proceeds to handleStartLearning → no items → prompt
      expect(out.message.toLowerCase()).toContain("don't see any learning items");
    });

    it('extracts "2 hours" and proceeds to start_learning', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'general_learning',
        userInput: '2 hours of study',
      });
      expect(out.message.toLowerCase()).toContain("don't see any learning items");
    });

    it('extracts "quick session" and proceeds to start_learning', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'general_learning',
        userInput: 'quick session please',
      });
      expect(out.message.toLowerCase()).toContain("don't see any learning items");
    });

    it('extracts "extended study" and proceeds to start_learning', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'general_learning',
        userInput: 'extended study session',
      });
      expect(out.message.toLowerCase()).toContain("don't see any learning items");
    });
  });

  describe('extractSubjectHints via general learning', () => {
    it('extracts "Computer Science" subject and proceeds', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'general_learning',
        userInput: 'Computer Science review',
      });
      expect(out.message.toLowerCase()).toContain("don't see any learning items");
    });

    it('extracts "Math" subject and proceeds', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'general_learning',
        userInput: 'Math practice',
      });
      expect(out.message.toLowerCase()).toContain("don't see any learning items");
    });

    it('extracts "Software Engineering" subject and proceeds', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'general_learning',
        userInput: 'Software Engineering focus',
      });
      expect(out.message.toLowerCase()).toContain("don't see any learning items");
    });

    it('extracts "Language" subject and proceeds', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'general_learning',
        userInput: 'Language drill',
      });
      expect(out.message.toLowerCase()).toContain("don't see any learning items");
    });
  });

  describe('inferSubject via topic creation', () => {
    it('infers CS for "dfs"', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'teach me dfs',
        userInput: 'teach me dfs',
      });
      expect(out.message).toContain('subject: "CS"');
    });

    it('infers SWE for "typescript"', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'teach me typescript',
        userInput: 'teach me typescript',
      });
      expect(out.message).toContain('subject: "SWE"');
    });

    it('infers Math for "algebra"', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'teach me algebra',
        userInput: 'teach me algebra',
      });
      expect(out.message).toContain('subject: "Math"');
    });

    it('infers Language for "spanish"', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'teach me spanish',
        userInput: 'teach me spanish',
      });
      expect(out.message).toContain('subject: "Language"');
    });

    it('defaults to CS for unknown topic "cooking"', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'teach me cooking',
        userInput: 'teach me cooking',
      });
      expect(out.message).toContain('subject: "CS"');
    });
  });

  // ── STEP-004: handleClarification, handleGetHelp, handleSessionCompletion ──

  describe('handleClarification', () => {
    it('responds to time-related clarification', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'time',
        userInput: 'time',
      });
      expect(out.message.toLowerCase()).toContain('how much time');
      expect(out.needsInput).toBe(true);
    });

    it('responds to subject-related clarification with "what subject"', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'what subject',
        userInput: 'what subject should I focus on',
      });
      expect(out.message.toLowerCase()).toContain('focus on today');
      expect(out.needsInput).toBe(true);
    });

    it('responds to general clarification when no specific keyword matches', async () => {
      const cm = createTestConversationManager();
      // Use intent to trigger need_clarification, but leave userInput empty
      // so handleClarification falls through to general
      const out = await cm.conductLearningSession({
        intent: 'how long do I have',
      });
      expect(out.message.toLowerCase()).toContain('here to help');
      expect(out.needsInput).toBe(true);
    });
  });

  describe('handleGetHelp', () => {
    it('returns help message with learning assistant info and examples', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'help',
        userInput: 'help',
      });
      expect(out.message.toLowerCase()).toContain('learning assistant');
      expect(out.message).toContain('Teach me');
      expect(out.needsInput).toBe(true);
      expect(out.suggestedInputs).toBeDefined();
      expect(out.suggestedInputs!.length).toBeGreaterThan(0);
    });
  });

  describe('handleSessionCompletion', () => {
    it('reports partial completion with items remaining', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'done',
        userInput: 'done',
        sessionState: {
          currentItemIndex: 2,
          currentRecommendations: [
            { item: minimalItem('1'), priority: 10, reason: 'r', order: 1, cognitiveLoad: 5 },
            { item: minimalItem('2'), priority: 9, reason: 'r', order: 2, cognitiveLoad: 5 },
            { item: minimalItem('3'), priority: 8, reason: 'r', order: 3, cognitiveLoad: 5 },
          ],
        },
      });
      expect(out.message).toContain('2 out of 3');
      expect(out.message).toMatch(/1 item[s]? remaining/i);
      expect(out.needsInput).toBe(true);
    });

    it('reports full session completion', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'done',
        userInput: 'done',
        sessionState: {
          currentItemIndex: 3,
          currentRecommendations: [
            { item: minimalItem('1'), priority: 10, reason: 'r', order: 1, cognitiveLoad: 5 },
            { item: minimalItem('2'), priority: 9, reason: 'r', order: 2, cognitiveLoad: 5 },
            { item: minimalItem('3'), priority: 8, reason: 'r', order: 3, cognitiveLoad: 5 },
          ],
        },
      });
      expect(out.message).toContain('Session complete');
      expect(out.needsInput).toBe(true);
    });

    it('asks for feedback when no sessionState is provided', async () => {
      const cm = createTestConversationManager();
      const out = await cm.conductLearningSession({
        intent: 'done',
        userInput: 'done',
      });
      expect(out.message.toLowerCase()).toContain('feedback');
      expect(out.needsInput).toBe(true);
    });
  });
});

function minimalItem(id: string): LearningItem {
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
