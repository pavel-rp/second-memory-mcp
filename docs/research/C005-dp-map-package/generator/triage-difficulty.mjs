#!/usr/bin/env node
// Triage for the creator review of the map's provisional difficulty values.
//
// The review set is 179 non-root nodes × six provisional dimensions, all carrying
// `creator_review: "deferred-provisional"`. Reviewing every value is not a realistic ask, and
// most values carry no signal that anything is wrong. This narrows the set two ways:
//
//   1. It proves which dimensions are DERIVED and therefore carry no judgement to review.
//   2. It ranks the remaining nodes by internal inconsistency, so the creator reads the ones
//      the map contradicts itself about rather than reading all of them.
//
// It decides nothing. Every output is a question for the creator, and a node this script does
// not flag is NOT thereby confirmed — see the "what this does not do" note at the end of output.
//
// Usage:  node docs/research/C005-dp-map-package/generator/triage-difficulty.mjs
//         node .../triage-difficulty.mjs --json

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const MAP = resolve(HERE, '../../C005-dp-map/nodes');

const FILES = [
  'cl-1-foundational.yaml',
  'cl-2-combinatorial.yaml',
  'cl-3-state-compression.yaml',
  'cl-4-optimization/mainstream.yaml',
  'cl-4-optimization/frontier.yaml',
];

const LOADS = [
  'state_formulation_load',
  'transition_derivation_load',
  'proof_obligation_load',
  'implementation_load',
  'recognition_load',
];

// --- parse -----------------------------------------------------------------
// The node files are a regular subset of YAML: a top-level sequence of two-space-indented
// mappings. A dependency-free line parser is used deliberately — this script must run in a
// checkout with no install step, exactly like build-cross-reference.mjs beside it.

function parseNodes(file) {
  const lines = readFileSync(resolve(MAP, file), 'utf8').split('\n');
  const out = [];
  let cur = null;
  let section = null;

  for (const raw of lines) {
    const id = raw.match(/^ {2}- id:\s*"([^"]+)"/);
    if (id) {
      if (cur) out.push(cur);
      cur = { id: id[1], file, prereqs: [], dims: {} };
      section = null;
      continue;
    }
    if (!cur) continue;

    const key = raw.match(/^ {4}(\w+):\s*(.*)$/);
    if (key) {
      section = ['difficulty_dimensions', 'prerequisites'].includes(key[1]) ? key[1] : null;
      if (!section) {
        const v = key[2].replace(/\s*#.*$/, '').trim().replace(/^"|"$/g, '');
        if (['name', 'node_kind', 'cluster', 'role', 'skill_type'].includes(key[1])) cur[key[1]] = v;
      }
      continue;
    }

    if (section === 'difficulty_dimensions') {
      const d = raw.match(/^ {6}(\w+):\s*(.*)$/);
      if (d) {
        const v = d[2].replace(/\s*#.*$/, '').trim().replace(/^"|"$/g, '');
        cur.dims[d[1]] = /^-?\d+$/.test(v) ? Number(v) : v;
      }
    } else if (section === 'prerequisites') {
      const item = raw.match(/^ {8}- "([^"]+)"/);
      if (item) cur.prereqs.push(item[1]);
      const inline = raw.match(/^ {6}\w+:\s*\[(.+)\]/);
      if (inline) for (const m of inline[1].matchAll(/"([^"]+)"/g)) cur.prereqs.push(m[1]);
    }
  }
  if (cur) out.push(cur);
  return out;
}

const all = FILES.flatMap(parseNodes);
const nodes = all.filter((n) => n.dims.creator_review);
const by = Object.fromEntries(nodes.map((n) => [n.id, n]));
const vec = (n) => LOADS.map((d) => n.dims[d]);
const total = (n) => vec(n).reduce((a, b) => a + b, 0);
const kind = (n) => n.skill_type || n.node_kind;

// --- part 1: which dimensions are derived? ---------------------------------
// `prerequisite_depth` is class MD — machine-derived, and explicitly NOT part of the creator
// review (it routes to the integrity validator). Any dimension that is a function of it is
// therefore also not a judgement, whatever class it is filed under.

const derived = [];
const stageExceptions = nodes.filter((n) => n.dims.progression_stage !== `PS-${Math.min(n.dims.prerequisite_depth, 4)}`);
const gateExceptions = nodes.filter((n) => n.dims.entry_gate !== (n.dims.prerequisite_depth === 1 ? 'gate-a' : 'gate-c'));
if (!stageExceptions.length) derived.push(['progression_stage', 'PS-min(prerequisite_depth, 4)']);
if (!gateExceptions.length) derived.push(['entry_gate', 'prerequisite_depth === 1 ? gate-a : gate-c']);

// --- part 2: rank the load vectors by internal inconsistency ---------------

const flags = [];
const suppressed = [];
const flag = (n, rule, detail, weight) => flags.push({ n, rule, detail, weight });

// A node is compared only against prerequisites of the SAME skill type. An `implementation`
// node rated lighter than the `strategic` node that formulates what it implements is expected,
// not anomalous; folding those in buries the real signal under a structural artifact.
for (const n of nodes) {
  for (const p of n.prereqs) {
    const pre = by[p];
    if (!pre) continue;
    const a = vec(n);
    const b = vec(pre);
    const dominated = a.every((v, i) => v <= b[i]) && a.some((v, i) => v < b[i]);
    const drop = total(pre) - total(n);
    if (!dominated && drop < 3) continue;
    if (kind(n) !== kind(pre)) {
      suppressed.push({ id: n.id, from: `${kind(pre)} -> ${kind(n)}`, drop });
      continue;
    }
    if (dominated) flag(n, 'easier-than-prerequisite', `[${a}] ≤ ${p} [${b}]`, 5);
    else flag(n, 'aggregate-inversion', `total ${total(n)} vs ${p} total ${total(pre)} (−${drop})`, 3);
  }
}

const cohorts = {};
for (const n of nodes) (cohorts[`${n.cluster}/${kind(n)}`] ??= []).push(n);
for (const [name, group] of Object.entries(cohorts)) {
  if (group.length < 5) continue;
  const sorted = group.map(total).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  for (const n of group) {
    const d = Math.abs(total(n) - median);
    if (d >= 5) flag(n, 'cohort-outlier', `total ${total(n)} vs ${name} median ${median} (${total(n) > median ? '+' : '−'}${d}, n=${group.length})`, 3);
  }
}

const ranked = Object.values(
  flags.reduce((acc, f) => {
    const e = (acc[f.n.id] ??= { id: f.n.id, name: f.n.name, kind: kind(f.n), cluster: f.n.cluster, vec: vec(f.n), total: total(f.n), score: 0, reasons: [] });
    e.score += f.weight;
    e.reasons.push(`${f.rule} — ${f.detail}`);
    return acc;
  }, {})
).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

// --- output ----------------------------------------------------------------

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ derived, ranked, suppressed, reviewed: nodes.length }, null, 2));
} else {
  console.log(`nodes carrying creator_review: ${nodes.length}\n`);
  console.log('DERIVED DIMENSIONS — no judgement to review, one rule decision each:');
  for (const [dim, rule] of derived) console.log(`  ${dim} === ${rule}   (${nodes.length}/${nodes.length}, no exceptions)`);
  if (stageExceptions.length) console.log(`  progression_stage: ${stageExceptions.length} exceptions — identity does NOT hold, review it as a judgement`);
  console.log(`\nFLAGGED FOR REVIEW: ${ranked.length} of ${nodes.length}\n`);
  ranked.forEach((r, i) => {
    console.log(`${String(i + 1).padStart(2)}. [${r.score}] ${r.id}`);
    console.log(`      ${r.kind}, ${r.cluster}, [${r.vec}] total ${r.total}`);
    r.reasons.forEach((x) => console.log(`      · ${x}`));
  });
  console.log(`\nSUPPRESSED: ${suppressed.length} cross-skill-type inversions, structurally expected.`);
  console.log('Listed under --json rather than dropped — a suppression nobody can see is a silent cap.');
  console.log('\nAn unflagged node is NOT a confirmed node. This finds values the map contradicts');
  console.log('itself about; it cannot find a value that is uniformly and consistently wrong.');
}
