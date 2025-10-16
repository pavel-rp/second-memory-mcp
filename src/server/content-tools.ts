import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getChunkContent, listChunksWithContent, type ListChunksWithContentFilter } from "../services/chunks.js";
import { getSql } from "../db/operations.js";
import { learningTopics } from "../db/schema.js";
import { eq } from "drizzle-orm";

export function registerContentTools(server: McpServer): void {
	// Tool for retrieving individual chunk content
	server.registerTool(
		"get_chunk_content",
		{
			title: "Get Chunk Content",
			description: "Retrieve the content of a specific learning chunk by ID.",
			inputSchema: {
				chunkId: z.string().min(1, "Chunk ID cannot be empty").describe("ID of the chunk to retrieve content for"),
			},
		},
		async ({ chunkId }: { chunkId: string }) => {
			try {
				const chunkContent = await getChunkContent(chunkId);
				
				if (!chunkContent) {
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify({
									success: false,
									error: "Chunk not found",
									message: `No chunk found with ID: ${chunkId}`,
								}),
							},
						],
					};
				}
				
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								success: true,
								chunkId,
								content: chunkContent.content,
								contentVersion: chunkContent.contentVersion,
								contentUpdatedAt: chunkContent.contentUpdatedAt,
								message: `Successfully retrieved content for chunk: ${chunkId}`,
							}),
						},
					],
			};
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								success: false,
								error: "retrieval_error",
								message: `Failed to retrieve chunk content: ${errorMsg}`,
							}),
						},
					],
			};
			}
		}
	);

	// Tool for retrieving topic summary
	server.registerTool(
		"get_topic_summary",
		{
			title: "Get Topic Summary",
			description: "Retrieve the summary content of a specific learning topic by ID.",
			inputSchema: {
				topicId: z.string().min(1, "Topic ID cannot be empty").describe("ID of the topic to retrieve summary for"),
			},
		},
		async ({ topicId }: { topicId: string }) => {
			try {
				const db = getSql();
				const topicResult = db.select({
					id: learningTopics.id,
					title: learningTopics.title,
					subject: learningTopics.subject,
					summary: learningTopics.summary,
					summaryVersion: learningTopics.summaryVersion,
					summaryUpdatedAt: learningTopics.summaryUpdatedAt,
					createdAt: learningTopics.createdAt,
					updatedAt: learningTopics.updatedAt,
				}).from(learningTopics).where(eq(learningTopics.id, topicId)).get();
				
				if (!topicResult) {
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify({
									success: false,
									error: "Topic not found",
									message: `No topic found with ID: ${topicId}`,
								}),
							},
						],
					};
				}
				
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								success: true,
								topicId,
								title: topicResult.title,
								subject: topicResult.subject,
								summary: topicResult.summary,
								summaryVersion: topicResult.summaryVersion,
								summaryUpdatedAt: topicResult.summaryUpdatedAt,
								createdAt: topicResult.createdAt,
								updatedAt: topicResult.updatedAt,
								message: `Successfully retrieved topic summary: ${topicResult.title}`,
							}),
						},
					],
			};
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								success: false,
								error: "retrieval_error",
								message: `Failed to retrieve topic summary: ${errorMsg}`,
							}),
						},
					],
			};
			}
		}
	);

	// Tool for batch content retrieval
	server.registerTool(
		"list_items_with_content",
		{
			title: "List Learning Items with Content",
			description: "Retrieve learning items with their content. Supports filtering by subject and due status.",
			inputSchema: {
				subjectFilter: z.string().optional().describe("Filter by subject/category"),
				dueOnly: z.boolean().optional().describe("Only return items due for review"),
				limit: z.number().int().min(1).max(100).optional().describe("Maximum number of items to return (1-100)"),
				includeContent: z.boolean().default(true).describe("Whether to include content in the response"),
			},
		},
		async ({ subjectFilter, dueOnly, limit, includeContent = true }: { subjectFilter?: string; dueOnly?: boolean; limit?: number; includeContent?: boolean }) => {
			try {
				const filter: ListChunksWithContentFilter = {
					subject: subjectFilter,
					dueOnly,
					limit,
					includeContent,
				};
				
				const items = await listChunksWithContent(filter);
				
				// The service already handles includeContent filtering, so we can use items directly
				const responseItems = items;
				
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								success: true,
								items: responseItems,
								count: responseItems.length,
								contentIncluded: includeContent,
								filter: {
									subject: subjectFilter || null,
									dueOnly: dueOnly || false,
									limit: limit || null,
								},
								message: `Successfully retrieved ${responseItems.length} learning items${includeContent ? ' with content' : ''}`,
							}),
						},
					],
			};
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								success: false,
								error: "retrieval_error",
								message: `Failed to retrieve learning items: ${errorMsg}`,
							}),
						},
					],
			};
			}
		}
	);
}