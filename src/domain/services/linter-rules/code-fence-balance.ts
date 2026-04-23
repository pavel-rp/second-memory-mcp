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
  'vue',
  'svelte',
  'graphql',
  'gql',
  'terraform',
  'tf',
  'hcl',
  'nix',
  'lua',
  'perl',
  'pl',
  'elixir',
  'ex',
  'exs',
  'erlang',
  'erl',
  'haskell',
  'hs',
  'clojure',
  'clj',
  'fsharp',
  'fs',
  'objective-c',
  'objc',
  'matlab',
  'groovy',
  'gradle',
  'makefile',
  'make',
  'cmake',
  'nginx',
  'apache',
  'powershell',
  'ps1',
  'bat',
  'cmd',
  'vim',
  'vimscript',
]);

/**
 * Matches a fence-delimiter line. Captures:
 *   [1] — the full fence run (e.g. "```", "~~~~"), used for length.
 *   [2] — the marker character (backtick or tilde), used for open/close pairing.
 *   [3] — any trailing content after the fence run (info string on openers;
 *         must be empty/whitespace for a valid CommonMark close).
 *
 * Allows up to 3 leading spaces and any number of blockquote `>` prefixes so
 * fences nested in blockquotes still match.
 */
const FENCE_LINE_RE = /^[ \t]{0,3}(?:>[ \t]*)*(([`~])\2{2,})(.*)$/;

type OpenFence = { marker: '`' | '~'; length: number };

/**
 * Stack-based fence balance check. Per CommonMark, a closing fence must:
 *   1. Use the same marker character as the opening fence.
 *   2. Be at least as long as the opening fence.
 *   3. Have no info string (nothing but whitespace after the fence run).
 *
 * A line that fails any of these is **not** a valid close — it's either a
 * nested/mismatched fence marker or literal content inside the open fence.
 * The opener stays open. Returns the unclosed opener or `null` if balanced.
 */
function findUnclosedFence(content: string): OpenFence | null {
  let openFence: OpenFence | null = null;
  for (const line of content.split(/\r?\n/)) {
    const match = FENCE_LINE_RE.exec(line);
    if (match === null) continue;
    const marker: '`' | '~' = match[2] === '`' ? '`' : '~';
    const length = match[1].length;
    const trailing = match[3].trim();

    if (openFence === null) {
      // First fence-like line opens — trailing text becomes the info string.
      openFence = { marker, length };
      continue;
    }
    // Inside an open fence: only a clean close terminates it.
    const canClose = trailing === '' && marker === openFence.marker && length >= openFence.length;
    if (canClose) {
      openFence = null;
    }
    // Otherwise: literal content inside the fence (per CommonMark, closers
    // cannot carry info text). Do nothing; stay open.
  }
  return openFence;
}

function runCodeFenceBalance(chunk: ChunkLintInput): LinterFinding[] {
  const content = chunk.content;
  if (!content) return [];

  const findings: LinterFinding[] = [];

  const unclosed = findUnclosedFence(content);
  if (unclosed !== null) {
    const markerLabel = unclosed.marker === '`' ? '```' : '~~~';
    findings.push({
      chunkId: chunk.chunkId,
      rule: CODE_FENCE_BALANCE_RULE_NAME,
      severity: 'blocking',
      category: 'structural',
      detail: `Unbalanced code fence: opening ${markerLabel} fence (length ${unclosed.length}) has no matching closing delimiter`,
    });
    return findings;
  }

  const tokens = getMarkdownIt().parse(content, {});
  for (const token of tokens) {
    if (token.type !== 'fence') continue;
    const info = token.info.trim();
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
