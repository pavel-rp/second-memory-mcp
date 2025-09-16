import { algorithmConfig, clampEaseFactor } from "../config/algorithm.js";
import type {
	NextReviewInput,
	NextReviewOutput,
	PriorityInput,
	PriorityOutput,
	AdvancedNextReviewInput,
	AdvancedNextReviewOutput,
	RankInput,
	RankOutput,
} from "../types/sr.js";

function toStartOfDay(date: Date): Date {
	const normalized = new Date(date);
	normalized.setHours(0, 0, 0, 0);
	return normalized;
}

function addDays(date: Date, days: number): Date {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d;
}

function isoDate(date: Date): string {
	return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
		.toISOString()
		.split("T")[0];
}

export function calculateNextReview(input: NextReviewInput): NextReviewOutput {
	const quality = Math.max(0, Math.min(5, Math.floor(input.quality)));
	const prevRepetitions = Math.max(0, Math.floor(input.repetitions));
	const prevEase = clampEaseFactor(Number.isFinite(input.easeFactor) ? input.easeFactor : algorithmConfig.minimumEaseFactor);
	const prevInterval = Math.max(0, Math.floor(input.interval));

	let nextRepetitions = prevRepetitions;
	let nextEase = prevEase;
	let nextInterval = prevInterval;

	if (quality < 3) {
		// Failure: reset reps to 0, interval to 0/1 day, penalize ease
		nextRepetitions = 0;
		nextInterval = 1; // schedule retry tomorrow to avoid same-day churn
		nextEase = clampEaseFactor(prevEase + algorithmConfig.easePenaltyFailure);
	} else {
		// Success path
		nextRepetitions = prevRepetitions + 1;
		if (nextRepetitions === 1) {
			nextInterval = Math.max(1, Math.floor(algorithmConfig.initialIntervalDays));
		} else if (nextRepetitions === 2) {
			nextInterval = Math.max(1, Math.floor(algorithmConfig.secondIntervalDays));
		} else {
			nextInterval = Math.max(1, Math.floor(prevInterval * nextEase));
		}

		if (quality >= 4) {
			nextEase = clampEaseFactor(prevEase + algorithmConfig.easeDeltaGood);
		} else {
			// quality === 3 treated as hard
			nextEase = clampEaseFactor(prevEase + algorithmConfig.easeDeltaHard);
		}
	}

	const today = toStartOfDay(new Date());
	const nextDate = addDays(today, nextInterval);
	return {
		interval: nextInterval,
		repetitions: nextRepetitions,
		easeFactor: nextEase,
		nextReview: isoDate(nextDate),
	};
}

export function calculatePriorityScore(input: PriorityInput): PriorityOutput {
	const now = toStartOfDay(new Date());
	const nextReview = new Date(input.nextReviewDate);
	if (isNaN(nextReview.getTime())) {
		// If invalid date, consider it overdue
		nextReview.setTime(now.getTime());
	}
	const daysUntil = Math.max(-365, Math.min(365, Math.floor((toStartOfDay(nextReview).getTime() - now.getTime()) / 86400000)));

	const ease = clampEaseFactor(input.easeFactor);
	const reps = Math.max(0, Math.floor(input.repetitions));
	const difficulty = Math.max(1, Math.min(10, Math.floor(input.difficulty)));

	// Compute a normalized urgency: overdue => high, far future => low
	// Map daysUntil into [0, 1] where overdue (<=0) => 1, 7 days => ~0.125
	const urgency = 1 / (1 + Math.max(0, daysUntil));

	// Inverse ease: lower EF -> higher priority
	const inverseEase = 1 / ease; // EF min 1.3, so bounded

	// Repetition novelty: fewer repetitions => higher priority
	const novelty = 1 / (1 + reps);

	// Difficulty scale to [0.1, 1]
	const difficultyNorm = 0.1 + (difficulty - 1) * (0.9 / 9);

	const w = algorithmConfig.priorityWeights;
	let score =
		w.urgency * urgency +
		w.ease * inverseEase +
		w.repetitions * novelty +
		w.difficulty * difficultyNorm;

	// Clamp to [0, 1] and scale to 0..100 for readability
	score = Math.max(0, Math.min(1, score)) * 100;

	return { priority: Math.round(score) };
}

// Advanced next review with lapses/leech handling
export function calculateNextReviewAdvanced(input: AdvancedNextReviewInput): AdvancedNextReviewOutput {
	const base = calculateNextReview(input);
	let ease = base.easeFactor;
	let interval = base.interval;
	let reps = base.repetitions;
	let leech = false;

	const overdue = Math.max(0, Math.floor(input.daysOverdue ?? 0));
	const consecutiveFailures = Math.max(0, Math.floor(input.consecutiveFailures ?? 0));

	if (overdue > 0) {
		// Apply lapse penalty to ease
		ease = clampEaseFactor(ease + algorithmConfig.lapsePenalty);
		// Pull interval closer if heavily overdue
		interval = Math.max(1, Math.floor(interval * (1 - Math.min(0.5, overdue / 30))));
	}

	if (consecutiveFailures >= algorithmConfig.maxConsecutiveLapses) {
		// Harsher reset: reduce repetitions to 0 and shorten interval
		reps = 0;
		interval = Math.max(1, Math.floor(interval * 0.5));
	}

	if (consecutiveFailures >= algorithmConfig.leechConsecutiveFailures) {
		leech = true;
		// stronger ease penalty for leeches using configured adjustments
		ease = clampEaseFactor(
			ease + Math.min(
				algorithmConfig.lapsePenalty + algorithmConfig.leechEasePenaltyAdjustment,
				algorithmConfig.minLeechEasePenalty
			)
		);
	}

	const next = addDays(toStartOfDay(new Date()), interval);
	return { ...base, repetitions: reps, easeFactor: ease, interval, nextReview: isoDate(next), leech };
}

// Rank with tag weights and caps
export function rankCandidatesWithConstraints(input: RankInput): RankOutput {
	// Score each candidate using existing priority, then adjust by tag weights
	const nowIso = isoDate(toStartOfDay(new Date()));
	const scored = input.candidates.map((c) => {
		const { priority } = calculatePriorityScore({
			nextReviewDate: c.nextReviewDate || nowIso,
			easeFactor: c.easeFactor,
			repetitions: c.repetitions,
			difficulty: c.difficulty,
		});
		const tags = Array.isArray(c.tags) ? c.tags : [];
		const weight = tags.length ? Math.max(...tags.map((t) => algorithmConfig.tagWeights[t] ?? 1)) : 1;
		return { id: c.id, score: priority * weight, tags };
	});

	scored.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

	// Apply daily caps (simplified: assume all are reviews)
	const maxReviews = Math.max(0, Math.floor(algorithmConfig.dailyCaps.maxReviews));
	const orderedIds = scored.slice(0, maxReviews > 0 ? maxReviews : scored.length).map((s) => s.id);
	return { orderedIds };
}


