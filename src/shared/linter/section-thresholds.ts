/**
 * Numeric thresholds and string allowlists for Tier 1b heuristic rules
 * (NEU-617). Imported by individual rule modules under
 * `src/domain/services/linter-rules/`. Tests import these constants by name to
 * avoid magic numbers.
 *
 * Each constant is fixture-derived from the §Q7 retro audit and the
 * `rsa-foundations` chunk shape — they encode "the patterns we observed
 * correlate with bad chunks", not first-principles content rules. Per
 * `rule-intent.ts`, every Tier 1b rule that consumes these ships
 * `blockingEligible: false`. Promotion to blocking is gated on the OOD harness
 * (NEU-627).
 */

/** Phantom-chapter rule (NEU-617): minimum H2 heading count to flag. */
export const PHANTOM_CHAPTER_H2_MIN = 3;

/** Phantom-chapter rule (NEU-617): minimum H3 heading count to flag. */
export const PHANTOM_CHAPTER_H3_MIN = 3;

/** Phantom-chapter rule (NEU-617): minimum bold (`<strong>`) inline-token count to flag. */
export const PHANTOM_CHAPTER_BOLD_MIN = 6;

/**
 * Bullet-dominant rule (NEU-617): exclusive ratio of bullet-paragraphs to
 * total paragraphs above which a chunk is flagged. Strict greater-than (`>`).
 */
export const BULLET_DOMINANCE_RATIO = 0.7;

/**
 * Bullet-dominant rule (NEU-617): minimum total paragraph count required
 * before the ratio is evaluated. Suppresses spurious findings on trivial
 * chunks where a single bullet would dominate by accident.
 */
export const BULLET_DOMINANCE_PARAGRAPH_FLOOR = 3;

/**
 * Word-count-floor rule (NEU-617): chunks whose content has fewer than this
 * many words are flagged, except when `knowledgeType === 'fact'` (carve-out
 * derived from the §Q7 audit; facts are legitimately terse).
 */
export const WORD_COUNT_FLOOR = 300;

/**
 * Word-count-ceiling rule (NEU-617): chunks whose content exceeds this many
 * words are flagged. No knowledge-type carve-out — long-form content of any
 * type warrants a closer look.
 */
export const WORD_COUNT_CEILING = 1500;

/**
 * Scaffolding-section rule (NEU-617): top-level (`##`) headings whose exact
 * text matches one of these strings are flagged. Derived from 38 known E5
 * chunks that conflate scaffolding scaffold-into-chunk presentation. Match is
 * case-sensitive — `## practice problems` does NOT fire.
 */
export const SCAFFOLDING_SECTION_HEADINGS: readonly string[] = [
  'Practice Problems',
  'Exercises',
  'Summary',
];
