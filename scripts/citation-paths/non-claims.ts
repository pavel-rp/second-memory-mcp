/**
 * By-design non-claims: citation tokens that are deliberately non-resolving and
 * MUST NOT be repaired.
 *
 * `docs/research/C010-system-and-repository-architecture/16_mechanical-audits.md`
 * §5.4 itemises eleven by-design non-claims and its closing paragraph adds a
 * twelfth class: passages that quote a defective or non-existent path IN ORDER
 * TO REPORT IT as defective. Repairing one of those destroys the audit's own
 * evidence — per `DR-C10-S12-2` Rationale (ii), "a repaired citation is
 * byte-identical to one that was never broken".
 *
 * KEYING. Entries are keyed by (package, file, target) with an expected
 * occurrence `count`. The original NEU-989 audit keyed by line number, which is
 * correct for a one-shot sweep but wrong for a CI gate: any edit above the cited
 * line shifts it and the staleness guard fails the build on an unrelated docs
 * change. The count preserves what the line number was really protecting — the
 * list cannot silently grow into a blanket amnesty, because an extra occurrence
 * of an exempted (file, target) pair is still reported.
 */

export interface NonClaim {
  /** Package directory name under `docs/research/`. */
  pkg: string;
  /** Basename of the citing file. */
  file: string;
  /** The exact citation target, as written. */
  target: string;
  /** How many times this exact pair is expected to appear. */
  count: number;
  why: string;
}

const C010 = 'C010-system-and-repository-architecture';

export const NON_CLAIMS: readonly NonClaim[] = [
  // `16_mechanical-audits.md` §5.2 / §5.4. The chapter itself declares
  // "7 such quotations in `16_...md`"; they collapse to four (file, target)
  // pairs because three of them are quoted twice.
  {
    pkg: C010,
    file: '16_mechanical-audits.md',
    target: '01_evidence-taxonomy.md',
    count: 2,
    why: '§5.2 and §5.4 quote the bare upstream form F-S11-2 reports as defective',
  },
  {
    pkg: C010,
    file: '16_mechanical-audits.md',
    target: '09_enforceable-quality-system.md',
    count: 2,
    why: '§5.2 and §5.4 quote the bare upstream form F-S11-2 reports as defective',
  },
  {
    pkg: C010,
    file: '16_mechanical-audits.md',
    target: '../04_state-category-inventory.md',
    count: 2,
    why: '§5.2 and §5.4 quote the spurious-../ C1 form as the example of the defect',
  },
  {
    pkg: C010,
    file: '16_mechanical-audits.md',
    target: 'S11_outcome-coverage-audit.md',
    count: 1,
    why: '§5.4 row: illustrative naming example from traceability/README.md',
  },

  // `02_findings-register.md` `### SUB-11`. The section that RAISES F-S11-1 and
  // F-S11-2 necessarily quotes the defective forms and lists citing filenames
  // as audit data.
  {
    pkg: C010,
    file: '02_findings-register.md',
    target: 'DR-C10-S2-1_no-learner-facing-execution-environment.md',
    count: 1,
    why: 'F-S11-1 evidence: a citing filename listed as audit data, not a citation',
  },
  {
    pkg: C010,
    file: '02_findings-register.md',
    target: 'DR-C10-S2-3_out-of-band-citation-drift-component.md',
    count: 1,
    why: 'F-S11-1 evidence: a citing filename listed as audit data, not a citation',
  },
  {
    pkg: C010,
    file: '02_findings-register.md',
    target: '../04_state-category-inventory.md',
    count: 1,
    why: 'F-S11-1 consequence quotes the C1 form as the example of the defect',
  },
  {
    pkg: C010,
    file: '02_findings-register.md',
    target: '01_evidence-taxonomy.md',
    count: 1,
    why: 'F-S11-2 finding quotes the bare form it is reporting',
  },
  {
    pkg: C010,
    file: '02_findings-register.md',
    target: '09_enforceable-quality-system.md',
    count: 2,
    why: 'F-S11-2 finding and consequence quote the bare form being reported',
  },

  // `DR-C10-S12-2`: the convention statement itself. `01_outcome-register.md` is
  // quoted as the CORRECT package-root form; the folder tokens are prose nouns.
  {
    pkg: C010,
    file: 'DR-C10-S12-2_citation-and-label-erratum-versus-convention.md',
    target: '01_outcome-register.md',
    count: 1,
    why: 'convention clause quotes the correct package-root bare form as an example',
  },
  {
    pkg: C010,
    file: 'DR-C10-S12-2_citation-and-label-erratum-versus-convention.md',
    target: 'decision-records/',
    count: 2,
    why: 'prose noun naming the folder, in the convention clause and a revision trigger',
  },
  {
    pkg: C010,
    file: 'DR-C10-S12-2_citation-and-label-erratum-versus-convention.md',
    target: 'traceability/',
    count: 2,
    why: 'prose noun naming the folder, in the convention clause and a revision trigger',
  },
];

/** Total exempted occurrences — the number the gate reports as verified present. */
export const NON_CLAIM_OCCURRENCES = NON_CLAIMS.reduce((n, c) => n + c.count, 0);

export const nonClaimKey = (pkg: string, file: string, target: string): string =>
  `${pkg}::${file}::${target}`;

const INDEX = new Map<string, NonClaim>(NON_CLAIMS.map((n) => [nonClaimKey(n.pkg, n.file, n.target), n]));

export function findNonClaim(pkg: string, file: string, target: string): NonClaim | undefined {
  return INDEX.get(nonClaimKey(pkg, file, target));
}
