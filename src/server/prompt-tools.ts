import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { promptPack } from "../prompts/prompt-pack.js";
import {
        ScaffoldingPromptInputSchema,
        ScaffoldingPromptInputShape,
        type ScaffoldingPromptInput,
        LearningPromptInputSchema,
        LearningPromptInputShape,
        type LearningPromptInput,
        RetrievalPromptInputSchema,
        RetrievalPromptInputShape,
        type RetrievalPromptInput,
        ReviewPromptInputSchema,
        ReviewPromptInputShape,
        type ReviewPromptInput,
        ChunkGenerationInputSchema,
        ChunkGenerationInputShape,
        type ChunkGenerationToolArgs,
        ChunkManagementInputSchema,
        ChunkManagementInputShape,
        type ChunkManagementToolArgs,
} from "../types/prompt-tools.js";

export function registerPromptTools(server: McpServer): void {
        server.registerTool(
                "scaffolding_prompt",
                {
                        title: "Generate Scaffolding Prompt",
                        description: "Produce scaffolding plan guidance text",
                        inputSchema: ScaffoldingPromptInputShape,
                },
                async (rawInput: unknown) => {
                        const { problem }: ScaffoldingPromptInput = ScaffoldingPromptInputSchema.parse(rawInput);
                        const text = promptPack.getPrompt("scaffolding", { problem });
                        return { content: [{ type: "text", text }] };
                }
        );

        server.registerTool(
                "learning_prompt",
                {
                        title: "Generate Learning Prompt",
                        description: "Produce chunk learning guidance text",
                        inputSchema: LearningPromptInputShape,
                },
                async (rawInput: unknown) => {
                        const parsedArgs: LearningPromptInput = LearningPromptInputSchema.parse(rawInput);
                        const text = promptPack.getPrompt("learning", parsedArgs);
                        return { content: [{ type: "text", text }] };
                }
        );

        server.registerTool(
                "retrieval_prompt",
                {
                        title: "Generate Retrieval Prompt",
                        description: "Produce retrieval practice drill text",
                        inputSchema: RetrievalPromptInputShape,
                },
                async (rawInput: unknown) => {
                        const parsedArgs: RetrievalPromptInput = RetrievalPromptInputSchema.parse(rawInput);
                        const text = promptPack.getPrompt("retrieval", parsedArgs);
                        return { content: [{ type: "text", text }] };
                }
        );

        server.registerTool(
                "review_prompt",
                {
                        title: "Generate Review Prompt",
                        description: "Produce spaced review session guidance text",
                        inputSchema: ReviewPromptInputShape,
                },
                async (rawInput: unknown) => {
                        const parsedArgs: ReviewPromptInput = ReviewPromptInputSchema.parse(rawInput);
                        const text = promptPack.getPrompt("review", parsedArgs);
                        return { content: [{ type: "text", text }] };
                }
        );

        server.registerTool(
                "workflow_guidance_prompt",
                {
                        title: "Generate Workflow Guidance Prompt",
                        description: "Produce end-to-end orchestration guidance text",
                },
                async () => {
                        const text = promptPack.getPrompt("workflow_guidance", {});
                        return { content: [{ type: "text", text }] };
                }
        );

        server.registerTool(
                "chunk_generation_prompt",
                {
                        title: "Generate Chunk Set with Instructions",
                        description:
                                "Provide comprehensive step-by-step instructions for generating scaffolded learning chunks with workflow integration",
                        inputSchema: ChunkGenerationInputShape,
                },
                async (rawInput: unknown) => {
                        const args: ChunkGenerationToolArgs = ChunkGenerationInputSchema.parse(rawInput);
                        const basePrompt = promptPack.getPrompt("chunk_generation", args);

                        const instructions = `# Chunk Generation Instructions

## Step-by-Step Guide

1. **Use your reasoning capabilities** to analyze the topic: "${args.topicTitle}"
2. **Generate 5-9 scaffolded learning chunks** following these guidelines:
   - Break down complex concepts into digestible pieces
   - Ensure logical progression from basic to advanced
   - Include prerequisite relationships between chunks
   - Estimate appropriate difficulty levels (1-10)
   - Set realistic duration estimates (5-30 minutes per chunk)

3. **Follow the structured format** shown in the prompt below
4. **Create chunks using this exact schema**:
   \`\`\`json
   {
     "id": "unique-chunk-id",
     "title": "Descriptive Chunk Title",
     "content": "Learning content description",
     "difficulty": 5,
     "prerequisites": ["prerequisite-chunk-titles"],
     "estimatedDuration": 15,
     "order": 1,
     "tags": ["relevant", "tags"],
     "chunkType": "new"
   }
   \`\`\`

5. **After generating chunks**, use the \`create_topic_with_chunks\` tool with your generated chunks

## Base Prompt for Reference:
${basePrompt}

## Workflow Integration:
${
                                args.workflowContext === "guided"
                                        ? "- This is part of a guided learning session\\n- Follow up by calling create_topic_with_chunks with your generated chunks\\n- The system will handle the rest of the workflow automatically"
                                        : "- This is an explicit chunk generation request\\n- Generate chunks according to the topic requirements\\n- Use create_topic_with_chunks tool when ready to persist the topic"
                        }

## Next Actions:
1. Generate your chunk definitions using the guidance above
2. Call \`create_topic_with_chunks\` tool with:
   - topicTitle: "${args.topicTitle}"
   - topicDescription: "${args.topicDescription || `Learn ${args.topicTitle} through structured lessons`}"
   - subject: [infer appropriate subject]
   - chunks: [your generated chunk array]

Remember: You are generating the content using your reasoning - the server only provides this guidance structure.`;

                        return { content: [{ type: "text", text: instructions }] };
                }
        );

        server.registerTool(
                "chunk_management_prompt",
                {
                        title: "Manage Chunk(s)",
                        description: "Propose updates/merges/splits/retirements with rationale",
                        inputSchema: ChunkManagementInputShape,
                },
                async (rawInput: unknown) => {
                        const args: ChunkManagementToolArgs = ChunkManagementInputSchema.parse(rawInput);
                        const text = promptPack.getPrompt("chunk_management", args);
                        return { content: [{ type: "text", text }] };
                }
        );
}
