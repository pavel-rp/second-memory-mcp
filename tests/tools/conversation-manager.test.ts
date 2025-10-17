import { describe, it, expect } from "vitest";
import { ConversationManager } from "../../src/tools/conversation-manager.js";

describe("ConversationManager", () => {
  it("handles start learning with no items by prompting setup", async () => {
    const cm = new ConversationManager();
    const out = await cm.conductLearningSession({ intent: "start_learning", context: { learningItems: [] } } as any);
    expect(out.message.toLowerCase()).toContain("don't see any learning items");
    expect(out.needsInput).toBe(false);
  });

  it("produces guidance when items exist (guided)", async () => {
    const cm = new ConversationManager();
    const out = await cm.conductLearningSession({
      intent: "start_learning",
      context: {
        learningItems: [
          {
            id: "a",
            title: "Intro",
            subject: "CS",
            difficulty: 5,
            nextReviewDate: new Date().toISOString().slice(0, 10),
            easeFactor: 2.3,
            repetitions: 1,
            estimatedDuration: 10,
            chunkType: "review",
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

  it("continues session and indicates final item when at end", async () => {
    const cm = new ConversationManager();
    const out = await cm.conductLearningSession({
      intent: "continue_session",
      sessionState: {
        currentItemIndex: 1,
        currentRecommendations: [
          { item: { ...minimalItem("1") }, priority: 10, reason: "overdue", order: 1, cognitiveLoad: 5 },
        ],
      },
    } as any);

    expect(out.message.toLowerCase()).toContain("session");
    expect(out.needsInput).toBe(true);
  });

  it("asks clarifying question for time", async () => {
    const cm = new ConversationManager();
    const out = await cm.conductLearningSession({ intent: "need_clarification", userInput: "how long should i study?" } as any);
    expect(out.needsInput).toBe(true);
    expect(out.message.toLowerCase()).toContain("how much time");
  });

  describe("Topic Creation with Instruction-Based Workflow", () => {
    it("provides instruction-based guidance for topic creation", async () => {
      const cm = new ConversationManager();
      const out = await cm.conductLearningSession({
        intent: "I want to learn React",
        userInput: "I want to learn React"
      } as any);

      expect(out.needsInput).toBe(false);
      expect(out.sessionUpdated).toBe(true);
      expect(out.message).toContain("react");
      expect(out.message).toContain("create_topic_with_chunks");
      expect(out.message).toContain("chunk_generation");
    });

    it("handles empty topic title gracefully", async () => {
      const cm = new ConversationManager();
      const out = await cm.conductLearningSession({
        intent: "I want to learn",
        userInput: "I want to learn"
      } as any);

      expect(out.needsInput).toBe(true);
      expect(out.message).toContain("I'd be happy to help you learn!");
      expect(out.suggestedInputs).toContain("I have 30 minutes");
    });

    it("provides workflow guidance with inferred subject", async () => {
      const cm = new ConversationManager();
      const out = await cm.conductLearningSession({
        intent: "I want to learn JavaScript",
        userInput: "teach me JavaScript"
      } as any);

      expect(out.message).toContain("javascript");
      expect(out.message).toContain("subject: \"SWE\""); // Should infer Software Engineering
      expect(out.recommendations?.nextActions).toContain("Call chunk_generation prompt with topic details");
    });

    it("includes comprehensive instruction steps", async () => {
      const cm = new ConversationManager();
      const out = await cm.conductLearningSession({
        intent: "I want to learn Machine Learning",
        userInput: "I want to learn Machine Learning"
      } as any);

      expect(out.message).toContain("chunk_generation");
      expect(out.message).toContain("create_topic_with_chunks");
      expect(out.message).toContain("5-9 scaffolded learning chunks");
    });

    it("provides context-aware subject inference", async () => {
      const cm = new ConversationManager();

      // Test CS topic
      const csOut = await cm.conductLearningSession({
        intent: "I want to learn algorithms",
        userInput: "teach me algorithms"
      } as any);
      expect(csOut.message).toContain("subject: \"CS\"");

      // Test Math topic
      const mathOut = await cm.conductLearningSession({
        intent: "I want to learn calculus",
        userInput: "teach me calculus"
      } as any);
      expect(mathOut.message).toContain("subject: \"Math\"");
    });

    it("maintains conversation flow with proper suggested inputs", async () => {
      const cm = new ConversationManager();
      const out = await cm.conductLearningSession({
        intent: "I want to learn Python",
        userInput: "I want to learn Python programming"
      } as any);

      expect(out.suggestedInputs).toContain("Call chunk_generation prompt now");
      expect(out.suggestedInputs).toContain("Tell me more about the chunk generation process");
      expect(out.suggestedInputs).toContain("Choose a different topic");
    });

    it("handles user preferences from context", async () => {
      const cm = new ConversationManager();
      const out = await cm.conductLearningSession({
        intent: "I want to learn React",
        userInput: "teach me React",
        context: {
          preferredDifficulty: 7,
          learningStyle: "visual",
          maxChunkDuration: 25
        }
      } as any);

      // Should still provide direct workflow guidance regardless of preferences
      expect(out.message).toContain("chunk_generation");
      expect(out.message).toContain("react");
    });

    it("provides rationale in recommendations", async () => {
      const cm = new ConversationManager();
      const out = await cm.conductLearningSession({
        intent: "I want to learn Data Structures",
        userInput: "I want to learn Data Structures"
      } as any);

      expect(out.recommendations?.rationale).toContain("explicit guidance for chunk generation workflow");
      expect(out.recommendations?.rationale).toContain("data structures");
      expect(out.recommendations?.nextActions).toHaveLength(3);
    });
  });
});

function minimalItem(id: string) {
  return {
    id,
    title: "T",
    subject: "CS",
    difficulty: 5,
    nextReviewDate: new Date().toISOString().slice(0, 10),
    easeFactor: 2,
    repetitions: 1,
    estimatedDuration: 5,
    chunkType: "review",
  };
}


