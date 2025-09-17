import type { LearningItem, RecommendationInput } from "./recommendations.js";

/**
 * Single step in the orchestration workflow
 */
export interface OrchestrationStep {
  step: number;
  action: 'fetch' | 'process' | 'return';
  target: 'notion' | 'recommendation' | 'user';
  description: string;
  toolToUse?: string;
  exampleInput?: LearningItem[] | RecommendationInput;
}

/**
 * Complete orchestration guidance for multi-server workflows
 */
export interface OrchestrationGuidance {
  steps: OrchestrationStep[];
  currentStep: number;
  nextAction: string;
  fallbackInstructions?: string;
  exampleQuery?: string;
}

/**
 * Input for orchestration helper
 */
export interface OrchestrationInput {
  mode?: 'guided' | 'explicit';
  context?: {
    hasNotionAccess?: boolean;
    currentStep?: number;
    errorMessage?: string;
  };
}