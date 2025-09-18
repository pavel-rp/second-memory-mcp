import type { OrchestrationGuidance, OrchestrationInput, OrchestrationStep } from "../types/orchestration.js";

/**
 * Generate orchestration guidance for SQLite-based learning workflows
 * Provides step-by-step instructions for Claude to follow
 */
export function generateOrchestrationGuidance(input: OrchestrationInput): OrchestrationGuidance {
  const mode = input.mode || 'guided';
  const context = input.context || {};

  // Define the standard workflow steps
  const steps: OrchestrationStep[] = [
    {
      step: 1,
      action: 'fetch',
      target: 'sqlite',
      description: 'Query the local SQLite database to fetch existing learning items using list_learning_items_sqlite',
      toolToUse: 'list_learning_items_sqlite',
      exampleInput: []
    },
    {
      step: 2,
      action: 'process',
      target: 'recommendation',
      description: 'Pass the fetched learning items to the what_to_learn_today tool for personalized recommendations',
      toolToUse: 'what_to_learn_today',
      exampleInput: []
    },
    {
      step: 3,
      action: 'return',
      target: 'user',
      description: 'Present the personalized learning recommendations to the user',
      toolToUse: undefined
    }
  ];

  const currentStep = context.currentStep || 1;

  // Generate next action based on current step and context
  let nextAction: string;
  let fallbackInstructions: string | undefined;

  if (context.errorMessage) {
    nextAction = `Error encountered: ${context.errorMessage}. Please check your SQLite database configuration and try again.`;
    fallbackInstructions = "If SQLite database is unavailable, verify the database file exists and is accessible.";
  } else if (currentStep === 1) {
    nextAction = "Start by querying the local SQLite database to fetch your existing learning items. Use the list_learning_items_sqlite tool.";
    fallbackInstructions = "If SQLite database is unavailable, verify the database file exists and is properly configured.";
  } else if (currentStep === 2) {
    nextAction = "Now pass the learning items you fetched from SQLite to the what_to_learn_today tool to get personalized recommendations.";
  } else {
    nextAction = "Present the learning recommendations to the user and ask if they'd like to begin studying.";
  }

  const exampleQuery = mode === 'guided'
    ? "I'd like to know what I should learn today. Can you check my progress and give me some recommendations?"
    : "Query SQLite database for learning items, then generate recommendations based on spaced repetition priorities.";

  return {
    steps,
    currentStep,
    nextAction,
    fallbackInstructions,
    exampleQuery
  };
}