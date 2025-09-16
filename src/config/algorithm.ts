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
	// Advanced parameters
	lapsePenalty: number; // additional EF delta applied when overdue
	maxConsecutiveLapses: number; // threshold for harsher reset
	leechFailureThreshold: number; // failures across window to consider leech
	leechConsecutiveFailures: number; // consecutive failures to consider leech
	leechEasePenaltyAdjustment: number; // extra negative delta applied when leech
	minLeechEasePenalty: number; // lower bound for leech penalty
	dailyCaps: { maxNew: number; maxReviews: number };
	tagWeights: Record<string, number>;
};

function parseNumber(envValue: string | undefined, fallback: number): number {
	if (envValue == null || envValue.trim() === "") return fallback;
	const parsed = Number(envValue);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function parseRecord(envValue: string | undefined): Record<string, number> {
	// Expect JSON like {"tagA":1.2,"tagB":0.8}
	if (!envValue) return {};
	try {
		const raw: unknown = JSON.parse(envValue);
		if (typeof raw !== "object" || raw === null) return {};
		const obj = raw as Record<string, unknown>;
		const out: Record<string, number> = {};
		for (const [k, v] of Object.entries(obj)) {
			let n: number | undefined;
			if (typeof v === "number") {
				n = v;
			} else if (typeof v === "string") {
				const parsed = Number(v);
				if (Number.isFinite(parsed)) n = parsed;
			}
			if (n !== undefined && Number.isFinite(n)) out[k] = n;
		}
		return out;
	} catch {
		return {};
	}
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
	lapsePenalty: parseNumber(process.env.SM_LAPSE_PENALTY, -0.15),
	maxConsecutiveLapses: parseNumber(process.env.SM_MAX_CONSEC_LAPSES, 3),
	leechFailureThreshold: parseNumber(process.env.SM_LEECH_FAIL_THRESHOLD, 6),
	leechConsecutiveFailures: parseNumber(process.env.SM_LEECH_CONSEC_FAILS, 3),
	leechEasePenaltyAdjustment: parseNumber(process.env.SM_LEECH_EASE_ADJUST, -0.05),
	minLeechEasePenalty: parseNumber(process.env.SM_MIN_LEECH_EASE_PENALTY, -0.25),
	dailyCaps: {
		maxNew: parseNumber(process.env.SM_DAILY_CAP_NEW, 20),
		maxReviews: parseNumber(process.env.SM_DAILY_CAP_REVIEWS, 200),
	},
	tagWeights: parseRecord(process.env.SM_TAG_WEIGHTS),
};

export function clampEaseFactor(easeFactor: number): number {
	return Math.max(easeFactor, algorithmConfig.minimumEaseFactor);
}


