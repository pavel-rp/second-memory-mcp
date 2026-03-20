import { describe, it, expect, beforeEach } from 'vitest';
import { DependencyResolver } from '../../../../src/domain/algorithms/dependency-resolver.js';
import type { LearningItem } from '../../../../src/domain/types/recommendations.js';

describe('DependencyResolver', () => {
  let resolver: DependencyResolver;

  beforeEach(() => {
    resolver = new DependencyResolver(5); // Max depth of 5 for testing
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

  describe('resolveDependencies', () => {
    it('should handle items with no dependencies', async () => {
      const items = [createTestItem('item1'), createTestItem('item2')];

      const result = await resolver.resolveDependencies(items);

      expect(result.isValid).toBe(true);
      expect(result.resolvedChain).toHaveLength(2);
      expect(result.circularDependencies).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should resolve simple linear dependencies', async () => {
      const items = [
        createTestItem('item1'), // No dependencies
        createTestItem('item2', ['item1']), // Depends on item1
        createTestItem('item3', ['item2']), // Depends on item2
      ];

      const result = await resolver.resolveDependencies(items);

      expect(result.isValid).toBe(true);
      expect(result.resolvedChain).toEqual(['item1', 'item2', 'item3']);
      expect(result.circularDependencies).toHaveLength(0);
    });

    it('should resolve complex dependency graph', async () => {
      const items = [
        createTestItem('a'), // No dependencies
        createTestItem('b'), // No dependencies
        createTestItem('c', ['a']), // Depends on a
        createTestItem('d', ['a', 'b']), // Depends on a and b
        createTestItem('e', ['c', 'd']), // Depends on c and d
      ];

      const result = await resolver.resolveDependencies(items);

      expect(result.isValid).toBe(true);

      // Check that dependencies come before dependents
      const chain = result.resolvedChain;
      expect(chain.indexOf('a')).toBeLessThan(chain.indexOf('c'));
      expect(chain.indexOf('a')).toBeLessThan(chain.indexOf('d'));
      expect(chain.indexOf('b')).toBeLessThan(chain.indexOf('d'));
      expect(chain.indexOf('c')).toBeLessThan(chain.indexOf('e'));
      expect(chain.indexOf('d')).toBeLessThan(chain.indexOf('e'));
    });

    it('should detect simple circular dependencies', async () => {
      const items = [createTestItem('item1', ['item2']), createTestItem('item2', ['item1'])];

      const result = await resolver.resolveDependencies(items);

      expect(result.isValid).toBe(false);
      expect(result.circularDependencies.length).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Circular dependencies detected');
    });

    it('should detect complex circular dependencies', async () => {
      const items = [
        createTestItem('item1', ['item3']),
        createTestItem('item2', ['item1']),
        createTestItem('item3', ['item2']),
      ];

      const result = await resolver.resolveDependencies(items);

      expect(result.isValid).toBe(false);
      expect(result.circularDependencies.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Circular dependencies detected');
    });

    it('should handle self-referencing dependencies', async () => {
      const items = [
        createTestItem('item1', ['item1']), // Self-reference
      ];

      const result = await resolver.resolveDependencies(items);

      expect(result.isValid).toBe(false);
      expect(result.circularDependencies).toContain('item1');
    });

    it('should resolve dependencies for specific target items', async () => {
      const items = [
        createTestItem('item1'),
        createTestItem('item2', ['item1']),
        createTestItem('item3'),
        createTestItem('item4', ['item3']),
      ];

      // Only resolve dependencies for item2
      const result = await resolver.resolveDependencies(items, ['item2']);

      expect(result.isValid).toBe(true);
      expect(result.resolvedChain).toEqual(['item1', 'item2']);
      expect(result.resolvedChain).not.toContain('item3');
      expect(result.resolvedChain).not.toContain('item4');
    });

    it('should handle missing prerequisite references gracefully', async () => {
      const items = [createTestItem('item1', ['nonexistent-item'])];

      const result = await resolver.resolveDependencies(items);

      // Should still work, treating nonexistent-item as having no dependencies
      expect(result.isValid).toBe(true);
      expect(result.resolvedChain).toContain('item1');
    });
  });

  describe('detectCircularDependencies', () => {
    it('should return false for acyclic graphs', () => {
      const dependencyGraph = new Map([
        ['item1', []],
        ['item2', ['item1']],
        ['item3', ['item2']],
      ]);

      const hasCircular = resolver.detectCircularDependencies('item3', dependencyGraph);
      expect(hasCircular).toBe(false);
    });

    it('should return true for direct circular dependency', () => {
      const dependencyGraph = new Map([
        ['item1', ['item2']],
        ['item2', ['item1']],
      ]);

      const hasCircular = resolver.detectCircularDependencies('item1', dependencyGraph);
      expect(hasCircular).toBe(true);
    });

    it('should return true for indirect circular dependency', () => {
      const dependencyGraph = new Map([
        ['item1', ['item2']],
        ['item2', ['item3']],
        ['item3', ['item1']],
      ]);

      const hasCircular = resolver.detectCircularDependencies('item1', dependencyGraph);
      expect(hasCircular).toBe(true);
    });

    it('should handle empty dependency graph', () => {
      const dependencyGraph = new Map<string, string[]>();

      const hasCircular = resolver.detectCircularDependencies('item1', dependencyGraph);
      expect(hasCircular).toBe(false);
    });
  });

  describe('depth calculation', () => {
    it('should calculate correct max depth for linear chain', async () => {
      const items = [
        createTestItem('item1'),
        createTestItem('item2', ['item1']),
        createTestItem('item3', ['item2']),
        createTestItem('item4', ['item3']),
      ];

      const result = await resolver.resolveDependencies(items, ['item4']);

      expect(result.isValid).toBe(true);
      expect(result.maxDepthReached).toBe(3); // item4 -> item3 -> item2 -> item1
    });

    it('should calculate correct max depth for complex graph', async () => {
      const items = [
        createTestItem('base1'),
        createTestItem('base2'),
        createTestItem('mid1', ['base1']),
        createTestItem('mid2', ['base2']),
        createTestItem('top', ['mid1', 'mid2']),
      ];

      const result = await resolver.resolveDependencies(items, ['top']);

      expect(result.isValid).toBe(true);
      expect(result.maxDepthReached).toBe(2); // top -> mid1/mid2 -> base1/base2
    });
  });

  describe('maxDepth exceeded', () => {
    it('returns invalid when dependency depth exceeds maxDepth limit', async () => {
      const shallowResolver = new DependencyResolver(2); // maxDepth = 2
      const items = [
        createTestItem('item1'),
        createTestItem('item2', ['item1']),
        createTestItem('item3', ['item2']),
        createTestItem('item4', ['item3']), // depth 3 > maxDepth 2
      ];

      const result = await shallowResolver.resolveDependencies(items, ['item4']);

      expect(result.isValid).toBe(false);
      expect(result.maxDepthReached).toBeGreaterThan(2);
      expect(result.errors[0]).toContain('exceeds maximum allowed depth');
      expect(result.resolvedChain).toEqual([]);
    });

    it('returns valid when depth equals maxDepth exactly', async () => {
      const exactResolver = new DependencyResolver(3);
      const items = [
        createTestItem('item1'),
        createTestItem('item2', ['item1']),
        createTestItem('item3', ['item2']),
        createTestItem('item4', ['item3']), // depth = 3 = maxDepth
      ];

      const result = await exactResolver.resolveDependencies(items, ['item4']);

      expect(result.isValid).toBe(true);
      expect(result.maxDepthReached).toBe(3);
    });
  });

  describe('target nodes not in dependency graph', () => {
    it('resolves target items that have no prerequisites and no dependents', async () => {
      // Items exist but target nodes are standalone — not referenced by anyone
      const items = [createTestItem('orphan1'), createTestItem('orphan2')];

      const result = await resolver.resolveDependencies(items, ['orphan1']);

      expect(result.isValid).toBe(true);
      expect(result.resolvedChain).toContain('orphan1');
      expect(result.resolvedChain).not.toContain('orphan2');
    });

    it('adds target nodes to inDegree map when not already present', async () => {
      // Target item has a prerequisite not in the item list
      const items = [createTestItem('base'), createTestItem('middle', ['base'])];

      // Resolve for a target that depends on middle
      const result = await resolver.resolveDependencies(items, ['middle']);

      expect(result.isValid).toBe(true);
      expect(result.resolvedChain).toEqual(['base', 'middle']);
    });

    it('handles target ID not present in the items list', async () => {
      // 'ghost' is requested as a target but doesn't exist in items
      const items = [createTestItem('base'), createTestItem('child', ['base'])];

      const result = await resolver.resolveDependencies(items, ['ghost']);

      expect(result.isValid).toBe(true);
      expect(result.resolvedChain).toContain('ghost');
    });
  });

  describe('performance and edge cases', () => {
    it('should handle large dependency graphs efficiently', async () => {
      const deepResolver = new DependencyResolver(100);
      const items: LearningItem[] = [];

      // Create a large linear chain
      items.push(createTestItem('item0'));
      for (let i = 1; i < 50; i++) {
        items.push(createTestItem(`item${i}`, [`item${i - 1}`]));
      }

      const startTime = Date.now();
      const result = await deepResolver.resolveDependencies(items);
      const endTime = Date.now();

      expect(result.isValid).toBe(true);
      expect(result.resolvedChain).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle empty item list', async () => {
      const result = await resolver.resolveDependencies([]);

      expect(result.isValid).toBe(true);
      expect(result.resolvedChain).toHaveLength(0);
      expect(result.circularDependencies).toHaveLength(0);
      expect(result.maxDepthReached).toBe(0);
    });

    it('should handle items with duplicate prerequisites', async () => {
      const items = [
        createTestItem('item1'),
        createTestItem('item2', ['item1', 'item1']), // Duplicate prerequisite
      ];

      const result = await resolver.resolveDependencies(items);

      expect(result.isValid).toBe(true);
      expect(result.resolvedChain).toEqual(['item1', 'item2']);
    });

    it('should handle items with empty prerequisite arrays', async () => {
      const items = [createTestItem('item1', []), createTestItem('item2', ['item1'])];

      const result = await resolver.resolveDependencies(items);

      expect(result.isValid).toBe(true);
      expect(result.resolvedChain).toEqual(['item1', 'item2']);
    });
  });

  describe('error handling', () => {
    it('should provide meaningful error messages for circular dependencies', async () => {
      const items = [
        createTestItem('math-basics', ['advanced-calc']),
        createTestItem('algebra', ['math-basics']),
        createTestItem('advanced-calc', ['algebra']),
      ];

      const result = await resolver.resolveDependencies(items);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Circular dependencies detected');
      expect(result.circularDependencies.length).toBeGreaterThan(0);
    });

    it('should handle mixed valid and circular dependencies', async () => {
      const items = [
        createTestItem('valid1'),
        createTestItem('valid2', ['valid1']),
        createTestItem('circular1', ['circular2']),
        createTestItem('circular2', ['circular1']),
      ];

      const result = await resolver.resolveDependencies(items);

      expect(result.isValid).toBe(false);
      expect(result.circularDependencies).toContain('circular1');
      expect(result.circularDependencies).toContain('circular2');
    });
  });
});
