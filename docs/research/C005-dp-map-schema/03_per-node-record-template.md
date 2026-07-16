# The Per-Node Record Template

**Task:** NEU-933 · **Decision:** `D-S1` · **Compiled:** 2026-07-16 · **Status:** see `adjudication/01_schema-decision-ledger.md`

**Mappers (SUB-3/4/5/6/13): this is your working file. Copy the block in §1 and fill it in.** The reasoning behind the fields is `01_node-and-edge-schema.md`; you need it for the skill-type cascade (§3 there) and nothing else.

---

## 1. The template — copy this

```yaml
  - id: "cl-N.your-technique"            # <cluster>.<kebab-name>. Namespaced by CLUSTER, not by file.
    name: "Your Technique"               # Human name. Plain, not clever.
    node_kind: "knowledge"               # "knowledge" | "skill"  — REQUIRED, no default
    skill_type: "conceptual"             # REQUIRED iff node_kind=="skill"; MUST BE ABSENT otherwise.
                                         # Exactly one of: "conceptual" | "procedural" | "strategic" |
                                         # "implementation" | "proof" | "debugging" | "optimization" | "transfer"
    skill_type_rationale: >-             # REQUIRED on every skill node. State the CASCADE PATH, not just the answer.
      Cascade stops at S5: it is choosing the state under a correctness constraint.
      S1 no (no proof obligation), S2 no (no recurrence exists yet to accelerate),
      S3 no (no symptom), S4 no (the mapping is stated, not hidden).
    cluster: "CL-N"                      # Your cluster id. Never a sibling's.
    role: "technique"                    # "technique" for everything you write. "root" is SUB-2's, frozen.
    summary: >-
      One paragraph: what this node IS. What a learner acquires. Not how to teach it
      (SUB-7's), not how hard it is (SUB-7's), not whether it's covered (OUT-7's).

    prerequisites:
      # ---- ALL THREE ARE DRAWN DIRECTLY, BY YOU, RIGHT NOW ----
      intra_cluster: []                  # ["cl-N.other-node"] — targets in YOUR cluster.
      roots: []                          # ["cl-1.root.formulate-state-transition-base-case"]
                                         #   The frozen DP floor. DRAW straight onto it from any cluster.
                                         #   NOT a cross-cluster declaration. See §4.
      boundary_anchors: []               # ["anchor.modular-arithmetic@1.0.0"] — VERSION-PINNED.
                                         #   Sanctioned non-DP terminals. DRAW directly.
                                         #   Need one that isn't registered? Route AR-1. Never invent.

    # ---- DECLARED ONLY. YOU DO NOT DRAW THESE. SUB-12 DOES. ----
    cross_cluster_attachments: []        # See §3 for the full shape. The sibling's file does not
                                         # exist yet — you cannot see its ids. DECLARE, don't draw.

    difficulty_dimensions: {}            # LEAVE EMPTY. The dimension SET is unresolved — owner SUB-7 (OUT-3).
                                         # DO NOT INVENT DIMENSIONS. (INC-S3)
    javascript_materiality:
      assessed: false                    # LEAVE false. OUT-5 (SUB-8) owns the verdict.
      note: ""                           # OPTIONAL free-text OBSERVATION. Never a verdict.
    coverage:
      status: "unaudited"                # LEAVE "unaudited". OUT-7 owns this.
      corpus_refs: []                    # ["C1:1635"] — corpus ids from D-F2.
                                         # CAP-2: Codeforces (C4) ids are UNVERIFIED. Never assert one as verified.
    evidence_class: 1                    # NEU-887's seven-class taxonomy. 1 [literature] or 2 [code-evidence].
                                         # NEVER 7 — no class-7 evidence exists anywhere in C005.
    status: "provisional"                # "settled" | "provisional" | "unresolved"
                                         # DEFAULT IS "provisional". You MAY NOT write "settled" —
                                         # only the ledger promotes. See §5.
    adjudicated_at_map_version: "0.1.0"
    owner: "NEU-93X"                     # Your task id.

    # ---- OPTIONAL ----
    aliases: []                          # Other names for this technique. X-D2: naming is unstable across
                                         # references; record synonyms so OUT-7 doesn't read a naming
                                         # difference as a coverage gap.
    contested_by: []                     # ["CL-3"] — a rival cluster with a live claim. Carry it, don't smooth it.
    notes: ""                            # Anything that doesn't fit. Including an AR-1 anchor request in flight.
```

## 2. Field reference

| Field | Required | Owner of the VALUE | Notes |
| --- | --- | --- | --- |
| `id` | ✅ | you | `<cluster>.<kebab-name>`. Cluster-namespaced. Globally unique. |
| `name` | ✅ | you | |
| `node_kind` | ✅ | you | `"knowledge"` (something true) \| `"skill"` (something doable). |
| `skill_type` | ✅ iff skill | you | Exactly one of eight. **Absent** — not `null` — on knowledge nodes. |
| `skill_type_rationale` | ✅ iff skill | you | Must state the cascade path. "It's conceptual" is a review finding. |
| `cluster` | ✅ | fixed by `D-F4` | Yours. Never a sibling's. |
| `role` | ✅ | you | `"technique"`. `"root"` is frozen, SUB-2's. |
| `summary` | ✅ | you | What a learner acquires. |
| `prerequisites.intra_cluster` | ✅ (may be `[]`) | you | **DRAWN.** |
| `prerequisites.roots` | ✅ (may be `[]`) | you | **DRAWN.** |
| `prerequisites.boundary_anchors` | ✅ (may be `[]`) | you | **DRAWN.** Version-pinned. |
| `cross_cluster_attachments` | ✅ (may be `[]`) | you declare, **SUB-12 realizes** | **DECLARED ONLY.** |
| `difficulty_dimensions` | ✅ | **SUB-7** | `{}`. Don't invent. |
| `javascript_materiality` | ✅ | **SUB-8** | `assessed: false`. `note` is an observation. |
| `coverage` | ✅ | **OUT-7** | `"unaudited"`. |
| `evidence_class` | ✅ | you | 1 or 2. Never 7. |
| `status` | ✅ | **the ledger** | Default `"provisional"`. |
| `adjudicated_at_map_version` | ✅ | you | The `map_version` you authored under. |
| `owner` | ✅ | you | Your task id. |
| `aliases` | ○ | you | |
| `contested_by` | ○ | you | |
| `notes` | ○ | you | |

## 3. Declaring a cross-cluster prerequisite

**You are declaring an attachment point, not drawing an edge.** SUB-12 draws it later, once every cluster file exists.

```yaml
    cross_cluster_attachments:
      - attachment_id: "xc.cl-4.knuth-optimization->cl-2.interval-dp"   # xc.<from>-><to_node>
        from: "cl-4.knuth-optimization"    # ALWAYS your own node's id
        to_cluster: "CL-2"                 # REQUIRED — which sibling owns the target
        to_node: "cl-2.interval-dp"        # A PREDICTION. You cannot look this up.
        to_name: "Interval DP"             # REQUIRED — SUB-12's real resolution key
        relation: "requires"               # "requires" (you need it) | "required-by" (it needs you)
        rationale: >-
          Knuth's optimization accelerates the interval DP recurrence; a learner cannot
          acquire it without first being able to formulate that recurrence.
        confidence: "named"                # "named" | "conjectured"
        status: "declared"                 # the ONLY legal value in your file
```

**Why `to_node` is a guess and `to_name` is not optional.** The five mappers run **in parallel**. When you declare onto `cl-2.interval-dp`, SUB-4 has not written `cl-2-combinatorial.yaml` — there is no id to look up. You predict from the grammar. SUB-4 may name it `cl-2.interval-dp-optimal-bst` or something else entirely. So SUB-12 resolves on **`to_name` + `to_cluster` + `rationale`**, using `to_node` as a hint. **Write `to_name` as the plainest name for the thing, not your predicted id in prose.**

**Rules:**

- **Declare from your own side only.** Never declare on a sibling's behalf. A genuine mutual dependency surfaces as **two** declarations — correct, because that is a **cycle** and the audit must see it rather than have it merged away.
- **`confidence: "conjectured"`** is legitimate: you believe a target *should* exist but aren't sure it will be mapped. If it resolves to nothing, that is a **coverage finding for OUT-7**, not your error.
- **Unresolvable declarations are reported as gaps, never deleted.** Your declaration is evidence a dependency exists.
- **Never write `status: "realized"`.** That is SUB-12's, in `edges/cross-cluster.yaml`.

## 4. 🔴 Drawn vs declared — the distinction everything turns on

Three downstream clusters and the integration pass depend on you getting this right.

| Your prerequisite is… | Action | Field | Why |
| --- | --- | --- | --- |
| …in **your own cluster** | **DRAW** | `prerequisites.intra_cluster` | You own both ends. |
| …a **DP root** | **DRAW** | `prerequisites.roots` | Frozen floor. Exists before you start. |
| …a **registered non-DP anchor** | **DRAW** | `prerequisites.boundary_anchors` | Frozen floor. Exists before you start. **Sanctioned terminal, not a jump.** |
| …a **sibling cluster's node** | **DECLARE** | `cross_cluster_attachments` | Doesn't exist yet. You can't see its id. |

> **The rule in one line:** *draw an edge to anything that already exists; declare an attachment to anything that doesn't.*

**Worked, from the spec's own examples:**

- **SOS DP → modular/linear algebra.** A sanctioned non-DP prerequisite. **DRAW:** `boundary_anchors: ["anchor.modular-arithmetic@1.0.0", "anchor.linear-algebra@1.0.0"]`. These are in the shared floor from the start.
- **CHT → envelope geometry.** Same. **DRAW:** `boundary_anchors: ["anchor.convex-hull-envelope-geometry@1.0.0"]`.
- **Knuth optimization → the interval DP it accelerates.** A sibling cluster's node (CL-2). **DECLARE.** You are CL-4; SUB-4 hasn't written CL-2 yet.
- **Anything → `cl-1.root.formulate-state-transition-base-case`.** A root. **DRAW:** `roots: [...]` — even from CL-3 or CL-4. Roots carry `cl-1.` ids but are **not** a cross-cluster declaration; they're the frozen shared floor. (`01_node-and-edge-schema.md` §4.2.)

### ⛔ Never do these

1. **Never fake a cross-cluster or unregistered non-DP prerequisite as a `roots` edge** to make a chain bottom out. This launders a real dependency into a fake terminal and is **the single failure the floor audit exists to catch**.
2. **Never invent a boundary anchor.** The register is versioned and shared; a local anchor is invisible to every other mapper and to the audit. Run **route AR-1** (`boundary-register.yaml`): file a ledger request against `D-S3`, set the node `status: "provisional"`, record it in `notes`. Meanwhile the prerequisite stays visible.
3. **Never write into another cluster's file, and never touch `edges/cross-cluster.yaml` or `manifest.yaml`.** Four other mappers are writing concurrently; this is what makes that safe.
4. **Never silently drop a prerequisite you can't express.** Record it in `notes`, set `status: "provisional"`, file the ledger entry. A smoothed gap is forbidden — NEU-887 discipline, inherited.

## 5. Status — you almost always write `provisional`

**Status flips only in the adjudication ledger.** You may **not** promote your own node to `"settled"` by editing YAML.

| Write | When |
| --- | --- |
| `"provisional"` | **Your default.** A node you're confident about but no ledger entry has adjudicated. **Not a weakness** — the map's honesty depends on it. |
| `"provisional"` + ledger entry | Indeterminate skill type (Convention S → `D-S1a`), or a contested cluster assignment (`D-F4a`), or an AR-1 request in flight. |
| `"unresolved"` | A node you know must exist but cannot map. **Name an owner. Never invent a value to avoid this.** |
| `"settled"` | **Only** where a ledger entry says so. Today: the 8 roots, nothing else. |

## 6. Worked example — a complete, compliant node

Illustrative only. **Not a mapping decision** — SUB-6 owns whether this node exists and what it says. It exercises every field, including a drawn anchor edge, a drawn root edge, and a declared cross-cluster attachment.

```yaml
  - id: "cl-4.knuth-optimization"
    name: "Knuth / quadrangle-inequality optimization"
    node_kind: "skill"
    skill_type: "optimization"
    skill_type_rationale: >-
      Cascade stops at S2: it takes an already-correct interval DP recurrence and
      reduces its evaluation from O(n^3) to O(n^2) without changing what any state
      means. S1 no — proving the quadrangle inequality holds is a real obligation but
      it is a SEPARATE node (cl-4.quadrangle-inequality-proof, skill_type "proof");
      this node is the application, not the argument. Splitting them per schema §1.1
      rather than typing one node twice.
    cluster: "CL-4"
    role: "technique"
    summary: >-
      Exploit the quadrangle inequality to bound the optimal split point monotonically,
      collapsing an interval DP's inner search from linear to amortized constant. The
      recurrence is unchanged; only the cost of evaluating it moves.
    prerequisites:
      intra_cluster: []
      roots:
        - "cl-1.root.formulate-state-transition-base-case"
      boundary_anchors: []
    cross_cluster_attachments:
      - attachment_id: "xc.cl-4.knuth-optimization->cl-2.interval-dp"
        from: "cl-4.knuth-optimization"
        to_cluster: "CL-2"
        to_node: "cl-2.interval-dp"
        to_name: "Interval DP"
        relation: "requires"
        rationale: >-
          The optimization is parasitic on an interval DP that must already be correct.
          A learner cannot acquire it without first being able to formulate that
          recurrence. Per D-F4 §3.1 the base DP is CL-2's node and the optimization is
          CL-4's — two nodes, not one contested node.
        confidence: "named"
        status: "declared"
    difficulty_dimensions: {}
    javascript_materiality:
      assessed: false
      note: ""
    coverage:
      status: "unaudited"
      corpus_refs: []
    evidence_class: 1
    status: "provisional"
    adjudicated_at_map_version: "0.1.0"
    owner: "NEU-937"
    aliases: ["Knuth-Yao speedup", "quadrangle inequality optimization"]
```

**What this example demonstrates, deliberately:**

- **One technique, two nodes** — the *application* (`optimization`) and the *proof* that licenses it are separate, each typed once (§1.1).
- **The base DP is DECLARED, not drawn.** SUB-6 cannot see CL-2's ids; `to_name: "Interval DP"` is what SUB-12 resolves on.
- **The root edge is DRAWN** — straight from CL-4 onto a `cl-1.` root id. Not a declaration.
- **`status: "provisional"`**, because no ledger entry has adjudicated it.
- **`aliases`** carries `X-D2`'s naming instability so OUT-7 doesn't read a synonym as a gap.

## 7. Before you commit your file — self-check

| # | Check |
| --- | --- |
| 1 | Every node has `node_kind`. Every skill node has `skill_type` **and** `skill_type_rationale` stating a cascade path. No knowledge node has a `skill_type`. |
| 2 | Did you emit **one node per technique name**? If so, re-read §1.1 — you may have written a topic list. |
| 3 | Every prerequisite chain bottoms out on a **root** or a **registered anchor**. No chain just stops. |
| 4 | No `prerequisites.*` entry points at a **sibling cluster's** node. Those are `cross_cluster_attachments`. |
| 5 | No `roots` or `boundary_anchors` edge is a **disguised** cross-cluster or unregistered dependency. |
| 6 | Every `cross_cluster_attachments` entry has `to_name`, `to_cluster`, `rationale`, and `status: "declared"`. |
| 7 | Every `attachment_id` matches `xc.<from>-><to_node>`, and `from` is your own node's id. |
| 8 | `difficulty_dimensions` is `{}`. `javascript_materiality.assessed` is `false`. `coverage.status` is `"unaudited"`. |
| 9 | No node is `"settled"` without a ledger entry. No node carries `frozen: true`. |
| 10 | All string enums are **quoted** (`D-F3`'s YAML constraint — the Norway problem is real). |
| 11 | Ids match the grammar and are cluster-namespaced. **CL-4 mappers: you share a namespace with your sibling file.** |
| 12 | You wrote **only your own file**. |
