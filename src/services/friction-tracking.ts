import { and, eq, desc, sql } from "drizzle-orm";
import crypto from "node:crypto";
import { getSql, withTx } from "../db/operations.js";
import { frictionMetrics, learningChunks, type FrictionMetricsRow, type NewFrictionMetricsRow } from "../db/schema.js";
import { encodeJsonArray, decodeJsonArray } from "../db/operations.js";
import type { 
	FrictionTrackingInput, 
	FrictionAnalysisResult, 
	FrictionUpdate,
	FrictionMetrics as FrictionMetricsType 
} from "../types/topic-creation.js";
import { VALIDATION_CONSTANTS } from "../constants/validation.js";

/**
 * Friction Tracking Service
 * Tracks user difficulty with chunks and provides analytics for learning optimization
 */
export class FrictionTrackingService {
	/**
	 * Record friction metrics for a chunk attempt
	 */
	async recordFrictionMetrics(input: FrictionTrackingInput): Promise<void> {
		try {
			const { chunkId, metrics } = input;
			const now = Date.now();

			await withTx(async (tx) => {
				// Check if friction metrics already exist for this chunk
				const existing = tx.select()
					.from(frictionMetrics)
					.where(eq(frictionMetrics.chunkId, chunkId))
					.get();

				if (existing) {
					// Update existing metrics
					const updatedMetrics = this.calculateUpdatedMetrics(existing, metrics);
					
					await tx.update(frictionMetrics)
						.set({
							failedAttempts: updatedMetrics.failedAttempts,
							averageTimeSpent: updatedMetrics.averageTimeSpent,
							errorPatternsJson: encodeJsonArray(updatedMetrics.errorPatterns),
							lastStruggleDate: metrics.attemptResult === "failure" ? now : existing.lastStruggleDate,
							frictionScore: updatedMetrics.frictionScore,
							consecutiveFailures: updatedMetrics.consecutiveFailures,
							totalAttempts: updatedMetrics.totalAttempts,
							updatedAt: now
						})
						.where(eq(frictionMetrics.chunkId, chunkId))
						.run();
				} else {
					// Create new friction metrics
					const newMetrics: NewFrictionMetricsRow = {
						id: crypto.randomUUID(),
						chunkId: chunkId,
						userId: undefined, // Anonymous tracking for now
						failedAttempts: metrics.attemptResult === "failure" ? 1 : 0,
						averageTimeSpent: metrics.timeSpent,
						errorPatternsJson: metrics.errorType ? encodeJsonArray([metrics.errorType]) : null,
						lastStruggleDate: metrics.attemptResult === "failure" ? now : 0,
						frictionScore: this.calculateInitialFrictionScore(metrics),
						consecutiveFailures: metrics.attemptResult === "failure" ? 1 : 0,
						totalAttempts: 1,
						createdAt: now,
						updatedAt: now
					};

					await tx.insert(frictionMetrics).values(newMetrics).run();
				}
			});

		} catch (error) {
			console.error("Failed to record friction metrics:", error);
			throw new Error(`Failed to record friction metrics: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get high-friction chunks for prioritization
	 */
	async getHighFrictionChunks(limit: number = 10): Promise<FrictionAnalysisResult[]> {
		try {
			const db = getSql();
			
			// Get chunks with highest friction scores
			const highFrictionChunks = db.select({
				chunkId: frictionMetrics.chunkId,
				frictionScore: frictionMetrics.frictionScore,
				failedAttempts: frictionMetrics.failedAttempts,
				consecutiveFailures: frictionMetrics.consecutiveFailures,
				totalAttempts: frictionMetrics.totalAttempts,
				lastStruggleDate: frictionMetrics.lastStruggleDate,
				chunkTitle: learningChunks.title,
				chunkDifficulty: learningChunks.difficulty
			})
			.from(frictionMetrics)
			.innerJoin(learningChunks, eq(frictionMetrics.chunkId, learningChunks.id))
			.where(sql`${frictionMetrics.frictionScore} > 0.3`) // High friction threshold
			.orderBy(desc(frictionMetrics.frictionScore))
			.limit(limit)
			.all();

			return highFrictionChunks.map(chunk => ({
				chunkId: chunk.chunkId,
				frictionScore: chunk.frictionScore,
				priority: this.calculatePriority(chunk.frictionScore, chunk.consecutiveFailures, chunk.chunkDifficulty),
				recommendations: this.generateRecommendations(chunk),
				isLeech: chunk.consecutiveFailures >= VALIDATION_CONSTANTS.LEECH_THRESHOLD
			}));

		} catch (error) {
			console.error("Failed to get high friction chunks:", error);
			return [];
		}
	}

	/**
	 * Analyze friction patterns for a specific chunk
	 */
	async analyzeChunkFriction(chunkId: string): Promise<FrictionAnalysisResult | null> {
		try {
			const db = getSql();
			
			const metrics = db.select()
				.from(frictionMetrics)
				.where(eq(frictionMetrics.chunkId, chunkId))
				.get();

			if (!metrics) {
				return null;
			}

			const chunk = db.select()
				.from(learningChunks)
				.where(eq(learningChunks.id, chunkId))
				.get();

			if (!chunk) {
				return null;
			}

			return {
				chunkId: chunkId,
				frictionScore: metrics.frictionScore,
				priority: this.calculatePriority(metrics.frictionScore, metrics.consecutiveFailures, chunk.difficulty),
				recommendations: this.generateRecommendations({
					frictionScore: metrics.frictionScore,
					failedAttempts: metrics.failedAttempts,
					consecutiveFailures: metrics.consecutiveFailures,
					totalAttempts: metrics.totalAttempts,
					chunkDifficulty: chunk.difficulty
				}),
				isLeech: metrics.consecutiveFailures >= VALIDATION_CONSTANTS.LEECH_THRESHOLD
			};

		} catch (error) {
			console.error("Failed to analyze chunk friction:", error);
			return null;
		}
	}

	/**
	 * Update chunk priority based on friction
	 */
	async updateChunkPriority(chunkId: string, frictionScore: number): Promise<void> {
		try {
			const db = getSql();
			
			// Update the friction score in the metrics
			await db.update(frictionMetrics)
				.set({
					frictionScore: frictionScore,
					updatedAt: Date.now()
				})
				.where(eq(frictionMetrics.chunkId, chunkId))
				.run();

		} catch (error) {
			console.error("Failed to update chunk priority:", error);
			throw new Error(`Failed to update chunk priority: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get friction metrics for a chunk
	 */
	async getFrictionMetrics(chunkId: string): Promise<FrictionMetricsType | null> {
		try {
			const db = getSql();
			
			const metrics = db.select()
				.from(frictionMetrics)
				.where(eq(frictionMetrics.chunkId, chunkId))
				.get();

			if (!metrics) {
				return null;
			}

			return {
				chunkId: metrics.chunkId,
				userId: metrics.userId,
				failedAttempts: metrics.failedAttempts,
				averageTimeSpent: metrics.averageTimeSpent,
				errorPatterns: metrics.errorPatternsJson ? decodeJsonArray(metrics.errorPatternsJson) : [],
				lastStruggleDate: metrics.lastStruggleDate,
				frictionScore: metrics.frictionScore,
				consecutiveFailures: metrics.consecutiveFailures,
				totalAttempts: metrics.totalAttempts
			};

		} catch (error) {
			console.error("Failed to get friction metrics:", error);
			return null;
		}
	}

	/**
	 * Calculate updated metrics based on new attempt
	 */
	private calculateUpdatedMetrics(existing: FrictionMetricsRow, update: FrictionUpdate): {
		failedAttempts: number;
		averageTimeSpent: number;
		errorPatterns: string[];
		frictionScore: number;
		consecutiveFailures: number;
		totalAttempts: number;
	} {
		const isFailure = update.attemptResult === "failure";
		const isPartial = update.attemptResult === "partial";
		
		// Update failed attempts
		const newFailedAttempts = existing.failedAttempts + (isFailure ? 1 : 0);
		
		// Update consecutive failures
		const newConsecutiveFailures = isFailure 
			? existing.consecutiveFailures + 1 
			: 0;
		
		// Update total attempts
		const newTotalAttempts = existing.totalAttempts + 1;
		
		// Update average time spent (weighted average)
		const newAverageTimeSpent = Math.round(
			(existing.averageTimeSpent * existing.totalAttempts + update.timeSpent) / newTotalAttempts
		);
		
		// Update error patterns
		const existingPatterns = existing.errorPatternsJson ? decodeJsonArray(existing.errorPatternsJson) : [];
		const newErrorPatterns = update.errorType && !existingPatterns.includes(update.errorType)
			? [...existingPatterns, update.errorType]
			: existingPatterns;
		
		// Calculate new friction score
		const newFrictionScore = this.calculateFrictionScore(
			newFailedAttempts,
			newConsecutiveFailures,
			newTotalAttempts,
			newAverageTimeSpent
		);

		return {
			failedAttempts: newFailedAttempts,
			averageTimeSpent: newAverageTimeSpent,
			errorPatterns: newErrorPatterns,
			frictionScore: newFrictionScore,
			consecutiveFailures: newConsecutiveFailures,
			totalAttempts: newTotalAttempts
		};
	}

	/**
	 * Calculate initial friction score for new metrics
	 */
	private calculateInitialFrictionScore(update: FrictionUpdate): number {
		const isFailure = update.attemptResult === "failure";
		const isPartial = update.attemptResult === "partial";
		
		// Base score from attempt result
		let score = isFailure ? 0.7 : (isPartial ? 0.4 : 0.1);
		
		// Adjust based on time spent (longer = more friction)
		if (update.timeSpent > 600000) { // 10 minutes
			score += 0.3;
		} else if (update.timeSpent > 300000) { // 5 minutes
			score += 0.2;
		}
		
		return Math.min(1.0, score);
	}

	/**
	 * Calculate friction score based on multiple factors
	 */
	private calculateFrictionScore(
		failedAttempts: number,
		consecutiveFailures: number,
		totalAttempts: number,
		averageTimeSpent: number
	): number {
		// Base score from failure rate
		const failureRate = totalAttempts > 0 ? failedAttempts / totalAttempts : 0;
		let score = failureRate * 0.6; // 60% weight on failure rate
		
		// Add penalty for consecutive failures
		score += Math.min(0.3, consecutiveFailures * 0.1); // Up to 30% penalty
		
		// Add penalty for excessive time spent
		if (averageTimeSpent > 600000) { // 10 minutes
			score += 0.1;
		}
		
		return Math.min(1.0, score);
	}

	/**
	 * Calculate priority score for retrieval system
	 */
	private calculatePriority(frictionScore: number, consecutiveFailures: number, difficulty: number): number {
		// Higher friction = higher priority
		let priority = frictionScore * 100;
		
		// Boost priority for consecutive failures
		priority += consecutiveFailures * 20;
		
		// Adjust for difficulty (harder chunks get more priority when struggling)
		priority += difficulty * 5;
		
		return Math.round(priority);
	}

	/**
	 * Generate recommendations based on friction patterns
	 */
	private generateRecommendations(chunk: {
		frictionScore: number;
		failedAttempts: number;
		consecutiveFailures: number;
		totalAttempts: number;
		chunkDifficulty?: number;
	}): string[] {
		const recommendations: string[] = [];
		
		if (chunk.frictionScore > 0.7) {
			recommendations.push("Consider breaking this chunk into smaller parts");
		}
		
		if (chunk.consecutiveFailures >= 3) {
			recommendations.push("Review prerequisites and foundational concepts");
		}
		
		if (chunk.failedAttempts > chunk.totalAttempts * 0.6) {
			recommendations.push("Try different learning approaches (visual, examples, practice)");
		}
		
		if (chunk.chunkDifficulty && chunk.chunkDifficulty > 7) {
			recommendations.push("Consider reducing difficulty or adding more scaffolding");
		}
		
		if (recommendations.length === 0) {
			recommendations.push("Continue with current approach, monitor progress");
		}
		
		return recommendations;
	}
}

// Export singleton instance
export const frictionTrackingService = new FrictionTrackingService();
