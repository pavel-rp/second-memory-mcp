import type {
	SessionInput,
	SessionChunk,
	SessionProgress,
	WorkflowPhase,
	CompletionStatus,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	SessionMode,
} from "../types/session.js";
import { SessionInputSchema } from "../types/session.js";
import { algorithmConfig } from "../config/algorithm.js";

// Helper function to parse ISO timestamp
function parseTimestamp(timestamp: string): Date {
	const parsed = new Date(timestamp);
	return isNaN(parsed.getTime()) ? new Date() : parsed;
}

// Helper function to clamp quality values to valid range
function clampQuality(quality: number): number {
	if (!Number.isFinite(quality)) return 0;
	return Math.max(0, Math.min(5, quality));
}

// Helper function to calculate time elapsed between timestamps
function calculateTimeElapsed(startTime: string, currentTime?: string): number {
	const start = parseTimestamp(startTime);
	const current = currentTime ? parseTimestamp(currentTime) : new Date();
	return Math.max(0, current.getTime() - start.getTime());
}

// Helper function to validate and clean session chunks
function cleanSessionChunks(chunks: SessionChunk[]): SessionChunk[] {
	return chunks.map(chunk => ({
		...chunk,
		attempts: chunk.attempts.map(attempt => ({
			...attempt,
			quality: attempt.quality !== undefined ? clampQuality(attempt.quality) : undefined,
			time_spent_ms: Math.max(0, attempt.time_spent_ms || 0),
		})),
		quality_scores: chunk.quality_scores.map(score => clampQuality(score)),
		time_spent_ms: Math.max(0, chunk.time_spent_ms || 0),
	}));
}

/**
 * Calculate session progress metrics from session input data
 */
export function calculateSessionProgress(sessionData: SessionInput): SessionProgress {
	const cleanedChunks = cleanSessionChunks(sessionData.chunks);

	// Basic counts
	const totalChunks = cleanedChunks.length;
	const chunksCompleted = cleanedChunks.filter(chunk => chunk.status === "completed").length;

	// Calculate overall progress
	const overallProgress = totalChunks > 0 ? chunksCompleted / totalChunks : 0;

	// Calculate average quality from all quality scores
	const allQualityScores = cleanedChunks.flatMap(chunk => chunk.quality_scores);
	const averageQuality = allQualityScores.length > 0
		? allQualityScores.reduce((sum, score) => sum + score, 0) / allQualityScores.length
		: 0;

	// Calculate time elapsed
	const timeElapsedMs = calculateTimeElapsed(sessionData.start_time, sessionData.current_time);

	// Estimate remaining time based on current pace
	let estimatedTimeRemainingMs: number | undefined;
	if (chunksCompleted > 0 && totalChunks > chunksCompleted && timeElapsedMs > 0) {
		const averageTimePerChunk = timeElapsedMs / chunksCompleted;
		const remainingChunks = totalChunks - chunksCompleted;
		estimatedTimeRemainingMs = Math.round(averageTimePerChunk * remainingChunks);
	}

	return {
		session_id: sessionData.session_id,
		overall_progress: Math.round(overallProgress * 100) / 100, // Round to 2 decimal places
		chunks_completed: chunksCompleted,
		total_chunks: totalChunks,
		average_quality: Math.round(averageQuality * 100) / 100, // Round to 2 decimal places
		time_elapsed_ms: timeElapsedMs,
		estimated_time_remaining_ms: estimatedTimeRemainingMs,
	};
}

/**
 * Determine the next workflow phase and provide guidance
 */
export function determineNextPhase(sessionData: SessionInput): WorkflowPhase {
	const progress = calculateSessionProgress(sessionData);
	const mode = sessionData.mode;

	// Determine current phase based on session mode and progress
	let currentPhase = "unknown";
	let nextPhase: string | undefined;
	let phaseProgress = 0;
	let guidance = "Session analysis in progress...";
	let canAdvance = false;

	switch (mode) {
		case "scaffolding":
			if (progress.chunks_completed === 0) {
				currentPhase = "problem_analysis";
				nextPhase = "chunk_planning";
				phaseProgress = 0;
				guidance = "Begin by analyzing the learning problem and identifying key concepts to break down.";
				canAdvance = false;
			} else if (progress.overall_progress < 0.5) {
				currentPhase = "chunk_planning";
				nextPhase = "chunk_validation";
				phaseProgress = progress.overall_progress * 2; // Scale to 0-1 for this phase
				guidance = "Continue developing learning chunks. Ensure each chunk is digestible and has clear prerequisites.";
				canAdvance = progress.chunks_completed > 0;
			} else {
				currentPhase = "chunk_validation";
				phaseProgress = (progress.overall_progress - 0.5) * 2; // Scale remaining progress
				guidance = "Review and validate the scaffolded chunks. Ensure proper sequence and cognitive load distribution.";
				canAdvance = progress.overall_progress >= 0.8;
			}
			break;

		case "learning":
			if (progress.chunks_completed === 0) {
				currentPhase = "prerequisite_check";
				nextPhase = "content_presentation";
				phaseProgress = 0;
				guidance = "Verify that prerequisite knowledge is in place before beginning new learning.";
				canAdvance = false;
			} else if (progress.overall_progress < 0.7) {
				currentPhase = "content_presentation";
				nextPhase = "comprehension_check";
				phaseProgress = progress.overall_progress / 0.7; // Scale to phase completion
				guidance = "Present learning content systematically. Build understanding step by step.";
				canAdvance = progress.average_quality >= 3;
			} else {
				currentPhase = "comprehension_check";
				phaseProgress = (progress.overall_progress - 0.7) / 0.3; // Scale remaining progress
				guidance = "Verify comprehension through practice and assessment. Ensure solid understanding before proceeding.";
				canAdvance = progress.average_quality >= 4;
			}
			break;

		case "retrieval":
			if (progress.chunks_completed === 0) {
				currentPhase = "retrieval_setup";
				nextPhase = "first_attempt";
				phaseProgress = 0;
				guidance = "Prepare for retrieval practice. Review the two-attempt policy and success criteria.";
				canAdvance = false;
			} else if (progress.overall_progress < 0.5) {
				currentPhase = "first_attempt";
				nextPhase = "second_attempt";
				phaseProgress = progress.overall_progress * 2;
				guidance = "Attempt to retrieve knowledge from memory. Take time to recall before checking answers.";
				canAdvance = true; // Always can proceed to second attempt
			} else {
				currentPhase = "second_attempt";
				phaseProgress = (progress.overall_progress - 0.5) * 2;
				guidance = "If first attempt was unsuccessful, try again with hints or cues. Focus on understanding gaps.";
				canAdvance = progress.average_quality >= 3;
			}
			break;

		case "review":
			if (progress.chunks_completed === 0) {
				currentPhase = "review_preparation";
				nextPhase = "spaced_review";
				phaseProgress = 0;
				guidance = "Prepare for spaced review session. Check review priorities and schedule.";
				canAdvance = false;
			} else if (progress.overall_progress < 0.8) {
				currentPhase = "spaced_review";
				nextPhase = "consolidation";
				phaseProgress = progress.overall_progress / 0.8;
				guidance = "Review material using spaced intervals. Focus on challenging areas and weak points.";
				canAdvance = progress.average_quality >= 3.5;
			} else {
				currentPhase = "consolidation";
				phaseProgress = (progress.overall_progress - 0.8) / 0.2;
				guidance = "Consolidate learning through final review. Strengthen connections and long-term retention.";
				canAdvance = progress.average_quality >= 4;
			}
			break;
	}

	return {
		current_phase: currentPhase,
		next_phase: nextPhase,
		phase_progress: Math.max(0, Math.min(1, phaseProgress)),
		guidance,
		can_advance: canAdvance,
	};
}

/**
 * Check if session should be completed based on multiple criteria
 */
export function checkSessionCompletion(sessionData: SessionInput): CompletionStatus {
	const progress = calculateSessionProgress(sessionData);
	const workflow = determineNextPhase(sessionData);

	// Get configuration thresholds
	const config = algorithmConfig.sessionConfig;
	const QUALITY_THRESHOLD = config.qualityThreshold;
	const TIME_THRESHOLD_MS = config.timeThresholdMs;
	const COMPLETION_THRESHOLD = config.completionThreshold;
	const MAX_TIME_MS = config.maxTimeMs;

	// Check completion criteria
	const qualityThresholdMet = progress.average_quality >= QUALITY_THRESHOLD;
	const timeThresholdMet = progress.time_elapsed_ms >= TIME_THRESHOLD_MS;
	const chunkThresholdMet = progress.overall_progress >= COMPLETION_THRESHOLD;

	// Determine completion status
	let isComplete = false;
	let completionReason = "";
	let recommendation: "continue" | "complete" | "break" = "continue";

	// Time-based completion (session too long)
	if (progress.time_elapsed_ms >= MAX_TIME_MS) {
		isComplete = true;
		completionReason = "Maximum session time reached (2 hours). Take a break to maintain effectiveness.";
		recommendation = "break";
	}
	// Quality + progress completion
	else if (qualityThresholdMet && chunkThresholdMet) {
		isComplete = true;
		completionReason = "Learning goals achieved with high quality performance.";
		recommendation = "complete";
	}
	// Progress completion alone
	else if (chunkThresholdMet) {
		isComplete = true;
		completionReason = "Session objectives completed successfully.";
		recommendation = "complete";
	}
	// Quality threshold with reasonable time
	else if (qualityThresholdMet && timeThresholdMet) {
		isComplete = true;
		completionReason = "High quality performance achieved with sufficient practice time.";
		recommendation = "complete";
	}
	// Long session with moderate progress
	else if (timeThresholdMet && progress.overall_progress >= 0.5) {
		isComplete = true;
		completionReason = "Good progress made in extended session. Consider taking a break.";
		recommendation = "break";
	}
	// Continue conditions
	else if (progress.overall_progress < 0.3 && progress.time_elapsed_ms < 30 * 60 * 1000) {
		completionReason = "Session just beginning. Continue with current learning phase.";
		recommendation = "continue";
	}
	else if (!workflow.can_advance && progress.average_quality < 3) {
		completionReason = "Current phase needs more work before advancing.";
		recommendation = "continue";
	}
	else {
		completionReason = "Session progressing normally. Continue with learning objectives.";
		recommendation = "continue";
	}

	return {
		is_complete: isComplete,
		completion_reason: completionReason,
		quality_threshold_met: qualityThresholdMet,
		time_threshold_met: timeThresholdMet,
		chunk_threshold_met: chunkThresholdMet,
		recommendation,
	};
}

/**
 * Validate and normalize session context data
 */
export function validateSessionContext(context: unknown): SessionInput {
	// Use Zod to validate and parse the input
	const result = SessionInputSchema.safeParse(context);

	if (!result.success) {
		// Extract meaningful error information
		const errorMessages = result.error.errors.map(err =>
			`${err.path.join('.')}: ${err.message}`
		).join('; ');

		throw new Error(`Invalid session context: ${errorMessages}`);
	}

	const validatedData = result.data;

	// Apply defaults and normalization
	const normalizedData: SessionInput = {
		...validatedData,
		current_time: validatedData.current_time || new Date().toISOString(),
		chunks: cleanSessionChunks(validatedData.chunks),
		context: validatedData.context || {},
	};

	// Additional business logic validation
	if (normalizedData.chunks.length === 0) {
		throw new Error("Session must contain at least one chunk");
	}

	// Validate time consistency
	const startTime = parseTimestamp(normalizedData.start_time);
	const currentTime = parseTimestamp(normalizedData.current_time || "");

	if (currentTime < startTime) {
		throw new Error("Current time cannot be before start time");
	}

	return normalizedData;
}