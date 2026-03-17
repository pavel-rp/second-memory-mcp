import type { NotesRepository, CreateNoteInput } from '../ports/notes-repository.js';
import type {
  NoteCreated,
  NoteListResult,
  NoteDeleted,
  NoteTargetType,
} from '../domain/types/notes-tools.js';

export type NotesDeps = {
  notes: NotesRepository;
};

export async function createNote(input: CreateNoteInput, deps: NotesDeps): Promise<NoteCreated> {
  return deps.notes.createNote(input);
}

export async function listNotes(
  targetType: NoteTargetType,
  targetId: string,
  deps: NotesDeps
): Promise<NoteListResult> {
  const records = await deps.notes.getNotesByTarget(targetType, targetId);
  return { notes: records };
}

export async function deleteNote(noteId: string, deps: NotesDeps): Promise<NoteDeleted> {
  const deleted = await deps.notes.deleteNote(noteId);
  return { success: deleted };
}
