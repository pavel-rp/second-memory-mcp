import { algorithmConfig } from "../config/algorithm.js";
import { calculateItemCognitiveLoad } from "./cognitive-load.js";
export { calculateItemCognitiveLoad } from "./cognitive-load.js";
import type {
	LearningItem,
	SessionConstraints,
	SubjectPreference,
	LearningPatterns,
} from "../types/recommendations.js";

/**
 * Utility functions for filtering and prioritizing learning content
 * based on user preferences, time constraints, and cognitive load
 */

/**
 * Filter learning items by subject preference
 */
export function filterBySubject(
	items: LearningItem[],
	preference: SubjectPreference
): LearningItem[] {
	if (preference === "Any") {
		return items;
	}

	return items.filter(item => item.subject === preference);
}

/**
 * Filter items that can fit within time constraints
 */
export function filterByTimeConstraints(
	items: LearningItem[],
	maxDuration: number,
	includeBuffer: boolean = true
): LearningItem[] {
	// Add 10% buffer for transitions and breaks if requested
	const effectiveMaxDuration = includeBuffer ? maxDuration * 0.9 : maxDuration;

	return items.filter(item => item.estimatedDuration <= effectiveMaxDuration);
}

/**
 * Filter items by cognitive load capacity
 */
export function filterByCognitiveLoad(
	items: LearningItem[],
	maxCognitiveLoad: number
): LearningItem[] {
	return items.filter(item => {
		const itemLoad = calculateItemCognitiveLoad(item);
		return itemLoad <= maxCognitiveLoad;
	});
}

/**
 * Calculate cognitive load for a single learning item
 */
// calculateItemCognitiveLoad moved to shared utility in ./cognitive-load.ts

/**
 * Estimate completion time for a set of items including transitions
 */
export function estimateSessionDuration(
	items: LearningItem[],
	includeTransitions: boolean = true
): number {
	const baseDuration = items.reduce((total, item) => total + item.estimatedDuration, 0);

	if (!includeTransitions || items.length <= 1) {
		return baseDuration;
	}

	// Add transition time between items (1-2 minutes each)
	const transitionTime = (items.length - 1) * 1.5;

	// Add session setup/teardown time (2-3 minutes)
	const overheadTime = 2.5;

	return Math.round(baseDuration + transitionTime + overheadTime);
}

/**
 * Filter items based on prerequisites satisfaction
 */
export function filterByPrerequisites(
	items: LearningItem[],
	completedItems: string[] = []
): LearningItem[] {
	return items.filter(item => {
		if (!item.prerequisites || item.prerequisites.length === 0) {
			return true; // No prerequisites required
		}

		// Check if all prerequisites are satisfied
		return item.prerequisites.every(prereq =>
			completedItems.includes(prereq)
		);
	});
}

/**
 * Prioritize items based on due dates and urgency
 */
export function prioritizeByUrgency(items: LearningItem[]): LearningItem[] {
	const now = new Date();

	return items.sort((a, b) => {
		const aDate = new Date(a.nextReviewDate);
		const bDate = new Date(b.nextReviewDate);

		// Calculate days until due (negative = overdue)
		const aDaysUntil = Math.floor((aDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
		const bDaysUntil = Math.floor((bDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

		// Overdue items first, then by how overdue
		if (aDaysUntil < 0 && bDaysUntil >= 0) return -1;
		if (bDaysUntil < 0 && aDaysUntil >= 0) return 1;

		// Both overdue: more overdue first
		if (aDaysUntil < 0 && bDaysUntil < 0) {
			return aDaysUntil - bDaysUntil;
		}

		// Both future: sooner first
		return aDaysUntil - bDaysUntil;
	});
}

/**
 * Apply intelligent filtering based on user patterns
 */
export function filterByLearningPatterns(
	items: LearningItem[],
	patterns: LearningPatterns
): LearningItem[] {
	// Filter by preferred difficulty range
	const difficultyTolerance = 2; // +/- 2 points from preferred
	const minDifficulty = Math.max(1, patterns.preferredDifficulty - difficultyTolerance);
	const maxDifficulty = Math.min(10, patterns.preferredDifficulty + difficultyTolerance);

	let filtered = items.filter(item =>
		item.difficulty >= minDifficulty && item.difficulty <= maxDifficulty
	);

	// If user has strong subject preferences, boost those subjects
	if (patterns.subjectPreferences) {
		filtered = filtered.sort((a, b) => {
			const aPreference = patterns.subjectPreferences[a.subject] || 0;
			const bPreference = patterns.subjectPreferences[b.subject] || 0;
			return bPreference - aPreference;
		});
	}

	return filtered;
}

/**
 * Compose a balanced session with optimal item distribution
 */
export function composeBalancedSession(
	items: LearningItem[],
	constraints: SessionConstraints
): LearningItem[] {
	const sessionItems: LearningItem[] = [];
	let remainingTime = constraints.maxDuration || 30;
	let remainingCognitiveLoad = constraints.maxCognitiveLoad || 20;

	// Separate items by type for balanced selection
	const overdueItems = items.filter(item => new Date(item.nextReviewDate) <= new Date());
	const reviewItems = items.filter(item =>
		new Date(item.nextReviewDate) > new Date() && item.chunkType === "review"
	);
	const newItems = items.filter(item => item.chunkType === "new");

	// Helper function to check if item fits constraints
	const itemFits = (item: LearningItem): boolean => {
		const itemLoad = calculateItemCognitiveLoad(item);
		return item.estimatedDuration <= remainingTime && itemLoad <= remainingCognitiveLoad;
	};

	// Add items in priority order while respecting constraints
	const addItemsFromCategory = (categoryItems: LearningItem[], maxItems?: number) => {
		let added = 0;
		for (const item of categoryItems) {
			if (maxItems && added >= maxItems) break;
			if (itemFits(item)) {
				sessionItems.push(item);
				remainingTime -= item.estimatedDuration;
				remainingCognitiveLoad -= calculateItemCognitiveLoad(item);
				added++;
			}
		}
	};

	// Prioritize overdue items first
	addItemsFromCategory(prioritizeByUrgency(overdueItems));

	// Add review items
	addItemsFromCategory(prioritizeByUrgency(reviewItems));

	// Add new items (limited to prevent cognitive overload)
	const maxNewItems = constraints.maxNewItems || 3;
	addItemsFromCategory(newItems, maxNewItems);

	return sessionItems;
}

/**
 * Generate intelligent constraints based on time and context
 */
export function generateIntelligentConstraints(
	timeAvailable: number,
	userPatterns?: LearningPatterns
): SessionConstraints {
	const config = algorithmConfig.sessionConfig;

	// Base cognitive load on available time
	let maxCognitiveLoad = Math.min(25, timeAvailable * 0.5); // Rough heuristic

	// Adjust based on user patterns
	if (userPatterns) {
		maxCognitiveLoad = Math.min(maxCognitiveLoad, userPatterns.fatigueThreshold || 20);
	}

	// Determine max new items based on time
	let maxNewItems = 3; // Conservative default
	if (timeAvailable >= 45) {
		maxNewItems = 5;
	} else if (timeAvailable <= 15) {
		maxNewItems = 1;
	}

	return {
		maxDuration: timeAvailable,
		maxCognitiveLoad,
		maxNewItems,
	};
}

/**
 * Calculate session quality score based on balance and optimization
 */
export function calculateSessionQuality(items: LearningItem[]): {
	score: number;
	factors: {
		balance: number;
		cognitiveLoad: number;
		urgency: number;
		variety: number;
	};
} {
	if (items.length === 0) {
		return {
			score: 0,
			factors: { balance: 0, cognitiveLoad: 0, urgency: 0, variety: 0 }
		};
	}

	// Balance factor: good mix of new/review/overdue
	const newCount = items.filter(i => i.chunkType === "new").length;
	const reviewCount = items.filter(i => i.chunkType === "review").length;
	const overdueCount = items.filter(i => new Date(i.nextReviewDate) <= new Date()).length;

	const balanceScore = Math.min(1, (newCount + reviewCount + overdueCount) / items.length);

	// Cognitive load factor: reasonable distribution
	const loads = items.map(calculateItemCognitiveLoad);
	const avgLoad = loads.reduce((sum, load) => sum + load, 0) / loads.length;
	const loadVariance = loads.reduce((sum, load) => sum + Math.pow(load - avgLoad, 2), 0) / loads.length;
	const cognitiveLoadScore = Math.max(0, 1 - (loadVariance / 10)); // Penalize high variance

	// Urgency factor: addressing overdue items
	const urgencyScore = overdueCount > 0 ? Math.min(1, overdueCount / items.length) : 0.8;

	// Variety factor: different subjects
	const subjects = new Set(items.map(i => i.subject));
	const varietyScore = Math.min(1, subjects.size / Math.min(3, items.length));

	const factors = {
		balance: balanceScore,
		cognitiveLoad: cognitiveLoadScore,
		urgency: urgencyScore,
		variety: varietyScore,
	};

	// Weighted average
	const score = (
		factors.balance * 0.3 +
		factors.cognitiveLoad * 0.25 +
		factors.urgency * 0.25 +
		factors.variety * 0.2
	);

	return { score: Math.round(score * 100) / 100, factors };
}