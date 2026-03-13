import { calculatePriorityScore } from '../algorithms/sr-calculator.js';
import { calculateItemCognitiveLoad } from './cognitive-load.js';
import type { PrerequisiteValidator } from './prerequisite-validator.js';
import type { DependencyResolver } from '../algorithms/dependency-resolver.js';
import type { AlgorithmConfig } from '../config/algorithm.js';
import type {
  RecommendationInput,
  RecommendationOutput,
  LearningItem,
  LearningRecommendation,
  SessionSummary,
  ConversationGuidance,
  SessionConstraints,
  LearningPatterns,
  SubjectPreference,
} from '../types/recommendations.js';
import { logger } from '../../shared/logger.js';

/**
 * Core recommendation engine that generates intelligent learning recommendations
 * based on spaced repetition algorithms, cognitive load theory, and user history
 */
export class RecommendationEngine {
  private lastPrerequisiteFiltering: { rationale: string; filteredCount: number } | null = null;
  private lastDependencyResolution: {
    addedPrerequisites: string[];
    resolvedChain: string[];
  } | null = null;
  private chunkLookupFn: (id: string) => Promise<LearningItem | undefined>;
  private prerequisiteValidator: PrerequisiteValidator;
  private dependencyResolver: DependencyResolver;
  private algorithmConfig: AlgorithmConfig;

  constructor(deps: {
    chunkLookupFn: (id: string) => Promise<LearningItem | undefined>;
    prerequisiteValidator: PrerequisiteValidator;
    dependencyResolver: DependencyResolver;
    algorithmConfig: AlgorithmConfig;
  }) {
    this.chunkLookupFn = deps.chunkLookupFn;
    this.prerequisiteValidator = deps.prerequisiteValidator;
    this.dependencyResolver = deps.dependencyResolver;
    this.algorithmConfig = deps.algorithmConfig;
  }

  /**
   * Generate personalized learning recommendations
   */
  async generateRecommendations(
    input: RecommendationInput,
    now: Date
  ): Promise<RecommendationOutput> {
    // Apply intelligent defaults for guided mode
    const processedInput = this.applyIntelligentDefaults(input);

    // Filter and prioritize learning items
    const candidates = await this.filterAndPrioritizeCandidates(
      processedInput.learningItems,
      processedInput.constraints,
      now
    );

    // Compose balanced session
    let recommendations = this.composeBalancedSession(candidates, processedInput, now);

    // Resolve dependencies and include missing prerequisites
    recommendations = await this.resolveAndIncludePrerequisites(
      recommendations,
      processedInput.learningItems || [],
      now
    );

    // Generate session summary
    const sessionSummary = this.generateSessionSummary(recommendations);

    // Generate conversation guidance for guided mode
    const conversationGuidance =
      processedInput.mode === 'guided'
        ? this.generateConversationGuidance(processedInput, recommendations)
        : undefined;

    // Generate rationale
    const rationale = this.generateRationale(recommendations, processedInput);

    // Generate alternatives
    const alternatives = this.generateAlternatives(candidates, recommendations, now);

    // Add orchestration hint if no learning items provided
    const orchestrationHint =
      (processedInput.learningItems?.length ?? 0) === 0
        ? processedInput.fetchFromDatabase
          ? 'No learning items found with current filters. Try relaxing filters (subjectFilter, dueOnly, limit) or add more learning content to the database.'
          : 'No learning items provided. RECOMMENDED: Use fetchFromDatabase: true to automatically fetch and generate recommendations in one call. Legacy: You can also use list_learning_items to fetch items manually and then pass them to this tool.'
        : undefined;

    // Include dependency resolution info if prerequisites were added
    const dependencyResolution =
      this.lastDependencyResolution && this.lastDependencyResolution.addedPrerequisites.length > 0
        ? {
            addedPrerequisites: this.lastDependencyResolution.addedPrerequisites,
            resolvedOrder: this.lastDependencyResolution.resolvedChain,
          }
        : undefined;

    return {
      recommendations,
      sessionSummary,
      conversationGuidance,
      estimatedDuration: sessionSummary.totalDuration,
      rationale,
      alternatives,
      nextActions: this.generateNextActions(recommendations, processedInput),
      orchestrationHint,
      dependencyResolution,
    };
  }

  /**
   * Apply intelligent defaults based on user history and mode
   */
  private applyIntelligentDefaults(input: RecommendationInput): RecommendationInput {
    const defaults: Partial<RecommendationInput> = {
      mode: input.mode || 'guided',
    };

    // Time estimation based on history or system defaults
    if (!input.timeAvailable) {
      if (input.userHistory?.patterns.averageSessionDuration) {
        defaults.timeAvailable = input.userHistory.patterns.averageSessionDuration;
      } else {
        defaults.timeAvailable = 30; // 30-minute default
      }
    }

    // Subject preference from history
    if (!input.subjectPreference && input.userHistory?.patterns.subjectPreferences) {
      const preferences = input.userHistory.patterns.subjectPreferences;
      const topSubject = Object.entries(preferences).sort(([, a], [, b]) => b - a)[0]?.[0];
      if (this.isSubjectPreference(topSubject)) {
        defaults.subjectPreference = topSubject;
      } else {
        defaults.subjectPreference = 'Any';
      }
    }

    // Constraints based on cognitive load patterns
    if (!input.constraints) {
      defaults.constraints = this.generateIntelligentConstraints(input);
    }

    return { ...defaults, ...input };
  }

  /**
   * Generate intelligent constraints based on user patterns
   */
  private generateIntelligentConstraints(input: RecommendationInput): SessionConstraints {
    const patterns = input.userHistory?.patterns;

    return {
      maxDuration: input.timeAvailable || 30,
      maxCognitiveLoad: patterns?.fatigueThreshold || 20,
      maxNewItems: this.calculateOptimalNewItems(patterns),
      subjectFilter: input.subjectPreference !== 'Any' ? input.subjectPreference : undefined,
    };
  }

  /**
   * Calculate optimal number of new items based on success patterns
   */
  private calculateOptimalNewItems(patterns?: LearningPatterns): number {
    if (!patterns) return 3; // Conservative default

    // Adjust new items based on success rate
    const baseNewItems = 5;
    const adjustment = (patterns.successRate - 0.7) * 5; // +/- based on 70% baseline
    return Math.max(1, Math.min(9, Math.round(baseNewItems + adjustment)));
  }

  /**
   * Filter and prioritize learning items using existing algorithms
   */
  private async filterAndPrioritizeCandidates(
    items: LearningItem[] | undefined,
    constraints: SessionConstraints | undefined,
    now: Date
  ): Promise<LearningItem[]> {
    let filtered = items ? [...items] : [];

    // Apply subject filter
    if (constraints?.subjectFilter) {
      filtered = filtered.filter(item => item.subject === constraints.subjectFilter);
    }

    // Exclude specific IDs
    const excludeIds = constraints?.excludeIds;
    if (excludeIds && excludeIds.length > 0) {
      filtered = filtered.filter(item => !excludeIds.includes(item.id));
    }

    // Apply prerequisite filtering (before priority scoring)
    try {
      const prerequisiteResult = await this.prerequisiteValidator.filterByPrerequisites(
        filtered,
        constraints?.excludeIds
      );

      // Store filtering information for rationale generation
      this.lastPrerequisiteFiltering = {
        rationale: prerequisiteResult.rationale,
        filteredCount: prerequisiteResult.filteredItems.length,
      };

      // Use only items that passed prerequisite validation
      filtered = prerequisiteResult.validItems;
    } catch (error) {
      // Log error but continue with original filtering if prerequisite validation fails
      logger.warn(
        'Prerequisite validation failed, continuing without prerequisite filtering:',
        error
      );
      this.lastPrerequisiteFiltering = {
        rationale: 'Prerequisite validation unavailable - continuing with all items',
        filteredCount: 0,
      };
    }

    // Calculate priorities for remaining items
    const itemsWithPriority = filtered.map(item => {
      const priorityInput = {
        nextReviewDate: item.nextReviewDate,
        easeFactor: item.easeFactor,
        repetitions: item.repetitions,
        difficulty: item.difficulty,
      };

      const { priority } = calculatePriorityScore(priorityInput, this.algorithmConfig, now);
      return { ...item, calculatedPriority: priority };
    });

    // Sort by priority (highest first)
    return itemsWithPriority
      .sort((a, b) => b.calculatedPriority - a.calculatedPriority)
      .map(({ calculatedPriority: _calculatedPriority, ...item }) => item);
  }

  /**
   * Compose balanced session with cognitive load management
   */
  private composeBalancedSession(
    candidates: LearningItem[],
    input: RecommendationInput,
    now: Date
  ): LearningRecommendation[] {
    const constraints = input.constraints ?? this.generateIntelligentConstraints(input);
    const recommendations: LearningRecommendation[] = [];
    let totalDuration = 0;
    let totalCognitiveLoad = 0;
    let newItemCount = 0;

    // Separate items by type for balanced selection
    const overdueItems = candidates.filter(item => new Date(item.nextReviewDate) <= now);
    const reviewItems = candidates.filter(
      item => new Date(item.nextReviewDate) > now && item.chunkType === 'review'
    );
    const newItems = candidates.filter(item => item.chunkType === 'new');

    // Prioritize overdue items
    for (const item of overdueItems) {
      if (this.shouldAddToSession(item, constraints, totalDuration, totalCognitiveLoad)) {
        const recommendation = this.createRecommendation(
          item,
          recommendations.length + 1,
          'overdue - needs immediate attention',
          now
        );
        recommendations.push(recommendation);
        totalDuration += item.estimatedDuration;
        totalCognitiveLoad += recommendation.cognitiveLoad;
      }
    }

    // Add review items
    for (const item of reviewItems) {
      if (this.shouldAddToSession(item, constraints, totalDuration, totalCognitiveLoad)) {
        const recommendation = this.createRecommendation(
          item,
          recommendations.length + 1,
          'optimal review timing',
          now
        );
        recommendations.push(recommendation);
        totalDuration += item.estimatedDuration;
        totalCognitiveLoad += recommendation.cognitiveLoad;
      }
    }

    // Add new items up to limit
    for (const item of newItems) {
      if (newItemCount >= (constraints.maxNewItems || 5)) break;
      if (this.shouldAddToSession(item, constraints, totalDuration, totalCognitiveLoad)) {
        const recommendation = this.createRecommendation(
          item,
          recommendations.length + 1,
          'new content - expanding knowledge',
          now
        );
        recommendations.push(recommendation);
        totalDuration += item.estimatedDuration;
        totalCognitiveLoad += recommendation.cognitiveLoad;
        newItemCount++;
      }
    }

    // Interleave for optimal learning (mix difficulties)
    return this.interleaveRecommendations(recommendations);
  }

  /**
   * Check if item should be added to session based on constraints
   */
  private shouldAddToSession(
    item: LearningItem,
    constraints: SessionConstraints,
    currentDuration: number,
    currentCognitiveLoad: number
  ): boolean {
    // Duration check
    if (
      constraints.maxDuration &&
      currentDuration + item.estimatedDuration > constraints.maxDuration
    ) {
      return false;
    }

    // Cognitive load check
    const itemCognitiveLoad = calculateItemCognitiveLoad(item);
    if (
      constraints.maxCognitiveLoad &&
      currentCognitiveLoad + itemCognitiveLoad > constraints.maxCognitiveLoad
    ) {
      return false;
    }

    return true;
  }

  /**
   * Create recommendation with priority and cognitive load calculation
   */
  private createRecommendation(
    item: LearningItem,
    order: number,
    reason: string,
    now: Date
  ): LearningRecommendation {
    const priorityInput = {
      nextReviewDate: item.nextReviewDate,
      easeFactor: item.easeFactor,
      repetitions: item.repetitions,
      difficulty: item.difficulty,
    };

    const { priority } = calculatePriorityScore(priorityInput, this.algorithmConfig, now);

    return {
      item,
      priority,
      reason,
      order,
      cognitiveLoad: this.calculateCognitiveLoad(item),
    };
  }

  /**
   * Calculate cognitive load for an item
   */
  private calculateCognitiveLoad(item: LearningItem): number {
    return calculateItemCognitiveLoad(item);
  }

  /**
   * Interleave recommendations at the topic level.
   * Chunks from the same topic stay contiguous (preserving input order);
   * topic-groups are emitted sequentially in first-seen order.
   * Chunks without a topicId are treated as individual single-item groups.
   */
  private interleaveRecommendations(
    recommendations: LearningRecommendation[]
  ): LearningRecommendation[] {
    if (recommendations.length === 0) return [];

    // Group by topicId; orphan chunks each become their own group
    const groupMap = new Map<string, LearningRecommendation[]>();
    let orphanCounter = 0;

    for (const rec of recommendations) {
      const key = rec.item.topicId ?? `__orphan_${orphanCounter++}`;
      let group = groupMap.get(key);
      if (!group) {
        group = [];
        groupMap.set(key, group);
      }
      group.push(rec);
    }

    // Emit groups sequentially in insertion order: all chunks of group 1, then group 2, etc.
    const interleaved: LearningRecommendation[] = [];
    let order = 1;
    for (const group of groupMap.values()) {
      for (const rec of group) {
        interleaved.push({ ...rec, order: order++ });
      }
    }

    return interleaved;
  }

  /**
   * BFS traversal to discover all transitive prerequisites for selected items
   */
  private async discoverPrerequisiteGraph(
    selectedIds: string[],
    itemMap: Map<string, LearningItem>
  ): Promise<Set<string>> {
    const queue: string[] = [...selectedIds];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId || visited.has(currentId)) continue;
      visited.add(currentId);

      let item = itemMap.get(currentId);
      if (!item) {
        item = await this.chunkLookupFn(currentId);
        if (!item) {
          logger.warn(`Prerequisite chunk ${currentId} not found in database`);
          continue;
        }
        itemMap.set(currentId, item);
      }

      for (const prereqId of item.prerequisites || []) {
        if (!visited.has(prereqId)) queue.push(prereqId);
      }
    }

    return visited;
  }

  /**
   * Build ordered recommendations from a resolved dependency chain
   */
  private buildOrderedRecommendations(
    resolvedChain: string[],
    selectedIdSet: Set<string>,
    recommendationMap: Map<string, LearningRecommendation>,
    itemMap: Map<string, LearningItem>,
    now: Date
  ): { recommendations: LearningRecommendation[]; includedIds: string[] } {
    let order = 1;
    const combined: LearningRecommendation[] = [];
    const includedIds: string[] = [];

    for (const itemId of resolvedChain) {
      if (selectedIdSet.has(itemId)) {
        const existing = recommendationMap.get(itemId);
        if (existing) {
          combined.push({ ...existing, order: order++ });
          includedIds.push(itemId);
        }
        continue;
      }

      const item = itemMap.get(itemId);
      if (!item) {
        logger.warn(`Skipped item ${itemId} from dependency chain - not available after lookup`);
        continue;
      }

      combined.push(
        this.createRecommendation(item, order++, 'prerequisite - required for selected items', now)
      );
      includedIds.push(itemId);
    }

    return { recommendations: combined, includedIds };
  }

  private async resolveAndIncludePrerequisites(
    recommendations: LearningRecommendation[],
    allAvailableItems: LearningItem[],
    now: Date
  ): Promise<LearningRecommendation[]> {
    if (recommendations.length === 0) {
      this.lastDependencyResolution = null;
      return recommendations;
    }

    try {
      const selectedIds = recommendations.map(r => r.item.id);
      const selectedIdSet = new Set(selectedIds);

      const itemMap = new Map<string, LearningItem>();
      for (const item of allAvailableItems) itemMap.set(item.id, item);
      for (const rec of recommendations) itemMap.set(rec.item.id, rec.item);

      const visited = await this.discoverPrerequisiteGraph(selectedIds, itemMap);
      const relevantItems = Array.from(itemMap.entries())
        .filter(([id]) => visited.has(id))
        .map(([, item]) => item);

      if (relevantItems.length === 0) {
        this.lastDependencyResolution = null;
        return recommendations;
      }

      const resolution = await this.dependencyResolver.resolveDependencies(
        relevantItems,
        selectedIds
      );
      if (!resolution.isValid) {
        logger.warn('Dependency resolution failed:', resolution.errors.join(', '));
        this.lastDependencyResolution = null;
        return recommendations;
      }

      const resolvedChain = resolution.resolvedChain.filter(id => visited.has(id));
      const recommendationMap = new Map(recommendations.map(r => [r.item.id, r]));
      const { recommendations: combined, includedIds } = this.buildOrderedRecommendations(
        resolvedChain,
        selectedIdSet,
        recommendationMap,
        itemMap,
        now
      );

      this.lastDependencyResolution = {
        addedPrerequisites: includedIds.filter(id => !selectedIdSet.has(id)),
        resolvedChain: combined.map(rec => rec.item.id),
      };

      return combined;
    } catch (error) {
      logger.error('Error resolving dependencies:', error);
      this.lastDependencyResolution = null;
      return recommendations;
    }
  }

  /**
   * Generate session summary
   */
  private generateSessionSummary(recommendations: LearningRecommendation[]): SessionSummary {
    const newItems = recommendations.filter(r => r.item.chunkType === 'new').length;
    const reviewItems = recommendations.filter(r => r.item.chunkType === 'review').length;
    const remediationItems = recommendations.filter(r => r.item.chunkType === 'remediation').length;

    const subjects = [...new Set(recommendations.map(r => r.item.subject))];

    return {
      totalItems: recommendations.length,
      totalDuration: recommendations.reduce((sum, r) => sum + r.item.estimatedDuration, 0),
      totalCognitiveLoad: recommendations.reduce((sum, r) => sum + r.cognitiveLoad, 0),
      newItems,
      reviewItems,
      remediationItems,
      subjects,
    };
  }

  /**
   * Generate conversation guidance for guided mode
   */
  private generateConversationGuidance(
    input: RecommendationInput,
    recommendations: LearningRecommendation[]
  ): ConversationGuidance {
    if (recommendations.length === 0) {
      return {
        nextAction:
          'No items are due for review right now. Consider studying new content or taking a break.',
        encouragement: 'Great job staying on top of your learning schedule!',
      };
    }

    const firstItem = recommendations[0];
    const totalTime = recommendations.reduce((sum, r) => sum + r.item.estimatedDuration, 0);

    let nextAction = `Start with "${firstItem.item.title}" (${firstItem.item.estimatedDuration} min, ${firstItem.reason}).`;

    if (recommendations.length > 1) {
      nextAction += ` Then continue with ${
        recommendations.length - 1
      } more items (~${totalTime} min total).`;
    }

    const encouragement = this.generateEncouragement(input, recommendations);

    return {
      nextAction,
      encouragement,
      progressUpdate: `You have ${recommendations.length} items ready for an optimal learning session.`,
    };
  }

  /**
   * Generate encouraging message based on context
   */
  private generateEncouragement(
    input: RecommendationInput,
    recommendations: LearningRecommendation[]
  ): string {
    const overdueCount = recommendations.filter(r => r.reason.includes('overdue')).length;
    const newCount = recommendations.filter(r => r.item.chunkType === 'new').length;

    if (overdueCount > 0) {
      return "You're catching up on some overdue items - excellent work maintaining your learning momentum!";
    }

    if (newCount > 0) {
      return 'Ready to explore new concepts! This session will expand your knowledge effectively.';
    }

    return 'Perfect timing for reinforcing your knowledge. Consistent review leads to lasting learning!';
  }

  /**
   * Generate rationale explaining recommendation choices
   */
  private generateRationale(
    recommendations: LearningRecommendation[],
    input: RecommendationInput
  ): string {
    if (recommendations.length === 0) {
      return 'No items match your current criteria or constraints.';
    }

    const overdueCount = recommendations.filter(r => r.reason.includes('overdue')).length;
    const newCount = recommendations.filter(r => r.item.chunkType === 'new').length;
    const reviewCount = recommendations.filter(r => r.item.chunkType === 'review').length;

    let rationale = `Selected ${recommendations.length} items based on spaced repetition priorities`;

    if (input.timeAvailable) {
      rationale += ` and ${input.timeAvailable}-minute time constraint`;
    }

    if (overdueCount > 0) {
      rationale += `. Prioritized ${overdueCount} overdue items for immediate attention`;
    }

    if (newCount > 0) {
      rationale += `. Included ${newCount} new items to expand knowledge`;
    }

    if (reviewCount > 0) {
      rationale += `. Added ${reviewCount} optimally-timed reviews for reinforcement`;
    }

    rationale += '. Items are interleaved by difficulty to optimize cognitive load.';

    // Add dependency resolution explanation if applicable
    if (
      this.lastDependencyResolution &&
      this.lastDependencyResolution.addedPrerequisites.length > 0
    ) {
      const prereqCount = this.lastDependencyResolution.addedPrerequisites.length;
      rationale += ` Automatically included ${prereqCount} prerequisite${prereqCount > 1 ? 's' : ''} to ensure proper learning progression. Prerequisites are ordered first to build foundational knowledge.`;
    }

    // Add prerequisite filtering explanation if applicable
    if (this.lastPrerequisiteFiltering) {
      if (this.lastPrerequisiteFiltering.filteredCount > 0) {
        rationale += ` Note: ${this.lastPrerequisiteFiltering.filteredCount} items were filtered out due to unmet prerequisites - focus on mastering foundational concepts first.`;
      }
      // Include detailed prerequisite rationale if available
      if (
        this.lastPrerequisiteFiltering.rationale &&
        !this.lastPrerequisiteFiltering.rationale.includes('No items were processed') &&
        !this.lastPrerequisiteFiltering.rationale.includes('All') &&
        !this.lastPrerequisiteFiltering.rationale.includes('unavailable')
      ) {
        rationale += ` ${this.lastPrerequisiteFiltering.rationale}`;
      }
    }

    return rationale;
  }

  /**
   * Generate alternative recommendations
   */
  private generateAlternatives(
    candidates: LearningItem[],
    selected: LearningRecommendation[],
    now: Date
  ): LearningRecommendation[] {
    const selectedIds = new Set(selected.map(r => r.item.id));
    const alternatives = candidates
      .filter(item => !selectedIds.has(item.id))
      .slice(0, 3) // Up to 3 alternatives
      .map((item, index) => this.createRecommendation(item, index + 1, 'alternative option', now));

    return alternatives;
  }

  /**
   * Generate next actions for user
   */
  private generateNextActions(
    recommendations: LearningRecommendation[],
    input: RecommendationInput
  ): string[] {
    if (recommendations.length === 0) {
      return ['Check for new content to study', 'Review your learning goals'];
    }

    const actions = ['Begin learning session with recommended items'];

    if (input.mode === 'guided') {
      actions.push("Say 'next' when ready for the next item");
      actions.push('Ask questions if you need clarification');
    }

    return actions;
  }

  private isSubjectPreference(value: unknown): value is SubjectPreference {
    return (
      value === 'CS' ||
      value === 'Math' ||
      value === 'SWE' ||
      value === 'Language' ||
      value === 'Any'
    );
  }
}
