import { describe, it, expect } from 'vitest';
import { SERVER_INSTRUCTIONS } from '../../../src/shared/instructions.js';

/**
 * NEU-841: clients such as Claude Code (~2 KB) and ChatGPT (~512 chars) truncate
 * the MCP `initialize` instructions payload, so the critical workflow rules —
 * the teaching loop, the submit_answer contract, and never-fabricate-scores —
 * MUST live within the first 2,048 bytes to survive that truncation. Full depth
 * stays available verbatim through get_server_workflow for non-truncating
 * clients. This test pins both halves of that contract.
 */
const TRUNCATION_BUDGET_BYTES = 2048;

/** UTF-8 byte offset at which `phrase` ends within SERVER_INSTRUCTIONS (-1 if absent). */
function endByteOffset(phrase: string): number {
  const idx = SERVER_INSTRUCTIONS.indexOf(phrase);
  if (idx < 0) return -1;
  return Buffer.byteLength(SERVER_INSTRUCTIONS.slice(0, idx + phrase.length), 'utf8');
}

describe('SERVER_INSTRUCTIONS truncation-survival contract', () => {
  // Critical rules that MUST survive a 2 KB client truncation.
  const criticalHeadPhrases: Array<{ label: string; phrase: string }> = [
    { label: 'teaching loop header', phrase: 'TEACHING FLOW' },
    { label: 'teaching loop entrypoint', phrase: 'start_learning' },
    { label: 'teaching loop submit step', phrase: 'submit_answer with prompt_text' },
    { label: 'teaching loop completion', phrase: 'complete_session' },
    { label: 'never-fabricate-scores rule', phrase: 'Never fabricate scores' },
    {
      label: 'submit_answer sole-path contract',
      phrase: 'submit_answer is the sole path for recording review data',
    },
    {
      label: 'submit_answer verbatim-response contract',
      phrase: "the learner's exact words",
    },
  ];

  for (const { label, phrase } of criticalHeadPhrases) {
    it(`keeps the ${label} within the first ${TRUNCATION_BUDGET_BYTES} bytes`, () => {
      const end = endByteOffset(phrase);
      expect(end, `"${phrase}" must be present in SERVER_INSTRUCTIONS`).toBeGreaterThan(0);
      expect(end).toBeLessThanOrEqual(TRUNCATION_BUDGET_BYTES);
    });
  }

  it('lets a 2 KB-truncated client still read every critical rule', () => {
    const truncated = Buffer.from(SERVER_INSTRUCTIONS, 'utf8')
      .subarray(0, TRUNCATION_BUDGET_BYTES)
      .toString('utf8');
    for (const { phrase } of criticalHeadPhrases) {
      expect(truncated).toContain(phrase);
    }
  });

  // Full depth must remain semantically complete for non-truncating clients
  // (get_server_workflow serves SERVER_INSTRUCTIONS verbatim). Reordering must
  // not drop any section.
  const preservedSections = [
    'TEACHING FLOW',
    'OPERATIONAL CONSTRAINTS',
    'ROLLING SESSION FLOW',
    'CONTENT CREATION',
    'ASSESSMENT FLOW',
    'WHEN TO USE ASSESSMENT MODE',
    'PROBE-FIRST SCAFFOLDING',
    'TOOL DISAMBIGUATION',
    'TEACHING CONTENT INTEGRITY',
    'QUESTION QUALITY',
  ];

  for (const section of preservedSections) {
    it(`retains the "${section}" section for non-truncating clients`, () => {
      expect(SERVER_INSTRUCTIONS).toContain(section);
    });
  }

  it('describes assessment quality as mapper-derived with no binary collapse (NEU-928)', () => {
    expect(SERVER_INSTRUCTIONS).toContain('rubric grading payload');
    expect(SERVER_INSTRUCTIONS).toContain('no binary collapse');
    // The stale pass→quality 4 / fail→quality 2 collapse must be gone.
    expect(SERVER_INSTRUCTIONS).not.toContain('quality 4, fail');
    expect(SERVER_INSTRUCTIONS).not.toContain('fail → quality 2');
  });

  it('keeps the full instructions within the MCP handshake budget', () => {
    // Raised from 6800 (NEU-847): the correct_answer presentation clause added
    // to both TEACHING FLOW and ROLLING SESSION FLOW step 4 is genuine new
    // content, not slack — this still leaves headroom for future growth.
    expect(Buffer.byteLength(SERVER_INSTRUCTIONS, 'utf8')).toBeLessThan(7000);
  });
});
