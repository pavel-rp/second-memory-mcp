import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrerequisiteValidator } from '../../../../src/domain/services/prerequisite-validator.js';
import { DEFAULT_ALGORITHM_CONFIG } from '../../../../src/domain/config/algorithm-defaults.js';
import type { LearningItem } from '../../../../src/domain/types/recommendations.js';
import type { MasteryStatus } from '../../../../src/domain/types/prerequisite-validation.js';

const NOW_MS = new Date('2025-06-15T12:00:00Z').getTime();

const mockReferenceValidator = {
  validateChunkPrerequisites: vi.fn(),
  validatePrerequisiteReferences: vi.fn(),
  clearCache: vi.fn(),
};
const mockMasteryService = {
  checkItemMastery: vi.fn(),
};

describe('PrerequisiteValidator', () => {
  let validator: PrerequisiteValidator;

  beforeEach(() => {
    vi.resetAllMocks();
    validator = new PrerequisiteValidator({
      referenceValidator: mockReferenceValidator,
      masteryService: mockMasteryService,
      algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
      clock: () => NOW_MS,
    });
  });

  // Helper function to create test learning items
  const createTestItem = (id: string, prerequisites: string[] = []): LearningItem => ({
    id,
    title: `Test Item ${id}`,
    subject: 'CS',
    difficulty: 5,
    nextReviewDate: '2025-09-26',
    easeFactor: 2.5,
    repetitions: 2,
    estimatedDuration: 10,
    chunkType: 'review',
    prerequisites,
    tags: [],
  });

  // Helper function to create mastery status
  const createMasteryStatus = (itemId: string, isMastered: boolean = true): MasteryStatus => ({
    itemId,
    isMastered,
    averageQuality: isMastered ? 4.5 : 2.5,
    attemptCount: isMastered ? 3 : 1,
    daysSinceLastReview: isMastered ? 5 : 45,
    successRate: isMastered ? 0.85 : 0.4,
  });

  describe('filterByPrerequisites', () => {
    it('should return all items when no items provided', async () => {
      const result = await validator.filterByPrerequisites([]);

      expect(result.validItems).toEqual([]);
      expect(result.filteredItems).toEqual([]);
      expect(result.rationale).toContain('No learning items provided');
    });

    it('should pass items without prerequisites', async () => {
      const items = [createTestItem('item1'), createTestItem('item2')];

      const result = await validator.filterByPrerequisites(items);

      expect(result.validItems).toEqual(items);
      expect(result.filteredItems).toHaveLength(0);
      expect(result.rationale).toContain('items passed prerequisite validation');
    });

    it('should filter items with invalid prerequisite references', async () => {
      const item = createTestItem('item1', ['invalid-prereq']);

      mockReferenceValidator.validateChunkPrerequisites.mockResolvedValue({
        isValid: false,
        validReferences: [],
        invalidReferences: ['invalid-prereq'],
        errors: [
          "Chunk 'item1': Prerequisite reference 'invalid-prereq' does not exist as a chunk ID in the database",
        ],
      });

      const result = await validator.filterByPrerequisites([item]);

      expect(result.validItems).toHaveLength(0);
      expect(result.filteredItems).toHaveLength(1);
      expect(result.filteredItems[0].reason).toContain('Invalid prerequisite references');
      expect(result.filteredItems[0].missingPrerequisites).toEqual(['invalid-prereq']);
    });

    it('should filter items with unmastered prerequisites', async () => {
      const item = createTestItem('item1', ['prereq1', 'prereq2']);

      // Mock valid references
      mockReferenceValidator.validateChunkPrerequisites.mockResolvedValue({
        isValid: true,
        validReferences: ['prereq1', 'prereq2'],
        invalidReferences: [],
        errors: [],
      });

      // Mock mastery status - one mastered, one not
      mockMasteryService.checkItemMastery
        .mockResolvedValueOnce(createMasteryStatus('prereq1', true))
        .mockResolvedValueOnce(createMasteryStatus('prereq2', false));

      const result = await validator.filterByPrerequisites([item]);

      expect(result.validItems).toHaveLength(0);
      expect(result.filteredItems).toHaveLength(1);
      expect(result.filteredItems[0].reason).toContain('Prerequisite "prereq2" not yet mastered');
      expect(result.filteredItems[0].missingPrerequisites).toEqual(['prereq2']);
    });

    it('should pass items with all prerequisites mastered', async () => {
      const item = createTestItem('item1', ['prereq1', 'prereq2']);

      // Mock valid references
      mockReferenceValidator.validateChunkPrerequisites.mockResolvedValue({
        isValid: true,
        validReferences: ['prereq1', 'prereq2'],
        invalidReferences: [],
        errors: [],
      });

      // Mock mastery status - both mastered
      mockMasteryService.checkItemMastery
        .mockResolvedValueOnce(createMasteryStatus('prereq1', true))
        .mockResolvedValueOnce(createMasteryStatus('prereq2', true));

      const result = await validator.filterByPrerequisites([item]);

      expect(result.validItems).toHaveLength(1);
      expect(result.validItems[0]).toEqual(item);
      expect(result.filteredItems).toHaveLength(0);
    });

    it('should exclude specified item IDs', async () => {
      const items = [createTestItem('item1'), createTestItem('item2'), createTestItem('item3')];

      const result = await validator.filterByPrerequisites(items, ['item2']);

      expect(result.validItems).toHaveLength(2);
      expect(result.validItems.map(item => item.id)).toEqual(['item1', 'item3']);
    });

    it('should handle multiple missing prerequisites correctly', async () => {
      const item = createTestItem('item1', ['prereq1', 'prereq2', 'prereq3']);

      mockReferenceValidator.validateChunkPrerequisites.mockResolvedValue({
        isValid: true,
        validReferences: ['prereq1', 'prereq2', 'prereq3'],
        invalidReferences: [],
        errors: [],
      });

      // Mock mastery status - none mastered
      mockMasteryService.checkItemMastery
        .mockResolvedValueOnce(createMasteryStatus('prereq1', false))
        .mockResolvedValueOnce(createMasteryStatus('prereq2', false))
        .mockResolvedValueOnce(createMasteryStatus('prereq3', false));

      const result = await validator.filterByPrerequisites([item]);

      expect(result.filteredItems).toHaveLength(1);
      expect(result.filteredItems[0].reason).toContain('3 prerequisites not yet mastered');
      expect(result.filteredItems[0].reason).toContain('prereq1, prereq2, prereq3');
    });

    it('should handle validation errors gracefully', async () => {
      const item = createTestItem('item1', ['prereq1']);

      // First call is the DB connectivity probe — let it succeed
      // Subsequent calls (per-item validation) reject
      mockReferenceValidator.validateChunkPrerequisites
        .mockResolvedValueOnce({
          isValid: true,
          validReferences: [],
          invalidReferences: [],
          errors: [],
        })
        .mockRejectedValue(new Error('Database connection failed'));

      const result = await validator.filterByPrerequisites([item]);

      expect(result.filteredItems).toHaveLength(1);
      expect(result.filteredItems[0].reason).toContain('Prerequisite validation failed');
      expect(result.filteredItems[0].reason).toContain('Database connection failed');
    });
  });

  describe('validatePrerequisites', () => {
    it('should return valid for empty prerequisites', async () => {
      const result = await validator.validatePrerequisites('item1', []);

      expect(result.isValid).toBe(true);
      expect(result.missingPrerequisites).toEqual([]);
      expect(result.masteredPrerequisites).toEqual([]);
    });

    it('should return valid for null prerequisites', async () => {
      const result = await validator.validatePrerequisites('item1', undefined as any);

      expect(result.isValid).toBe(true);
      expect(result.missingPrerequisites).toEqual([]);
      expect(result.masteredPrerequisites).toEqual([]);
    });

    it('should correctly categorize mastered and missing prerequisites', async () => {
      const prerequisites = ['prereq1', 'prereq2', 'prereq3'];

      mockMasteryService.checkItemMastery
        .mockResolvedValueOnce(createMasteryStatus('prereq1', true))
        .mockResolvedValueOnce(createMasteryStatus('prereq2', false))
        .mockResolvedValueOnce(createMasteryStatus('prereq3', true));

      const result = await validator.validatePrerequisites('item1', prerequisites);

      expect(result.isValid).toBe(false);
      expect(result.masteredPrerequisites).toEqual(['prereq1', 'prereq3']);
      expect(result.missingPrerequisites).toEqual(['prereq2']);
    });

    it('should handle mastery check errors', async () => {
      mockMasteryService.checkItemMastery.mockRejectedValue(new Error('Mastery check failed'));

      const result = await validator.validatePrerequisites('item1', ['prereq1']);

      expect(result.isValid).toBe(false);
      expect(result.missingPrerequisites).toEqual(['prereq1']);
      expect(result.validationErrors).toHaveLength(1);
      expect(result.validationErrors![0]).toContain('Error checking mastery');
    });
  });

  describe('checkItemMastery', () => {
    it('should delegate to prerequisite mastery service', async () => {
      const expectedMastery = createMasteryStatus('item1', true);
      mockMasteryService.checkItemMastery.mockResolvedValue(expectedMastery);

      const result = await validator.checkItemMastery('item1');

      expect(mockMasteryService.checkItemMastery).toHaveBeenCalledWith('item1');
      expect(result).toEqual(expectedMastery);
    });
  });

  describe('mastery criteria management', () => {
    it('should update mastery criteria', () => {
      const newCriteria = {
        minimumQualityScore: 3.5,
        requiredAttempts: 3,
      };

      validator.updateMasteryCriteria(newCriteria);
      const currentCriteria = validator.getMasteryCriteria();

      expect(currentCriteria.minimumQualityScore).toBe(3.5);
      expect(currentCriteria.requiredAttempts).toBe(3);
    });

    it('should return current mastery criteria', () => {
      const criteria = validator.getMasteryCriteria();

      expect(criteria).toHaveProperty('minimumQualityScore');
      expect(criteria).toHaveProperty('requiredAttempts');
      expect(criteria).toHaveProperty('recencyDays');
      expect(criteria).toHaveProperty('successRate');
    });
  });

  describe('filterByPrerequisites — database unavailable', () => {
    it('falls back to filterWithoutDatabase when DB is unavailable', async () => {
      // Make the DB connectivity probe fail
      mockReferenceValidator.validateChunkPrerequisites.mockRejectedValue(
        new Error('Connection refused')
      );

      const items = [
        createTestItem('no-prereqs'), // no prerequisites
        createTestItem('has-prereqs', ['prereq1']), // has prerequisites
      ];

      const result = await validator.filterByPrerequisites(items);

      // Only items without prerequisites should pass
      expect(result.validItems).toHaveLength(1);
      expect(result.validItems[0].id).toBe('no-prereqs');
      expect(result.rationale).toContain('Database services unavailable');
      expect(result.rationale).toContain('1 items without prerequisites included');
    });

    it('filterWithoutDatabase respects excludeIds', async () => {
      mockReferenceValidator.validateChunkPrerequisites.mockRejectedValue(
        new Error('Connection refused')
      );

      const items = [
        createTestItem('item1'),
        createTestItem('item2'),
        createTestItem('item3', ['prereq1']),
      ];

      const result = await validator.filterByPrerequisites(items, ['item1']);

      // item1 excluded, item2 passes (no prereqs), item3 skipped (has prereqs)
      expect(result.validItems).toHaveLength(1);
      expect(result.validItems[0].id).toBe('item2');
      expect(result.rationale).toContain('Database services unavailable');
    });
  });

  describe('generateFilteringRationale edge cases', () => {
    it('returns "No items were processed" for empty item list with excludeIds', async () => {
      const result = await validator.filterByPrerequisites([], ['excluded']);

      expect(result.rationale).toContain('No learning items provided');
    });

    it('returns "No items were processed" when all items are excluded by excludeIds', async () => {
      // DB probe succeeds
      mockReferenceValidator.validateChunkPrerequisites.mockResolvedValue({
        isValid: true,
        validReferences: [],
        invalidReferences: [],
        errors: [],
      });

      const items = [createTestItem('item1'), createTestItem('item2')];
      const result = await validator.filterByPrerequisites(items, ['item1', 'item2']);

      expect(result.rationale).toContain('No items were processed');
    });
  });

  describe('database availability caching', () => {
    it('uses cached DB availability on second call within interval', async () => {
      // DB probe succeeds
      mockReferenceValidator.validateChunkPrerequisites.mockResolvedValue({
        isValid: true,
        validReferences: [],
        invalidReferences: [],
        errors: [],
      });

      const items = [createTestItem('item1')];

      // First call — triggers DB probe
      await validator.filterByPrerequisites(items);
      // Second call — should use cached result
      await validator.filterByPrerequisites(items);

      // validateChunkPrerequisites called once for DB probe, not twice
      expect(mockReferenceValidator.validateChunkPrerequisites).toHaveBeenCalledTimes(1);
    });
  });

  describe('rationale generation', () => {
    it('should generate appropriate rationale for mixed results', async () => {
      const items = [
        createTestItem('item1'), // no prerequisites
        createTestItem('item2', ['prereq1']), // will be filtered
        createTestItem('item3', ['prereq2']), // will pass
      ];

      // Setup mocks — first call is DB connectivity probe, then per-item validation
      mockReferenceValidator.validateChunkPrerequisites
        .mockResolvedValueOnce({
          isValid: true,
          validReferences: [],
          invalidReferences: [],
          errors: [],
        })
        .mockResolvedValueOnce({
          isValid: true,
          validReferences: ['prereq1'],
          invalidReferences: [],
          errors: [],
        })
        .mockResolvedValueOnce({
          isValid: true,
          validReferences: ['prereq2'],
          invalidReferences: [],
          errors: [],
        });

      mockMasteryService.checkItemMastery
        .mockResolvedValueOnce(createMasteryStatus('prereq1', false))
        .mockResolvedValueOnce(createMasteryStatus('prereq2', true));

      const result = await validator.filterByPrerequisites(items);

      expect(result.rationale).toContain('learning items');
      expect(result.rationale).toContain('passed prerequisite validation');
      expect(result.rationale).toContain('filtered out');
    });
  });
});

describe('PrerequisiteValidator Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should work with realistic learning scenarios', async () => {
    const localRefValidator = {
      validateChunkPrerequisites: vi.fn(),
    };
    const localMasterySvc = {
      checkItemMastery: vi.fn(),
    };

    const validator = new PrerequisiteValidator({
      referenceValidator: localRefValidator,
      masteryService: localMasterySvc,
      algorithmConfig: DEFAULT_ALGORITHM_CONFIG,
      clock: () => NOW_MS,
      customCriteria: {
        minimumQualityScore: 4.0,
        requiredAttempts: 2,
        recencyDays: 30,
        successRate: 0.8,
      },
    });

    localRefValidator.validateChunkPrerequisites.mockResolvedValue({
      isValid: true,
      validReferences: ['basic-concepts'],
      invalidReferences: [],
      errors: [],
    });

    // Prerequisite not sufficiently mastered
    localMasterySvc.checkItemMastery.mockResolvedValue({
      itemId: 'basic-concepts',
      isMastered: false,
      averageQuality: 3.5, // Below threshold
      attemptCount: 2,
      daysSinceLastReview: 10,
      successRate: 0.75, // Below threshold
    });

    const createTestItem = (id: string, prerequisites: string[] = []): LearningItem => ({
      id,
      title: `Test Item ${id}`,
      subject: 'CS',
      difficulty: 5,
      nextReviewDate: '2025-09-26',
      easeFactor: 2.5,
      repetitions: 2,
      estimatedDuration: 10,
      chunkType: 'review',
      prerequisites,
      tags: [],
    });

    const advancedItem = createTestItem('advanced-topic', ['basic-concepts']);
    const result = await validator.filterByPrerequisites([advancedItem]);

    expect(result.validItems).toHaveLength(0);
    expect(result.filteredItems).toHaveLength(1);
    expect(result.rationale).toContain('1 filtered out');
  });
});
