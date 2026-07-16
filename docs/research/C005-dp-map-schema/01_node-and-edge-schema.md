# The Knowledge-and-Skill Graph Schema

**Task:** NEU-933 · **Decisions:** `D-S1` (node/edge schema), `D-S4` (root-edge disposition) · **Compiled:** 2026-07-16 · **Status:** see `adjudication/01_schema-decision-ledger.md` — this file sets none

This file authors the **node and edge schema** inside the representation format NEU-932 fixed (`D-F3`). It resolves `D-F3a`, which NEU-932 left **unresolved by design** and assigned to this sub-task.

**What it is bound by** (NEU-932 `03_representation-format.md` §5, left column — not re-opened here): YAML as the node-data format; the file layout and per-cluster ownership; the manifest and `map_version` semver; that every node has a `status` field with three legal values; the markdown entry point. Plus `D-F3`'s live constraint: **quote all string enums, pin YAML 1.2**.

**What it makes no decision about:** any family mapping (SUB-3/4/5/6/13's), any progression (SUB-7's), any difficulty value or dimension (SUB-7's), any JavaScript-materiality verdict (SUB-8's), any coverage verdict (SUB-9…11's).

---

## 1. The map is a knowledge-and-skill graph, not a topic list

The charter's standing constraint is that **topic volume is never coverage**. A schema that only carried names and links would let a mapper satisfy every audit with a long list of technique names — the exact failure mode. So the schema **forces** two distinctions on every node, and a node that omits either is invalid rather than merely thin.

> **Every node declares `node_kind`: `"knowledge"` or `"skill"`.**
> **Every `skill` node declares `skill_type`: exactly one of eight.**

| `node_kind` | What it asserts | Test |
| --- | --- | --- |
| `"knowledge"` | Something that is **true** and can be understood — a property, a definition, a fact, a relationship. | Can it be *stated*? Is it true or false independent of anyone's ability? |
| `"skill"` | Something a learner can **do** — an ability that is exercised, succeeds or fails, and improves with practice. | Can someone be *good or bad at it*? Can it be assessed by watching someone attempt it? |

The distinction is enforced structurally, not by convention:

- `skill_type` is **required** when `node_kind: "skill"`.
- `skill_type` **must be absent** when `node_kind: "knowledge"`. Not `null`, not `"none"` — **absent**. A knowledge node carrying a skill type is a validation error, because it means the mapper did not make the distinction.

### 1.1 One technique is usually several nodes — this is the thing mappers get wrong most

A technique like "bitmask DP" is **not one node**. Knowing what a bitmask state *is*, recognizing that a problem wants one, writing the subset-iteration loop correctly, and proving the transition covers every subset exactly once are **four different things a learner acquires separately and fails separately**.

> **Rule.** `skill_type` is single-valued and mandatory. If a technique needs conceptual understanding *and* implementation facility *and* strategic recognition, that is **three skill nodes**, each typed once — not one node with three types and not one node typed by whichever felt most important.

This is the same move NEU-932 `D-F4` §3.2 already makes at the cluster level: *"LIS in O(n²) is CL-1; LIS in O(n log n) is CL-4. Same problem, different node."* The schema applies that principle one level down. **A mapper that emits exactly one node per technique name has produced a topic list wearing a graph's clothes**, and the schema is built so that this is visible rather than hidden.

The roots demonstrate it: each of the four DP first principles is **two** nodes — the knowledge and the skill it licenses (`nodes/cl-1-foundational.yaml`).

## 2. The eight skill types

Every skill node is typed as **exactly one** of these. The vocabulary is closed: eight values, no others, no extension without a ledger challenge against `D-S1`.

| Id | Type | The defining contribution | Not this if… |
| --- | --- | --- | --- |
| S1 | `"proof"` | Establishing that a DP is **correct or optimal** by argument — exchange arguments, induction on the state order, quadrangle-inequality conditions, correctness of a greedy tie-break. | You are checking a property by judgment rather than arguing it (→ `conceptual`). |
| S2 | `"optimization"` | Reducing the **cost** of an already-correct DP without changing what its states mean. | The DP does not exist yet (→ `strategic`), or you are making it *run* rather than *run faster* (→ `implementation`). |
| S3 | `"debugging"` | Diagnosing a **wrong or too-slow** DP from its symptoms — wrong answer on a case, TLE, MLE, stack overflow — back to its cause. | You are choosing a technique up front rather than diagnosing a failure (→ `strategic`). |
| S4 | `"transfer"` | Recognizing that a known technique applies to a problem that **looks unrelated** — seeing the DP under an unfamiliar surface. | The mapping is obvious from the statement (→ `strategic`). |
| S5 | `"strategic"` | **Choosing** — which formulation, which state, which technique — under a correctness or cost constraint. Problem statement → the decision about how to attack it. | You are executing a choice already made (→ `implementation`/`procedural`). |
| S6 | `"implementation"` | Turning a **chosen** formulation into working code — memory layout, iteration order, in-place tricks, language-specific realities. | The routine is fixed and mechanical (→ `procedural`). |
| S7 | `"procedural"` | Executing a **fixed, known routine** step by step, where the steps do not vary with the problem. | Any step requires a judgment about *this* problem (→ `implementation`). |
| S8 | `"conceptual"` | Understanding what something **means** — well enough to explain it, recognize it, or judge whether a property holds. | Any of S1–S7 fired. **S8 is the confident residual, never the sink** (§3.1). |

### 2.1 The two boundaries that will actually bite

Recorded explicitly because they are where mappers will disagree with each other, and consistency across five parallel mappers is the whole point of a shared vocabulary.

**`optimization` (S2) vs `strategic` (S5) — the CL-4 boundary.** S2 presupposes a **correct recurrence already exists**. If the learner is still deciding what the state is, nothing exists to optimize and the skill is S5. This is the same test NEU-932's partition cascade runs at T1 (CL-4), one level down — and it is deliberately the same test, so a CL-4 node's skill typing and its cluster assignment agree by construction rather than by coincidence.

**`implementation` (S6) vs `procedural` (S7).** The line is **whether a step requires a judgment about this specific problem**. Writing a bottom-up loop requires choosing an evaluation order that respects *this* recurrence's dependencies → S6. Iterating submasks with `for (int s = m; s; s = (s-1) & m)` is a fixed idiom that does not vary → S7. When in doubt the cascade order (§3) sends it to S6, because S7 is the stronger, more falsifiable claim: it asserts *nothing* varies.

## 3. The skill-type cascade — ordered, first-match-wins

A mandatory single-valued type needs a tiebreak, because real skills answer several tests. This mirrors NEU-932 `D-F4` §3's partition cascade deliberately: **the ordering is the disjointness argument**, and reusing a pattern the mappers have already internalized costs nothing and buys consistency.

> **Ask, in order. The first test that answers "yes" types the node. Stop there.**
>
> 1. **S1 `proof`** — Is the contribution *arguing* correctness or optimality?
> 2. **S2 `optimization`** — Does it take an already-correct DP and reduce its cost?
> 3. **S3 `debugging`** — Does it start from a *symptom* of a broken or slow DP?
> 4. **S4 `transfer`** — Does it recognize a known technique under an unfamiliar surface?
> 5. **S5 `strategic`** — Is it *choosing* the formulation, state, or technique?
> 6. **S6 `implementation`** — Is it realizing a chosen formulation as code?
> 7. **S7 `procedural`** — Is it executing a fixed routine whose steps don't vary?
> 8. **S8 `conceptual`** — Otherwise: understanding what it *means*.

Why this order: **most-specific claim first**. `proof` and `optimization` both presuppose a correct DP already exists — the strongest precondition available, so they cannot be residuals. `debugging` and `transfer` presuppose a specific trigger (a symptom; an unfamiliar surface). `strategic` → `implementation` → `procedural` runs down the pipeline from deciding to doing to executing. `conceptual` is last because "understanding what it means" is true of *almost every* skill node in a weak sense, and a test that is almost always true must never be asked first.

### 3.1 `conceptual` is the confident residual — and there is no sink

NEU-932 `04_…` §4.1 makes the case that a rule's **residual** and a fallback's **sink** are different jobs and must not be the same bucket, or the residual rots into "miscellaneous". That argument applies here unchanged, and this schema takes the lesson:

- **S8 `conceptual` is reached only on a confident "no" to S1–S7.** It is not the dumping ground for skills nobody could type.
- **There is no sink type**, deliberately. A mapper facing a genuinely indeterminate skill does **not** park it in `conceptual`.

> **Convention S.** A skill node whose type cannot be confidently determined is typed with the **best candidate from the cascade** — the type is mandatory, so it is always assigned — and simultaneously:
> - `status: "provisional"`,
> - `skill_type_rationale` states *why* it is indeterminate and names the rival type,
> - a `D-S1a` entry is filed in the ledger with a **named re-adjudication trigger**.
>
> **It is never silent, so drift is always countable.** This is NEU-932's `D-F4a`/U2 discipline applied to skill typing, inherited rather than re-derived.

**The honest cost, recorded rather than hidden:** `conceptual` will still attract the odd node, because "understanding what it means" is genuinely hard to falsify. The mitigation is `skill_type_rationale`, which is **required on every skill node** and must state the cascade path taken — not just the answer. A rationale reading "it's conceptual" with no rejected tests is a review finding. If `D-S1a` entries exceed **10** at the coverage audit, that signals the cascade needs revision rather than the residual absorbing drift — recorded as a revision trigger on `D-S1`, mirroring `D-F4`'s `>10 U2` trigger.

## 4. Prerequisite-edge semantics

> **A prerequisite edge from A to B asserts: a learner cannot acquire A without first having B.**

**Edges may cross `knowledge` and `skill` freely, in both directions.** This is required, not merely permitted, and it is the whole reason the two node kinds are worth distinguishing:

- skill → knowledge: `recognize-optimal-substructure` requires `optimal-substructure`.
- knowledge → skill: understanding *why* Knuth's optimization applies can require being able to *formulate* the interval DP first.
- skill → skill: `implement-memoization-and-tabulation` requires `formulate-state-transition-base-case`.
- knowledge → knowledge: `memoization-vs-tabulation` requires `state-transition-base-case-formulation`.

No field constrains an edge by node kind. A schema that forbade knowledge→skill would force mappers to launder real dependencies, which is exactly what this map exists to prevent.

**Edges are directed and the graph must be acyclic.** The dependency/cycle audit (OUT-2) owns cycle detection; this schema owns only the assertion that a cycle is a **defect**, since "A requires B requires A" is not a learnable order. A mapper that finds a cycle files it — it does not break the cycle by deleting an edge it likes least.

### 4.1 The four fields — three DRAWN, one DECLARED

**This is the distinction three downstream clusters and the integration pass depend on.**

| Field | Target | Disposition | Why |
| --- | --- | --- | --- |
| `prerequisites.intra_cluster` | A node in the mapper's **own cluster** | **DRAWN** | The mapper owns both endpoints and can see both ids. |
| `prerequisites.roots` | A **frozen root** node | **DRAWN** | The root set exists, frozen, before any mapper starts. |
| `prerequisites.boundary_anchors` | A **registered anchor** | **DRAWN** | The register exists, frozen, before any mapper starts. A **sanctioned terminal**, not a jump. |
| `cross_cluster_attachments` | A **sibling cluster's node** | **DECLARED ONLY** | The sibling's file **does not exist yet**. The mapper cannot see its ids. |

> **The rule in one line:** *you may draw an edge to anything that already exists; you may only declare an attachment to something that doesn't.*

That is the actual principle, and it explains every row. Anchors and roots are drawn because they are a **shared frozen floor present from the start**. A sibling's node is declared because the five mappers **run concurrently** — when SUB-6 wants to link Knuth's optimization to the interval DP it accelerates, SUB-4 has not written `cl-2-combinatorial.yaml` yet. There is no id to point at. SUB-12 exists precisely to resolve those declarations once all five files exist.

**Prohibited, explicitly:** faking a cross-cluster or unregistered non-DP prerequisite as a `roots` or `boundary_anchors` edge to make a chain bottom out. This launders a real dependency into a fake terminal, and it is the single failure the floor audit exists to catch. If you need an anchor that isn't registered, run route `AR-1` (`boundary-register.yaml`); if you need a sibling's node, declare it.

### 4.2 `D-S4` — why root edges are DRAWN even though roots live in CL-1

**This is the one place this schema refines NEU-932's rules rather than simply obeying them, so it is recorded loudly rather than slipped in.**

The roots live in `nodes/cl-1-foundational.yaml` and carry `cl-1.` ids. So an edge `cl-3.plug-dp → cl-1.root.formulate-state-transition-base-case` **spans two clusters**, and NEU-932 `03_…` §4 rule 4 reads, literally: *"Edges whose endpoints span clusters go in `edges/cross-cluster.yaml`."* Read literally, every root edge in CL-2/CL-3/CL-4 would be a declaration for SUB-12 to resolve.

**That reading is rejected. Root edges are DRAWN directly, by every mapper, from its own file.**

The argument is about **what rule 4 is for**, not about its wording:

1. **Rule 4 solves a visibility problem.** SUB-12 exists because parallel mappers cannot see each other's nodes. That is the entire content of the constraint — resolve references to things that didn't exist when they were referenced. **Roots do exist**, frozen, authored before any mapper starts, with stable published ids. There is nothing to resolve. Routing them through SUB-12 would be ceremony that buys zero coordination.
2. **The floor would not exist until integration.** The acceptance bar says *"when a mapping sub-task attaches a prerequisite chain downward, then it terminates on a root or a registered anchor"* — at **map time**. If root edges were declarations, no chain would bottom out until SUB-12 ran, and the floor audit could not run on the mappers' own output. **The floor must be reachable while mapping, or it isn't a floor.**
3. **It breaks no file ownership.** The edge is written in the **depending node's own file**, pointing at a frozen id. CL-3's mapper writes only `cl-3-state-compression.yaml`. Nobody touches CL-1's file. Rule 1 (*"a sub-task writes only its own file"*) holds exactly.
4. **It is symmetric with anchors.** Anchors are unambiguously drawn — the spec says so directly. Roots have identical mechanics: shared, frozen, present from the start, published ids. Treating two identical situations differently because one happens to carry a cluster prefix would be arbitrary.

**The honest cost, recorded rather than hidden:** a naive audit that classifies edges by *endpoint span* will see root edges as cross-cluster edges that SUB-12 failed to draw, and will report false positives. Two mitigations, both live: `edges/cross-cluster.yaml` **R5** warns SUB-12 not to re-draw them (re-drawing would **duplicate every floor edge** and corrupt the dependency and path audits), and `manifest.yaml`'s `edge_disposition` block states the classification in machine-readable form so an audit can classify by **field** — `prerequisites.roots` vs `cross_cluster_attachments` — rather than by endpoint span. **Classify by field, not by span.**

**If NEU-932's author disagrees, the route is a ledger challenge against `D-S4`, not a local redesign** — five sub-tasks are scoped to this. Logged as a carried item (`X-S1`) so the refinement is visible to the audits rather than discovered by them.

### 4.3 The attachment-point naming convention — all five mappers must follow it exactly

**SUB-12 cannot resolve declarations into edges unless every mapper names them the same way.** This is the highest-coordination-cost field in the schema, so the convention is mechanical.

```yaml
cross_cluster_attachments:
  - attachment_id: "xc.cl-4.knuth-optimization->cl-2.interval-dp"
    from: "cl-4.knuth-optimization"   # ALWAYS this node's own id
    to_cluster: "CL-2"                # REQUIRED — which sibling cluster owns the target
    to_node: "cl-2.interval-dp"       # BEST-KNOWN id — a PREDICTION, may be wrong
    to_name: "Interval DP"            # REQUIRED — the human name. SUB-12's real key.
    relation: "requires"              # "requires" | "required-by"
    rationale: "Knuth's optimization accelerates the interval DP recurrence; a learner cannot acquire it without first being able to formulate that recurrence."
    confidence: "named"               # "named" | "conjectured"
    status: "declared"                # ONLY legal value at map time
```

**`attachment_id` grammar** — deterministic, so two mappers cannot mint different ids for the same intent:

```
xc.<from-node-id>-><to-node-id>
```

Lowercase, kebab-case, no spaces. `xc.` prefix marks it as a cross-cluster declaration on sight.

**Field rules the mappers must internalize:**

- **`to_node` is a PREDICTION, not a lookup.** You cannot see the sibling's file — it does not exist yet. Predict the id from the grammar (`<cluster>.<kebab-name>`) and accept it may be wrong.
- **`to_name` is what SUB-12 actually resolves on**, together with `to_cluster` and `rationale`. It is **required** and must be the plainest name for the target. An exact-id-match-only resolver would silently drop real dependencies; `to_name` is the fallback that prevents that.
- **`relation: "requires"`** means *this node requires the target*. `"required-by"` means the reverse. Declare from **your own side only** — do not declare on a sibling's behalf. A genuine mutual dependency therefore surfaces as two declarations, which is correct: it is a **cycle**, and the audit must see it rather than have it merged away.
- **`confidence: "named"`** = you are confident the target exists or will. **`"conjectured"`** = you believe a target *should* exist but aren't sure the sibling will map it. Both are legitimate; `"conjectured"` that resolves to nothing is a **coverage finding for OUT-7**, not a mapper's error.
- **`status: "declared"`** is the only legal value at map time. SUB-12 writes `"realized"` in `edges/cross-cluster.yaml` — **never back in your file**.

**An unresolvable declaration is a GAP, reported with its `attachment_id` — never deleted** (`edges/cross-cluster.yaml` R2). A mapper's declaration is *evidence that a dependency exists*; failure to find the target is a finding about the **map**, not about the declaration. This is NEU-887's "gaps are recorded, never smoothed", inherited.

## 5. Field reference

The complete per-node field list is in `03_per-node-record-template.md`, with a copy-paste template. Summary of **required on every node**:

`id` · `name` · `node_kind` · `skill_type` (iff skill) · `cluster` · `role` · `summary` · `prerequisites.intra_cluster` · `prerequisites.roots` · `prerequisites.boundary_anchors` · `cross_cluster_attachments` · `difficulty_dimensions` · `javascript_materiality` · `coverage` · `evidence_class` · `status` · `adjudicated_at_map_version` · `owner`

### 5.1 Id grammar

| Kind | Grammar | Example |
| --- | --- | --- |
| Technique node | `<cluster-lowercase>.<kebab-name>` | `cl-3.plug-dp` |
| Root node | `cl-1.root.<kebab-name>` | `cl-1.root.optimal-substructure` |
| Boundary anchor | `anchor.<kebab-name>` | `anchor.li-chao-tree` |
| Anchor **reference** (in an edge) | `anchor.<kebab-name>@<version>` | `anchor.modular-arithmetic@1.0.0` |
| Cross-cluster attachment | `xc.<from-id>-><to-id>` | `xc.cl-4.knuth-optimization->cl-2.interval-dp` |

Node ids are **namespaced by cluster, not by file** (NEU-932 `03_…` §4 rule 5), so two mappers cannot mint colliding ids without touching each other's files. **CL-4's two files share one namespace** — SUB-6 and SUB-13 must not collide; a collision is a dependency-audit finding.

Anchor references are **version-pinned** (`@1.0.0`). An anchor's scope changing is a MAJOR bump of `register_version` because every dependent's terminal shifts meaning — the pin is what makes that detectable rather than silent.

### 5.2 Fields whose VALUES belong to other sub-tasks

The schema fixes the **shape**; these sub-tasks fix the contents. **Mappers must not invent values here** — NEU-887's `unresolved` discipline: *a consumer must not invent a value.*

| Field | Shape | Owner | Mapper writes |
| --- | --- | --- | --- |
| `difficulty_dimensions` | `map<string, string\|number\|null>` | **SUB-7 (OUT-3)** | `{}` — the dimension **set itself is unresolved** (`INC-S3`). Do not invent dimensions. |
| `javascript_materiality.assessed` | `bool` | **SUB-8 (OUT-5)** | `false` |
| `javascript_materiality.note` | `string` | mapper | A free-text **observation**, never a verdict. |
| `coverage.status` | `"unaudited"\|"covered"\|"partial"\|"gap"` | **SUB-9…11 (OUT-7)** | `"unaudited"` |
| `coverage.corpus_refs` | `list<string>` | mapper | Corpus ids from `D-F2`. **`CAP-2`: Codeforces ids are unverified — never assert one as verified.** |
| `status` | `"settled"\|"provisional"\|"unresolved"` | **the ledger** | See below. |

### 5.3 `status` — the field a mapper may not simply choose

**Status flips only in the adjudication ledger** (NEU-887 discipline, inherited via NEU-932 `D-F3` §6). A mapper **may not** promote its own node to `settled` by editing YAML.

In practice, a mapper writes:

- **`"provisional"`** for a node it is confident about but which no ledger entry has adjudicated. **This is the correct default for essentially every mapped node**, and it is not a weakness — the map's honesty depends on it.
- **`"provisional"` + a `D-S1a` ledger entry** for a node with an indeterminate skill type (Convention S) or a contested cluster assignment (`D-F4a`).
- **`"unresolved"`** for a node it knows must exist but cannot map — with an owner named. **Never invent a value to avoid this.**
- **`"settled"`** only where a ledger entry says so. Today that is the 8 roots and nothing else.

`adjudicated_at_map_version` records the `map_version` at which `status` was last adjudicated, so a reader can tell settled-and-current from settled-long-ago-under-an-older-schema.

## 6. Validation

The schema is **specified here in prose and by the worked roots**, and the JSON Schema that mechanically validates it is **not written** — recorded as `INC-S2`, with an owner, rather than implied.

Honest reasoning: NEU-932 `D-F3` §5 assigns SUB-2 "the generator itself, and the JSON Schema that validates the YAML", and the deferral is a real deviation from that grant, so it is logged rather than quiet. It is deferred because a validator over **zero technique nodes** validates nothing — it would be tested only against the specimens that authored it, which is the weakest possible evidence. The five mappers' output is the first input that could actually falsify it. The coverage audit (OUT-7) is the first consumer that needs mechanical validation and is where the validator, the generator, and the index-freshness assertion naturally land together.

**What holds the line until then:** the frozen roots are a working, copy-able specimen of every field (`nodes/cl-1-foundational.yaml`); the template is copy-paste (`03_per-node-record-template.md`); and the dry-run (`dry-run/00_schema-usability-dry-run.md`) desk-checks a cold mapper against them. This is class-1/2 evidence about the schema's **expressiveness** — **not** evidence that a real agent used it correctly. That gap is `INC-D1`, inherited from NEU-932 and carried undiminished.

**The checks a validator must eventually enforce**, stated now so the deferral loses nothing:

| Check | Condition |
| --- | --- |
| **V-1** | `node_kind` ∈ {`knowledge`, `skill`}. |
| **V-2** | `skill_type` present **iff** `node_kind == "skill"`; and ∈ the eight. |
| **V-3** | `skill_type_rationale` present on every skill node and names its cascade path. |
| **V-4** | Every `prerequisites.roots` target has `role: "root"`. |
| **V-5** | Every `prerequisites.boundary_anchors` target resolves in `boundary-register.yaml` at the pinned version. |
| **V-6** | Every `prerequisites.intra_cluster` target is in the **same** cluster. |
| **V-7** | No `prerequisites.*` target is in a **different, non-root** cluster (that would be a drawn cross-cluster edge — prohibited). |
| **V-8** | Every `cross_cluster_attachments.to_cluster` is a sibling cluster, never the node's own. |
| **V-9** | `attachment_id` matches `xc.<from>-><to_node>` and `from` == the node's own `id`. |
| **V-10** | `cross_cluster_attachments.status == "declared"` in any node file. |
| **V-11** | `status` ∈ the three; `settled` only where the ledger says so. |
| **V-12** | `adjudicated_at_map_version` present and ≤ manifest `map_version`. |
| **V-13** | `difficulty_dimensions == {}` until SUB-7 lands. |
| **V-14** | Ids match the §5.1 grammar and are globally unique. |
| **V-15** | All string enums are **quoted** (`D-F3`'s YAML constraint). |
| **V-16** | `len(manifest.clusters) == 4` **and** `== manifest.cluster_count`. Node **files** number 5; that is not the cluster count. |
| **V-17** | No node in a mapper's file carries `frozen: true` except the roots. |
| **V-18** | The graph is acyclic (OUT-2 owns detection; this asserts a cycle is a defect). |
