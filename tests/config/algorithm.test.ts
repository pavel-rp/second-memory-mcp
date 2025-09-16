import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("algorithm config env overrides", () => {
	const original = { ...process.env };
	beforeEach(() => {
		process.env.SM_MIN_EASE_FACTOR = "1.5";
		process.env.SM_INITIAL_INTERVAL_DAYS = "2";
		process.env.SM_SECOND_INTERVAL_DAYS = "7";
		process.env.SM_EASE_DELTA_GOOD = "0.2";
		process.env.SM_EASE_DELTA_HARD = "-0.05";
		process.env.SM_EASE_PENALTY_FAILURE = "-0.3";
		process.env.SM_PRIORITY_W_URGENCY = "0.5";
		process.env.SM_PRIORITY_W_EASE = "0.2";
		process.env.SM_PRIORITY_W_REPS = "0.2";
		process.env.SM_PRIORITY_W_DIFF = "0.1";
	});
	afterEach(() => {
		process.env = { ...original };
	});

	it("applies overrides on import", async () => {
		// reset module cache so env is read fresh on import
		vi.resetModules();
		const mod = await import("../../src/config/algorithm.js");
		expect(mod.algorithmConfig.minimumEaseFactor).toBeGreaterThanOrEqual(1.5);
		expect(mod.algorithmConfig.initialIntervalDays).toBe(2);
		expect(mod.algorithmConfig.secondIntervalDays).toBe(7);
		expect(mod.algorithmConfig.easeDeltaGood).toBeCloseTo(0.2, 5);
		expect(mod.algorithmConfig.easeDeltaHard).toBeCloseTo(-0.05, 5);
		expect(mod.algorithmConfig.easePenaltyFailure).toBeCloseTo(-0.3, 5);
	});
});


