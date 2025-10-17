import { z } from 'zod';
import { VALIDATION_CONSTANTS } from '../constants/validation.js';
import type { ChunkType } from './recommendations.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { SubjectPreference } from './recommendations.js';

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
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
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
  // Content persistence fields
  topicSummary?: string;
};

// Topic creation service interfaces
export type TopicCreationInput = {
  topicTitle: string;
  topicDescription?: string;
  subject: string;
  chunks: ChunkDefinition[];
  userPreferences?: UserPreferences;
  // Content persistence fields
  topicSummary?: string;
};

export type TopicCreationResult = {
  success: boolean;
  topic?: TopicWithChunks;
  error?: {
    type: 'validation' | 'database' | 'generation';
    message: string;
    retryable: boolean;
  };
};

// Zod schemas for runtime validation

export const UserPreferencesSchema = z.object({
  preferredDifficulty: z
    .number()
    .int()
    .min(VALIDATION_CONSTANTS.MIN_DIFFICULTY)
    .max(VALIDATION_CONSTANTS.MAX_DIFFICULTY)
    .optional(),
  learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional(),
  maxChunkDuration: z.number().min(1).max(120).optional(), // 1-120 minutes
  includePrerequisites: z.boolean().optional(),
});

export const ChunkDefinitionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(VALIDATION_CONSTANTS.MAX_TITLE_LENGTH),
  content: z
    .string()
    .min(VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH)
    .max(VALIDATION_CONSTANTS.MAX_CONTENT_SIZE),
  difficulty: z
    .number()
    .int()
    .min(VALIDATION_CONSTANTS.MIN_DIFFICULTY)
    .max(VALIDATION_CONSTANTS.MAX_DIFFICULTY),
  prerequisites: z.array(z.string()),
  estimatedDuration: z.number().min(1).max(120), // 1-120 minutes
  order: z.number().int().min(1),
  tags: z.array(z.string()),
  chunkType: z.enum(['new', 'review', 'remediation']),
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
  // Content persistence validation
  topicSummary: z.string().optional(),
});

export const TopicCreationInputSchema = z.object({
  topicTitle: z.string().min(1).max(VALIDATION_CONSTANTS.MAX_TITLE_LENGTH),
  topicDescription: z.string().max(1000).optional(),
  subject: z.string().min(1).max(VALIDATION_CONSTANTS.MAX_SUBJECT_LENGTH),
  chunks: z.array(ChunkDefinitionSchema).min(1).max(20), // 1-20 chunks per topic
  userPreferences: UserPreferencesSchema.optional(),
  // Content persistence validation
  topicSummary: z
    .string()
    .min(VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH)
    .max(VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE)
    .optional(),
});

export const TopicCreationResultSchema = z.object({
  success: z.boolean(),
  topic: TopicWithChunksSchema.optional(),
  error: z
    .object({
      type: z.enum(['validation', 'database', 'generation']),
      message: z.string(),
      retryable: z.boolean(),
    })
    .optional(),
});
