ALTER TABLE "learning_chunks" ADD COLUMN "knowledge_type" text;
ALTER TABLE "learning_chunks" ADD CONSTRAINT "chk_knowledge_type" CHECK ("learning_chunks"."knowledge_type" IN ('fact', 'concept', 'procedure', 'principle'));
ALTER TABLE "learning_topics" ADD COLUMN "dependency_graph_type" text;
ALTER TABLE "learning_topics" ADD CONSTRAINT "chk_dependency_graph_type" CHECK ("learning_topics"."dependency_graph_type" IN ('linear_chain', 'convergent', 'divergent', 'single_root'));
