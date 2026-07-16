#!/usr/bin/env node
// =============================================================================
// C005 DP Map Package — PACKAGE-COMPLETENESS GATE  (NEU-944 / SUB-11)
// =============================================================================
// RUN: node docs/research/C005-dp-map-package/generator/package-completeness-gate.mjs
//
// WHAT THIS GATE DOES *NOT* DO
//   It does NOT re-derive NEU-943's results. Re-deriving them with a second,
//   independently-written implementation would prove only that two scripts agree.
//   The spec says CONFIRM, and confirming means REUSING NEU-943's own validator:
//   this gate SPAWNS `../../C005-dp-map-integrity/validator/audit-graph-integrity.mjs`
//   and asserts on its exit code and its own printed verdicts. NEU-943 remains the
//   author of every structural claim below; this gate is a consumer of them.
//
// WHAT IT DOES DO — the OUT-9 package gate:
//   PG-1..PG-4  confirm NEU-943's structural verdicts (by reuse)
//   PG-5..PG-8  package assembly: view freshness, one-hop completeness, no orphan
//   PG-9..PG-11 ledger discipline: every element labelled, union-not-replace
//   PG-12       scope: no lesson, problem, graph editor, or exercise runner built
// =============================================================================

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../../../..');
const MAP = join(REPO, 'docs/research/C005-dp-map');
const PKG = resolve(HERE, '..');
const RESEARCH = join(REPO, 'docs/research');

function loadYamlLib() {
  const candidates = [join(REPO, 'node_modules/yaml/dist/index.js')];
  const store = join(REPO, 'node_modules/.pnpm');
  if (existsSync(store)) {
    for (const entry of readdirSync(store).filter((d) => /^yaml@/.test(d)).sort().reverse())
      candidates.push(join(store, entry, 'node_modules/yaml/dist/index.js'));
  }
  for (const c of candidates) if (existsSync(c)) return import(pathToFileURL(c).href);
  throw new Error('cannot locate the `yaml` package; looked in:\n  ' + candidates.join('\n  '));
}
const YAML = (await loadYamlLib()).default;
const load = (p) => YAML.parse(readFileSync(join(MAP, p), 'utf8'));

const fail = [];
const report = [];
const check = (ok, label, detail = '') => {
  report.push(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
  if (!ok) fail.push(label);
};

// =============================================================================
// PG-1..PG-4 — CONFIRM NEU-943's RESULTS BY REUSING NEU-943's VALIDATOR
// =============================================================================
console.log('\n=== PG-1..4 · CONFIRMING NEU-943 (by running ITS validator, not a copy) ===');
const VALIDATOR = join(RESEARCH, 'C005-dp-map-integrity/validator/audit-graph-integrity.mjs');
check(existsSync(VALIDATOR), 'PG-0 NEU-943 validator is present and reusable');

let vOut = '';
let vExit = 0;
try {
  vOut = execFileSync(process.execPath, [VALIDATOR], { encoding: 'utf8' });
} catch (e) {
  vOut = String((e.stdout || '') + (e.stderr || ''));
  vExit = e.status ?? 1;
}
const said = (needle) => vOut.includes(needle);

check(vExit === 0, 'PG-1 NEU-943 validator exits 0 (structural invariants hold)', `exit ${vExit}`);
check(
  said('PASS  all EIGHT skill types instantiated by >=1 node'),
  'PG-2 CONFIRMED (not re-derived): NEU-943 eight-skill-type UNION-COMPLETENESS holds',
);
check(
  said('PASS  every non-root chain bottoms out on a ROOT or a REGISTERED ANCHOR'),
  'PG-3 CONFIRMED (not re-derived): every prerequisite chain terminates on a DP root or a REGISTERED ANCHOR',
);
check(
  said('PASS  graph is ACYCLIC') && said('PASS  cluster count is 4 (len(clusters), never node files)'),
  'PG-4 CONFIRMED (not re-derived): graph ACYCLIC and len(clusters)=4',
);
const m = vOut.match(/STRUCTURAL CHECKS: (\d+)\/(\d+) passed/);
console.log(`  NEU-943 reports ${m ? m[0] : '(unparsed)'} — consumed as-is, re-derived nowhere.`);
check(!!m && m[1] === m[2], 'PG-4b every NEU-943 structural check still passes against the final tree', m ? m[0] : '');

// =============================================================================
// LOAD the map for the package-side checks
// =============================================================================
const manifest = load('manifest.yaml');
const boundary = load('boundary-register.yaml');
const xc = load('edges/cross-cluster.yaml');
const nodes = [];
for (const c of manifest.clusters) for (const f of c.files) for (const n of load(f.path).nodes) nodes.push(n);
const nonRoot = nodes.filter((n) => n.role !== 'root');

// =============================================================================
// PG-5 — the cross-reference view is FRESH (regeneration is a fixed point)
// =============================================================================
console.log('\n=== PG-5 · VIEW FRESHNESS ===');
const VIEW = join(PKG, '01_cross-reference-view.md');
check(existsSync(VIEW), 'PG-5a the cross-reference view exists');
const before = existsSync(VIEW) ? readFileSync(VIEW, 'utf8') : '';
execFileSync(process.execPath, [join(HERE, 'build-cross-reference.mjs')], { encoding: 'utf8' });
const after = readFileSync(VIEW, 'utf8');
// The generated line carries a build date; compare ignoring it so a re-run on a
// later day is not a false drift signal. Everything else must be byte-identical.
const norm = (s) => s.replace(/\*\*Generated:\*\* \d{4}-\d{2}-\d{2}/, '**Generated:** <date>');
check(norm(before) === norm(after), 'PG-5 the checked-in view is REGENERATION-FRESH (no index drift)');

// =============================================================================
// PG-6 — ONE-HOP COMPLETENESS: every node recoverable, with every required facet
// =============================================================================
console.log('\n=== PG-6 · ONE-HOP COMPLETENESS ===');
const missingBlock = nodes.filter((n) => !after.includes(`### \`${n.id}\``));
check(missingBlock.length === 0, 'PG-6a every one of the map\'s nodes has a block in the view', missingBlock.map((n) => n.id).join(','));
const missingRow = nodes.filter((n) => !after.includes(`| \`${n.id}\` |`));
check(missingRow.length === 0, 'PG-6b every node is reachable from the alphabetical lookup table', missingRow.map((n) => n.id).join(','));

// every REQUIRED facet is present on every non-root block
const blocks = new Map();
for (const n of nodes) {
  const start = after.indexOf(`### \`${n.id}\``);
  if (start < 0) continue;
  const next = after.indexOf('\n### `', start + 1);
  blocks.set(n.id, after.slice(start, next < 0 ? after.length : next));
}
const FACETS = ['**Type**', '**Requires**', '**Stage / difficulty**', '**JavaScript materiality**', '**Coverage**', '**Audit findings**', '**Status**'];
const facetGaps = [];
for (const n of nonRoot) {
  const b = blocks.get(n.id) || '';
  for (const f of FACETS) if (!b.includes(f)) facetGaps.push(`${n.id}:${f}`);
}
check(facetGaps.length === 0, 'PG-6c every mapped technique recovers ALL seven OUT-9 facets in ONE hop', facetGaps.slice(0, 6).join(' '));
console.log(`  ${nonRoot.length} technique blocks x ${FACETS.length} facets = ${nonRoot.length * FACETS.length} facet checks`);

// PG-6d — cross-cluster prerequisites are recoverable on the DEPENDENT's block
const xcGaps = [];
for (const e of xc.edges) {
  const b = blocks.get(e.from) || '';
  if (!b.includes(e.to)) xcGaps.push(e.edge_id);
}
check(xcGaps.length === 0, 'PG-6d every REALIZED cross-cluster prerequisite appears on its dependent\'s block', xcGaps.join(','));

// PG-6e — every boundary-anchor terminal is recoverable on its dependent's block
const anGaps = [];
for (const n of nodes)
  for (const a of (n.prerequisites || {}).boundary_anchors || []) {
    const b = blocks.get(n.id) || '';
    if (!b.includes(String(a).split('@')[0])) anGaps.push(`${n.id}->${a}`);
  }
check(anGaps.length === 0, 'PG-6e every registered boundary-anchor TERMINAL appears on its dependent\'s block', anGaps.join(','));

// =============================================================================
// PG-7 — the F-943-1 defect is SURFACED, never buried
// =============================================================================
console.log('\n=== PG-7 · THE OPEN DEFECT IS SURFACED ===');
// Key on the PER-NODE WARNING MARKER, not a bare "F-943-1" mention. Most blocks
// reference F-943-1 in passing (F-943-3 inherits it, the stage caveats cite it), so a
// substring match reports 179 and proves nothing. The marker below is emitted ONLY on a
// node the finding actually lands on.
const MARK = '**⚠ `F-943-1` (HIGH, OPEN) lands on this node';
const flagged = [...blocks.entries()].filter(([, b]) => b.includes(MARK)).map(([id]) => id);
check(flagged.length === 26, 'PG-7a all 26 F-943-1-affected nodes carry the per-node warning marker', `${flagged.length} flagged`);
// and the 6 inversions are named on the 5 nodes that carry them
const invMarked = [...blocks.entries()].filter(([, b]) => b.includes('Stage inverts across a cluster boundary')).map(([id]) => id);
check(invMarked.length === 5, 'PG-7a2 all 5 inversion-bearing nodes name their backwards dependency (6 inversions)', `${invMarked.length} nodes`);
const OPEN = join(PKG, '03_open-items-and-provisional-register.md');
const openTxt = existsSync(OPEN) ? readFileSync(OPEN, 'utf8') : '';
check(/F-943-1/.test(openTxt) && /unresolved/.test(openTxt), 'PG-7b F-943-1 is bound as an explicit UNRESOLVED element');
check(/NEU-940/.test(openTxt), 'PG-7c F-943-1 names an OWNER');
check(/[Rr]evision trigger/.test(openTxt) && /edge-complete/.test(openTxt), 'PG-7d F-943-1 names a REVISION TRIGGER');

// =============================================================================
// PG-8 — every OPEN ITEM has an owner and a revision trigger
// =============================================================================
console.log('\n=== PG-8 · OPEN ITEMS ARE OWNED ===');
const MUST_BIND = [
  'F-943-1', 'F-943-2', 'F-943-3', 'F-939-1', 'F-939-A', 'F-939-B',
  'INC-C1', 'INC-C2', 'INC-S1', 'CAP-2', 'JS-U1', 'JS-U2', 'JS-U3', 'JS-U5',
  'AR-1-a/936', 'AR-1-b/936', 'AR-1-a/938', 'AR-1-b/938', 'AR-1-c/935', 'AR-1-d/935',
  'D-S1a-1', 'X-S1', 'X-D1', 'X-D2', 'R1', 'PS-2', 'creator_review',
];
const unbound = MUST_BIND.filter((k) => !openTxt.includes(k));
check(unbound.length === 0, 'PG-8a every inherited open item is BOUND in the register', unbound.join(','));
check(/deferred-provisional/.test(openTxt), 'PG-8b the deferred creator review is listed among decisions that ship provisional');

// =============================================================================
// PG-9..PG-11 — LEDGER DISCIPLINE
// =============================================================================
console.log('\n=== PG-9..11 · LEDGER DISCIPLINE ===');
const LEDGER = join(RESEARCH, 'C005-dp-map-schema/adjudication/01_schema-decision-ledger.md');
const led = readFileSync(LEDGER, 'utf8');

// PG-9 — D-S1a count is 1, so D-S1's >10 cascade-revision threshold does NOT fire.
//        EXC-11 stays resolved. VERIFY — do not re-break.
const dS1aRows = (led.match(/\*\*`D-S1a-\d+`\*\*/g) || []).length;
check(dS1aRows === 1, 'PG-9 D-S1a count = 1 => D-S1 >10 cascade threshold does NOT fire; EXC-11 stays RESOLVED', `${dS1aRows} rows`);

// PG-10 — UNION, NEVER REPLACE. Every pre-existing ledger id must still be present.
const PRESERVED = [
  'D-S1', 'D-S2', 'D-S3', 'D-S4', 'D-S5', 'D-S1a',
  'D-C1', 'D-C2', 'D-C3', 'D-C4',
  'AR-1/a', 'AR-1/b', 'AR-1-a/938', 'AR-1-b/938', 'AR-1-c/935', 'AR-1-d/935',
  'D-S1a-1', 'INC-S1', 'INC-S2', 'INC-S3', 'X-S1', 'X-D1', 'X-D2', 'X-D3',
  'EXC-11', 'CV-32', 'CV-33', 'CV-34', 'CV-35',
];
const clobbered = PRESERVED.filter((k) => !led.includes(k));
check(clobbered.length === 0, 'PG-10 ledger UNIONED, never replaced — every pre-existing id survives', clobbered.join(','));
// nodes cite ledger ids in notes; a dropped/renamed row turns those into false claims
const citedInNotes = new Set();
for (const n of nodes) {
  for (const k of ['AR-1/a', 'AR-1/b', 'AR-1-a', 'AR-1-b', 'INC-S1', 'D-S1a'])
    if (String(n.notes || '').includes(k)) citedInNotes.add(k);
}
const brokenCite = [...citedInNotes].filter((k) => !led.includes(k));
check(brokenCite.length === 0, 'PG-10b every ledger id CITED BY A NODE\'s notes still resolves (no false claims)', brokenCite.join(','));
console.log(`  node-cited ledger ids: ${[...citedInNotes].join(', ') || '(none)'}`);

// PG-11 — no element unlabelled by the ledger: every node carries a legal status
const LEGAL = ['settled', 'provisional', 'unresolved'];
const badStatus = nodes.filter((n) => !LEGAL.includes(n.status));
check(badStatus.length === 0, 'PG-11a every node carries a legal adjudicated status (no element unlabelled)', badStatus.map((n) => n.id).join(','));
const noVersion = nodes.filter((n) => !n.adjudicated_at_map_version);
check(noVersion.length === 0, 'PG-11b every node records adjudicated_at_map_version', noVersion.map((n) => n.id).join(','));
const tally = {};
for (const n of nodes) tally[n.status] = (tally[n.status] || 0) + 1;
console.log('  node status tally: ' + Object.entries(tally).map(([k, v]) => `${k}=${v}`).join(' | '));

// PG-11c — NEU-944's own rows are present
check(['D-P1', 'D-P2', 'D-P3', 'D-P4'].every((k) => led.includes(k)), 'PG-11c NEU-944 bound the package through the ONE adjudication ledger (D-P1..D-P4)');

// PG-11d — node-level coverage is `unaudited` map-wide; REPORTED, not invented
const unaud = nonRoot.filter((n) => (n.coverage || {}).status === 'unaudited').length;
check(
  unaud === nonRoot.length && /INC-C7/.test(openTxt),
  'PG-11d node-level coverage is `unaudited` map-wide and RECORDED as INC-C7 (not invented)',
  `${unaud}/${nonRoot.length} unaudited`,
);

// =============================================================================
// PG-12 — SCOPE: no lesson, problem, graph editor, or exercise runner
// =============================================================================
console.log('\n=== PG-12 · SCOPE — NOTHING FORBIDDEN WAS BUILT ===');
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
const pkgFiles = walk(PKG).map((f) => f.slice(PKG.length + 1).replace(/\\/g, '/'));
console.log('  package contents:\n    ' + pkgFiles.join('\n    '));
const FORBIDDEN = /(^|\/)(lessons?|problems?|exercises?|editor|runner|curriculum)\//i;
check(!pkgFiles.some((f) => FORBIDDEN.test(f)), 'PG-12a no lesson/problem/editor/runner directory exists in the package');
// the only executables are the generator and this gate — both projections, neither a runner
const scripts = pkgFiles.filter((f) => /\.(mjs|js|ts)$/.test(f));
check(
  scripts.every((f) => f === 'generator/build-cross-reference.mjs' || f === 'generator/package-completeness-gate.mjs'),
  'PG-12b the ONLY executables are the view generator and this gate (no exercise runner, no editor)',
  scripts.join(','),
);
// the package must not mint graph content
check(!pkgFiles.some((f) => /\.ya?ml$/.test(f)), 'PG-12c the package contains NO yaml — it mints no node, edge or register entry');

// =============================================================================
// PG-13 — the OUT-8 authoring-requirements spec exists and is complete
// =============================================================================
console.log('\n=== PG-13 · OUT-8 AUTHORING REQUIREMENTS ===');
const REQ = join(PKG, '02_authoring-requirements.md');
const reqTxt = existsSync(REQ) ? readFileSync(REQ, 'utf8') : '';
check(existsSync(REQ), 'PG-13a the authoring-requirements spec exists');
for (const [needle, label] of [
  ['Required coverage', 'PG-13b states REQUIRED COVERAGE'],
  ['Sequencing and prerequisite constraints', 'PG-13c states SEQUENCING / PREREQUISITE CONSTRAINTS'],
  ['Difficulty-calibration inputs', 'PG-13d states DIFFICULTY-CALIBRATION INPUTS'],
  ['RESIDUAL OWNER', 'PG-13e routes INC-C1\'s root cause into a binding work-split rule'],
  ['not data-disjointness', 'PG-13f routes F-943-1\'s root cause into a binding sequencing rule'],
])
  check(reqTxt.includes(needle), label);

// =============================================================================
// SUMMARY
// =============================================================================
console.log('\n' + '='.repeat(78));
for (const r of report) console.log(r);
console.log('='.repeat(78));
console.log(`PACKAGE-COMPLETENESS GATE: ${report.length - fail.length}/${report.length} passed`);
if (fail.length) { console.log('\nFAILED:\n  - ' + fail.join('\n  - ')); process.exit(1); }
console.log('\nGATE VERDICT: PASS — package complete, one-hop recovery mechanical, every element');
console.log('labelled by the ledger, NEU-943 confirmed by reuse, nothing forbidden built.');
