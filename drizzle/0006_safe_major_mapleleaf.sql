CREATE TABLE "notes" (
	"id" text PRIMARY KEY NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"note_type" text NOT NULL,
	"content" text NOT NULL,
	"author" text NOT NULL,
	"created_at" bigint NOT NULL,
	CONSTRAINT "chk_note_target_type" CHECK ("notes"."target_type" IN ('chunk', 'topic', 'session')),
	CONSTRAINT "chk_note_type" CHECK ("notes"."note_type" IN ('insight', 'confusion', 'connection', 'deeper_exploration')),
	CONSTRAINT "chk_note_author" CHECK ("notes"."author" IN ('agent', 'user'))
);
--> statement-breakpoint
CREATE INDEX "idx_notes_target" ON "notes" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_notes_created_at" ON "notes" USING btree ("created_at");