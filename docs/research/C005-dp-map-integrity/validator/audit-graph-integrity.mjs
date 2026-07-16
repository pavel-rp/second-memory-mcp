#!/usr/bin/env node
// =============================================================================
// C005 DP Map — Graph-Integrity Validator  (NEU-943 / SUB-9)
// =============================================================================
// Produces every number in ../01..04. Prose that disagrees with this script is
// wrong; this script is the artifact.
//
// RUN:  node docs/research/C005-dp-map-integrity/validator/audit-graph-integrity.mjs
//
// NOTE ON THE `yaml` IMPORT
//   `yaml` is a transitive dep and is NOT hoisted to node_modules/ under pnpm, so a
//   bare `import 'yaml'` fails. It is resolved from the pnpm store below. On Windows
//   an absolute path MUST be a file:// URL or the ESM loader rejects the drive letter
//   as an unsupported protocol ('b:').
//
// EXIT CODE: 0 if the STRUCTURAL invariants hold (acyclicity, grounding, referential
//   integrity, skill-type union-completeness, OUT-6 path criterion). The ANNOTATION
//   findings (F-943-1) are REPORTED, not fatal — they are routed to NEU-940's owner,
//   and failing the build on them would block a merge on someone else's defect.
// =============================================================================

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../../../..');
const MAP = join(REPO, 'docs/research/C005-dp-map');

// --- resolve `yaml` out of the pnpm store (not hoisted) ----------------------
// Version is DISCOVERED, never pinned: a hard-coded `yaml@2.8.1` would break the
// moment the transitive dep bumps, even with a perfectly usable copy on disk.
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
// LOAD
// =============================================================================
const manifest = load('manifest.yaml');
const boundary = load('boundary-register.yaml');
const xc = load('edges/cross-cluster.yaml');

const nodes = [];
for (const c of manifest.clusters)
  for (const f of c.files)
    for (const n of load(f.path).nodes) nodes.push({ ...n, _file: f.path });

const N = new Map(nodes.map((n) => [n.id, n]));
const ids = new Set(N.keys());
const rootIds = new Set(nodes.filter((n) => n.role === 'root').map((n) => n.id));
const anchorIds = new Set(boundary.anchors.map((a) => a.id));
const bare = (a) => String(a).split('@')[0];

// =============================================================================
// A. PARTITION SHAPE — CL-4 is ONE cluster across TWO files
// =============================================================================
console.log('\n=== A. PARTITION SHAPE ===');
console.log(`len(clusters) = ${manifest.clusters.length} | asserted cluster_count = ${manifest.cluster_count} | node files = ${nodes.length && manifest.clusters.flatMap(c=>c.files).length}`);
check(manifest.clusters.length === 4, 'cluster count is 4 (len(clusters), never node files)');
check(manifest.cluster_count === manifest.clusters.length, 'manifest.cluster_count agrees with len(clusters)');
const cl4 = manifest.clusters.find((c) => c.id === 'CL-4');
check(cl4 && cl4.files.length === 2, 'CL-4 is ONE cluster registered across TWO files');

// =============================================================================
// B. INVENTORY
// =============================================================================
console.log('\n=== B. INVENTORY ===');
console.log(`nodes = ${nodes.length} | roots = ${rootIds.size} | non-root = ${nodes.length - rootIds.size} | anchors = ${anchorIds.size}`);
check(nodes.length === 187, 'node total is 187', `${nodes.length}`);
check(rootIds.size === 8, 'frozen roots = 8');
check(anchorIds.size === boundary.anchor_count, 'anchor_count agrees with the register');
const dupes = nodes.map((n) => n.id).filter((id, i, a) => a.indexOf(id) !== i);
check(dupes.length === 0, 'node ids unique', dupes.join(','));

// =============================================================================
// C. EDGE ASSEMBLY — classify by FIELD, never by endpoint span (D-S4 / X-S1)
// =============================================================================
const prereq = new Map(nodes.map((n) => [n.id, []]));   // node -> node prerequisites
const anchorsOf = new Map(nodes.map((n) => [n.id, []]));
const xcOf = new Map(nodes.map((n) => [n.id, []]));
const classified = { intra_cluster: [], roots: [], boundary_anchors: [], cross_cluster: [] };

for (const n of nodes) {
  const p = n.prerequisites || {};
  for (const t of p.intra_cluster || []) { prereq.get(n.id).push(t); classified.intra_cluster.push([n.id, t]); }
  for (const t of p.roots || []) { prereq.get(n.id).push(t); classified.roots.push([n.id, t]); }
  for (const t of p.boundary_anchors || []) { anchorsOf.get(n.id).push(bare(t)); classified.boundary_anchors.push([n.id, bare(t)]); }
}
for (const e of xc.edges) { prereq.get(e.from).push(e.to); xcOf.get(e.from).push(e.to); classified.cross_cluster.push([e.from, e.to]); }

console.log('\n=== C. EDGE CENSUS (by FIELD) ===');
for (const [k, v] of Object.entries(classified)) console.log(`  ${k.padEnd(18)} ${v.length}`);
const totalEdges = Object.values(classified).reduce((a, v) => a + v.length, 0);
console.log(`  ${'TOTAL'.padEnd(18)} ${totalEdges}`);

// =============================================================================
// D. REFERENTIAL INTEGRITY
// =============================================================================
console.log('\n=== D. REFERENTIAL INTEGRITY ===');
const dangling = [];
for (const [k, list] of Object.entries(classified))
  for (const [a, b] of list) {
    if (!ids.has(a)) dangling.push(`${k}: source ${a} missing`);
    if (k === 'boundary_anchors') { if (!anchorIds.has(b)) dangling.push(`${k}: anchor ${b} not registered`); }
    else if (!ids.has(b)) dangling.push(`${k}: target ${b} missing`);
  }
check(dangling.length === 0, 'every edge endpoint resolves', dangling.join('; '));
check(classified.intra_cluster.every(([a, b]) => N.get(a).cluster === N.get(b).cluster), 'intra_cluster edges stay in-cluster');
check(classified.roots.every(([, b]) => rootIds.has(b)), 'roots-field edges point only at role:root nodes');
check(xc.edges.every((e) => e.from_cluster !== e.to_cluster), 'cross-cluster edges actually cross');
const redrawn = xc.edges.filter((e) => rootIds.has(e.to) || anchorIds.has(bare(e.to)));
check(redrawn.length === 0, 'ZERO root/anchor edges re-drawn in cross-cluster.yaml (R5 / D-S4)', redrawn.map((e) => e.edge_id).join(','));
check(nodes.filter((n) => n.node_kind === 'knowledge' && n.skill_type).length === 0, 'no knowledge node carries skill_type');

// =============================================================================
// E. CYCLE AUDIT — full edge-complete graph
// =============================================================================
console.log('\n=== E. CYCLE AUDIT ===');
const adj = new Map([...ids].map((i) => [i, []]));
for (const [k, list] of Object.entries(classified)) {
  if (k === 'boundary_anchors') continue; // anchors are terminals, not graph vertices
  for (const [a, b] of list) if (adj.has(a) && adj.has(b)) adj.get(a).push(b);
}
const color = new Map([...ids].map((i) => [i, 0])); // 0 white 1 grey 2 black
const stack = [], cycles = [];
(function () {
  const dfs = (u) => {
    color.set(u, 1); stack.push(u);
    for (const v of adj.get(u)) {
      if (color.get(v) === 1) cycles.push([...stack.slice(stack.indexOf(v)), v]);
      else if (color.get(v) === 0) dfs(v);
    }
    stack.pop(); color.set(u, 2);
  };
  for (const id of ids) if (color.get(id) === 0) dfs(id);
})();
for (const c of cycles) console.log('  CYCLE: ' + c.join(' -> '));
check(cycles.length === 0, 'graph is ACYCLIC (no cycle retained, so none needs justification)', `${cycles.length} cycles`);

// =============================================================================
// F. FLOOR AUDIT — a registered anchor is a CLEAN TERMINAL, never a gap
// =============================================================================
console.log('\n=== F. FLOOR AUDIT ===');
const anchored = new Set([...anchorsOf].filter(([, v]) => v.length).map(([k]) => k));
const memoF = new Map();
const reachesFloor = (u, seen = new Set()) => {
  if (rootIds.has(u) || anchored.has(u)) return true;
  if (memoF.has(u)) return memoF.get(u);
  if (seen.has(u)) return false;
  seen.add(u);
  let ok = false;
  for (const v of adj.get(u) || []) if (reachesFloor(v, new Set(seen))) { ok = true; break; }
  memoF.set(u, ok); return ok;
};
const noPrereq = nodes.filter((n) => n.role !== 'root' && (prereq.get(n.id).length + anchorsOf.get(n.id).length) === 0);
check(noPrereq.length === 0, 'no non-root node has zero prerequisites', noPrereq.map((n) => n.id).join(','));
const ungrounded = nodes.filter((n) => n.role !== 'root' && !reachesFloor(n.id));
check(ungrounded.length === 0, 'every non-root chain bottoms out on a ROOT or a REGISTERED ANCHOR', ungrounded.map((n) => n.id).join(','));
console.log(`  nodes terminating on a registered anchor (clean terminals, NOT gaps): ${anchored.size}`);

// =============================================================================
// G. EIGHT-SKILL-TYPE UNION-COMPLETENESS
// =============================================================================
console.log('\n=== G. EIGHT-SKILL-TYPE UNION-COMPLETENESS ===');
const REQUIRED = ['conceptual', 'procedural', 'strategic', 'implementation', 'proof', 'debugging', 'optimization', 'transfer'];
const skills = nodes.filter((n) => n.node_kind === 'skill');
check(skills.every((n) => n.skill_type), 'every skill node declares a skill_type');
const tally = {};
for (const n of skills) tally[n.skill_type] = (tally[n.skill_type] || 0) + 1;
for (const t of REQUIRED) {
  const all = skills.filter((n) => n.skill_type === t);
  const nonRoot = all.filter((n) => n.role !== 'root');
  const cs = [...new Set(nonRoot.map((n) => n.cluster))].sort().join(',') || '(none)';
  console.log(`  ${t.padEnd(15)} total ${String(all.length).padStart(2)} | non-root ${String(nonRoot.length).padStart(2)} | roots ${all.length - nonRoot.length} | clusters ${cs}`);
}
const missing = REQUIRED.filter((t) => !tally[t]);
check(missing.length === 0, 'all EIGHT skill types instantiated by >=1 node', missing.join(','));
const unknown = Object.keys(tally).filter((t) => !REQUIRED.includes(t));
check(unknown.length === 0, 'no skill_type outside the named eight', unknown.join(','));
// fragility is REPORTED, not failed — union-completeness is the criterion, not spread
for (const t of REQUIRED) {
  const nonRoot = skills.filter((n) => n.skill_type === t && n.role !== 'root');
  if (nonRoot.length <= 1) console.log(`  !! FRAGILE (reported, not a FAIL): "${t}" rests on ${nonRoot.length} non-root node(s): ${nonRoot.map((n) => n.id).join(',')}`);
}

// =============================================================================
// H. DIFFICULTY / STAGE CONSISTENCY over NEU-940's 179 applied values
// =============================================================================
console.log('\n=== H. NEU-940 DIFFICULTY-DIMENSION CONSISTENCY ===');
const nonRoot = nodes.filter((n) => n.role !== 'root');
const dd = (id) => N.get(id)?.difficulty_dimensions || {};
check(nodes.filter((n) => n.role === 'root').every((n) => Object.keys(n.difficulty_dimensions || {}).length === 0), 'roots carry {} (frozen, DR-S02)');
check(nonRoot.every((n) => Object.keys(n.difficulty_dimensions || {}).length > 0), 'all 179 non-root nodes carry dimensions');
// `|| {}` matters: a node missing the field must reach the check() above as a clean
// FAIL, not crash the run here before anything is reported.
const keysets = new Set(nonRoot.map((n) => Object.keys(n.difficulty_dimensions || {}).sort().join('|')));
check(keysets.size === 1, 'all 179 nodes share ONE dimension key-set (no key drift)', `${keysets.size} distinct key-sets`);

// H1 — declared prerequisite_depth vs the rubric's own definition:
//      "Longest DP-technique path back to the floor" (02_difficulty-dimensions.md §2).
//      The FLOOR is the roots/anchors => a root is a depth-0 terminal; hops *inside*
//      the frozen root block are not DP-technique hops and are not counted.
const memoD = new Map();
const depth = (id, seen = new Set()) => {
  if (rootIds.has(id)) return 0;
  if (memoD.has(id)) return memoD.get(id);
  if (seen.has(id)) return 0;
  seen.add(id);
  let best = 0;
  for (const p of prereq.get(id) || []) best = Math.max(best, 1 + depth(p, new Set(seen)));
  for (const _ of anchorsOf.get(id) || []) best = Math.max(best, 1);
  memoD.set(id, best); return best;
};
// counterfactual: the same depth computed WITHOUT the NEU-939 cross-cluster edges
const memoX = new Map();
const depthNoXc = (id, seen = new Set()) => {
  if (rootIds.has(id)) return 0;
  if (memoX.has(id)) return memoX.get(id);
  if (seen.has(id)) return 0;
  seen.add(id);
  const skip = new Set(xcOf.get(id) || []);
  let best = 0;
  for (const p of prereq.get(id) || []) { if (skip.has(p)) continue; best = Math.max(best, 1 + depthNoXc(p, new Set(seen))); }
  for (const _ of anchorsOf.get(id) || []) best = Math.max(best, 1);
  memoX.set(id, best); return best;
};

const depthMismatch = nonRoot
  .map((n) => ({ id: n.id, cluster: n.cluster, declared: dd(n.id).prerequisite_depth, computed: depth(n.id), noXc: depthNoXc(n.id) }))
  .filter((r) => r.declared !== r.computed);
console.log(`  H1 prerequisite_depth: ${nonRoot.length - depthMismatch.length}/${nonRoot.length} agree with the rubric; ${depthMismatch.length} disagree`);
const overs = depthMismatch.filter((r) => r.declared > r.computed);
const explained = depthMismatch.filter((r) => r.declared === r.noXc);
console.log(`     direction: ${depthMismatch.length - overs.length} UNDER-report, ${overs.length} over-report (unanimity is the tell)`);
console.log(`     ${explained.length}/${depthMismatch.length} exactly equal the depth computed WITHOUT the NEU-939 cross-cluster edges`);
for (const r of depthMismatch) console.log(`       ${r.id.padEnd(52)} declared ${r.declared} | rubric ${r.computed} | pre-939 ${r.noXc}${r.declared === r.noXc ? '  <= matches pre-939 graph' : ''}`);

// H2 — progression_stage monotonicity, ISOLATED BY EDGE CLASS (the root-cause probe)
// Returns null on ANY unparseable stage. Without the isFinite guard a malformed
// stage yields NaN, `NaN == null` is false so it survives the skip, and every
// `NaN > x` comparison is false — the edge would be silently dropped from the
// inversion check instead of counted. A check that quietly skips what it cannot
// read is worse than no check.
const psn = (id) => {
  const s = dd(id).progression_stage;
  if (!s) return null;
  const n = parseInt(String(s).replace('PS-', ''), 10);
  return Number.isFinite(n) ? n : null;
};
const unparseableStages = nonRoot.filter((n) => dd(n.id).progression_stage && psn(n.id) === null);
check(unparseableStages.length === 0, 'every progression_stage parses (none silently skipped)', unparseableStages.map((n) => n.id).join(','));
console.log('  H2 progression_stage monotonicity, by edge class:');
const inversions = [];
for (const [k, list] of Object.entries(classified)) {
  if (k === 'boundary_anchors') continue;
  let checked = 0, inv = 0;
  for (const [a, b] of list) {
    if (rootIds.has(a) || rootIds.has(b)) continue;
    const x = psn(a), y = psn(b);
    if (x == null || y == null) continue;
    checked++;
    if (y > x) { inv++; inversions.push({ cls: k, dep: a, depStage: dd(a).progression_stage, pre: b, preStage: dd(b).progression_stage }); }
  }
  console.log(`     ${k.padEnd(16)} checked ${String(checked).padStart(3)} | inversions ${inv}${inv ? '   <-- DEFECT CONCENTRATED HERE' : '   (clean)'}`);
}
for (const i of inversions) console.log(`       INVERSION [${i.cls}] ${i.dep} (${i.depStage}) requires ${i.pre} (${i.preStage})`);

// =============================================================================
// I. OUT-6 REPRESENTATIVE PATH SET — >=1 per each of the 4 clusters + >=1 research-tier
// =============================================================================
console.log('\n=== I. OUT-6 REPRESENTATIVE PATH SET ===');
const walk = (id) => {
  const path = [id]; const guard = new Set([id]); let cur = id;
  for (;;) {
    if (rootIds.has(cur)) return { path, terminal: `ROOT ${cur}` };
    const ps = (prereq.get(cur) || []).filter((p) => !guard.has(p));
    if (!ps.length) {
      const a = anchorsOf.get(cur) || [];
      return a.length ? { path, terminal: `ANCHOR ${a[0]}` } : { path, terminal: 'DEAD-END' };
    }
    ps.sort((a, b) => depth(b) - depth(a));
    cur = ps[0]; guard.add(cur); path.push(cur);
  }
};
let pathsOk = 0;
for (const c of manifest.clusters) {
  const members = nodes.filter((n) => n.cluster === c.id && n.role !== 'root').sort((a, b) => depth(b.id) - depth(a.id));
  // An empty cluster is a reportable FAIL of OUT-6, not a crash.
  if (!members.length) { check(false, `OUT-6: cluster ${c.id} has at least one non-root node to walk from`); continue; }
  const r = walk(members[0].id);
  const grounded = r.terminal.startsWith('ROOT') || r.terminal.startsWith('ANCHOR');
  if (grounded) pathsOk++;
  console.log(`  ${c.id}: ${members[0].id} (${dd(members[0].id).progression_stage}) -- ${r.path.length} hops --> ${r.terminal}  [${grounded ? 'GROUNDED' : 'UNGROUNDED'}]`);
  console.log('       ' + r.path.join('\n       -> '));
}
check(pathsOk === 4, 'OUT-6: >=1 foundation-to-advanced path for EACH of the 4 clusters, each grounded');

// research-tier chain claimed by NEU-938 — verified hop-by-hop, not assumed
const RT = ['cl-4.larsch-online-smawk-implementation', 'cl-4.smawk-application', 'cl-4.total-monotonicity', 'cl-4.quadrangle-inequality', 'cl-1.root.optimal-substructure'];
let rtOk = RT.every((id) => ids.has(id));
for (let i = 0; i < RT.length - 1; i++) if (!(prereq.get(RT[i]) || []).includes(RT[i + 1])) rtOk = false;
console.log(`  RESEARCH-TIER: ${RT.join(' -> ')}`);
check(rtOk && rootIds.has(RT[RT.length - 1]), 'OUT-6: >=1 path reaches a research-tier endpoint, every hop present, terminating on a ROOT');

// =============================================================================
// J. NEU-939 UNRESOLVABLE ATTACHMENTS — F-939-A / F-939-B
// =============================================================================
console.log('\n=== J. NEU-939 UNRESOLVABLE ATTACHMENTS ===');
const hay = (n) => `${n.id} ${n.name} ${n.summary || ''}`;
const sos = nodes.filter((n) => /sos|sum.over.subset|zeta|moebius|mobius/i.test(hay(n)));
const bit = nodes.filter((n) => /bitset|word.parallel/i.test(hay(n)));
for (const u of xc.unresolvable_declarations) console.log(`  ${u.finding_id}: ${u.attachment_id} | declared target ${u.to_node_declared} exists? ${ids.has(u.to_node_declared)}`);
check(sos.length === 0, 'F-939-A CONFIRMED: no SOS/zeta-Moebius node anywhere in the 187', sos.map((n) => n.id).join(','));
check(bit.length === 0, 'F-939-B CONFIRMED: no bitset/word-parallel node anywhere in the 187', bit.map((n) => n.id).join(','));
check(xc.unresolvable_declarations.every((u) => !ids.has(u.to_node_declared)), 'both unresolvable targets genuinely absent (not a naming miss)');

// =============================================================================
// SUMMARY
// =============================================================================
console.log('\n' + '='.repeat(78));
for (const r of report) console.log(r);
console.log('='.repeat(78));
console.log(`STRUCTURAL CHECKS: ${report.length - fail.length}/${report.length} passed`);
console.log(`ANNOTATION FINDINGS (reported, routed to NEU-940 — not build-fatal): ` +
  `${depthMismatch.length} depth mismatches, ${inversions.length} stage inversions`);
if (fail.length) { console.log('\nFAILED:\n  - ' + fail.join('\n  - ')); process.exit(1); }
console.log('\nSTRUCTURAL VERDICT: PASS — acyclic, grounded, union-complete, OUT-6 criterion met.');
