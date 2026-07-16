#!/usr/bin/env node
// =============================================================================
// C005 DP Map Package — Per-Technique Cross-Reference View GENERATOR (NEU-944 / SUB-11)
// =============================================================================
// Emits ../01_cross-reference-view.md — the load-bearing ONE-HOP recovery view.
//
// RUN: node docs/research/C005-dp-map-package/generator/build-cross-reference.mjs
//
// WHAT THIS IS
//   A PROJECTION. It joins facts that already exist in the merged packages and
//   writes them into one place per technique. It DERIVES NO NEW node, edge,
//   progression stage, difficulty value, JS-materiality finding, integrity
//   finding, or coverage verdict. Every field it prints is copied from its
//   owning package, and every field names that owner.
//
// WHY GENERATED AND NOT HAND-WRITTEN
//   NEU-932 D-F3 §3 records index-drift as an open cost. A hand-maintained
//   187-node view is drift the moment a node changes. The one-hop claim in OUT-9
//   is only worth making if it is MECHANICALLY true, so it is regenerated and
//   the package-completeness gate re-checks it.
//
// THE ONE PLACE THIS SCRIPT SHOWS A NUMBER ITS SOURCE DOES NOT CARRY
//   The rubric-computed prerequisite_depth, shown ONLY inside an F-943-1 warning.
//   That number is NEU-943's published finding (its validator prints it), not a
//   value minted here, and it is never presented as a difficulty value to consume.
//   The BINDING value stays NEU-940's `declared`. See ../03 F-943-1.
//
// NOTE ON THE `yaml` IMPORT — same constraint as NEU-943's validator: `yaml` is a
//   transitive dep, NOT hoisted under pnpm; on Windows an absolute path must be a
//   file:// URL. Version DISCOVERED, never pinned.
// =============================================================================

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../../../..');
const MAP = join(REPO, 'docs/research/C005-dp-map');
const OUT = resolve(HERE, '..');

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

// =============================================================================
// LOAD — the merged, inherited artifact
// =============================================================================
const manifest = load('manifest.yaml');
const boundary = load('boundary-register.yaml');
const xc = load('edges/cross-cluster.yaml');

const nodes = [];
for (const c of manifest.clusters)
  for (const f of c.files)
    for (const n of load(f.path).nodes) nodes.push({ ...n, _file: f.path });

const N = new Map(nodes.map((n) => [n.id, n]));
const rootIds = new Set(nodes.filter((n) => n.role === 'root').map((n) => n.id));
const anchorById = new Map(boundary.anchors.map((a) => [a.id, a]));
const bare = (a) => String(a).split('@')[0];

// realized cross-cluster edges, keyed by dependent (NEU-939 owns these)
const xcOut = new Map(nodes.map((n) => [n.id, []]));
const xcIn = new Map(nodes.map((n) => [n.id, []]));
for (const e of xc.edges) {
  if (xcOut.has(e.from)) xcOut.get(e.from).push(e);
  if (xcIn.has(e.to)) xcIn.get(e.to).push(e);
}

// intra-cluster + root dependents (who requires me) — helps a curriculum agent sequence
const dependents = new Map(nodes.map((n) => [n.id, []]));
for (const n of nodes) {
  const p = n.prerequisites || {};
  for (const t of [...(p.intra_cluster || []), ...(p.roots || [])])
    if (dependents.has(t)) dependents.get(t).push(n.id);
}
for (const e of xc.edges) if (dependents.has(e.to)) dependents.get(e.to).push(e.from);

// =============================================================================
// F-943-1 REPRODUCTION — NEU-943's finding, recomputed with NEU-943's algorithm
// so the view can FLAG the affected nodes. Not a new finding; a lookup.
// =============================================================================
const prereq = new Map(nodes.map((n) => [n.id, []]));
const anchorsOf = new Map(nodes.map((n) => [n.id, []]));
for (const n of nodes) {
  const p = n.prerequisites || {};
  for (const t of [...(p.intra_cluster || []), ...(p.roots || [])]) prereq.get(n.id).push(t);
  for (const t of p.boundary_anchors || []) anchorsOf.get(n.id).push(bare(t));
}
for (const e of xc.edges) prereq.get(e.from).push(e.to);

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

const dd = (n) => n.difficulty_dimensions || {};
const psn = (id) => {
  const s = dd(N.get(id) || {}).progression_stage;
  if (!s) return null;
  const v = parseInt(String(s).replace('PS-', ''), 10);
  return Number.isFinite(v) ? v : null;
};

// depth mismatches (F-943-1)
const depthBad = new Map();
for (const n of nodes) {
  if (n.role === 'root') continue;
  const declared = dd(n).prerequisite_depth;
  const computed = depth(n.id);
  if (declared !== computed) depthBad.set(n.id, { declared, computed });
}
// stage inversions (F-943-1), cross-cluster layer
const invByNode = new Map();
for (const e of xc.edges) {
  if (rootIds.has(e.from) || rootIds.has(e.to)) continue;
  const x = psn(e.from), y = psn(e.to);
  if (x == null || y == null) continue;
  if (y > x) {
    if (!invByNode.has(e.from)) invByNode.set(e.from, []);
    invByNode.get(e.from).push(e);
  }
}

// =============================================================================
// RENDER
// =============================================================================
const esc = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
const code = (s) => '`' + s + '`';
const nm = (id) => (N.has(id) ? esc(N.get(id).name) : '(target absent)');

const L = [];
const p = (s = '') => L.push(s);

const clusterOf = new Map(manifest.clusters.map((c) => [c.id, c]));
const byCluster = new Map(manifest.clusters.map((c) => [c.id, []]));
for (const n of nodes) if (byCluster.has(n.cluster)) byCluster.get(n.cluster).push(n);

p('# 01 — Per-Technique Cross-Reference View  ·  GENERATED, NEVER HAND-EDITED');
p();
p('> **⚠ Generated by `generator/build-cross-reference.mjs` from the merged packages.**');
p('> A hand edit here is invisible to the graph and is overwritten by the next run.');
p('> If something is wrong here, fix it **in the owning package** — this file owns nothing.');
p();
p(`**Task:** NEU-944 (SUB-11) · **Package version:** \`1.0.0\` · **Map version projected:** \`${manifest.map_version}\` · **Schema:** \`${manifest.schema_version}\` · **Generated:** ${new Date().toISOString().slice(0, 10)}`);
p();
p('---');
p();
p('## What this view is');
p();
p('**The one hop.** For ANY technique in the map, this file resolves — in a single lookup, with no');
p('further reads — its **node type**, **prerequisites** (intra-cluster, cross-cluster, and any');
p('registered boundary-anchor terminal), **progression stage**, **difficulty**, **JavaScript');
p('materiality**, **coverage verdict**, and **audit findings**, and marks **which of those are');
p('binding and which are open**.');
p();
p('**This view is a PROJECTION and adjudicates nothing.** Every field is copied from the package');
p('that owns it and names that owner. Status lives in exactly one place —');
p('`../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md`. This file never sets it.');
p();
p('## How to read a block');
p();
p('| Line | Meaning | Owner |');
p('| --- | --- | --- |');
p('| **Type** | `node_kind` + `skill_type` (closed eight-value vocabulary) | NEU-933 `D-S1` |');
p('| **Requires** | every prerequisite, by field. `intra` / `root` / `anchor` are DRAWN by the mapper; `cross` is REALIZED by NEU-939. An `anchor` line is a **SANCTIONED TERMINAL**, never a gap. | NEU-934–938 (drawn), NEU-939 (cross) |');
p('| **Required by** | reverse edges — who cannot be taught before this | derived from the same edges |');
p('| **Stage / difficulty** | NEU-940\'s applied values, `dimension_set_version 1.0.0` | NEU-940 |');
p('| **JS** | materiality verdict, `rule_version 1.0.0` | NEU-941 |');
p('| **Coverage** | the node\'s own `coverage` block | NEU-934–938; map-level verdict NEU-942 |');
p('| **Findings** | every audit finding that lands on THIS node | NEU-943, NEU-939 |');
p('| **Status** | the node\'s adjudicated status | the ledger, and only the ledger |');
p();
p('### ⚠ The one thing you must read before you sequence anything');
p();
p('**`F-943-1` (HIGH, OPEN) — 26 of 179 `prerequisite_depth` values are wrong, and 6 dependencies');
p('order backwards by `progression_stage`.** NEU-940\'s stages and depths were computed against the');
p('**pre-NEU-939 graph** — before the cross-cluster edges existed. Every affected node below carries');
p('an explicit `⚠ F-943-1` line. **Nothing hides it and nothing is silently corrected here.**');
p();
p('**Consume accordingly (NEU-943 `05` §5, binding):**');
p('**Trust the edges. Do NOT trust `progression_stage` across a cluster boundary.** The 25');
p('cross-cluster edges are audited and correct; the stages on 6 of them are inverted. **Sequence from');
p('the graph\'s topological order — which exists, because the graph is acyclic — not from the stage');
p('labels**, until `F-943-1` is closed. Treat `prerequisite_depth` as **advisory**.');
p();
p('See `../03_open-items-and-provisional-register.md` for owner and revision trigger.');
p();
p('---');
p();

// ---- inventory ----
p('## Inventory');
p();
p('| | Count | Source |');
p('| --- | ---: | --- |');
p(`| Nodes projected | **${nodes.length}** | ${manifest.clusters.flatMap((c) => c.files).length} node files across **${manifest.clusters.length}** clusters |`);
p(`| Frozen roots (\`role: "root"\`) | **${rootIds.size}** | NEU-933 \`D-S2\` |`);
p(`| Mapped technique nodes | **${nodes.length - rootIds.size}** | NEU-934–938, NEU-943 |`);
p(`| Registered boundary anchors | **${anchorById.size}** | \`boundary-register.yaml\` \`${boundary.register_version}\` |`);
p(`| Realized cross-cluster edges | **${xc.edges.length}** | NEU-939 |`);
p(`| Nodes flagged by \`F-943-1\` (depth) | **${depthBad.size}** | NEU-943 |`);
p(`| Nodes flagged by \`F-943-1\` (stage inversion) | **${invByNode.size}** | NEU-943 |`);
p();
p('**CL-4 is ONE cluster across TWO files.** Any audit counting clusters counts `len(clusters)` = '
  + `**${manifest.clusters.length}**. Never count node files (that number is `
  + `${manifest.clusters.flatMap((c) => c.files).length} and it is not the cluster count).`);
p();
p('---');
p();

// ---- lookup table ----
p('## Lookup — every technique, alphabetical by id');
p();
p('Grep this table for a technique name, then jump to its block. Every id below has a block.');
p();
p('| Technique id | Name | Cluster | Type | Stage | Open? |');
p('| --- | --- | --- | --- | --- | --- |');
for (const n of [...nodes].sort((a, b) => a.id.localeCompare(b.id))) {
  const t = n.node_kind === 'skill' ? `skill/${n.skill_type}` : 'knowledge';
  const stage = n.role === 'root' ? '— (root)' : dd(n).progression_stage || '—';
  const flags = [];
  if (depthBad.has(n.id) || invByNode.has(n.id)) flags.push('`F-943-1`');
  if (n.status !== 'settled') flags.push('`' + n.status + '`');
  p(`| \`${n.id}\` | ${esc(n.name)} | ${n.cluster} | ${t} | ${stage} | ${flags.join(' ') || '—'} |`);
}
p();
p('---');
p();

// ---- per-node blocks ----
for (const c of manifest.clusters) {
  const members = byCluster.get(c.id) || [];
  p(`## ${c.id} — ${esc(c.name)}`);
  p();
  p(`*${esc(c.defining_contribution)}*`);
  p();
  p(`**${members.length} nodes** · files: ${c.files.map((f) => code(f.path)).join(', ')}`);
  p();
  const ordered = [...members].sort((a, b) => (a.role === 'root' ? 0 : 1) - (b.role === 'root' ? 0 : 1) || a.id.localeCompare(b.id));
  for (const n of ordered) {
    p(`### \`${n.id}\``);
    p();
    p(`**${esc(n.name)}**${n.aliases && n.aliases.length ? ' · aliases: ' + n.aliases.map((a) => `*${esc(a)}*`).join(', ') : ''}`);
    p();
    if (n.summary) { p(`> ${esc(n.summary)}`); p(); }

    // Type
    const typeLine = n.node_kind === 'skill'
      ? `**Type** — \`skill\` / \`${n.skill_type}\``
      : '**Type** — `knowledge`';
    p(typeLine + (n.role === 'root' ? '  ·  **FROZEN ROOT** (`D-S2`) — a terminal of the floor; carries no stage and no dimensions by design' : ''));
    p();

    // Requires
    const pr = n.prerequisites || {};
    const reqs = [];
    for (const t of pr.intra_cluster || []) reqs.push(`- \`intra\`   → \`${t}\` — ${nm(t)}`);
    for (const t of pr.roots || []) reqs.push(`- \`root\`    → \`${t}\` — ${nm(t)}  *(floor terminal)*`);
    for (const t of pr.boundary_anchors || []) {
      const a = anchorById.get(bare(t));
      reqs.push(`- \`anchor\`  → \`${bare(t)}\`${a ? ` — ${esc(a.name)} (\`${a.kind}\`)` : ''}  *(**SANCTIONED TERMINAL**, register \`${boundary.register_version}\` — not a gap, not decomposed)*`);
    }
    for (const e of xcOut.get(n.id) || []) reqs.push(`- \`cross\`   → \`${e.to}\` — ${nm(e.to)}  *(${e.from_cluster}→${e.to_cluster}, realized by NEU-939, \`${e.edge_id}\`)*`);
    p('**Requires**');
    p();
    if (reqs.length) reqs.forEach((r) => p(r));
    else p(n.role === 'root' ? '- *nothing — this IS the floor.*' : '- *(none recorded)*');
    p();

    // unresolvable declarations landing on this node
    const unres = (xc.unresolvable_declarations || []).filter((u) => u.from === n.id || String(u.attachment_id || '').includes(n.id));
    if (unres.length) {
      p('**⚠ Declared but UNRESOLVABLE** — the declared target does not exist. This is the visible face of a');
      p('*known, owned coverage gap* (`INC-C1`), **not** a defect in this node. Do not close it by deleting the');
      p('declaration.');
      p();
      for (const u of unres) p(`- \`${u.finding_id}\` — declared → \`${u.to_node_declared}\` · **absent from all ${nodes.length} nodes** (NEU-943 re-verified by id, name and summary)`);
      p();
    }

    // Required by
    const deps = [...new Set(dependents.get(n.id) || [])].sort();
    p('**Required by**');
    p();
    if (deps.length) p(deps.map((d) => `\`${d}\``).join(', '));
    else p('*nothing — this is a leaf of the current map.*');
    p();

    if (n.role !== 'root') {
      // Stage / difficulty
      const d = dd(n);
      p('**Stage / difficulty** — NEU-940, `dimension_set_version ' + (d.dimension_set_version || '?') + '`');
      p();
      p('| Dimension | Value |');
      p('| --- | --- |');
      for (const k of Object.keys(d).sort()) p(`| \`${k}\` | ${typeof d[k] === 'object' ? esc(JSON.stringify(d[k])) : `\`${d[k]}\``} |`);
      p();
      if (d.creator_review === 'deferred-provisional') {
        p('*`creator_review: "deferred-provisional"` — the creator plausibility review did NOT run (charter');
        p('Assumption #11, creator unavailable). **These values ship PROVISIONAL with a named revision trigger.***');
        p('*See `../03_open-items-and-provisional-register.md` → deferred creator review.*');
        p();
      }
      // F-943-1 flags
      if (depthBad.has(n.id) || invByNode.has(n.id)) {
        p('**⚠ `F-943-1` (HIGH, OPEN) lands on this node — its stage/depth annotation is NOT trustworthy.**');
        p();
        const b = depthBad.get(n.id);
        if (b) {
          p(`- **Depth under-reports.** Declared \`prerequisite_depth: ${b.declared}\`; the graph, walked under`);
          p(`  NEU-940's own rubric, gives **${b.computed}**. NEU-940 computed against the **pre-NEU-939 graph** —`);
          p('  before the cross-cluster edges existed. **The declared value remains the recorded one** (correcting it');
          p('  is NEU-940\'s to do, not this package\'s); the rubric figure is quoted here as `F-943-1`\'s evidence,');
          p('  **not as a difficulty value to consume**. Treat the declared depth as **advisory**.');
        }
        for (const e of invByNode.get(n.id) || []) {
          p(`- **Stage inverts across a cluster boundary.** This node is \`${dd(n).progression_stage}\` but requires`);
          p(`  \`${e.to}\` at \`${dd(N.get(e.to)).progression_stage}\` — **a dependency that would be taught AFTER its own`);
          p('  prerequisite** if sequenced by stage. **Sequence from the graph, not the stage label.**');
        }
        p();
      }

      // JS
      const js = n.javascript_materiality || {};
      p('**JavaScript materiality** — NEU-941, `rule_version ' + (js.rule_version || '?') + '`');
      p();
      if (js.assessed === false || js.assessed == null) {
        p('- *not assessed*');
      } else if (js.material) {
        p(`- **MATERIAL**${js.severity ? ` · severity \`${js.severity}\`` : ''}${js.effects && js.effects.length ? ' · effects ' + js.effects.map((e) => code(typeof e === 'string' ? e : e.id || JSON.stringify(e))).join(', ') : ''}`);
        if (js.rationale) p(`- ${esc(js.rationale)}`);
      } else {
        p('- **JavaScript-neutral** (assessed, explicitly not material)');
        if (js.rationale) p(`- ${esc(js.rationale)}`);
      }
      if (js.mapper_note) p(`- *mapper note (preserved):* ${esc(js.mapper_note)}`);
      p();
      p('*`JS-U2` (inherited, open): **every performance verdict is directional, never quantified.** No');
      p('benchmark was run. Do not read a `performance` severity as a measured factor.*');
      p();

      // Coverage
      const cov = n.coverage || {};
      p('**Coverage** — node block (NEU-934–938); map-level verdict NEU-942');
      p();
      p(`- \`status: "${cov.status}"\`${cov.corpus_refs && cov.corpus_refs.length ? ' · `corpus_refs`: ' + cov.corpus_refs.map(code).join(', ') : ''}`);
      if (cov.status === 'unaudited') {
        p('- *`unaudited` is **accurate, not an omission**: NEU-942 adjudicated coverage at the **map** level (30');
        p('  disagreements, zero smoothed) and **wrote no node file** (its `AC-6-C`), so no node-level verdict was');
        p('  ever written back. The binding coverage verdict for this technique is "**in scope and mapped; the OUT-7');
        p('  sweep raised no gap against it**". Recorded as `INC-C7` in `../06_caps-and-incomplete-scope.md` —');
        p('  **not** invented here.*');
      }
      p();
      p('*`CAP-2` (inherited, open): Codeforces 403\'d. `corpus_refs` are **corpus-level only** — problem-level');
      p('ids are **unverified**. **Invent no problem-level citation.** Two mappers did, from memory, and withdrew');
      p('them; the withdrawals are upheld.*');
      p();
    }

    // Findings + status
    const findings = [];
    if (depthBad.has(n.id) || invByNode.has(n.id)) findings.push('`F-943-1` (HIGH, **open**) — see above');
    if (n.id === 'cl-1.judge-dp-applicability') findings.push('`F-943-2` (Low, **open**) — the map\'s `conceptual` skill type is union-complete but rests on **this single non-root node**. If this node is ever re-typed or removed, `conceptual` de-instantiates map-wide.');
    if (n.id === 'cl-4.divide-and-conquer-optimization') findings.push('`F-939-2` (**sharpened by NEU-943**) — the T3/T4 cluster-drift signal; this node is *also* an `F-943-1` inversion. **`F-939-2` and `F-943-1` are the same blindness in two annotations.**');
    if (n.role !== 'root' && dd(n).entry_gate) findings.push('`F-943-3` (Low, **open**) — `entry_gate` is a **deterministic function** of `progression_stage` (zero exceptions map-wide), so it carries **no independent information** and inherits `F-943-1`. Gates B and D are instantiated by no node.');
    if (unres.length) findings.push('`' + unres.map((u) => u.finding_id).join('`, `') + '` — unresolvable declaration(s), above. Confirmed **genuine coverage gaps** by NEU-943; owned by `INC-C1`.');
    p('**Audit findings**');
    p();
    if (findings.length) findings.forEach((f) => p(`- ${f}`));
    else p('- *none land on this node.*');
    p();

    p(`**Status** — \`${n.status}\` · adjudicated at map version \`${n.adjudicated_at_map_version}\` · owner \`${n.owner}\``);
    p();
    if (n.status === 'provisional') {
      p('*`provisional` = **recorded and usable but NOT BINDING**. It carries a named revision trigger, and a');
      p('consumer relying on it **must surface that reliance** (NEU-887 status discipline, inherited). The correct');
      p('default for a mapped node is `provisional` — that is the map\'s honesty, not a weakness. **Only the ledger');
      p('flips it.***');
      p();
    }
    if (n.notes) { p(`*Notes (verbatim from the owning mapper):* ${esc(n.notes)}`); p(); }
    p('---');
    p();
  }
}

// ---- anchors ----
p('## Registered boundary anchors — the non-DP half of the terminal floor');
p();
p(`\`boundary-register.yaml\` \`register_version: ${boundary.register_version}\` · **${anchorById.size} anchors** · NEU-933 \`D-S3\` — **settled**`);
p();
p('An anchor is a **NAMED, VERSIONED, UNDECOMPOSED** terminal. A chain that bottoms out here has');
p('**terminated legitimately** — it is not an unexplained jump and not a gap. Anchors sit at or above');
p('NEU-887\'s elementary-data-structures floor, which is out of scope for this charter.');
p();
p('| Anchor | Kind | Used by |');
p('| --- | --- | --- |');
for (const a of boundary.anchors) {
  const users = nodes.filter((n) => (anchorsOf.get(n.id) || []).includes(a.id)).map((n) => n.id);
  p(`| \`${a.id}\` | \`${a.kind}\` | ${users.length ? users.map(code).join(', ') : '*no dependent*'} |`);
}
p();
p('**The register is NOT asserted complete (`INC-S1`, open).** **6 `AR-1` anchor requests are filed and');
p('open** — Aho–Corasick, shortest-path relaxation, Lagrangian duality, (min,+) convolution,');
p('topological order, SCC condensation. **Their dependents are `provisional` for exactly that reason.**');
p('**Never invent an anchor**; file `AR-1`. See `../03_open-items-and-provisional-register.md`.');
p();
p('---');
p();
p('*End of generated view. Regenerate with `node docs/research/C005-dp-map-package/generator/build-cross-reference.mjs`.*');

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, '01_cross-reference-view.md'), L.join('\n') + '\n', 'utf8');
console.log(`wrote 01_cross-reference-view.md — ${nodes.length} node blocks, ${L.length} lines`);
console.log(`  F-943-1: ${depthBad.size} depth-flagged, ${invByNode.size} inversion-flagged nodes`);
