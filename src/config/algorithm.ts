// Configuration for spaced repetition algorithms
// Simple typed config with environment overrides (no secrets)

export type AlgorithmConfig = {
	minimumEaseFactor: number; // floor for ease factor (>= 1.3)
	initialIntervalDays: number; // interval for the very first review (after first success)
	secondIntervalDays: number; // interval for the second successful review
	easeDeltaGood: number; // additive delta to EF when quality >= 4
	easeDeltaHard: number; // additive delta to EF when quality === 3
	easePenaltyFailure: number; // additive delta when quality < 3 (usually negative)
	priorityWeights: {
		urgency: number; // weight for time until next review
		ease: number; // weight for inverse ease
		repetitions: number; // weight for lower repetitions
		difficulty: number; // weight for difficulty
	};
};

function parseNumber(envValue: string | undefined, fallback: number): number {
	if (envValue == null || envValue.trim() === "") return fallback;
	const parsed = Number(envValue);
	return Number.isFinite(parsed) ? parsed : fallback;
}

const minimumEaseFactor = Math.max(parseNumber(process.env.SM_MIN_EASE_FACTOR, 1.3), 1.3);

export const algorithmConfig: AlgorithmConfig = {
	minimumEaseFactor,
	initialIntervalDays: parseNumber(process.env.SM_INITIAL_INTERVAL_DAYS, 1),
	secondIntervalDays: parseNumber(process.env.SM_SECOND_INTERVAL_DAYS, 6),
	easeDeltaGood: parseNumber(process.env.SM_EASE_DELTA_GOOD, 0.1),
	easeDeltaHard: parseNumber(process.env.SM_EASE_DELTA_HARD, -0.02),
	easePenaltyFailure: parseNumber(process.env.SM_EASE_PENALTY_FAILURE, -0.2),
	priorityWeights: {
		urgency: parseNumber(process.env.SM_PRIORITY_W_URGENCY, 0.6),
		ease: parseNumber(process.env.SM_PRIORITY_W_EASE, 0.15),
		repetitions: parseNumber(process.env.SM_PRIORITY_W_REPS, 0.1),
		difficulty: parseNumber(process.env.SM_PRIORITY_W_DIFF, 0.15),
	},
};

export function clampEaseFactor(easeFactor: number): number {
	return Math.max(easeFactor, algorithmConfig.minimumEaseFactor);
}


