CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
ALTER TABLE "learning_chunks" ADD COLUMN "content_embedding" vector(1536);--> statement-breakpoint
ALTER TABLE "learning_topics" ADD COLUMN "summary_embedding" vector(1536);--> statement-breakpoint
CREATE INDEX "idx_learning_chunks_content_embedding" ON "learning_chunks" USING hnsw ("content_embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "idx_learning_topics_summary_embedding" ON "learning_topics" USING hnsw ("summary_embedding" vector_cosine_ops);