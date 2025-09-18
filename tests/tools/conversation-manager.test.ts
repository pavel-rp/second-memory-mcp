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


