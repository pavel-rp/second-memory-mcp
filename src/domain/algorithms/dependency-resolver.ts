import type { LearningItem } from '../types/recommendations.js';
import { extractErrorMessage } from '../../shared/errors.js';

/**
 * Result of dependency resolution
 */
export type DependencyResolutionResult = {
  /** Resolved dependency chain in order (prerequisites first) */
  resolvedChain: string[];
  /** Items that have circular dependencies */
  circularDependencies: string[];
  /** Maximum depth reached during resolution */
  maxDepthReached: number;
  /** Whether resolution was successful */
  isValid: boolean;
  /** Any errors encountered during resolution */
  errors: string[];
};

/**
 * Utility for resolving complex prerequisite dependency chains and detecting circular dependencies
 * Implements efficient graph algorithms for dependency management
 */
export class DependencyResolver {
  private maxDepth: number;

  constructor(maxDepth: number) {
    this.maxDepth = maxDepth;
  }

  /**
   * Resolve dependencies for a set of learning items, returning them in proper order
   * @param items Learning items with prerequisite relationships
   * @param targetItemIds Optional specific items to resolve dependencies for
   * @returns Dependency resolution result with ordered chain
   */
  async resolveDependencies(
    items: LearningItem[],
    targetItemIds?: string[]
  ): Promise<DependencyResolutionResult> {
    // Build dependency graph from learning items
    const dependencyGraph = this.buildDependencyGraph(items);

    // Determine which items to resolve
    const itemsToResolve = targetItemIds || items.map(item => item.id);

    // Check for circular dependencies first
    const circularDependencies = this.detectAllCircularDependencies(dependencyGraph);

    if (circularDependencies.length > 0) {
      return {
        resolvedChain: [],
        circularDependencies,
        maxDepthReached: 0,
        isValid: false,
        errors: [`Circular dependencies detected: ${circularDependencies.join(' -> ')}`],
      };
    }

    // Resolve dependency chain using topological sort
    try {
      const resolvedChain = this.topologicalSort(dependencyGraph, itemsToResolve);

      const maxDepthReached = this.calculateMaxDepth(dependencyGraph, itemsToResolve);

      if (maxDepthReached > this.maxDepth) {
        return {
          resolvedChain: [],
          circularDependencies: [],
          maxDepthReached,
          isValid: false,
          errors: [
            `Dependency depth ${maxDepthReached} exceeds maximum allowed depth ${this.maxDepth}`,
          ],
        };
      }

      return {
        resolvedChain,
        circularDependencies: [],
        maxDepthReached,
        isValid: true,
        errors: [],
      };
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      return {
        resolvedChain: [],
        circularDependencies: [],
        maxDepthReached: 0,
        isValid: false,
        errors: [errorMessage],
      };
    }
  }

  /**
   * Detect circular dependencies in a dependency graph
   * @param itemId Starting item ID
   * @param dependencyGraph Full dependency graph
   * @param visited Set of visited nodes (for cycle detection)
   * @param recursionStack Current recursion path (for cycle detection)
   * @returns True if circular dependency detected
   */
  detectCircularDependencies(
    itemId: string,
    dependencyGraph: Map<string, string[]>,
    visited: Set<string> = new Set(),
    recursionStack: Set<string> = new Set()
  ): boolean {
    // Mark current node as visited and add to recursion stack
    visited.add(itemId);
    recursionStack.add(itemId);

    // Check all prerequisites of current item
    const prerequisites = dependencyGraph.get(itemId) || [];

    for (const prereqId of prerequisites) {
      // If prerequisite not visited yet, recurse
      if (!visited.has(prereqId)) {
        if (this.detectCircularDependencies(prereqId, dependencyGraph, visited, recursionStack)) {
          return true;
        }
      }
      // If prerequisite is in current recursion stack, we found a cycle
      else if (recursionStack.has(prereqId)) {
        return true;
      }
    }

    // Remove from recursion stack before returning
    recursionStack.delete(itemId);
    return false;
  }

  /**
   * Detect all circular dependencies in the graph
   * @param dependencyGraph Dependency graph to check
   * @returns Array of item IDs involved in circular dependencies
   */
  private detectAllCircularDependencies(dependencyGraph: Map<string, string[]>): string[] {
    const visited = new Set<string>();
    const circularItems = new Set<string>();

    for (const itemId of dependencyGraph.keys()) {
      if (!visited.has(itemId)) {
        const recursionStack = new Set<string>();
        if (
          this.findCircularPath(itemId, dependencyGraph, visited, recursionStack, circularItems)
        ) {
          // Add all items in current recursion stack to circular items
          recursionStack.forEach(id => circularItems.add(id));
        }
      }
    }

    return Array.from(circularItems);
  }

  /**
   * Helper method to find circular paths and collect all involved items
   */
  private findCircularPath(
    itemId: string,
    dependencyGraph: Map<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>,
    circularItems: Set<string>
  ): boolean {
    visited.add(itemId);
    recursionStack.add(itemId);

    const prerequisites = dependencyGraph.get(itemId) || [];

    for (const prereqId of prerequisites) {
      if (!visited.has(prereqId)) {
        if (
          this.findCircularPath(prereqId, dependencyGraph, visited, recursionStack, circularItems)
        ) {
          circularItems.add(itemId);
          return true;
        }
      } else if (recursionStack.has(prereqId)) {
        circularItems.add(itemId);
        circularItems.add(prereqId);
        return true;
      }
    }

    recursionStack.delete(itemId);
    return false;
  }

  /**
   * Build dependency graph from learning items
   * @param items Learning items with prerequisites
   * @returns Map of item ID to prerequisite IDs
   */
  private buildDependencyGraph(items: LearningItem[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    for (const item of items) {
      graph.set(item.id, item.prerequisites || []);
    }

    return graph;
  }

  /**
   * Perform topological sort to resolve dependency order
   * @param dependencyGraph Dependency graph
   * @param targetItems Items to include in resolution
   * @returns Ordered list of item IDs (prerequisites first)
   */
  private topologicalSort(dependencyGraph: Map<string, string[]>, targetItems: string[]): string[] {
    const inDegree = new Map<string, number>();
    const dependentsMap = new Map<string, string[]>();
    const result: string[] = [];
    const queue: string[] = [];

    // Collect all nodes present either as items or prerequisites
    const allNodes = new Set<string>();
    for (const [node, prerequisites] of dependencyGraph) {
      allNodes.add(node);
      inDegree.set(node, prerequisites.length);

      for (const prereq of prerequisites) {
        allNodes.add(prereq);
        inDegree.set(prereq, inDegree.get(prereq) ?? 0);
        const dependents = dependentsMap.get(prereq) ?? [];
        dependents.push(node);
        dependentsMap.set(prereq, dependents);
      }
    }

    for (const target of targetItems) {
      allNodes.add(target);
      if (!inDegree.has(target)) {
        inDegree.set(target, 0);
      }
    }

    // Nodes with no incoming edges are prerequisites that can be processed first
    for (const [node, degree] of inDegree) {
      if (degree === 0) {
        queue.push(node);
      }
    }

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        continue;
      }
      result.push(current);

      const dependents = dependentsMap.get(current) ?? [];
      for (const dependent of dependents) {
        const newInDegree = (inDegree.get(dependent) || 0) - 1;
        inDegree.set(dependent, newInDegree);
        if (newInDegree === 0) {
          queue.push(dependent);
        }
      }
    }

    if (result.length !== allNodes.size) {
      throw new Error('Dependency cycle detected during topological sort');
    }

    const relevantItems = this.findAllDependencies(dependencyGraph, targetItems);
    return result.filter(item => relevantItems.has(item));
  }

  /**
   * Find all dependencies (transitive) for given target items
   * @param dependencyGraph Dependency graph
   * @param targetItems Target items to find dependencies for
   * @returns Set of all relevant item IDs
   */
  private findAllDependencies(
    dependencyGraph: Map<string, string[]>,
    targetItems: string[]
  ): Set<string> {
    const relevant = new Set<string>();
    const visited = new Set<string>();

    const dfs = (itemId: string) => {
      if (visited.has(itemId)) return;
      visited.add(itemId);
      relevant.add(itemId);

      const prerequisites = dependencyGraph.get(itemId) || [];
      for (const prereq of prerequisites) {
        dfs(prereq);
      }
    };

    for (const targetItem of targetItems) {
      dfs(targetItem);
    }

    return relevant;
  }

  /**
   * Calculate maximum depth of dependency chain
   * @param dependencyGraph Dependency graph
   * @param targetItems Items to calculate depth for
   * @returns Maximum depth reached
   */
  private calculateMaxDepth(dependencyGraph: Map<string, string[]>, targetItems: string[]): number {
    let maxDepth = 0;

    const calculateDepth = (itemId: string, visited: Set<string> = new Set()): number => {
      if (visited.has(itemId)) return 0; // Avoid infinite loops
      visited.add(itemId);

      const prerequisites = dependencyGraph.get(itemId) || [];
      if (prerequisites.length === 0) return 0;

      let maxPrereqDepth = 0;
      for (const prereq of prerequisites) {
        const depth = calculateDepth(prereq, new Set(visited));
        maxPrereqDepth = Math.max(maxPrereqDepth, depth);
      }

      return maxPrereqDepth + 1;
    };

    for (const targetItem of targetItems) {
      const depth = calculateDepth(targetItem);
      maxDepth = Math.max(maxDepth, depth);
    }

    return maxDepth;
  }
}
