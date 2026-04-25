import nlp from 'compromise';
import type { ChunkLintInput, LinterFinding, LinterRule } from '../chunk-linter.js';

export const PHANTOM_PREREQUISITE_RULE_NAME = 'tier1b.phantom-prerequisite';

const TRAILING_PUNCT = /[.,;:!?]+$/u;
const LEADING_ARTICLE_LOWER = /^(?:a|an|the)\s+/u;
const LEADING_ARTICLE_ANYCASE = /^(?:[Aa]n?|[Tt]he)\s+/u;
const PURE_NUMERIC = /^[\d.,\s]+$/u;
const MIN_SURFACE_LENGTH = 3;

type Phrase = { surface: string; normal: string };

function stripDeterminerLower(text: string): string {
  return text.replace(TRAILING_PUNCT, '').replace(LEADING_ARTICLE_LOWER, '').trim();
}

function stripDeterminerSurface(text: string): string {
  return text.replace(TRAILING_PUNCT, '').replace(LEADING_ARTICLE_ANYCASE, '').trim();
}

function extractNounPhrases(text: string): Phrase[] {
  const phrases: Phrase[] = [];
  const json = nlp(text).nouns().toSingular().json({ normal: true, text: true }) as Array<{
    text?: string;
    normal?: string;
  }>;
  for (const entry of json) {
    const surface = stripDeterminerSurface((entry.text ?? '').toString());
    const normal = stripDeterminerLower((entry.normal ?? '').toString());
    if (!surface || !normal) continue;
    phrases.push({ surface, normal });
  }
  return phrases;
}

function buildPrerequisiteSet(prerequisites: readonly string[]): Set<string> {
  const set = new Set<string>();
  for (const prereq of prerequisites) {
    if (!prereq) continue;
    const phrases = extractNounPhrases(prereq);
    if (phrases.length === 0) {
      // Compromise rejected the input (e.g. all stopwords). Best-effort
      // fallback: store the lowercased, trimmed, de-articled prereq verbatim.
      // No singularization is applied here, so a fallback prereq like
      // `"foos"` will not match a content phrase compromise singularizes to
      // `"foo"`. Acceptable trade-off — this branch only fires when compromise
      // disagrees with the user's classification, which is rare for normal
      // technical prereqs. Authors that hit a divergence can submit the
      // singular form.
      const fallback = stripDeterminerLower(prereq.toLowerCase());
      if (fallback) set.add(fallback);
      continue;
    }
    for (const { normal } of phrases) set.add(normal);
  }
  return set;
}

function runPhantomPrerequisite(chunk: ChunkLintInput): LinterFinding[] {
  if (!chunk.content) return [];
  // No internal try/catch: the framework's `runLinterSuite` wraps every rule
  // in `safeRun` and fans exceptions through the `onRuleError` callback. A
  // local try/catch here would silently bypass that diagnostic plumbing.
  const prereqSet = buildPrerequisiteSet(chunk.prerequisites);
  const findings: LinterFinding[] = [];
  const seen = new Set<string>();
  for (const { surface, normal } of extractNounPhrases(chunk.content)) {
    if (surface.length < MIN_SURFACE_LENGTH) continue;
    if (PURE_NUMERIC.test(normal)) continue;
    if (seen.has(normal)) continue;
    seen.add(normal);
    if (prereqSet.has(normal)) continue;
    findings.push({
      chunkId: chunk.chunkId,
      rule: PHANTOM_PREREQUISITE_RULE_NAME,
      severity: 'warning',
      category: 'phantom_prerequisite',
      detail: `Term "${surface}" used without a declared prerequisite`,
    });
  }
  return findings;
}

export const phantomPrerequisiteRule = {
  name: PHANTOM_PREREQUISITE_RULE_NAME,
  scope: 'chunk',
  tier: 'tier1b',
  blockingEligible: false,
  run: runPhantomPrerequisite,
} satisfies LinterRule;
