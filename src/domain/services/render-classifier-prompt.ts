// Domain-pure helper that renders the classifier user-prompt string.
//
// Lives in `domain/services` so both the LangChain adapter (which sends it to
// the model) and the orchestration layer (which logs it for auditability via
// `classifier.chunk_verdict`) can call the same function without one importing
// the other.

import type { ChunkClassifierInput } from '../types/classifier.js';

export function renderClassifierUserPayload(
  input: ChunkClassifierInput,
  userPrompt: string
): string {
  const tags = input.tags.length > 0 ? input.tags.join(', ') : '(none)';
  const prerequisites = input.prerequisites.length > 0 ? input.prerequisites.join(', ') : '(none)';
  return [
    userPrompt,
    '',
    '--- CHUNK ---',
    `id: ${input.chunkId}`,
    `title: ${input.title}`,
    `chunkType: ${input.chunkType}`,
    `tags: ${tags}`,
    `prerequisites: ${prerequisites}`,
    '',
    'content:',
    input.content,
  ].join('\n');
}
