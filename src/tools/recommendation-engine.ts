import { calculatePriorityScore } from "./sr-calculator.js";
import { calculateItemCognitiveLoad } from "./cognitive-load.js";
import { prerequisiteValidator } from "./prerequisite-validator.js";
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
} from "../types/recommendations.js";
import { logger } from "../utils/logger.js";

/**
 * Core recommendation engine that generates intelligent learning recommendations
 * based on spaced repetition algorithms, cognitive load theory, and user history
 */
export class RecommendationEngine {
  private lastPrerequisiteFiltering: { rationale: string; filteredCount: number } | null = null;

  /**
   * Generate personalized learning recommendations
   */
  async generateRecommendations(input: RecommendationInput): Promise<RecommendationOutput> {
    // Apply intelligent defaults for guided mode
    const processedInput = this.applyIntelligentDefaults(input);

    // Filter and prioritize learning items
    const candidates = await this.filterAndPrioritizeCandidates(
      processedInput.learningItems,
      processedInput.constraints
    );

    // Compose balanced session
    const recommendations = this.composeBalancedSession(
      candidates,
      processedInput
    );

    // Generate session summary
    const sessionSummary = this.generateSessionSummary(recommendations);

    // Generate conversation guidance for guided mode
    const conversationGuidance =
      processedInput.mode === "guided"
        ? this.generateConversationGuidance(processedInput, recommendations)
        : undefined;

    // Generate rationale
    const rationale = this.generateRationale(recommendations, processedInput);

    // Generate alternatives
    const alternatives = this.generateAlternatives(candidates, recommendations);

    // Add orchestration hint if no learning items provided
    const orchestrationHint = (processedInput.learningItems?.length ?? 0) === 0
      ? "No learning items provided. RECOMMENDED: Use fetchFromDatabase: true to automatically fetch and generate recommendations in one call. Legacy: You can also use list_learning_items_sqlite to fetch items manually and then pass them to this tool."
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
    };
  }

  /**
   * Apply intelligent defaults based on user history and mode
   */
  private applyIntelligentDefaults(
    input: RecommendationInput
  ): RecommendationInput {
    const defaults: Partial<RecommendationInput> = {
      mode: input.mode || "guided",
    };

    // Time estimation based on history or system defaults
    if (!input.timeAvailable) {
      if (input.userHistory?.patterns.averageSessionDuration) {
        defaults.timeAvailable =
          input.userHistory.patterns.averageSessionDuration;
      } else {
        defaults.timeAvailable = 30; // 30-minute default
      }
    }

    // Subject preference from history
    if (
      !input.subjectPreference &&
      input.userHistory?.patterns.subjectPreferences
    ) {
      const preferences = input.userHistory.patterns.subjectPreferences;
      const topSubject = Object.entries(preferences).sort(
        ([, a], [, b]) => b - a
      )[0]?.[0];
      if (this.isSubjectPreference(topSubject)) {
        defaults.subjectPreference = topSubject;
      } else {
        defaults.subjectPreference = "Any";
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
  private generateIntelligentConstraints(
    input: RecommendationInput
  ): SessionConstraints {
    const patterns = input.userHistory?.patterns;

    return {
      maxDuration: input.timeAvailable || 30,
      maxCognitiveLoad: patterns?.fatigueThreshold || 20,
      maxNewItems: this.calculateOptimalNewItems(patterns),
      subjectFilter:
        input.subjectPreference !== "Any" ? input.subjectPreference : undefined,
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
    items?: LearningItem[],
    constraints?: SessionConstraints
  ): Promise<LearningItem[]> {
    let filtered = items ? [...items] : [];

    // Apply subject filter
    if (constraints?.subjectFilter) {
      filtered = filtered.filter(
        (item) => item.subject === constraints.subjectFilter
      );
    }

    // Exclude specific IDs
    const excludeIds = constraints?.excludeIds;
    if (excludeIds && excludeIds.length > 0) {
      filtered = filtered.filter(
        (item) => !excludeIds.includes(item.id)
      );
    }

    // Apply prerequisite filtering (before priority scoring)
    try {
      const prerequisiteResult = await prerequisiteValidator.filterByPrerequisites(
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
      logger.warn('Prerequisite validation failed, continuing without prerequisite filtering:', error);
      this.lastPrerequisiteFiltering = {
        rationale: 'Prerequisite validation unavailable - continuing with all items',
        filteredCount: 0,
      };
    }

    // Calculate priorities for remaining items
    const itemsWithPriority = filtered.map((item) => {
      const priorityInput = {
        nextReviewDate: item.nextReviewDate,
        easeFactor: item.easeFactor,
        repetitions: item.repetitions,
        difficulty: item.difficulty,
      };

      const { priority } = calculatePriorityScore(priorityInput);
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
    input: RecommendationInput
  ): LearningRecommendation[] {
    const constraints = input.constraints ?? this.generateIntelligentConstraints(input);
    const recommendations: LearningRecommendation[] = [];
    let totalDuration = 0;
    let totalCognitiveLoad = 0;
    let newItemCount = 0;

    // Separate items by type for balanced selection
    const overdueItems = candidates.filter(
      (item) => new Date(item.nextReviewDate) <= new Date()
    );
    const reviewItems = candidates.filter(
      (item) =>
        new Date(item.nextReviewDate) > new Date() &&
        item.chunkType === "review"
    );
    const newItems = candidates.filter((item) => item.chunkType === "new");

    // Prioritize overdue items
    for (const item of overdueItems) {
      if (
        this.shouldAddToSession(
          item,
          constraints,
          totalDuration,
          totalCognitiveLoad
        )
      ) {
        const recommendation = this.createRecommendation(
          item,
          recommendations.length + 1,
          "overdue - needs immediate attention"
        );
        recommendations.push(recommendation);
        totalDuration += item.estimatedDuration;
        totalCognitiveLoad += recommendation.cognitiveLoad;
      }
    }

    // Add review items
    for (const item of reviewItems) {
      if (
        this.shouldAddToSession(
          item,
          constraints,
          totalDuration,
          totalCognitiveLoad
        )
      ) {
        const recommendation = this.createRecommendation(
          item,
          recommendations.length + 1,
          "optimal review timing"
        );
        recommendations.push(recommendation);
        totalDuration += item.estimatedDuration;
        totalCognitiveLoad += recommendation.cognitiveLoad;
      }
    }

    // Add new items up to limit
    for (const item of newItems) {
      if (newItemCount >= (constraints.maxNewItems || 5)) break;
      if (
        this.shouldAddToSession(
          item,
          constraints,
          totalDuration,
          totalCognitiveLoad
        )
      ) {
        const recommendation = this.createRecommendation(
          item,
          recommendations.length + 1,
          "new content - expanding knowledge"
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
    reason: string
  ): LearningRecommendation {
    const priorityInput = {
      nextReviewDate: item.nextReviewDate,
      easeFactor: item.easeFactor,
      repetitions: item.repetitions,
      difficulty: item.difficulty,
    };

    const { priority } = calculatePriorityScore(priorityInput);

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
   * Interleave recommendations for optimal learning
   */
  private interleaveRecommendations(
    recommendations: LearningRecommendation[]
  ): LearningRecommendation[] {
    // Sort by cognitive load to interleave easy/hard items
    const easy = recommendations.filter((r) => r.cognitiveLoad < 10);
    const medium = recommendations.filter(
      (r) => r.cognitiveLoad >= 10 && r.cognitiveLoad < 15
    );
    const hard = recommendations.filter((r) => r.cognitiveLoad >= 15);

    const interleaved: LearningRecommendation[] = [];
    let order = 1;

    // Interleave pattern: easy, medium, hard, easy, medium...
    const maxLength = Math.max(easy.length, medium.length, hard.length);
    for (let i = 0; i < maxLength; i++) {
      if (easy[i]) {
        interleaved.push({ ...easy[i], order: order++ });
      }
      if (medium[i]) {
        interleaved.push({ ...medium[i], order: order++ });
      }
      if (hard[i]) {
        interleaved.push({ ...hard[i], order: order++ });
      }
    }

    return interleaved;
  }

  /**
   * Generate session summary
   */
  private generateSessionSummary(
    recommendations: LearningRecommendation[]
  ): SessionSummary {
    const newItems = recommendations.filter(
      (r) => r.item.chunkType === "new"
    ).length;
    const reviewItems = recommendations.filter(
      (r) => r.item.chunkType === "review"
    ).length;
    const remediationItems = recommendations.filter(
      (r) => r.item.chunkType === "remediation"
    ).length;

    const subjects = [...new Set(recommendations.map((r) => r.item.subject))];

    return {
      totalItems: recommendations.length,
      totalDuration: recommendations.reduce(
        (sum, r) => sum + r.item.estimatedDuration,
        0
      ),
      totalCognitiveLoad: recommendations.reduce(
        (sum, r) => sum + r.cognitiveLoad,
        0
      ),
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
          "No items are due for review right now. Consider studying new content or taking a break.",
        encouragement: "Great job staying on top of your learning schedule!",
      };
    }

    const firstItem = recommendations[0];
    const totalTime = recommendations.reduce(
      (sum, r) => sum + r.item.estimatedDuration,
      0
    );

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
    const overdueCount = recommendations.filter((r) =>
      r.reason.includes("overdue")
    ).length;
    const newCount = recommendations.filter(
      (r) => r.item.chunkType === "new"
    ).length;

    if (overdueCount > 0) {
      return "You're catching up on some overdue items - excellent work maintaining your learning momentum!";
    }

    if (newCount > 0) {
      return "Ready to explore new concepts! This session will expand your knowledge effectively.";
    }

    return "Perfect timing for reinforcing your knowledge. Consistent review leads to lasting learning!";
  }

  /**
   * Generate rationale explaining recommendation choices
   */
  private generateRationale(
    recommendations: LearningRecommendation[],
    input: RecommendationInput
  ): string {
    if (recommendations.length === 0) {
      return "No items match your current criteria or constraints.";
    }

    const overdueCount = recommendations.filter((r) =>
      r.reason.includes("overdue")
    ).length;
    const newCount = recommendations.filter(
      (r) => r.item.chunkType === "new"
    ).length;
    const reviewCount = recommendations.filter(
      (r) => r.item.chunkType === "review"
    ).length;

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

    rationale +=
      ". Items are interleaved by difficulty to optimize cognitive load.";

    // Add prerequisite filtering explanation if applicable
    if (this.lastPrerequisiteFiltering) {
      if (this.lastPrerequisiteFiltering.filteredCount > 0) {
        rationale += ` Note: ${this.lastPrerequisiteFiltering.filteredCount} items were filtered out due to unmet prerequisites - focus on mastering foundational concepts first.`;
      }
      // Include detailed prerequisite rationale if available
      if (this.lastPrerequisiteFiltering.rationale &&
          !this.lastPrerequisiteFiltering.rationale.includes("No items were processed") &&
          !this.lastPrerequisiteFiltering.rationale.includes("All") &&
          !this.lastPrerequisiteFiltering.rationale.includes("unavailable")) {
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
    selected: LearningRecommendation[]
  ): LearningRecommendation[] {
    const selectedIds = new Set(selected.map((r) => r.item.id));
    const alternatives = candidates
      .filter((item) => !selectedIds.has(item.id))
      .slice(0, 3) // Up to 3 alternatives
      .map((item, index) =>
        this.createRecommendation(item, index + 1, "alternative option")
      );

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
      return ["Check for new content to study", "Review your learning goals"];
    }

    const actions = ["Begin learning session with recommended items"];

    if (input.mode === "guided") {
      actions.push("Say 'next' when ready for the next item");
      actions.push("Ask questions if you need clarification");
    }

    return actions;
  }

  private isSubjectPreference(value: unknown): value is SubjectPreference {
    return value === "CS" || value === "Math" || value === "SWE" || value === "Language" || value === "Any";
  }
}
