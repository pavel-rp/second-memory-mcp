export type NotionSchemasResource = {
	schema_version: string;
	schemas: {
		learning_topics: Record<string, unknown>;
		learning_chunks: Record<string, unknown>;
		review_schedule: Record<string, unknown>;
		performance_analytics: Record<string, unknown>;
		session_logs: Record<string, unknown>;
	};
	usage_notes: string;
	breaking_changes?: string[];
};


