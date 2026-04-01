import { describe, it, expect, vi } from 'vitest';
import {
  createNote,
  listNotes,
  deleteNote,
  type NotesDeps,
} from '../../../src/orchestration/notes-workflows.js';
import { stubNotesRepository } from '../../helpers/stub-ports.js';

function stubDeps(overrides?: Partial<NotesDeps['notes']>): NotesDeps {
  return { notes: stubNotesRepository(overrides) };
}

// ── createNote ──────────────────────────────────────────────────

describe('createNote', () => {
  it('creates a note and returns id + createdAt', async () => {
    const now = Date.now();
    const deps = stubDeps({
      createNote: vi.fn().mockResolvedValue({ id: 'note-1', createdAt: now }),
    });

    const result = await createNote(
      {
        targetType: 'chunk',
        targetId: 'chunk-1',
        noteType: 'insight',
        content: 'This is an insight',
        author: 'agent',
      },
      deps
    );

    expect(result).toEqual({ id: 'note-1', createdAt: now });
    expect(deps.notes.createNote).toHaveBeenCalledWith({
      targetType: 'chunk',
      targetId: 'chunk-1',
      noteType: 'insight',
      content: 'This is an insight',
      author: 'agent',
    });
  });

  it('passes topic target type through', async () => {
    const deps = stubDeps();
    await createNote(
      {
        targetType: 'topic',
        targetId: 'topic-1',
        noteType: 'confusion',
        content: 'Confused about this',
        author: 'user',
      },
      deps
    );

    expect(deps.notes.createNote).toHaveBeenCalledWith(
      expect.objectContaining({ targetType: 'topic', author: 'user' })
    );
  });

  it('passes session target type through', async () => {
    const deps = stubDeps();
    await createNote(
      {
        targetType: 'session',
        targetId: 'sess-1',
        noteType: 'connection',
        content: 'Connected to X',
        author: 'agent',
      },
      deps
    );

    expect(deps.notes.createNote).toHaveBeenCalledWith(
      expect.objectContaining({ targetType: 'session', noteType: 'connection' })
    );
  });
});

// ── listNotes ───────────────────────────────────────────────────

describe('listNotes', () => {
  it('returns notes array for a target', async () => {
    const notes = [
      {
        id: 'n1',
        noteType: 'insight',
        content: 'Note 1',
        author: 'agent',
        createdAt: '1970-01-01T00:00:01.000Z',
      },
      {
        id: 'n2',
        noteType: 'confusion',
        content: 'Note 2',
        author: 'user',
        createdAt: '1970-01-01T00:00:00.900Z',
      },
    ];
    const deps = stubDeps({
      getNotesByTarget: vi.fn().mockResolvedValue(notes),
    });

    const result = await listNotes('chunk', 'chunk-1', deps);

    expect(result).toEqual({ notes });
    expect(deps.notes.getNotesByTarget).toHaveBeenCalledWith('chunk', 'chunk-1');
  });

  it('returns empty array when target has no notes', async () => {
    const deps = stubDeps({
      getNotesByTarget: vi.fn().mockResolvedValue([]),
    });

    const result = await listNotes('topic', 'topic-1', deps);

    expect(result).toEqual({ notes: [] });
  });
});

// ── deleteNote ──────────────────────────────────────────────────

describe('deleteNote', () => {
  it('returns success true when note is deleted', async () => {
    const deps = stubDeps({
      deleteNote: vi.fn().mockResolvedValue(true),
    });

    const result = await deleteNote('note-1', deps);

    expect(result).toEqual({ success: true });
    expect(deps.notes.deleteNote).toHaveBeenCalledWith('note-1');
  });

  it('returns success false for non-existent note', async () => {
    const deps = stubDeps({
      deleteNote: vi.fn().mockResolvedValue(false),
    });

    const result = await deleteNote('nonexistent', deps);

    expect(result).toEqual({ success: false });
  });
});
