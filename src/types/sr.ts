export type NextReviewInput = {
	quality: number; // 0..5
	repetitions: number; // >=0
	easeFactor: number; // >=1.3
	interval: number; // days
};

export type NextReviewOutput = {
	interval: number; // days
	repetitions: number;
	easeFactor: number; // floored at 1.3
	nextReview: string; // ISO date (YYYY-MM-DD)
};

export type PriorityInput = {
	nextReviewDate: string; // ISO date
	easeFactor: number;
	repetitions: number;
	difficulty: number; // 1..10
};

export type PriorityOutput = { priority: number };


