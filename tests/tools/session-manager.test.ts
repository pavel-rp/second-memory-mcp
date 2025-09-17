import { describe, it, expect } from "vitest";
import {
	calculateSessionProgress,
	determineNextPhase,
	checkSessionCompletion,
	validateSessionContext,
} from "../../src/tools/session-manager.js";
import type { SessionInput } from "../../src/types/session.js";

describe("Session Manager", () => {
	const mockSessionInput: SessionInput = {
		session_id: "test-session-123",
		mode: "learning",
		start_time: "2024-01-01T10:00:00.000Z",
		current_time: "2024-01-01T10:30:00.000Z",
		chunks: [
			{
				chunk_id: "chunk-1",
				title: "Introduction to Programming",
				status: "completed",
				attempts: [
					{
						timestamp: "2024-01-01T10:15:00.000Z",
						quality: 4,
						time_spent_ms: 900000, // 15 minutes
						completed: true,
					},
				],
				quality_scores: [4],
				time_spent_ms: 900000,
			},
			{
				chunk_id: "chunk-2",
				title: "Variables and Data Types",
				status: "in_progress",
				attempts: [
					{
						timestamp: "2024-01-01T10:25:00.000Z",
						quality: 3,
						time_spent_ms: 300000, // 5 minutes
						completed: false,
					},
				],
				quality_scores: [3],
				time_spent_ms: 300000,
			},
			{
				chunk_id: "chunk-3",
				title: "Control Flow",
				status: "pending",
				attempts: [],
				quality_scores: [],
				time_spent_ms: 0,
			},
		],
		context: { topic: "Programming Basics" },
	};

	describe("calculateSessionProgress", () => {
		it("should calculate basic progress metrics correctly", () => {
			const result = calculateSessionProgress(mockSessionInput);

			expect(result.session_id).toBe("test-session-123");
			expect(result.total_chunks).toBe(3);
			expect(result.chunks_completed).toBe(1);
			expect(result.overall_progress).toBe(0.33); // 1/3 rounded to 2 decimals
			expect(result.average_quality).toBe(3.5); // (4 + 3) / 2
			expect(result.time_elapsed_ms).toBe(1800000); // 30 minutes
		});

		it("should handle empty chunks gracefully", () => {
			const emptySession: SessionInput = {
				...mockSessionInput,
				chunks: [],
			};

			expect(() => calculateSessionProgress(emptySession)).not.toThrow();
		});

		it("should calculate estimated time remaining when applicable", () => {
			const result = calculateSessionProgress(mockSessionInput);
			expect(result.estimated_time_remaining_ms).toBeDefined();
			expect(result.estimated_time_remaining_ms).toBeGreaterThan(0);
		});

		it("should handle sessions with no completed chunks", () => {
			const noCompletedSession: SessionInput = {
				...mockSessionInput,
				chunks: mockSessionInput.chunks.map(chunk => ({
					...chunk,
					status: "pending" as const,
				})),
			};

			const result = calculateSessionProgress(noCompletedSession);
			expect(result.chunks_completed).toBe(0);
			expect(result.overall_progress).toBe(0);
			expect(result.estimated_time_remaining_ms).toBeUndefined();
		});

		it("should clamp quality scores to valid range", () => {
			const invalidQualitySession: SessionInput = {
				...mockSessionInput,
				chunks: [
					{
						chunk_id: "chunk-1",
						title: "Test Chunk",
						status: "completed",
						attempts: [
							{
								timestamp: "2024-01-01T10:15:00.000Z",
								quality: 10, // Invalid: too high
								time_spent_ms: 900000,
								completed: true,
							},
						],
						quality_scores: [10, -5], // Invalid scores
						time_spent_ms: 900000,
					},
				],
			};

			const result = calculateSessionProgress(invalidQualitySession);
			expect(result.average_quality).toBeLessThanOrEqual(5);
			expect(result.average_quality).toBeGreaterThanOrEqual(0);
		});
	});

	describe("determineNextPhase", () => {
		it("should determine scaffolding phases correctly", () => {
			const scaffoldingSession: SessionInput = {
				...mockSessionInput,
				mode: "scaffolding",
			};

			const result = determineNextPhase(scaffoldingSession);
			expect(result.current_phase).toBe("chunk_planning");
			expect(result.next_phase).toBe("chunk_validation");
			expect(result.guidance).toContain("chunk");
			expect(result.can_advance).toBe(true);
		});

		it("should determine learning phases correctly", () => {
			const result = determineNextPhase(mockSessionInput); // mode: "learning"
			expect(result.current_phase).toBe("content_presentation");
			expect(result.next_phase).toBe("comprehension_check");
			expect(result.guidance).toContain("learning");
		});

		it("should determine retrieval phases correctly", () => {
			const retrievalSession: SessionInput = {
				...mockSessionInput,
				mode: "retrieval",
			};

			const result = determineNextPhase(retrievalSession);
			expect(result.current_phase).toBe("first_attempt");
			expect(result.next_phase).toBe("second_attempt");
			expect(result.can_advance).toBe(true);
		});

		it("should determine review phases correctly", () => {
			const reviewSession: SessionInput = {
				...mockSessionInput,
				mode: "review",
			};

			const result = determineNextPhase(reviewSession);
			expect(result.current_phase).toBe("spaced_review");
			expect(result.next_phase).toBe("consolidation");
		});

		it("should clamp phase progress between 0 and 1", () => {
			const result = determineNextPhase(mockSessionInput);
			expect(result.phase_progress).toBeGreaterThanOrEqual(0);
			expect(result.phase_progress).toBeLessThanOrEqual(1);
		});
	});

	describe("checkSessionCompletion", () => {
		it("should recommend completion for high quality and progress", () => {
			const highQualitySession: SessionInput = {
				...mockSessionInput,
				chunks: mockSessionInput.chunks.map(chunk => ({
					...chunk,
					status: "completed" as const,
					quality_scores: [5],
				})),
			};

			const result = checkSessionCompletion(highQualitySession);
			expect(result.is_complete).toBe(true);
			expect(result.quality_threshold_met).toBe(true);
			expect(result.chunk_threshold_met).toBe(true);
			expect(result.recommendation).toBe("complete");
		});

		it("should recommend break for long sessions", () => {
			const longSession: SessionInput = {
				...mockSessionInput,
				start_time: "2024-01-01T08:00:00.000Z", // 2.5 hours ago
				current_time: "2024-01-01T10:30:00.000Z",
			};

			const result = checkSessionCompletion(longSession);
			expect(result.is_complete).toBe(true);
			expect(result.recommendation).toBe("break");
			expect(result.completion_reason).toContain("Maximum session time");
		});

		it("should recommend continue for short sessions", () => {
			const shortSession: SessionInput = {
				...mockSessionInput,
				start_time: "2024-01-01T10:15:00.000Z", // 15 minutes ago
				current_time: "2024-01-01T10:30:00.000Z",
				chunks: mockSessionInput.chunks.map(chunk => ({
					...chunk,
					status: "pending" as const,
				})),
			};

			const result = checkSessionCompletion(shortSession);
			expect(result.is_complete).toBe(false);
			expect(result.recommendation).toBe("continue");
		});

		it("should handle edge cases gracefully", () => {
			const edgeCaseSession: SessionInput = {
				...mockSessionInput,
				chunks: [],
			};

			// Should not throw an error even with invalid data
			expect(() => checkSessionCompletion(edgeCaseSession)).not.toThrow();
		});
	});

	describe("validateSessionContext", () => {
		it("should validate correct session data", () => {
			const result = validateSessionContext(mockSessionInput);
			expect(result).toEqual(expect.objectContaining({
				session_id: "test-session-123",
				mode: "learning",
			}));
		});

		it("should reject invalid session data", () => {
			const invalidSession = {
				session_id: "", // Invalid: empty string
				mode: "invalid-mode", // Invalid mode
				start_time: "not-a-date", // Invalid date format
				chunks: [],
			};

			expect(() => validateSessionContext(invalidSession)).toThrow("Invalid session context");
		});

		it("should reject sessions with empty chunks array", () => {
			const noChunksSession = {
				...mockSessionInput,
				chunks: [],
			};

			expect(() => validateSessionContext(noChunksSession)).toThrow("Session must contain at least one chunk");
		});

		it("should reject sessions where current time is before start time", () => {
			const timeInconsistentSession = {
				...mockSessionInput,
				start_time: "2024-01-01T10:30:00.000Z",
				current_time: "2024-01-01T10:00:00.000Z", // Before start time
			};

			expect(() => validateSessionContext(timeInconsistentSession)).toThrow("Current time cannot be before start time");
		});

		it("should set default current_time if not provided", () => {
			const sessionWithoutCurrentTime = {
				...mockSessionInput,
				current_time: undefined,
			};

			const result = validateSessionContext(sessionWithoutCurrentTime);
			expect(result.current_time).toBeDefined();
			expect(new Date(result.current_time!).getTime()).toBeGreaterThan(new Date(mockSessionInput.start_time).getTime());
		});

		it("should reject invalid chunk data during validation", () => {
			const sessionWithBadData = {
				...mockSessionInput,
				chunks: [
					{
						chunk_id: "chunk-1",
						title: "Test Chunk",
						status: "completed",
						attempts: [
							{
								timestamp: "2024-01-01T10:15:00.000Z",
								quality: 10, // Invalid: too high
								time_spent_ms: -100, // Invalid: negative
								completed: true,
							},
						],
						quality_scores: [-1, 6], // Invalid: outside range
						time_spent_ms: -500, // Invalid: negative
					},
				],
			};

			expect(() => validateSessionContext(sessionWithBadData)).toThrow("Invalid session context");
		});

		it("should clean chunk data when using calculate functions directly", () => {
			// Test that the cleaning happens in the calculation functions
			const sessionWithValidData: SessionInput = {
				...mockSessionInput,
				chunks: [
					{
						chunk_id: "chunk-1",
						title: "Test Chunk",
						status: "completed",
						attempts: [
							{
								timestamp: "2024-01-01T10:15:00.000Z",
								quality: 4,
								time_spent_ms: 900000,
								completed: true,
							},
						],
						quality_scores: [4, 5],
						time_spent_ms: 900000,
					},
				],
			};

			// This should work without errors
			const result = calculateSessionProgress(sessionWithValidData);
			expect(result).toBeDefined();
			expect(result.average_quality).toBe(4.5);
		});
	});
});