import { describe, it, expect } from 'vitest';
import { generateOrchestrationGuidance } from '../../src/tools/orchestration-helper.js';
import type { OrchestrationInput } from '../../src/types/orchestration.js';

describe('OrchestrationHelper', () => {
  describe('generateOrchestrationGuidance', () => {
    it('should return basic workflow steps for empty input', () => {
      const input: OrchestrationInput = {};
      const result = generateOrchestrationGuidance(input);

      expect(result.steps).toHaveLength(3);
      expect(result.steps[0].action).toBe('fetch');
      expect(result.steps[0].target).toBe('notion');
      expect(result.steps[1].action).toBe('process');
      expect(result.steps[1].target).toBe('recommendation');
      expect(result.steps[2].action).toBe('return');
      expect(result.steps[2].target).toBe('user');
      expect(result.currentStep).toBe(1);
    });

    it('should handle guided mode', () => {
      const input: OrchestrationInput = {
        mode: 'guided'
      };
      const result = generateOrchestrationGuidance(input);

      expect(result.exampleQuery).toContain("I'd like to know what I should learn today");
      expect(result.nextAction).toContain('Start by querying the Notion MCP server');
    });

    it('should handle explicit mode', () => {
      const input: OrchestrationInput = {
        mode: 'explicit'
      };
      const result = generateOrchestrationGuidance(input);

      expect(result.exampleQuery).toContain('Query Notion for learning items');
    });

    it('should handle error context', () => {
      const input: OrchestrationInput = {
        context: {
          errorMessage: 'Notion server unavailable'
        }
      };
      const result = generateOrchestrationGuidance(input);

      expect(result.nextAction).toContain('Error encountered: Notion server unavailable');
      expect(result.fallbackInstructions).toContain('check the MCP configuration');
    });

    it('should handle current step context', () => {
      const input: OrchestrationInput = {
        context: {
          currentStep: 2
        }
      };
      const result = generateOrchestrationGuidance(input);

      expect(result.currentStep).toBe(2);
      expect(result.nextAction).toContain('pass the learning items you fetched from Notion');
    });

    it('should handle step 3 context', () => {
      const input: OrchestrationInput = {
        context: {
          currentStep: 3
        }
      };
      const result = generateOrchestrationGuidance(input);

      expect(result.currentStep).toBe(3);
      expect(result.nextAction).toContain('Present the learning recommendations');
    });

    it('should provide fallback instructions for step 1', () => {
      const input: OrchestrationInput = {
        context: {
          currentStep: 1
        }
      };
      const result = generateOrchestrationGuidance(input);

      expect(result.fallbackInstructions).toContain('no Notion MCP server is available');
    });

    it('should handle hasNotionAccess context', () => {
      const input: OrchestrationInput = {
        context: {
          hasNotionAccess: false
        }
      };
      const result = generateOrchestrationGuidance(input);

      expect(result.fallbackInstructions).toBeDefined();
    });

    it('should return consistent structure for all inputs', () => {
      const inputs: OrchestrationInput[] = [
        {},
        { mode: 'guided' },
        { mode: 'explicit' },
        { context: { currentStep: 2 } },
        { context: { errorMessage: 'test error' } }
      ];

      inputs.forEach(input => {
        const result = generateOrchestrationGuidance(input);

        expect(result).toHaveProperty('steps');
        expect(result).toHaveProperty('currentStep');
        expect(result).toHaveProperty('nextAction');
        expect(result).toHaveProperty('exampleQuery');
        expect(Array.isArray(result.steps)).toBe(true);
        expect(typeof result.currentStep).toBe('number');
        expect(typeof result.nextAction).toBe('string');
        expect(typeof result.exampleQuery).toBe('string');
      });
    });
  });
});