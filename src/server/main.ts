import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { promptPack } from '../prompts/prompt-pack.js';
import { registerServerTools } from './tools.js';
import { ensureSchema } from '../db/migrate.js';
import { logger } from '../utils/logger.js';

type ChunkGenerationPromptArgs = {
  topicTitle: string;
  topicDescription?: string;
  existingChunkTitles?: string | string[];
};

type ChunkManagementPromptArgs = {
  operation?: string;
  managedChunkTitle?: string;
  managedChunkOrder?: string;
  managedChunkContent?: string;
  managedChunkPrerequisites?: string;
  intent?: string;
};

async function bootstrap(): Promise<void> {
  ensureSchema();

  const server = new McpServer({
    name: 'second-memory-learning',
    version: '0.1.0',
  });

  const transport = new StdioServerTransport();
  // Register tools and tool-backed prompts
  registerServerTools(server);

  // Prompts
  server.registerPrompt(
    'scaffolding',
    {
      title: 'Scaffolding Plan',
      description: 'Create scaffolding plan (5–9 chunks)',
      argsSchema: { problem: z.string().describe('Learning problem statement') },
    },
    ({ problem }: { problem: string }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: promptPack.getPrompt('scaffolding', { problem }),
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'learning',
    {
      title: 'Learning Guidance',
      description: 'Active learning guidance for a chunk',
      argsSchema: {
        chunkNumber: z.string().optional(),
        totalChunks: z.string().optional(),
        chunkTitle: z.string().optional(),
        chunkContent: z.string().optional(),
        prerequisites: z.string().optional(),
        drillFormat: z.string().optional(),
      },
    },
    (args: Record<string, string | undefined>) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: promptPack.getPrompt('learning', {
              ...args,
              chunkNumber: args?.chunkNumber ? Number(args.chunkNumber) : undefined,
              totalChunks: args?.totalChunks ? Number(args.totalChunks) : undefined,
            }),
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'retrieval',
    {
      title: 'Retrieval Drill',
      description: 'Generate retrieval drill (two-attempt policy)',
      argsSchema: {
        chunkTitle: z.string().optional(),
        drillFormat: z.string().optional(),
        masteryLevel: z.string().optional(),
      },
    },
    (args: Record<string, string | undefined>) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: promptPack.getPrompt('retrieval', {
              ...args,
              masteryLevel: args?.masteryLevel ? Number(args.masteryLevel) : undefined,
            }),
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'review',
    {
      title: 'Spaced Review',
      description: 'Spaced review session guidance',
      argsSchema: {
        lastReviewed: z.string().optional(),
        masteryLevel: z.string().optional(),
        previousAttempts: z.string().optional(),
        weakAreas: z.string().optional(),
      },
    },
    (args: Record<string, string | undefined>) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: promptPack.getPrompt('review', {
              ...args,
              masteryLevel: args?.masteryLevel ? Number(args.masteryLevel) : undefined,
              previousAttempts: args?.previousAttempts ? Number(args.previousAttempts) : undefined,
            }),
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'workflow_guidance',
    {
      title: 'Workflow Guidance',
      description: 'End-to-end orchestration guidance',
    },
    () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: promptPack.getPrompt('workflow_guidance', {}),
          },
        },
      ],
    })
  );

  // New: chunk prompts
  server.registerPrompt(
    'chunk_generation',
    {
      title: 'Chunk Generation',
      description: 'Propose 5–9 chunks with fields',
      argsSchema: {
        topicTitle: z.string().describe('Topic title'),
        topicDescription: z.string().optional(),
        existingChunkTitles: z.string().optional(), // comma-separated titles
      },
    },
    (args: ChunkGenerationPromptArgs) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: promptPack.getPrompt('chunk_generation', {
              topicTitle: args?.topicTitle,
              topicDescription: args?.topicDescription,
              existingChunkTitles: Array.isArray(args?.existingChunkTitles)
                ? args.existingChunkTitles
                : args?.existingChunkTitles
                  ? String(args.existingChunkTitles)
                      .split(',')
                      .map((s: string) => s.trim())
                      .filter(Boolean)
                  : undefined,
            }),
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'chunk_management',
    {
      title: 'Chunk Management',
      description: 'Update/Merge/Split/Retire with rationale',
      argsSchema: {
        operation: z.string().optional(),
        managedChunkTitle: z.string().optional(),
        managedChunkOrder: z.string().optional(),
        managedChunkContent: z.string().optional(),
        managedChunkPrerequisites: z.string().optional(),
        intent: z.string().optional(),
      },
    },
    (args: ChunkManagementPromptArgs) => {
      const op = args?.operation;
      const operation =
        op === 'update' || op === 'merge' || op === 'split' || op === 'retire' ? op : undefined;
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: promptPack.getPrompt('chunk_management', {
                operation,
                managedChunk: {
                  title: args?.managedChunkTitle ?? '<untitled>',
                  order: args?.managedChunkOrder ? Number(args.managedChunkOrder) : undefined,
                  content: args?.managedChunkContent,
                  prerequisites: args?.managedChunkPrerequisites,
                },
                intent: args?.intent,
              }),
            },
          },
        ],
      };
    }
  );

  await server.connect(transport);
}

bootstrap().catch(error => {
  logger.error('Failed to start MCP server:', error);
  process.exit(1);
});
