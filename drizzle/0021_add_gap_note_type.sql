ALTER TABLE "notes" DROP CONSTRAINT "chk_note_type";
ALTER TABLE "notes" ADD CONSTRAINT "chk_note_type" CHECK ("notes"."note_type" IN ('insight', 'confusion', 'connection', 'deeper_exploration', 'gap'));
