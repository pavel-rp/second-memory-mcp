import { z } from "zod";
import type { LearningItem } from "./recommendations.js";

// Core validation types for prerequisite checking

/**
 * Criteria used to determine if a prerequisite item has been mastered
 */
export type MasteryCriteria = {
  /** Minimum average quality score required (0-5) */
  minimumQualityScore: number;
  /** Minimum number of successful attempts required */
  requiredAttempts: number;
  /** Maximum age in days for attempts to be considered recent */
  recencyDays: number;
  /** Minimum success rate required (0-1) */
  successRate: number;
};

/**
 * Result of validating prerequisites for a learning item
 */
export type ValidationResult = {
  /** Whether all prerequisites are satisfied */
  isValid: boolean;
  /** List of prerequisite IDs that are not yet mastered */
  missingPrerequisites: string[];
  /** List of prerequisite IDs that have been mastered */
  masteredPrerequisites: string[];
  /** Any validation errors encountered */
  validationErrors?: string[];
};

/**
 * Status of mastery for a single prerequisite item
 */
export type MasteryStatus = {
  /** Chunk ID of the prerequisite */
  itemId: string;
  /** Whether the item has been mastered */
  isMastered: boolean;
  /** Current quality score average */
  averageQuality: number;
  /** Number of attempts made */
  attemptCount: number;
  /** Days since last review */
  daysSinceLastReview: number;
  /** Success rate (0-1) */
  successRate: number;
};

/**
 * Result of filtering learning items based on prerequisite validation
 */
export type FilteredResult = {
  /** Items that passed prerequisite validation */
  validItems: LearningItem[];
  /** Items that were filtered out due to unmet prerequisites */
  filteredItems: {
    item: LearningItem;
    reason: string;
    missingPrerequisites: string[];
  }[];
  /** Human-readable explanation of filtering decisions */
  rationale: string;
};

/**
 * Result of prerequisite reference validation
 */
export type PrerequisiteReferenceValidationResult = {
  /** Whether all prerequisite references are valid */
  isValid: boolean;
  /** List of valid prerequisite chunk IDs */
  validReferences: string[];
  /** List of invalid prerequisite references that don't exist in database */
  invalidReferences: string[];
  /** Error messages for invalid references */
  errors: string[];
};

/**
 * Input for prerequisite validation operations
 */
export type PrerequisiteValidationInput = {
  /** Learning items to validate */
  items: LearningItem[];
  /** Mastery criteria to use for validation */
  masteryCriteria: MasteryCriteria;
  /** Optional list of item IDs to exclude from validation */
  excludeIds?: string[];
};

/**
 * Configuration for prerequisite validation behavior
 */
export type PrerequisiteValidationConfig = {
  /** Default mastery criteria */
  defaultMasteryCriteria: MasteryCriteria;
  /** Whether to enable strict validation (fail on any invalid references) */
  strictValidation: boolean;
  /** Maximum depth for dependency graph traversal */
  maxDependencyDepth: number;
  /** Whether to cache mastery status results */
  enableCaching: boolean;
};

// Zod schemas for runtime validation

export const MasteryCriteriaSchema = z.object({
  minimumQualityScore: z.number().min(0).max(5),
  requiredAttempts: z.number().int().min(0),
  recencyDays: z.number().int().min(0),
  successRate: z.number().min(0).max(1),
});

export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  missingPrerequisites: z.array(z.string()),
  masteredPrerequisites: z.array(z.string()),
  validationErrors: z.array(z.string()).optional(),
});

export const MasteryStatusSchema = z.object({
  itemId: z.string().min(1),
  isMastered: z.boolean(),
  averageQuality: z.number().min(0).max(5),
  attemptCount: z.number().int().min(0),
  daysSinceLastReview: z.number().int().min(0),
  successRate: z.number().min(0).max(1),
});

export const PrerequisiteReferenceValidationResultSchema = z.object({
  isValid: z.boolean(),
  validReferences: z.array(z.string()),
  invalidReferences: z.array(z.string()),
  errors: z.array(z.string()),
});

export const PrerequisiteValidationInputSchema = z.object({
  items: z.array(z.any()), // LearningItemSchema would be imported from recommendations.ts
  masteryCriteria: MasteryCriteriaSchema,
  excludeIds: z.array(z.string()).optional(),
});

export const PrerequisiteValidationConfigSchema = z.object({
  defaultMasteryCriteria: MasteryCriteriaSchema,
  strictValidation: z.boolean(),
  maxDependencyDepth: z.number().int().min(1),
  enableCaching: z.boolean(),
});