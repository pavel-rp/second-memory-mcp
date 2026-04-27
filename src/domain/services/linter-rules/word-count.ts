/**
 * Shared word-counting helper for the Tier 1b word-count rules (NEU-617).
 * Whitespace-split on raw content — no markdown stripping. Code-fence content
 * and HTML count toward the total because these heuristics flag chunk shape,
 * not prose volume specifically.
 */
export function countWords(content: string): number {
  const trimmed = content.trim();
  if (trimmed === '') return 0;
  return trimmed.split(/\s+/).filter(token => token.length > 0).length;
}
