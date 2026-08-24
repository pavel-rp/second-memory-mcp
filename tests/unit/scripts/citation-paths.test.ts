import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkCorpus,
  extractTokens,
  isFailing,
  normalizeCandidate,
} from '../../../scripts/citation-paths/checker.js';
import type { NonClaim } from '../../../scripts/citation-paths/non-claims.js';
import { NON_CLAIMS, NON_CLAIM_OCCURRENCES } from '../../../scripts/citation-paths/non-claims.js';

const FIXTURE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../fixtures/citation-paths'
);

const CLEAN = 'FIXTURE-clean';
const BROKEN = 'FIXTURE-broken';

/** Exempts exactly the one by-design non-claim seeded in the broken fixture. */
const FIXTURE_NON_CLAIMS: readonly NonClaim[] = [
  {
    pkg: BROKEN,
    file: 'DR-FIXTURE-2_example.md',
    target: '02_only-here.md',
    count: 1,
    why: 'the fixture quotes a defective bare-upstream form in order to report it',
  },
];

const run = (gated: string[], nonClaims: readonly NonClaim[] = FIXTURE_NON_CLAIMS) =>
  checkCorpus({ repoRoot: FIXTURE_ROOT, gated, nonClaims });

const pkgReport = (gated: string[], pkg: string, nonClaims?: readonly NonClaim[]) => {
  const report = run(gated, nonClaims);
  const found = report.packages.find(p => p.pkg === pkg);
  if (!found) throw new Error(`fixture package ${pkg} not found`);
  return { report, found };
};

describe('normalizeCandidate', () => {
  it('strips a trailing line reference', () => {
    expect(normalizeCandidate('01_sibling.md:12')).toBe('01_sibling.md');
  });

  it('strips a trailing line and column reference', () => {
    expect(normalizeCandidate('01_sibling.md:12:4')).toBe('01_sibling.md');
  });

  it('strips a comma-separated line-reference list', () => {
    // The narrower `:\d+$` form misses this and silently reports the citation
    // as a missing target instead of a path defect.
    expect(normalizeCandidate('01_sibling.md:6,54,330,409')).toBe('01_sibling.md');
  });

  it('strips an anchor', () => {
    expect(normalizeCandidate('01_sibling.md#section')).toBe('01_sibling.md');
  });

  it.each([
    ['https://example.com/page.md', 'a URL'],
    ['mailto:someone@example.com', 'a mail link'],
    ['../90_….md', 'prose shorthand with an ellipsis'],
    ['../90_....md', 'prose shorthand with three dots'],
    [':41', 'a bare line reference'],
    ['#heading', 'a bare anchor'],
    ['some sentence here', 'prose containing whitespace'],
    ['src/**/*.ts', 'a glob'],
    ['DR-C10-S12-2', 'a register id'],
    ['plainword', 'a token that is neither a path nor a filename'],
  ])('rejects %s (%s)', raw => {
    expect(normalizeCandidate(raw)).toBeNull();
  });
});

describe('extractTokens', () => {
  it('extracts inline code spans', () => {
    expect(extractTokens('cites `a.md` and `b/c.md` here')).toEqual(['a.md', 'b/c.md']);
  });

  it('extracts markdown link targets', () => {
    expect(extractTokens('see [the doc](../a.md) for more')).toEqual(['../a.md']);
  });

  it('returns nothing for a line with neither', () => {
    expect(extractTokens('just prose, no citations')).toEqual([]);
  });
});

describe('citation gate — clean fixture package', () => {
  it('reports no non-resolving citations', () => {
    const { found } = pkgReport([CLEAN], CLEAN);
    expect(found.inScope).toEqual([]);
  });

  it('counts citations that resolve from their own directory', () => {
    const { found } = pkgReport([CLEAN], CLEAN);
    expect(found.resolved).toBeGreaterThan(0);
  });

  it('does not fail the gate', () => {
    const { report } = pkgReport([CLEAN], CLEAN);
    expect(isFailing(report)).toBe(false);
  });

  it('ignores citations inside fenced code blocks', () => {
    const { found } = pkgReport([CLEAN], CLEAN);
    expect(found.inScope.map(f => f.target)).not.toContain('totally-made-up-file.md');
  });

  it('excludes repo-root-relative source citations rather than gating them', () => {
    const { found } = pkgReport([CLEAN], CLEAN);
    expect(found.excluded.some(e => e.target === 'src/domain/algorithms')).toBe(true);
  });
});

describe('citation gate — deliberately seeded defects', () => {
  // This is the demonstration `OI-S12-1` half (b) requires: the gate is shown to
  // fail on a seeded fixture, so a green run on the real corpus is a result
  // rather than an absence of looking.
  it('fails the gate when the broken package is gated', () => {
    const { report } = pkgReport([BROKEN], BROKEN);
    expect(isFailing(report)).toBe(true);
  });

  it('detects exactly the three seeded defects', () => {
    const { found } = pkgReport([BROKEN], BROKEN);
    expect(found.inScope).toHaveLength(3);
  });

  it('classifies a package-root file citing a sibling with a spurious ../', () => {
    const { found } = pkgReport([BROKEN], BROKEN);
    const finding = found.inScope.find(f => f.target === '../01_sibling.md');
    expect(finding?.cls).toBe('C1-spurious-dotdot');
    expect(finding?.fix).toBe('01_sibling.md');
  });

  it('classifies a subfolder file citing a package-root sibling bare', () => {
    const { found } = pkgReport([BROKEN], BROKEN);
    const finding = found.inScope.find(
      f => f.file.endsWith('DR-FIXTURE-2_example.md') && f.target === '01_sibling.md'
    );
    expect(finding?.cls).toBe('C2-missing-dotdot');
    expect(finding?.fix).toBe('../01_sibling.md');
  });

  it('classifies an upstream document cited without its package directory', () => {
    const { found } = pkgReport([BROKEN], BROKEN);
    const finding = found.inScope.find(
      f => f.file.endsWith('00_root.md') && f.target === '02_only-here.md'
    );
    expect(finding?.cls).toBe('C3-bare-upstream');
    expect(finding?.fix).toContain(CLEAN);
  });

  it('reports the seeded line numbers so a failure is actionable', () => {
    const { found } = pkgReport([BROKEN], BROKEN);
    for (const finding of found.inScope) expect(finding.line).toBeGreaterThan(0);
  });
});

describe('gating is what decides failure, not the presence of defects', () => {
  it('does not fail when the package holding the defects is not gated', () => {
    const { report } = pkgReport([CLEAN], BROKEN);
    expect(isFailing(report)).toBe(false);
  });

  it('still measures and reports the ungated package', () => {
    const { found } = pkgReport([CLEAN], BROKEN);
    expect(found.inScope).toHaveLength(3);
  });
});

describe('by-design exemptions', () => {
  it('exempts a declared non-claim from the gated set', () => {
    const { found } = pkgReport([BROKEN], BROKEN);
    expect(
      found.inScope.some(f => f.target === '02_only-here.md' && f.file.includes('DR-FIXTURE-2'))
    ).toBe(false);
  });

  it('records the exempted occurrence rather than discarding it', () => {
    const { found } = pkgReport([BROKEN], BROKEN);
    expect([...found.nonClaimHits.values()].reduce((n, c) => n + c, 0)).toBe(1);
  });

  it('reports no stale exemption when the declared count matches', () => {
    const { found } = pkgReport([BROKEN], BROKEN);
    expect(found.staleNonClaims).toEqual([]);
  });

  it('flags an exemption whose target no longer appears', () => {
    const rotted: readonly NonClaim[] = [
      { ...FIXTURE_NON_CLAIMS[0]!, target: 'no-longer-cited.md' },
    ];
    const { found } = pkgReport([BROKEN], BROKEN, rotted);
    expect(found.staleNonClaims).toHaveLength(1);
    expect(found.staleNonClaims[0]?.observed).toBe(0);
  });

  it('flags an exemption declared fewer times than it occurs, so it cannot become a blanket amnesty', () => {
    const understated: readonly NonClaim[] = [{ ...FIXTURE_NON_CLAIMS[0]!, count: 5 }];
    const { found } = pkgReport([BROKEN], BROKEN, understated);
    expect(found.staleNonClaims).toHaveLength(1);
    expect(found.staleNonClaims[0]?.observed).toBe(1);
  });

  it('fails the gate on a stale exemption even when no citation is broken', () => {
    const rotted: readonly NonClaim[] = [
      { pkg: CLEAN, file: '00_root.md', target: 'never-cited.md', count: 1, why: 'seeded rot' },
    ];
    const { report, found } = pkgReport([CLEAN], CLEAN, rotted);
    expect(found.inScope).toEqual([]);
    expect(isFailing(report)).toBe(true);
  });
});

describe('the shipped C010 exemption registry', () => {
  it('declares eighteen exempted occurrences', () => {
    expect(NON_CLAIM_OCCURRENCES).toBe(18);
  });

  it('carries a stated reason for every entry', () => {
    for (const entry of NON_CLAIMS) expect(entry.why.length).toBeGreaterThan(0);
  });

  it('has no duplicate (package, file, target) key', () => {
    const keys = NON_CLAIMS.map(n => `${n.pkg}::${n.file}::${n.target}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
