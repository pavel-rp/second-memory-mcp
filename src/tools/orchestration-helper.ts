import type { OrchestrationGuidance, OrchestrationInput, OrchestrationStep } from "../types/orchestration.js";

/**
 * Generate orchestration guidance for multi-server workflows
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
      target: 'notion',
      description: 'Query the Notion MCP server to fetch existing learning items from the database',
      toolToUse: 'notion_query_database',
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
    nextAction = `Error encountered: ${context.errorMessage}. Please check your Notion MCP server configuration and try again.`;
    fallbackInstructions = "If Notion is unavailable, consider asking the user to create initial learning items manually or check the MCP configuration in Claude Desktop.";
  } else if (currentStep === 1) {
    nextAction = "Start by querying the Notion MCP server to fetch your existing learning items. Use the appropriate Notion database query tool.";
    fallbackInstructions = "If no Notion MCP server is available, ask the user to set up the Notion integration first.";
  } else if (currentStep === 2) {
    nextAction = "Now pass the learning items you fetched from Notion to the what_to_learn_today tool to get personalized recommendations.";
  } else {
    nextAction = "Present the learning recommendations to the user and ask if they'd like to begin studying.";
  }

  const exampleQuery = mode === 'guided'
    ? "I'd like to know what I should learn today. Can you check my progress and give me some recommendations?"
    : "Query Notion for learning items, then generate recommendations based on spaced repetition priorities.";

  return {
    steps,
    currentStep,
    nextAction,
    fallbackInstructions,
    exampleQuery
  };
}