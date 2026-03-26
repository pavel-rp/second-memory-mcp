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

  it('includes instructions in server init response', () => {
    const instructions = client.getInstructions();
    expect(instructions).toBeTypeOf('string');
    // MCP initialize response includes instructions; keep them concise to avoid bloating handshakes
    expect(instructions!.length).toBeLessThan(4700);
    expect(instructions).toContain('start_learning');
    expect(instructions).toContain('submit_answer');
  });

  it('produces independent instances per call', () => {
    const ctx = createMockAppContext();
    expect(createMcpServer(ctx)).not.toBe(createMcpServer(ctx));
  });

  it('registers exactly three prompts', async () => {
    const { prompts } = await client.listPrompts();
    const names = prompts.map(p => p.name).sort();
    expect(names).toEqual(['chunk_generation', 'chunk_management', 'scaffolding']);
  });

  it('does not register removed prompt resources', async () => {
    const { prompts } = await client.listPrompts();
    const names = prompts.map(p => p.name);
    for (const removed of [
      'learning',
      'retrieval',
      'review',
      'workflow_guidance',
      'learning_session',
    ]) {
      expect(names).not.toContain(removed);
    }
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
