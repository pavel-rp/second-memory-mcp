import { z } from 'zod';
import { VALIDATION_CONSTANTS } from '../../shared/constants/validation.js';
import type { ChunkType } from './recommendations.js';

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
