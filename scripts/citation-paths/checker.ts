/**
 * Citation-path resolvability checker for the research corpus.
 *
 * Walks every markdown file in a research package, extracts every path-like
 * citation target (inline code spans + markdown link targets), and resolves each
 * against the DIRECTORY OF THE FILE THAT CONTAINS IT.
 *
 * SCOPE. The gate covers citations that target the research corpus
 * (`docs/research/`) — package-root siblings, `decision-records/` and
 * `traceability/` files, and cross-package `../C0NN-*` references. That is the
 * universe the standing citation convention in `DR-C10-S12-2` governs:
 *
 *   - a package-root file cites a package-root sibling by BARE filename;
 *   - a file in `decision-records/` or `traceability/` cites a package-root
 *     sibling with ONE `../`, and a file in another package with TWO.
 *
 * Repo-root-relative citations of SOURCE and non-research docs (`src/...`,
 * `drizzle/...`, `docs/GLOSSARY.md`, `CLAUDE.md`, ...) are a separate,
 * corpus-wide convention and are reported as an excluded class rather than gated.
 *
 * Classes:
 *   C1 spurious-dotdot  : a package-root file writes `../<sibling>`
 *   C2 missing-dotdot   : a subfolder file writes a package-root sibling bare
 *   C3 bare-upstream    : an upstream doc cited by bare filename, no package dir
 *   repo-root-corpus    : an intra-corpus target written repo-root-relative
 *   repo-root-source    : a source/non-research doc cited repo-root-relative
 *   MISSING             : target does not exist anywhere — NOT a path bug
 *
 * Derived from the one-shot audit written for NEU-989; generalised over packages
 * and made injectable so the gate can be proven to fail on a seeded fixture
 * rather than trusted to be looking (see `OI-S12-1`).
 */

import fs from 'node:fs';
import path from 'node:path';
import { NON_CLAIMS, type NonClaim } from './non-claims.js';

export type CitationClass = 'C1-spurious-dotdot' | 'C2-missing-dotdot' | 'C3-bare-upstream';

export type ExcludedKind = 'repo-root-corpus' | 'repo-root-source' | 'MISSING-target';

export interface Finding {
  /** Path relative to the repo root. */
  file: string;
  line: number;
  raw: string;
  target: string;
  cls: CitationClass;
  /** The target that would resolve, in the convention's terms. */
  fix: string;
}

export interface Excluded {
  file: string;
  line: number;
  raw: string;
  target: string;
  kind: ExcludedKind;
  corpusHits?: string[];
}

export interface PackageReport {
  pkg: string;
  markdownFiles: number;
  citationsSeen: number;
  resolved: number;
  /** Non-resolving citations that are NOT exempted — the gated set. */
  inScope: Finding[];
  excluded: Excluded[];
  /** Exempted occurrences actually observed, by non-claim key. */
  nonClaimHits: Map<string, number>;
  /**
   * Exemptions whose observed occurrence count no longer matches the declared
   * count. A mismatch is an error, never a silent skip: it means the list has
   * rotted and could be hiding a real defect.
   */
  staleNonClaims: Array<{ nonClaim: NonClaim; observed: number }>;
}

export interface CorpusReport {
  packages: PackageReport[];
  /** Packages whose `inScope` count is required to be zero. */
  gated: string[];
}

const FILE_EXT = /\.(md|ts|tsx|js|mjs|cjs|json|sql|ya?ml|txt|toml|sh)$/i;

function walk(dir: string, ext: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, ext, acc);
    else if (entry.isFile() && entry.name.endsWith(ext)) acc.push(full);
  }
  return acc;
}

function walkAll(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    acc.push(full);
    if (entry.isDirectory()) walkAll(full, acc);
  }
  return acc;
}

function exists(p: string): boolean {
  try {
    fs.statSync(p);
    return true;
  } catch {
    return false;
  }
}

/** Reduce a raw inline-code / link token to a bare filesystem path, or null. */
export function normalizeCandidate(raw: string): string | null {
  let t = raw.trim();
  if (!t) return null;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(t)) return null; // URL
  if (t.startsWith('mailto:')) return null;
  if (t.includes('…') || t.includes('...')) return null; // prose shorthand
  if (t.startsWith(':') || t.startsWith('#')) return null; // bare line ref / anchor
  if (/\s/.test(t)) return null; // commands, sentences
  if (/[*?{}$()<>!|\\]/.test(t)) return null; // globs / shell patterns

  t = t.split('#')[0] ?? '';
  // Trailing line/col refs, including comma-separated lists: `:60`, `:60:4`,
  // `:52,183`, `:6,54,330,409`. Missing the comma form silently hides real
  // defects behind a "target does not exist" verdict.
  t = t.replace(/(:\d+(?:,\d+)*)+$/, '');
  t = t.replace(/[,;)\]]+$/, '');
  if (!t) return null;

  if (!(t.includes('/') || FILE_EXT.test(t))) return null;
  if (/^[A-Z]{1,5}-[A-Z0-9]+-[A-Z0-9-]+$/.test(t)) return null; // register id
  return t;
}

export function extractTokens(line: string): string[] {
  const out: string[] = [];
  for (const m of line.matchAll(/`([^`\n]+)`/g)) if (m[1]) out.push(m[1]);
  for (const m of line.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) if (m[1]) out.push(m[1]);
  return out;
}

export interface CheckPackageOptions {
  repoRoot: string;
  researchRel: string;
  /** Package directory name, relative to the research root. */
  pkg: string;
  /** Every path under the research root, for suffix-matching bare citations. */
  corpusPaths: string[];
  /** Exemption registry; injectable so the staleness guard itself is testable. */
  nonClaims?: readonly NonClaim[];
}

export function checkPackage({
  repoRoot,
  researchRel,
  pkg,
  corpusPaths,
  nonClaims: nonClaimRegistry = NON_CLAIMS,
}: CheckPackageOptions): PackageReport {
  const researchRoot = path.join(repoRoot, researchRel);
  const packageRoot = path.join(researchRoot, pkg);
  const underResearch = (abs: string): boolean =>
    abs === researchRoot || abs.startsWith(researchRoot + path.sep);

  /** Corpus paths whose tail equals the cited target. Exactly one = unambiguous. */
  const corpusSuffixMatches = (target: string): string[] => {
    const t = target.replace(/\/+$/, '');
    if (!t) return [];
    return corpusPaths.filter((p) => p === t || p.endsWith('/' + t));
  };

  const files = walk(packageRoot, '.md').sort();
  const inScope: Finding[] = [];
  const excluded: Excluded[] = [];
  const nonClaimHits = new Map<string, number>();
  let citationsSeen = 0;
  let resolved = 0;

  for (const file of files) {
    const dir = path.dirname(file);
    const rel = path.relative(repoRoot, file);
    const base = path.basename(file);
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    let inFence = false;

    lines.forEach((line, i) => {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
        inFence = !inFence;
        return;
      }
      if (inFence) return;

      for (const raw of extractTokens(line)) {
        const target = normalizeCandidate(raw);
        if (!target) continue;
        citationsSeen += 1;

        if (exists(path.resolve(dir, target))) {
          resolved += 1;
          continue;
        }

        // Candidate repairs, in the convention's terms.
        const stripped = target.startsWith('../') ? target.slice(3) : null;
        const strippedAbs = stripped === null ? null : path.resolve(dir, stripped);
        const addedAbs = path.resolve(dir, '../' + target);
        const addedTwiceAbs = path.resolve(dir, '../../' + target);
        const repoAbs = path.resolve(repoRoot, target);

        let cls: CitationClass;
        let fix: string;

        if (strippedAbs !== null && stripped !== null && exists(strippedAbs) && underResearch(strippedAbs)) {
          cls = 'C1-spurious-dotdot';
          fix = stripped;
        } else if (exists(addedAbs) && underResearch(addedAbs)) {
          cls = 'C2-missing-dotdot';
          fix = '../' + target;
        } else if (exists(addedTwiceAbs) && underResearch(addedTwiceAbs)) {
          // Short by two levels: a subfolder file citing another package
          // without either `../`. Same mechanism as C2, one step further.
          cls = 'C2-missing-dotdot';
          fix = '../../' + target;
        } else if (exists(repoAbs) && underResearch(repoAbs)) {
          // Intra-corpus target written repo-root-relative. Not governed by
          // `DR-C10-S12-2`'s convention, which speaks only to the bare / `../`
          // forms. The bulk of this class is the prose noun `docs/research/`
          // naming the tree rather than citing a file.
          excluded.push({
            file: rel,
            line: i + 1,
            raw,
            target,
            kind: 'repo-root-corpus',
          });
          continue;
        } else if (exists(repoAbs)) {
          // Source file or non-research doc cited repo-root-relative: the
          // corpus-wide convention, out of this gate's scope.
          excluded.push({ file: rel, line: i + 1, raw, target, kind: 'repo-root-source' });
          continue;
        } else {
          // Nothing resolves. Is it a real corpus document cited without its
          // package directory? Only an UNAMBIGUOUS single match is a repair —
          // several matches (a bare `README.md`) stays unrepaired by design.
          const corpusHits = corpusSuffixMatches(target);
          const only = corpusHits[0];
          if (corpusHits.length === 1 && only !== undefined) {
            cls = 'C3-bare-upstream';
            fix = path.relative(dir, only) + (target.endsWith('/') ? '/' : '');
          } else {
            excluded.push({
              file: rel,
              line: i + 1,
              raw,
              target,
              kind: 'MISSING-target',
              corpusHits: corpusHits.map((h) => path.relative(repoRoot, h)),
            });
            continue;
          }
        }

        const nonClaim = nonClaimRegistry.find(
          (n) => n.pkg === pkg && n.file === base && n.target === target,
        );
        if (nonClaim) {
          const key = `${pkg}::${base}::${target}`;
          nonClaimHits.set(key, (nonClaimHits.get(key) ?? 0) + 1);
        } else {
          inScope.push({ file: rel, line: i + 1, raw, target, cls, fix });
        }
      }
    });
  }

  // Staleness guard: every declared exemption must still be observed exactly as
  // many times as declared. Fewer means the list has rotted; more means an
  // unreviewed occurrence is riding on an existing exemption.
  const staleNonClaims = nonClaimRegistry
    .filter((n) => n.pkg === pkg)
    .map((nonClaim) => ({
      nonClaim,
      observed: nonClaimHits.get(nonClaimKeyOf(nonClaim)) ?? 0,
    }))
    .filter((r) => r.observed !== r.nonClaim.count);

  return {
    pkg,
    markdownFiles: files.length,
    citationsSeen,
    resolved,
    inScope,
    excluded,
    nonClaimHits,
    staleNonClaims,
  };
}

const nonClaimKeyOf = (n: NonClaim): string => `${n.pkg}::${n.file}::${n.target}`;

export interface CheckCorpusOptions {
  repoRoot: string;
  /** Defaults to `docs/research`. */
  researchRel?: string;
  /** Packages required to be clean. Every other package is measured, not gated. */
  gated: string[];
  /** Restrict the walk to these packages; defaults to every directory found. */
  only?: string[];
  /** Exemption registry; injectable so the staleness guard itself is testable. */
  nonClaims?: readonly NonClaim[];
}

export function checkCorpus({
  repoRoot,
  researchRel = 'docs/research',
  gated,
  only,
  nonClaims,
}: CheckCorpusOptions): CorpusReport {
  const researchRoot = path.join(repoRoot, researchRel);
  const corpusPaths = walkAll(researchRoot);
  const names = fs
    .readdirSync(researchRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((n) => (only ? only.includes(n) : true))
    .sort();

  return {
    packages: names.map((pkg) => checkPackage({ repoRoot, researchRel, pkg, corpusPaths, nonClaims })),
    gated,
  };
}

/** A corpus report fails when a gated package has findings or a rotted exemption list. */
export function isFailing(report: CorpusReport): boolean {
  return report.packages.some(
    (p) => report.gated.includes(p.pkg) && (p.inScope.length > 0 || p.staleNonClaims.length > 0),
  );
}
