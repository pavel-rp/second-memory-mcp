import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { promptPack } from '../shared/prompts/prompt-pack.js';
import { registerServerTools } from '../server/tools.js';
import type { AppContext } from '../composition-root.js';
import { SERVER_INSTRUCTIONS } from '../shared/instructions.js';
import { getVersion, SERVER_NAME } from '../shared/version.js';
import type {
  ChunkGenerationPromptArgs,
  ChunkManagementPromptArgs,
} from '../domain/types/prompts.js';

/**
 * Create a fully configured McpServer with all prompts and tools registered.
 * Transport-agnostic — caller is responsible for connecting to a transport.
 */
export function createMcpServer(ctx: AppContext): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: getVersion() },
    { instructions: SERVER_INSTRUCTIONS }
  );

  registerServerTools(server, ctx);

  server.registerPrompt(
    'scaffolding',
    {
      title: 'Scaffolding Plan',
      description: 'Create scaffolding plan (2–7 chunks)',
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
    'chunk_generation',
    {
      title: 'Chunk Generation',
      description: 'Propose 2–7 chunks with fields',
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
