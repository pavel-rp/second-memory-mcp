import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { registerNotesTools } from '../../../src/server/notes-tools.js';
import { createAppContext } from '../../../src/composition-root.js';
import { DrizzleNotesRepository } from '../../../src/adapters/drizzle/notes-repository.js';
import { getSql } from '../../../src/infrastructure/db/operations.js';
import { setupTestDb, cleanupTestDb, teardownTestDb } from '../../helpers/db-setup.js';
import { CaptureServer, parseToolResult } from '../../helpers/capture-server.js';

describe('Integration: notes tools', () => {
  let server: CaptureServer;
  let addNote: { spec: any; handler: Function };
  let listNotes: { spec: any; handler: Function };
  let deleteNote: { spec: any; handler: Function };

  beforeAll(setupTestDb);
  beforeEach(async () => {
    await cleanupTestDb();
    server = new CaptureServer();
    registerNotesTools(server as any, createAppContext({ embedding: undefined }));
    addNote = server.tools.get('add_note')!;
    listNotes = server.tools.get('list_notes')!;
    deleteNote = server.tools.get('delete_note')!;
    expect(addNote).toBeDefined();
    expect(listNotes).toBeDefined();
    expect(deleteNote).toBeDefined();
  });
  afterAll(teardownTestDb);

  // ── add_note ────────────────────────────────────────────────────

  it('add_note creates a note and returns id + created_at', async () => {
    const result = await addNote.handler({
      target_type: 'chunk',
      target_id: 'chunk-1',
      note_type: 'insight',
      content: 'User derived the proof independently',
      author: 'agent',
    });

    const parsed = parseToolResult(result);
    expect(parsed.id).toEqual(expect.any(String));
    expect(parsed.created_at).toEqual(expect.any(String));
  });

  it('add_note rejects invalid target_type', async () => {
    const result = await addNote.handler({
      target_type: 'invalid',
      target_id: 'chunk-1',
      note_type: 'insight',
      content: 'Some content',
      author: 'agent',
    });

    const parsed = parseToolResult(result);
    expect(parsed.success).toBe(false);
    expect(parsed.error.type).toBe('validation');
  });

  it('add_note rejects invalid note_type', async () => {
    const result = await addNote.handler({
      target_type: 'chunk',
      target_id: 'chunk-1',
      note_type: 'invalid_type',
      content: 'Some content',
      author: 'agent',
    });

    const parsed = parseToolResult(result);
    expect(parsed.success).toBe(false);
    expect(parsed.error.type).toBe('validation');
  });

  it('add_note rejects invalid author', async () => {
    const result = await addNote.handler({
      target_type: 'chunk',
      target_id: 'chunk-1',
      note_type: 'insight',
      content: 'Some content',
      author: 'system',
    });

    const parsed = parseToolResult(result);
    expect(parsed.success).toBe(false);
    expect(parsed.error.type).toBe('validation');
  });

  it('add_note rejects empty content', async () => {
    const result = await addNote.handler({
      target_type: 'chunk',
      target_id: 'chunk-1',
      note_type: 'insight',
      content: '',
      author: 'agent',
    });

    const parsed = parseToolResult(result);
    expect(parsed.success).toBe(false);
    expect(parsed.error.type).toBe('validation');
  });

  // ── list_notes ──────────────────────────────────────────────────

  it('list_notes returns notes ordered by created_at descending', async () => {
    // Create two notes
    await addNote.handler({
      target_type: 'chunk',
      target_id: 'chunk-1',
      note_type: 'insight',
      content: 'First note',
      author: 'agent',
    });
    await addNote.handler({
      target_type: 'chunk',
      target_id: 'chunk-1',
      note_type: 'confusion',
      content: 'Second note',
      author: 'user',
    });

    const result = await listNotes.handler({
      target_type: 'chunk',
      target_id: 'chunk-1',
    });

    const parsed = parseToolResult(result);
    expect(parsed.notes).toHaveLength(2);
    // Descending order: second note first
    expect(parsed.notes[0].content).toBe('Second note');
    expect(parsed.notes[1].content).toBe('First note');
    expect(parsed.notes[0].note_type).toBe('confusion');
    expect(parsed.notes[0].author).toBe('user');
    expect(parsed.notes[0].created_at).toEqual(expect.any(String));
  });

  it('list_notes returns empty array when target has no notes', async () => {
    const result = await listNotes.handler({
      target_type: 'topic',
      target_id: 'nonexistent-topic',
    });

    const parsed = parseToolResult(result);
    expect(parsed.notes).toEqual([]);
  });

  it('notes for different targets do not leak into each other', async () => {
    await addNote.handler({
      target_type: 'chunk',
      target_id: 'chunk-1',
      note_type: 'insight',
      content: 'Chunk note',
      author: 'agent',
    });
    await addNote.handler({
      target_type: 'topic',
      target_id: 'topic-1',
      note_type: 'confusion',
      content: 'Topic note',
      author: 'user',
    });

    const chunkResult = await listNotes.handler({
      target_type: 'chunk',
      target_id: 'chunk-1',
    });
    const topicResult = await listNotes.handler({
      target_type: 'topic',
      target_id: 'topic-1',
    });

    const chunkParsed = parseToolResult(chunkResult);
    const topicParsed = parseToolResult(topicResult);
    expect(chunkParsed.notes).toHaveLength(1);
    expect(chunkParsed.notes[0].content).toBe('Chunk note');
    expect(topicParsed.notes).toHaveLength(1);
    expect(topicParsed.notes[0].content).toBe('Topic note');
  });

  // ── delete_note ─────────────────────────────────────────────────

  it('delete_note removes a note and returns success', async () => {
    const addResult = await addNote.handler({
      target_type: 'chunk',
      target_id: 'chunk-1',
      note_type: 'insight',
      content: 'To be deleted',
      author: 'agent',
    });
    const noteId = parseToolResult(addResult).id;

    const deleteResult = await deleteNote.handler({ note_id: noteId });
    const parsed = parseToolResult(deleteResult);
    expect(parsed.success).toBe(true);

    // Verify note is gone
    const listResult = await listNotes.handler({
      target_type: 'chunk',
      target_id: 'chunk-1',
    });
    expect(parseToolResult(listResult).notes).toHaveLength(0);
  });

  it('delete_note returns false for non-existent note', async () => {
    const result = await deleteNote.handler({ note_id: 'nonexistent-id' });
    const parsed = parseToolResult(result);
    expect(parsed.success).toBe(false);
  });

  // ── adapter: getNotesForChunkIds ──────────────────────────────

  it('getNotesForChunkIds returns notes for given chunk IDs', async () => {
    // Create notes via tool
    await addNote.handler({
      target_type: 'chunk',
      target_id: 'chunk-A',
      note_type: 'insight',
      content: 'Chunk A note',
      author: 'agent',
    });
    await addNote.handler({
      target_type: 'chunk',
      target_id: 'chunk-B',
      note_type: 'confusion',
      content: 'Chunk B note',
      author: 'user',
    });

    const repo = new DrizzleNotesRepository(getSql());
    const notes = await repo.getNotesForChunkIds(['chunk-A', 'chunk-B']);

    expect(notes).toHaveLength(2);
    expect(notes.map(n => n.content).sort()).toEqual(['Chunk A note', 'Chunk B note']);
  });

  it('getNotesForChunkIds returns empty array for empty input', async () => {
    const repo = new DrizzleNotesRepository(getSql());
    const notes = await repo.getNotesForChunkIds([]);

    expect(notes).toEqual([]);
  });
});
