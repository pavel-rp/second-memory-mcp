import type { LearningItem } from "../types/recommendations.js";

/**
 * Calculate cognitive load for a single learning item
 * Shared utility to keep logic consistent across modules
 */
export function calculateItemCognitiveLoad(item: LearningItem): number {
	let load = item.difficulty; // Base load from difficulty (1-10)

	// Type-based adjustments
	switch (item.chunkType) {
		case "new":
			load *= 1.5; // New content requires more cognitive resources
			break;
		case "remediation":
			load *= 1.3; // Remediation requires focused attention
			break;
		case "review":
			load *= 0.8; // Review is typically easier
			break;
	}

	// Ease factor adjustment (harder items = more load)
	if (item.easeFactor < 2.0) {
		load *= 1.3; // Difficult items need more mental effort
	} else if (item.easeFactor > 3.0) {
		load *= 0.8; // Easy items need less mental effort
	}

	// Duration adjustment (longer sessions are more taxing)
	if (item.estimatedDuration > 20) {
		load *= 1.2;
	} else if (item.estimatedDuration < 10) {
		load *= 0.9;
	}

	// Repetition adjustment (very new items are harder)
	if (item.repetitions === 0) {
		load *= 1.2; // First exposure is cognitively demanding
	} else if (item.repetitions > 5) {
		load *= 0.9; // Well-practiced items are easier
	}

	return Math.round(load * 10) / 10; // Round to 1 decimal place
}


