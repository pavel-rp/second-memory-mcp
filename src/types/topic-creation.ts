import { z } from "zod";
import { VALIDATION_CONSTANTS } from "../constants/validation.js";
import type { ChunkType, SubjectPreference } from "./recommendations.js";

// Topic creation request types
export type TopicCreationRequest = {
	topicTitle: string;
	topicDescription?: string;
	subject: string;
	userPreferences?: UserPreferences;
	timeAvailable?: number; // minutes
};

export type UserPreferences = {
	preferredDifficulty?: number; // 1-10
	learningStyle?: "visual" | "auditory" | "kinesthetic" | "reading";
	maxChunkDuration?: number; // minutes
	includePrerequisites?: boolean;
};

// Chunk definition for topic creation
export type ChunkDefinition = {
	id: string;
	title: string;
	content: string;
	difficulty: number; // 1-10
	prerequisites: string[];
	estimatedDuration: number; // minutes
	order: number; // sequence in topic
	tags: string[];
	chunkType: ChunkType;
};

// Topic with chunks creation result
export type TopicWithChunks = {
	topicId: string;
	topicTitle: string;
	topicDescription: string;
	subject: string;
	chunks: ChunkDefinition[];
	createdAt: number;
	updatedAt: number;
};

// Friction tracking types
export type FrictionMetrics = {
	chunkId: string;
	userId?: string; // optional for anonymous tracking
	failedAttempts: number;
	averageTimeSpent: number; // milliseconds
	errorPatterns: string[];
	lastStruggleDate: number; // epoch ms
	frictionScore: number; // 0-1, higher = more friction
	consecutiveFailures: number;
	totalAttempts: number;
};

export type FrictionUpdate = {
	chunkId: string;
	attemptResult: "success" | "failure" | "partial";
	timeSpent: number; // milliseconds
	errorType?: string;
	quality?: number; // 0-5 for success cases
};

// Topic creation service interfaces
export type TopicCreationInput = {
	topicTitle: string;
	topicDescription?: string;
	subject: string;
	chunks: ChunkDefinition[];
	userPreferences?: UserPreferences;
};

export type TopicCreationResult = {
	success: boolean;
	topic?: TopicWithChunks;
	error?: {
		type: "validation" | "database" | "generation";
		message: string;
		retryable: boolean;
	};
};

// Friction tracking service interfaces
export type FrictionTrackingInput = {
	chunkId: string;
	metrics: FrictionUpdate;
};

export type FrictionAnalysisResult = {
	chunkId: string;
	frictionScore: number;
	priority: number; // for retrieval system
	recommendations: string[];
	isLeech: boolean; // high friction chunk
};

// Zod schemas for runtime validation

export const UserPreferencesSchema = z.object({
	preferredDifficulty: z.number().int().min(VALIDATION_CONSTANTS.MIN_DIFFICULTY).max(VALIDATION_CONSTANTS.MAX_DIFFICULTY).optional(),
	learningStyle: z.enum(["visual", "auditory", "kinesthetic", "reading"]).optional(),
	maxChunkDuration: z.number().min(1).max(120).optional(), // 1-120 minutes
	includePrerequisites: z.boolean().optional(),
});

export const ChunkDefinitionSchema = z.object({
	id: z.string().min(1),
	title: z.string().min(1).max(VALIDATION_CONSTANTS.MAX_TITLE_LENGTH),
	content: z.string().min(1),
	difficulty: z.number().int().min(VALIDATION_CONSTANTS.MIN_DIFFICULTY).max(VALIDATION_CONSTANTS.MAX_DIFFICULTY),
	prerequisites: z.array(z.string()),
	estimatedDuration: z.number().min(1).max(120), // 1-120 minutes
	order: z.number().int().min(1),
	tags: z.array(z.string()),
	chunkType: z.enum(["new", "review", "remediation"]),
});

export const TopicCreationRequestSchema = z.object({
	topicTitle: z.string().min(1).max(VALIDATION_CONSTANTS.MAX_TITLE_LENGTH),
	topicDescription: z.string().max(1000).optional(),
	subject: z.string().min(1).max(VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH),
	userPreferences: UserPreferencesSchema.optional(),
	timeAvailable: z.number().min(1).max(480).optional(), // 1-480 minutes (8 hours)
});

export const TopicWithChunksSchema = z.object({
	topicId: z.string().min(1),
	topicTitle: z.string().min(1),
	topicDescription: z.string(),
	subject: z.string().min(1),
	chunks: z.array(ChunkDefinitionSchema),
	createdAt: z.number().int().min(0),
	updatedAt: z.number().int().min(0),
});

export const FrictionMetricsSchema = z.object({
	chunkId: z.string().min(1),
	userId: z.string().optional(),
	failedAttempts: z.number().int().min(0),
	averageTimeSpent: z.number().min(0),
	errorPatterns: z.array(z.string()),
	lastStruggleDate: z.number().int().min(0),
	frictionScore: z.number().min(0).max(1),
	consecutiveFailures: z.number().int().min(0),
	totalAttempts: z.number().int().min(0),
});

export const FrictionUpdateSchema = z.object({
	chunkId: z.string().min(1),
	attemptResult: z.enum(["success", "failure", "partial"]),
	timeSpent: z.number().min(0),
	errorType: z.string().optional(),
	quality: z.number().min(0).max(VALIDATION_CONSTANTS.MAX_QUALITY_SCORE).optional(),
});

export const TopicCreationInputSchema = z.object({
	topicTitle: z.string().min(1).max(VALIDATION_CONSTANTS.MAX_TITLE_LENGTH),
	topicDescription: z.string().max(1000).optional(),
	subject: z.string().min(1).max(VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH),
	chunks: z.array(ChunkDefinitionSchema).min(1).max(20), // 1-20 chunks per topic
	userPreferences: UserPreferencesSchema.optional(),
});

export const TopicCreationResultSchema = z.object({
	success: z.boolean(),
	topic: TopicWithChunksSchema.optional(),
	error: z.object({
		type: z.enum(["validation", "database", "generation"]),
		message: z.string(),
		retryable: z.boolean(),
	}).optional(),
});

export const FrictionTrackingInputSchema = z.object({
	chunkId: z.string().min(1),
	metrics: FrictionUpdateSchema,
});

export const FrictionAnalysisResultSchema = z.object({
	chunkId: z.string().min(1),
	frictionScore: z.number().min(0).max(1),
	priority: z.number().min(0),
	recommendations: z.array(z.string()),
	isLeech: z.boolean(),
});
