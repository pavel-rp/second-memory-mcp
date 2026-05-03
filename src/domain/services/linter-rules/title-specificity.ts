import nlp from 'compromise';
import { TITLE_MIN_WORD_COUNT } from '../../../shared/linter/section-thresholds.js';
import type { LinterFinding, LinterRule, TopicLintInput } from '../chunk-linter.js';

export const TITLE_SPECIFICITY_RULE_NAME = 'tier1b.title-specificity';

const COORDINATOR_WORD = /\b(?:and|vs|or)\b/i;
const COORDINATOR_SLASH = /\s\/\s/;
const COORDINATOR_COMMA = /,\s/;
const HAS_COLON = /:/;
const HAS_DIGIT = /\d/;
const HAS_MATH_SYMBOL = /[+\-*=<>≤≥∑∫∀∃∈∉∪∩×÷±∞≈≠∝∂∇λΣΠ]/;

function hasVerb(title: string): boolean {
  const doc = nlp(title);
  return doc.verbs().length > 0;
}

function hasSpecificitySignal(title: string): boolean {
  if (HAS_COLON.test(title)) return true;
  if (HAS_DIGIT.test(title)) return true;
  if (HAS_MATH_SYMBOL.test(title)) return true;
  if (hasVerb(title)) return true;
  return false;
}

function findCoordinator(title: string): string | null {
  const wordMatch = COORDINATOR_WORD.exec(title);
  if (wordMatch) return wordMatch[0].toLowerCase();
  if (COORDINATOR_SLASH.test(title)) return '/';
  if (COORDINATOR_COMMA.test(title)) return ',';
  return null;
}

function checkTitle(title: string, chunkId: string): LinterFinding[] {
  const findings: LinterFinding[] = [];
  const trimmed = title.trim();
  if (!trimmed) return findings;

  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount < TITLE_MIN_WORD_COUNT && !hasSpecificitySignal(trimmed)) {
    findings.push({
      chunkId,
      rule: TITLE_SPECIFICITY_RULE_NAME,
      severity: 'warning',
      category: 'title_specificity',
      detail: `Title "${trimmed}" has ${wordCount} word(s) and no specificity signal`,
      suggestion: 'Use a more specific title — include a colon, verb, or subject qualifier',
    });
  }

  const coordinator = findCoordinator(trimmed);
  if (coordinator) {
    findings.push({
      chunkId,
      rule: TITLE_SPECIFICITY_RULE_NAME,
      severity: 'warning',
      category: 'title_specificity',
      detail: `Title "${trimmed}" contains coordinator "${coordinator}"`,
      suggestion: `Title contains "${coordinator}" — consider splitting into separate topics`,
    });
  }

  return findings;
}

function runTitleSpecificity(input: TopicLintInput): LinterFinding[] {
  const findings: LinterFinding[] = [];

  for (const f of checkTitle(input.topicTitle, '')) findings.push(f);

  for (const chunk of input.chunks) {
    for (const f of checkTitle(chunk.title, chunk.chunkId)) findings.push(f);
  }

  return findings;
}

export const titleSpecificityRule = {
  name: TITLE_SPECIFICITY_RULE_NAME,
  scope: 'topic',
  tier: 'tier1b',
  blockingEligible: false,
  run: runTitleSpecificity,
} satisfies LinterRule;
