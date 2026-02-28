import type { MasteryStatus } from '../domain/types/prerequisite-validation.js';

/**
 * Port interface for prerequisite mastery checks.
 * Used by PrerequisiteValidator to determine if chunks are mastered.
 */
export interface PrerequisiteMasteryPort {
  checkItemMastery(itemId: string): Promise<MasteryStatus>;
  checkMultipleItemsMastery(itemIds: string[]): Promise<Map<string, MasteryStatus>>;
}
