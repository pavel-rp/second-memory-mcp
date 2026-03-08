import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createMcpServer } from '../../../src/transport/create-server.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';

describe('createMcpServer', () => {
  let client: Client;
  let clientTransport: InMemoryTransport;
  let serverTransport: InMemoryTransport;

  beforeAll(async () => {
    const server = createMcpServer(createMockAppContext());
    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);

    client = new Client({ name: 'test-client', version: '1.0.0' });
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await clientTransport.close();
    await serverTransport.close();
  });

  it('returns an McpServer with connect method', () => {
    const server = createMcpServer(createMockAppContext());
    expect(server.connect).toBeTypeOf('function');
  });

  it('produces independent instances per call', () => {
    const ctx = createMockAppContext();
    expect(createMcpServer(ctx)).not.toBe(createMcpServer(ctx));
  });

  it('registers all eight prompts', async () => {
    const { prompts } = await client.listPrompts();
    const names = prompts.map(p => p.name).sort();
    expect(names).toEqual([
      'chunk_generation',
      'chunk_management',
      'learning',
      'learning_session',
      'retrieval',
      'review',
      'scaffolding',
      'workflow_guidance',
    ]);
  });

  it('registers server tools (spot-check)', async () => {
    const { tools } = await client.listTools();
    const names = tools.map(t => t.name);
    expect(names).toContain('calculate_next_review');
    expect(names).toContain('search_learning_content');
  });

  it('scaffolding prompt returns messages', async () => {
    const result = await client.getPrompt({ name: 'scaffolding', arguments: { problem: 'test' } });
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe('user');
  });

  it('learning prompt converts string numbers', async () => {
    const result = await client.getPrompt({
      name: 'learning',
      arguments: { chunkNumber: '2', totalChunks: '5' },
    });
    expect(result.messages).toHaveLength(1);
  });

  it('retrieval prompt passes masteryLevel', async () => {
    const result = await client.getPrompt({
      name: 'retrieval',
      arguments: { masteryLevel: '3' },
    });
    expect(result.messages).toHaveLength(1);
  });

  it('review prompt converts numeric args', async () => {
    const result = await client.getPrompt({
      name: 'review',
      arguments: { masteryLevel: '4', previousAttempts: '2' },
    });
    expect(result.messages).toHaveLength(1);
  });

  it('workflow_guidance prompt needs no args', async () => {
    const result = await client.getPrompt({ name: 'workflow_guidance' });
    expect(result.messages).toHaveLength(1);
  });

  it('chunk_generation prompt handles comma-separated titles', async () => {
    const result = await client.getPrompt({
      name: 'chunk_generation',
      arguments: { topicTitle: 'Algebra', existingChunkTitles: 'A, B, C' },
    });
    expect(result.messages).toHaveLength(1);
  });

  it('chunk_management prompt filters valid operations', async () => {
    const result = await client.getPrompt({
      name: 'chunk_management',
      arguments: { operation: 'update', managedChunkTitle: 'Test' },
    });
    expect(result.messages).toHaveLength(1);
  });

  it('chunk_management prompt handles invalid operation', async () => {
    const result = await client.getPrompt({
      name: 'chunk_management',
      arguments: { operation: 'invalid' },
    });
    expect(result.messages).toHaveLength(1);
  });

  it('learning_session prompt returns messages with args', async () => {
    const result = await client.getPrompt({
      name: 'learning_session',
      arguments: { sessionMode: 'start', timeAvailable: '30', subject: 'Math' },
    });
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe('user');
    const text = (result.messages[0].content as { type: string; text: string }).text;
    expect(text).toContain('30');
    expect(text).toContain('Math');
  });

  it('learning_session prompt works without optional args', async () => {
    const result = await client.getPrompt({ name: 'learning_session', arguments: {} });
    expect(result.messages).toHaveLength(1);
  });

  // ── Branch coverage: optional-arg falsy paths ──────────────────

  it('learning prompt without optional numeric args', async () => {
    const result = await client.getPrompt({
      name: 'learning',
      arguments: { chunkTitle: 'Intro' },
    });
    expect(result.messages).toHaveLength(1);
  });

  it('retrieval prompt without masteryLevel', async () => {
    const result = await client.getPrompt({
      name: 'retrieval',
      arguments: { chunkTitle: 'Intro' },
    });
    expect(result.messages).toHaveLength(1);
  });

  it('review prompt without numeric args', async () => {
    const result = await client.getPrompt({
      name: 'review',
      arguments: { lastReviewed: '2025-01-01' },
    });
    expect(result.messages).toHaveLength(1);
  });

  it('chunk_generation prompt without existingChunkTitles', async () => {
    const result = await client.getPrompt({
      name: 'chunk_generation',
      arguments: { topicTitle: 'Algebra' },
    });
    expect(result.messages).toHaveLength(1);
  });

  it('chunk_management prompt with managedChunkOrder', async () => {
    const result = await client.getPrompt({
      name: 'chunk_management',
      arguments: { operation: 'update', managedChunkTitle: 'Test', managedChunkOrder: '3' },
    });
    expect(result.messages).toHaveLength(1);
  });
});
