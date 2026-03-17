import { desc, eq, and, inArray } from 'drizzle-orm';
import crypto from 'node:crypto';
import { getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import { notes } from '../../infrastructure/db/schema.js';
import type { NoteCreated, NoteRecord, NoteTargetType } from '../../domain/types/notes-tools.js';
import type { NotesRepository, CreateNoteInput } from '../../ports/notes-repository.js';

export class DrizzleNotesRepository implements NotesRepository {
  constructor(private db: SqlDb = getSql()) {}

  async createNote(input: CreateNoteInput): Promise<NoteCreated> {
    const now = Date.now();
    const [row] = await this.db
      .insert(notes)
      .values({
        id: crypto.randomUUID(),
        targetType: input.targetType,
        targetId: input.targetId,
        noteType: input.noteType,
        content: input.content,
        author: input.author,
        createdAt: now,
      })
      .returning({ id: notes.id, createdAt: notes.createdAt });
    return row as NoteCreated;
  }

  async getNotesByTarget(targetType: NoteTargetType, targetId: string): Promise<NoteRecord[]> {
    const rows = await this.db
      .select({
        id: notes.id,
        noteType: notes.noteType,
        content: notes.content,
        author: notes.author,
        createdAt: notes.createdAt,
      })
      .from(notes)
      .where(and(eq(notes.targetType, targetType), eq(notes.targetId, targetId)))
      .orderBy(desc(notes.createdAt), desc(notes.id));
    return rows as NoteRecord[];
  }

  async getNotesForChunkIds(chunkIds: string[]): Promise<NoteRecord[]> {
    if (chunkIds.length === 0) return [];
    const rows = await this.db
      .select({
        id: notes.id,
        noteType: notes.noteType,
        content: notes.content,
        author: notes.author,
        createdAt: notes.createdAt,
      })
      .from(notes)
      .where(and(eq(notes.targetType, 'chunk'), inArray(notes.targetId, chunkIds)))
      .orderBy(desc(notes.createdAt), desc(notes.id));
    return rows as NoteRecord[];
  }

  async deleteNote(id: string): Promise<boolean> {
    const result = await this.db.delete(notes).where(eq(notes.id, id));
    return (result.rowCount as number) > 0;
  }
}
