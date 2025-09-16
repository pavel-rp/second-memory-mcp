// Read-only Notion schema definitions and usage notes
import type { NotionSchemasResource } from "../types/notion-schemas.js";

export function getSchemas(): NotionSchemasResource {
	return {
		schema_version: "1.1.0",
		schemas: {
			learning_topics: {
				database: "Learning Topics",
				properties: {
					title: { type: "title" },
					description: { type: "rich_text" },
					difficulty: { type: "number", format: "1..10" },
					status: { type: "select", options: ["planned", "in_progress", "learned"] },
					created_at: { type: "date" },
					updated_at: { type: "date" },
				},
			},
			learning_chunks: {
				database: "Learning Chunks",
				properties: {
					title: { type: "title" },
					topic: { type: "relation", database: "Learning Topics" },
					order: { type: "number" },
					content: { type: "rich_text" },
					prerequisites: { type: "rich_text" },
					// Advanced SR metadata (optional)
					tags: { type: "multi_select", options: [] },
					created_at: { type: "date" },
					updated_at: { type: "date" },
				},
			},
			review_schedule: {
				database: "Review Schedule",
				properties: {
					chunk: { type: "relation", database: "Learning Chunks" },
					next_review: { type: "date" },
					interval_days: { type: "number" },
					ease_factor: { type: "number" },
					repetitions: { type: "number" },
					priority: { type: "number" },
					last_quality: { type: "number", format: "0..5" },
					// Advanced SR metadata (optional)
					lapse_count: { type: "number" },
					consecutive_failures: { type: "number" },
					leech_flag: { type: "checkbox" },
					updated_at: { type: "date" },
				},
			},
			performance_analytics: {
				database: "Performance Analytics",
				properties: {
					date: { type: "date" },
					reviews_completed: { type: "number" },
					average_quality: { type: "number" },
					new_chunks_learned: { type: "number" },
					streak_days: { type: "number" },
				},
			},
			session_logs: {
				database: "Session Logs",
				properties: {
					start_time: { type: "date" },
					end_time: { type: "date" },
					mode: { type: "select", options: ["learning", "retrieval", "review"] },
					topic: { type: "relation", database: "Learning Topics" },
					chunk: { type: "relation", database: "Learning Chunks" },
					quality: { type: "number", format: "0..5" },
					notes: { type: "rich_text" },
				},
			},
		},
		usage_notes: [
			"Use a separate Notion MCP layer for all persistence.",
			"Create databases if missing using these schemas; do not call Notion APIs from this server.",
			"Link chunks to topics, and schedule entries to chunks.",
			"Update 'review_schedule' after each review using the calculator outputs.",
			"Advanced SR: Add optional fields 'lapse_count', 'consecutive_failures', 'leech_flag' to 'Review Schedule' and 'tags' (multi-select) to 'Learning Chunks'.",
		].join("\n"),
		breaking_changes: [
			"1.1.0: Added optional advanced SR fields; existing data remains valid. Ensure Notion databases include these columns where needed.",
		],
	};
}


