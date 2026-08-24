#!/usr/bin/env tsx
/**
 * CI gate: every relative citation in a gated research package must resolve
 * from the directory of the file that contains it.
 *
 *   pnpm run lint:citations            # gate + summary
 *   pnpm run lint:citations --verbose  # every finding, with its repair
 *   pnpm run lint:citations --json     # machine-readable
 *
 * Exit 0 when every gated package is clean, 1 otherwise. Non-gated packages are
 * measured and printed but never fail the build — their counts are published so
 * the residual is visible rather than hidden. See `OI-S12-1` in
 * `docs/research/C010-system-and-repository-architecture/90_open-items-and-provisional-register.md`.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkCorpus, isFailing } from './citation-paths/checker.js';

/** Packages required to be clean. Add a package here once it has been swept. */
const GATED = ['C010-system-and-repository-architecture'];

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const VERBOSE = process.argv.includes('--verbose');
const JSON_OUT = process.argv.includes('--json');

const report = checkCorpus({ repoRoot: REPO_ROOT, gated: GATED });
const failing = isFailing(report);

if (JSON_OUT) {
  console.log(
    JSON.stringify(
      {
        gated: report.gated,
        failing,
        packages: report.packages.map((p) => ({
          pkg: p.pkg,
          gated: report.gated.includes(p.pkg),
          markdownFiles: p.markdownFiles,
          citationsSeen: p.citationsSeen,
          resolved: p.resolved,
          nonResolving: p.inScope.length,
          exempted: [...p.nonClaimHits.values()].reduce((n, c) => n + c, 0),
          staleExemptions: p.staleNonClaims.length,
          findings: p.inScope,
        })),
      },
      null,
      2,
    ),
  );
} else {
  const gatedPkgs = report.packages.filter((p) => report.gated.includes(p.pkg));
  const otherPkgs = report.packages.filter((p) => !report.gated.includes(p.pkg));

  console.log('citation-path resolvability — gated packages\n');
  for (const p of gatedPkgs) {
    const exempted = [...p.nonClaimHits.values()].reduce((n, c) => n + c, 0);
    const status = p.inScope.length === 0 && p.staleNonClaims.length === 0 ? 'PASS' : 'FAIL';
    console.log(`  ${status}  ${p.pkg}`);
    console.log(
      `        ${p.markdownFiles} files · ${p.citationsSeen} citations · ${p.resolved} resolve · ` +
        `${p.inScope.length} non-resolving · ${exempted} exempted by design`,
    );
    for (const s of p.staleNonClaims) {
      console.log(
        `        STALE EXEMPTION  ${s.nonClaim.file} :: ${s.nonClaim.target} — ` +
          `declared ${s.nonClaim.count}, observed ${s.observed}`,
      );
    }
    if (p.inScope.length) {
      const byFile = new Map<string, number>();
      for (const f of p.inScope) byFile.set(f.file, (byFile.get(f.file) ?? 0) + 1);
      for (const [file, n] of [...byFile].sort()) console.log(`        ${String(n).padStart(4)}  ${file}`);
      if (VERBOSE) {
        for (const f of p.inScope) {
          console.log(`          ${f.file}:${f.line}  [${f.cls}]  ${f.target}  ->  ${f.fix}`);
        }
      }
    }
  }

  console.log('\nmeasured, not gated (counts published so the residual is visible)\n');
  for (const p of otherPkgs) {
    console.log(`  ${String(p.inScope.length).padStart(5)}  ${p.pkg}`);
  }
  const residual = otherPkgs.reduce((n, p) => n + p.inScope.length, 0);
  console.log(`  ${String(residual).padStart(5)}  TOTAL non-resolving outside the gate`);
}

process.exit(failing ? 1 : 0);
