/**
 * Static domain rules returned by init_agent_context.
 * These encode the ubiquitous language and constraints that agents must follow
 * when creating and managing learning content.
 */
export const DOMAIN_RULES = {
  chunk_definition:
    'Atomic learning unit targeting ONE knowledge component \u2014 a single fact, concept, rule, or procedure step. Follows the minimum information principle: if the content covers two ideas that could be tested separately, split into two chunks. Should not require the learner to process more than 2\u20133 novel interacting concepts simultaneously.',
  topic_scoping:
    "Group by STRUCTURAL DEPENDENCY \u2014 'does understanding X require understanding Y?' \u2014 NOT by topical similarity. Two chunks about the same subject that can be learned independently belong in SEPARATE topics.",
  content_requirements:
    'The content field is a full teaching script (300\u20131500 words), not a summary. The system uses it for teaching, reteaching, and graduated scaffolding. The condensed_summary field (2\u20134 sentences) is for quick refreshers only.',
  anti_patterns: [
    "Do NOT create broad topics like 'Fenwick Trees' or 'Dynamic Programming' containing all related concepts. Decompose by dependency chain.",
    'Do NOT write stub content \u2014 the system uses the content field for reteaching at multiple depths.',
    'Do NOT group chunks by topical similarity alone. The question is structural dependency, not shared subject.',
  ],
  sizing: {
    chunks_per_topic: '2\u20137',
    novel_elements_per_chunk: '\u22642\u20133 interacting concepts',
    content_length: '300\u20131500 words per chunk',
  },
} as const;
