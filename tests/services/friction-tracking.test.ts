import { describe, it, beforeEach, afterEach, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

let hasBinding = true;
try {
	const Database = require("better-sqlite3");
	new Database(":memory:");
} catch {
	hasBinding = false;
}

// Force tests to run in CI environment
if (process.env.CI && process.env.FORCE_SQLITE_TESTS) {
	hasBinding = true;
}

import { getDb, resetDatabase } from "../../src/db/client.js";
import { frictionTrackingService } from "../../src/services/friction-tracking.js";
import type { FrictionTrackingInput } from "../../src/types/topic-creation.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { FrictionUpdate } from "../../src/types/topic-creation.js";

function ensureSchema() {
	const db = getDb();
	db.exec(`
	CREATE TABLE IF NOT EXISTS learning_topics (
		id TEXT PRIMARY KEY NOT NULL,
		title TEXT NOT NULL,
		subject TEXT NOT NULL,
		summary TEXT,
		summary_version INTEGER,
		summary_updated_at INTEGER,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL
	);
	CREATE TABLE IF NOT EXISTS learning_chunks (
		id TEXT PRIMARY KEY NOT NULL,
		topic_id TEXT NOT NULL,
		title TEXT NOT NULL,
		subject TEXT NOT NULL,
		difficulty INTEGER NOT NULL,
		next_review_at INTEGER NOT NULL,
		ease_factor REAL NOT NULL,
		repetitions INTEGER NOT NULL,
		last_reviewed_at INTEGER,
		estimated_duration INTEGER NOT NULL,
		chunk_type TEXT NOT NULL,
		prerequisites_json TEXT,
		tags_json TEXT,
		content TEXT,
		content_version INTEGER,
		content_updated_at INTEGER,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL,
		FOREIGN KEY(topic_id) REFERENCES learning_topics(id) ON DELETE CASCADE
	);
	CREATE TABLE IF NOT EXISTS friction_metrics (
		id TEXT PRIMARY KEY NOT NULL,
		chunk_id TEXT NOT NULL,
		user_id TEXT,
		failed_attempts INTEGER NOT NULL DEFAULT 0,
		average_time_spent INTEGER NOT NULL DEFAULT 0,
		error_patterns_json TEXT,
		last_struggle_date INTEGER NOT NULL,
		friction_score REAL NOT NULL DEFAULT 0,
		consecutive_failures INTEGER NOT NULL DEFAULT 0,
		total_attempts INTEGER NOT NULL DEFAULT 0,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL,
		FOREIGN KEY(chunk_id) REFERENCES learning_chunks(id) ON DELETE CASCADE
	);
	`);
}

function tmpDbPath() {
	return path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}

function createTestChunk(chunkId: string, topicId: string) {
	const db = getDb();
	const now = Date.now();

	// Use INSERT OR IGNORE to avoid UNIQUE constraint errors
	db.prepare(`
		INSERT OR IGNORE INTO learning_topics (id, title, subject, summary, summary_version, summary_updated_at, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`).run(topicId, "Test Topic", "Test", null, null, null, now, now);

	db.prepare(`
		INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, estimated_duration, chunk_type, content, content_version, content_updated_at, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`).run(chunkId, topicId, "Test Chunk", "Test", 5, now, 2.5, 0, 15, "new", null, null, null, now, now);
}

(hasBinding ? describe : describe.skip)("friction tracking service", () => {
	let dbFile: string;

	beforeEach(async () => {
		dbFile = tmpDbPath();
		process.env.SM_DB_PATH = dbFile;
		await resetDatabase(); // Reset singleton to pick up new path
		ensureSchema();
	});

	afterEach(async () => {
		await resetDatabase(); // Close database connection
		if (fs.existsSync(dbFile)) {
			fs.unlinkSync(dbFile);
		}
		if (fs.existsSync(`${dbFile}-shm`)) {
			fs.unlinkSync(`${dbFile}-shm`);
		}
		if (fs.existsSync(`${dbFile}-wal`)) {
			fs.unlinkSync(`${dbFile}-wal`);
		}
	});

	describe("recordFrictionMetrics", () => {
		it("should create new friction metrics for first attempt", async () => {
			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			createTestChunk(chunkId, topicId);

			const input: FrictionTrackingInput = {
				chunkId,
				metrics: {
					attemptResult: "failure",
					timeSpent: 300000, // 5 minutes
					errorType: "conceptual"
				}
			};

			await frictionTrackingService.recordFrictionMetrics(input);

			const db = getDb();
			const metrics = db.prepare("SELECT * FROM friction_metrics WHERE chunk_id = ?").get(chunkId) as any;
			
			expect(metrics).toBeDefined();
			expect(metrics.failed_attempts).toBe(1);
			expect(metrics.consecutive_failures).toBe(1);
			expect(metrics.total_attempts).toBe(1);
			expect(metrics.average_time_spent).toBe(300000);
			expect(metrics.friction_score).toBeGreaterThan(0);
		});

		it("should update existing friction metrics", async () => {
			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			createTestChunk(chunkId, topicId);

			// First attempt - failure
			await frictionTrackingService.recordFrictionMetrics({
				chunkId,
				metrics: {
					attemptResult: "failure",
					timeSpent: 300000,
					errorType: "conceptual"
				}
			});

			// Second attempt - success
			await frictionTrackingService.recordFrictionMetrics({
				chunkId,
				metrics: {
					attemptResult: "success",
					timeSpent: 150000,
					errorType: undefined
				}
			});

			const db = getDb();
			const metrics = db.prepare("SELECT * FROM friction_metrics WHERE chunk_id = ?").get(chunkId) as any;
			
			expect(metrics.failed_attempts).toBe(1); // Still 1 failure
			expect(metrics.consecutive_failures).toBe(0); // Reset on success
			expect(metrics.total_attempts).toBe(2);
			expect(metrics.average_time_spent).toBe(225000); // Average of 300k and 150k
		});

		it("should handle partial success attempts", async () => {
			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			createTestChunk(chunkId, topicId);

			const input: FrictionTrackingInput = {
				chunkId,
				metrics: {
					attemptResult: "partial",
					timeSpent: 200000,
					errorType: "calculation"
				}
			};

			await frictionTrackingService.recordFrictionMetrics(input);

			const db = getDb();
			const metrics = db.prepare("SELECT * FROM friction_metrics WHERE chunk_id = ?").get(chunkId) as any;
			
			expect(metrics.failed_attempts).toBe(0); // Partial doesn't count as failure
			expect(metrics.total_attempts).toBe(1);
			expect(metrics.friction_score).toBeGreaterThan(0); // But still has some friction
		});

		it("should handle database errors gracefully", async () => {
			const input: FrictionTrackingInput = {
				chunkId: "invalid-chunk-id",
				metrics: {
					attemptResult: "failure",
					timeSpent: 100000,
					errorType: "conceptual"
				}
			};

			await expect(frictionTrackingService.recordFrictionMetrics(input))
				.rejects.toThrow("Failed to record friction metrics");
		});
	});

	describe("getHighFrictionChunks", () => {
		it("should return chunks with high friction scores", async () => {
			const chunkId1 = crypto.randomUUID();
			const chunkId2 = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			
			createTestChunk(chunkId1, topicId);
			createTestChunk(chunkId2, topicId);

			// Create high friction for chunk1
			await frictionTrackingService.recordFrictionMetrics({
				chunkId: chunkId1,
				metrics: {
					attemptResult: "failure",
					timeSpent: 600000, // 10 minutes
					errorType: "conceptual"
				}
			});

			// Create low friction for chunk2
			await frictionTrackingService.recordFrictionMetrics({
				chunkId: chunkId2,
				metrics: {
					attemptResult: "success",
					timeSpent: 60000, // 1 minute
					errorType: undefined
				}
			});

			const highFrictionChunks = await frictionTrackingService.getHighFrictionChunks(5);

			expect(highFrictionChunks).toHaveLength(1);
			expect(highFrictionChunks[0].chunkId).toBe(chunkId1);
			expect(highFrictionChunks[0].frictionScore).toBeGreaterThan(0.3);
			expect(highFrictionChunks[0].priority).toBeGreaterThan(0);
			expect(highFrictionChunks[0].recommendations).toBeDefined();
		});

		it("should return empty array when no high friction chunks exist", async () => {
			const highFrictionChunks = await frictionTrackingService.getHighFrictionChunks(5);
			expect(highFrictionChunks).toHaveLength(0);
		});

		it("should respect limit parameter", async () => {
			const topicId = crypto.randomUUID();
			
			// Create multiple high friction chunks
			for (let i = 0; i < 5; i++) {
				const chunkId = crypto.randomUUID();
				createTestChunk(chunkId, topicId);
				
				await frictionTrackingService.recordFrictionMetrics({
					chunkId,
					metrics: {
						attemptResult: "failure",
						timeSpent: 600000,
						errorType: "conceptual"
					}
				});
			}

			const highFrictionChunks = await frictionTrackingService.getHighFrictionChunks(3);
			expect(highFrictionChunks).toHaveLength(3);
		});
	});

	describe("analyzeChunkFriction", () => {
		it("should analyze friction for existing chunk", async () => {
			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			createTestChunk(chunkId, topicId);

			await frictionTrackingService.recordFrictionMetrics({
				chunkId,
				metrics: {
					attemptResult: "failure",
					timeSpent: 400000,
					errorType: "conceptual"
				}
			});

			const analysis = await frictionTrackingService.analyzeChunkFriction(chunkId);

			expect(analysis).toBeDefined();
			expect(analysis?.chunkId).toBe(chunkId);
			expect(analysis?.frictionScore).toBeGreaterThan(0);
			expect(analysis?.priority).toBeGreaterThan(0);
			expect(analysis?.recommendations).toBeDefined();
			expect(analysis?.isLeech).toBeDefined();
		});

		it("should return null for non-existent chunk", async () => {
			const analysis = await frictionTrackingService.analyzeChunkFriction("non-existent-chunk");
			expect(analysis).toBeNull();
		});

		it("should return null for chunk without friction metrics", async () => {
			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			createTestChunk(chunkId, topicId);

			const analysis = await frictionTrackingService.analyzeChunkFriction(chunkId);
			expect(analysis).toBeNull();
		});
	});

	describe("updateChunkPriority", () => {
		it("should update friction score for existing chunk", async () => {
			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			createTestChunk(chunkId, topicId);

			// Create initial metrics
			await frictionTrackingService.recordFrictionMetrics({
				chunkId,
				metrics: {
					attemptResult: "failure",
					timeSpent: 300000,
					errorType: "conceptual"
				}
			});

			const newFrictionScore = 0.8;
			await frictionTrackingService.updateChunkPriority(chunkId, newFrictionScore);

			const db = getDb();
			const metrics = db.prepare("SELECT * FROM friction_metrics WHERE chunk_id = ?").get(chunkId) as any;
			expect(metrics.friction_score).toBe(newFrictionScore);
		});

		it("should handle non-existent chunk gracefully", async () => {
			await expect(frictionTrackingService.updateChunkPriority("non-existent-chunk", 0.5))
				.rejects.toThrow("Failed to update chunk priority");
		});
	});

	describe("getFrictionMetrics", () => {
		it("should return friction metrics for existing chunk", async () => {
			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			createTestChunk(chunkId, topicId);

			await frictionTrackingService.recordFrictionMetrics({
				chunkId,
				metrics: {
					attemptResult: "failure",
					timeSpent: 300000,
					errorType: "conceptual"
				}
			});

			const metrics = await frictionTrackingService.getFrictionMetrics(chunkId);

			expect(metrics).toBeDefined();
			expect(metrics?.chunkId).toBe(chunkId);
			expect(metrics?.failedAttempts).toBe(1);
			expect(metrics?.totalAttempts).toBe(1);
			expect(metrics?.averageTimeSpent).toBe(300000);
			expect(metrics?.errorPatterns).toContain("conceptual");
		});

		it("should return null for non-existent chunk", async () => {
			const metrics = await frictionTrackingService.getFrictionMetrics("non-existent-chunk");
			expect(metrics).toBeNull();
		});
	});

	describe("friction score calculations", () => {
		it("should calculate higher friction for consecutive failures", async () => {
			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			createTestChunk(chunkId, topicId);

			// Record multiple consecutive failures
			for (let i = 0; i < 3; i++) {
				await frictionTrackingService.recordFrictionMetrics({
					chunkId,
					metrics: {
						attemptResult: "failure",
						timeSpent: 300000,
						errorType: "conceptual"
					}
				});
			}

			const analysis = await frictionTrackingService.analyzeChunkFriction(chunkId);
			expect(analysis?.frictionScore).toBeGreaterThan(0.5);
			expect(analysis?.isLeech).toBe(true); // Should be marked as leech
		});

		it("should reset consecutive failures on success", async () => {
			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			createTestChunk(chunkId, topicId);

			// Record failures
			await frictionTrackingService.recordFrictionMetrics({
				chunkId,
				metrics: {
					attemptResult: "failure",
					timeSpent: 300000,
					errorType: "conceptual"
				}
			});

			await frictionTrackingService.recordFrictionMetrics({
				chunkId,
				metrics: {
					attemptResult: "failure",
					timeSpent: 300000,
					errorType: "conceptual"
				}
			});

			// Record success
			await frictionTrackingService.recordFrictionMetrics({
				chunkId,
				metrics: {
					attemptResult: "success",
					timeSpent: 150000,
					errorType: undefined
				}
			});

			const db = getDb();
			const metrics = db.prepare("SELECT * FROM friction_metrics WHERE chunk_id = ?").get(chunkId) as any;
			expect(metrics.consecutive_failures).toBe(0);
		});
	});

	describe("recommendations generation", () => {
		it("should generate appropriate recommendations for high friction", async () => {
			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			createTestChunk(chunkId, topicId);

			// Create high friction scenario
			await frictionTrackingService.recordFrictionMetrics({
				chunkId,
				metrics: {
					attemptResult: "failure",
					timeSpent: 600000, // 10 minutes
					errorType: "conceptual"
				}
			});

			const analysis = await frictionTrackingService.analyzeChunkFriction(chunkId);
			expect(analysis?.recommendations).toBeDefined();
			expect(analysis?.recommendations.length).toBeGreaterThan(0);
			expect(analysis?.recommendations.some(rec => rec.includes("smaller parts"))).toBe(true);
		});

		it("should generate leech recommendations", async () => {
			const chunkId = crypto.randomUUID();
			const topicId = crypto.randomUUID();
			createTestChunk(chunkId, topicId);

			// Create leech scenario (multiple consecutive failures)
			for (let i = 0; i < 4; i++) {
				await frictionTrackingService.recordFrictionMetrics({
					chunkId,
					metrics: {
						attemptResult: "failure",
						timeSpent: 300000,
						errorType: "conceptual"
					}
				});
			}

			const analysis = await frictionTrackingService.analyzeChunkFriction(chunkId);
			expect(analysis?.isLeech).toBe(true);
			expect(analysis?.recommendations.some(rec => rec.includes("prerequisites"))).toBe(true);
		});
	});
});
