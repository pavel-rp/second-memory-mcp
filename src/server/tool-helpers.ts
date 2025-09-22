import { SessionInputSchema } from "../types/session.js";

export type ChunkGenerationToolArgs = {
        topicTitle: string;
        topicDescription?: string;
        existingChunkTitles?: string[];
        workflowContext?: "guided" | "explicit";
};

export type ChunkManagementToolArgs = {
        operation?: "update" | "merge" | "split" | "retire";
        managedChunk?: { title: string; order?: number; content?: string; prerequisites?: string };
        intent?: string;
};

export type AdvancedNextArgs = {
        quality: number;
        repetitions: number;
        ease_factor: number;
        interval: number;
        days_overdue?: number;
        consecutive_failures?: number;
};

export type RankCandidatesArgs = {
        candidates: Array<{
                id: string;
                next_review_date: string;
                ease_factor: number;
                repetitions: number;
                difficulty: number;
                tags?: string[];
        }>;
        timeboxMinutes?: number;
};

export const sessionToolInputSchema = SessionInputSchema.shape;
