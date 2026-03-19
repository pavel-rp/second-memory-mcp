import type { LearningItem } from './recommendations.js';

// Core validation types for prerequisite checking

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
  /** Number of attempts made */
  attemptCount: number;
  /** Days since last review */
  daysSinceLastReview: number;
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
