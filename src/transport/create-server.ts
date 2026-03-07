import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { promptPack } from '../shared/prompts/prompt-pack.js';
import { registerServerTools } from '../server/tools.js';
import type { AppContext } from '../composition-root.js';
import type {
  LearningPromptArgs,
  RetrievalPromptArgs,
  ReviewPromptArgs,
  ChunkGenerationPromptArgs,
  ChunkManagementPromptArgs,
} from '../domain/types/prompts.js';

/**
 * Create a fully configured McpServer with all prompts and tools registered.
 * Transport-agnostic — caller is responsible for connecting to a transport.
 */
export function createMcpServer(ctx: AppContext): McpServer {
  const server = new McpServer({
    name: 'second-memory-learning',
    version: '0.1.0',
  });

  registerServerTools(server, ctx);

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
        drillFormat: z
          .enum(['multiple_choice', 'open_ended', 'coding_problem', 'explanation', 'application'])
          .optional(),
      },
    },
    (args: LearningPromptArgs) => ({
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
        drillFormat: z
          .enum(['multiple_choice', 'open_ended', 'coding_problem', 'explanation', 'application'])
          .optional(),
        masteryLevel: z.string().optional(),
      },
    },
    (args: RetrievalPromptArgs) => ({
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
    (args: ReviewPromptArgs) => ({
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

  server.registerPrompt(
    'chunk_generation',
    {
      title: 'Chunk Generation',
      description: 'Propose 5–9 chunks with fields',
      argsSchema: {
        topicTitle: z.string().describe('Topic title'),
        topicDescription: z.string().optional(),
        existingChunkTitles: z.union([z.string(), z.array(z.string())]).optional(),
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

  return server;
}
