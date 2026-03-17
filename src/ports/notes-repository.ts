import type {
  NoteCreated,
  NoteRecord,
  NoteTargetType,
  NoteType,
  NoteAuthor,
} from '../domain/types/notes-tools.js';

export type CreateNoteInput = {
  targetType: NoteTargetType;
  targetId: string;
  noteType: NoteType;
  content: string;
  author: NoteAuthor;
};

export interface NotesRepository {
  createNote(input: CreateNoteInput): Promise<NoteCreated>;
  getNotesByTarget(targetType: string, targetId: string): Promise<NoteRecord[]>;
  getNotesForChunkIds(chunkIds: string[]): Promise<NoteRecord[]>;
  deleteNote(id: string): Promise<boolean>;
}
