import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { promptPack } from "../prompts/prompt-pack.js";
import { registerServerTools } from "./tools.js";
import { registerServerResources } from "./resources.js";

async function bootstrap(): Promise<void> {
  const server = new McpServer({
    name: "second-memory-learning",
    version: "0.1.0"
  });

  const transport = new StdioServerTransport();
  // Register tools, tool-backed prompts, and resources
  registerServerTools(server);
  registerServerResources(server);

  // Prompts
  server.registerPrompt(
    "scaffolding",
    {
      title: "Scaffolding Plan",
      description: "Create scaffolding plan (5–9 chunks)",
      argsSchema: { problem: z.string().describe("Learning problem statement") }
    },
    ({ problem }: any) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: promptPack.getPrompt("scaffolding", { problem })
          }
        }
      ]
    })
  );

  server.registerPrompt(
    "learning",
    {
      title: "Learning Guidance",
      description: "Active learning guidance for a chunk",
      argsSchema: {
        chunkNumber: z.string().optional(),
        totalChunks: z.string().optional(),
        chunkTitle: z.string().optional(),
        chunkContent: z.string().optional(),
        prerequisites: z.string().optional(),
        drillFormat: z.string().optional()
      }
    },
    (args: any) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: promptPack.getPrompt("learning", {
              ...args,
              chunkNumber: args?.chunkNumber ? Number(args.chunkNumber) : undefined,
              totalChunks: args?.totalChunks ? Number(args.totalChunks) : undefined
            })
          }
        }
      ]
    })
  );

  server.registerPrompt(
    "retrieval",
    {
      title: "Retrieval Drill",
      description: "Generate retrieval drill (two-attempt policy)",
      argsSchema: {
        chunkTitle: z.string().optional(),
        drillFormat: z.string().optional(),
        masteryLevel: z.string().optional()
      }
    },
    (args: any) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: promptPack.getPrompt("retrieval", {
              ...args,
              masteryLevel: args?.masteryLevel ? Number(args.masteryLevel) : undefined
            })
          }
        }
      ]
    })
  );

  server.registerPrompt(
    "review",
    {
      title: "Spaced Review",
      description: "Spaced review session guidance",
      argsSchema: {
        lastReviewed: z.string().optional(),
        masteryLevel: z.string().optional(),
        previousAttempts: z.string().optional(),
        weakAreas: z.string().optional()
      }
    },
    (args: any) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: promptPack.getPrompt("review", {
              ...args,
              masteryLevel: args?.masteryLevel ? Number(args.masteryLevel) : undefined,
              previousAttempts: args?.previousAttempts ? Number(args.previousAttempts) : undefined
            })
          }
        }
      ]
    })
  );

  server.registerPrompt(
    "workflow_guidance",
    {
      title: "Workflow Guidance",
      description: "End-to-end orchestration guidance"
    },
    () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: promptPack.getPrompt("workflow_guidance", {})
          }
        }
      ]
    })
  );

  await server.connect(transport);
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});


