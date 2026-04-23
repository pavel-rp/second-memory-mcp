/**
 * Shared `markdown-it` parser instance used by every Tier 1a structural rule
 * (NEU-628). One configured instance is constructed at module load and
 * re-used across all calls — `markdown-it` is stateless between `parse()`
 * calls, so sharing is safe.
 *
 * Configuration: CommonMark preset with the GFM-style table rule enabled,
 * HTML enabled so `<details>` tokens surface on inspection. No plugins.
 *
 * ## Purity (ARCH-F4/F5)
 *
 * `markdown-it` performs pure token transformation. It does not read env,
 * open files, touch the clock, or make network calls. Importing it here is
 * safe under the domain-layer purity lint rules (no `process`, no
 * `new Date()`, no `throw`).
 */

import MarkdownIt from 'markdown-it';

const md = new MarkdownIt('commonmark', { html: true });
// CommonMark preset disables GFM tables; re-enable for Tier 1a table-structure
// validation (NEU-628 explicitly targets GFM-style semantics).
md.enable('table');

export function getMarkdownIt(): MarkdownIt {
  return md;
}
