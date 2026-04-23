import { getMarkdownIt } from './markdown-it-instance.js';
import type { ChunkLintInput, LinterFinding, LinterRule } from '../chunk-linter.js';

export const CODE_FENCE_BALANCE_RULE_NAME = 'tier1a.code-fence-balance';

/**
 * Permissive allowlist of code-fence languages. Guard against obvious typos
 * (e.g. ```jsno). Not a curation policy — Tier 1b or Tier 2 handles judgment
 * on content quality.
 */
export const ALLOWED_FENCE_LANGUAGES: ReadonlySet<string> = new Set([
  'typescript',
  'ts',
  'tsx',
  'javascript',
  'js',
  'jsx',
  'python',
  'py',
  'bash',
  'sh',
  'shell',
  'zsh',
  'json',
  'yaml',
  'yml',
  'toml',
  'sql',
  'html',
  'xml',
  'css',
  'scss',
  'markdown',
  'md',
  'text',
  'txt',
  'plaintext',
  'diff',
  'patch',
  'c',
  'cpp',
  'c++',
  'csharp',
  'cs',
  'rust',
  'rs',
  'go',
  'java',
  'kotlin',
  'swift',
  'ruby',
  'rb',
  'php',
  'r',
  'scala',
  'dockerfile',
  'ini',
  'env',
  'log',
]);

function runCodeFenceBalance(chunk: ChunkLintInput): LinterFinding[] {
  const content = chunk.content;
  if (!content) return [];

  const findings: LinterFinding[] = [];

  // Raw-source scan for unbalanced triple-backtick or tilde fences.
  // `markdown-it` silently absorbs a trailing unclosed fence by extending
  // the block to EOF — so an odd count of fence-delimiter lines is a
  // reliable signal of imbalance that the token stream alone cannot
  // detect. The regex also tolerates any number of blockquote `>`
  // prefixes so fences nested in blockquotes still count.
  const fenceLineMatches = content.match(/^[ \t]{0,3}(?:>[ \t]*)*(?:```+|~~~+)/gm) ?? [];
  if (fenceLineMatches.length % 2 !== 0) {
    findings.push({
      chunkId: chunk.chunkId,
      rule: CODE_FENCE_BALANCE_RULE_NAME,
      severity: 'blocking',
      category: 'structural',
      detail: 'Unbalanced code fence: odd number of ``` delimiters',
    });
    return findings;
  }

  const tokens = getMarkdownIt().parse(content, {});
  for (const token of tokens) {
    if (token.type !== 'fence') continue;
    const info = (token.info ?? '').trim();
    if (info === '') continue; // Unlabeled fences pass per the permissive policy.
    const lang = info.split(/\s+/)[0].toLowerCase();
    if (!ALLOWED_FENCE_LANGUAGES.has(lang)) {
      findings.push({
        chunkId: chunk.chunkId,
        rule: CODE_FENCE_BALANCE_RULE_NAME,
        severity: 'blocking',
        category: 'structural',
        detail: `Unknown code fence language: "${lang}"`,
      });
    }
  }

  return findings;
}

export const codeFenceBalanceRule = {
  name: CODE_FENCE_BALANCE_RULE_NAME,
  scope: 'chunk',
  tier: 'tier1a',
  run: runCodeFenceBalance,
} satisfies LinterRule;
