# Method and Scope

**Task:** NEU-933 · **Compiled:** 2026-07-16

How this package was made, what it inherited, what it decided, and — the part that matters most for a reader deciding whether to trust it — **what it deliberately did not attempt**.

---

## 1. What this sub-task was asked for

Three deliverables, from the NEU-933 spec (covering charter outcomes **OUT-1** and **OUT-2**):

1. **(a)** A graph schema in NEU-932's representation format, distinguishing knowledge from skill nodes, typing every skill node as exactly one of eight named skill types, with prerequisite-edge semantics free across knowledge/skill.
2. **(b)** The **terminal floor**: the explicit DP first-principle root nodes **and** a versioned assumed-knowledge boundary register naming the sanctioned non-DP anchors.
3. **(c)** NEU-887's traceability register and adjudication ledger **extended** — never re-derived — to the DP map, plus **(d)** the per-node record template, and the adjudication skeleton SUB-11 later drives.

**This is scaffolding, not content.** It maps no DP.

## 2. The inherited stack

NEU-933 is the **fourth** package in C005 and the **third** to extend NEU-887. It invents no new extension style.

| Package | Supplies | NEU-933's use |
| --- | --- | --- |
| **NEU-887** `../C005-product-foundation/` | Seven-class evidence taxonomy, materiality rule, traceability register, adjudication ledger, status discipline, the elementary-data-structures floor | **Extended by reference.** `04_register-extension.md` makes the boundary auditable. |
| **NEU-888** `../C005-instructional-model/` | Instructional and mastery semantics | **Consumed, not re-derived.** NEU-933 makes no mastery or progression claim. |
| **NEU-932** `../C005-dp-map-foundations/` | `D-F1`…`D-F5`: taxonomies, corpora, the representation format, the four-cluster partition | **Binding.** Consumed as given. `D-F3a` — the node schema — was left unresolved **by design** and assigned here. |

**The single most important inherited fact:** NEU-932 fixed the **container**; NEU-933 fixes the **contents**. That line is `03_representation-format.md` §5, and NEU-933 stays on its side of it.

## 3. Method

1. **Read the binding decisions first.** NEU-932's `D-F3` (format, layout, per-cluster ownership, versioning, YAML constraints) and `D-F4` (four clusters, the ordered cascade, Convention U) before authoring anything. The `D-F3a` grant defines the freedom available.
2. **Author the schema against the charter's forced distinctions** — knowledge/skill, eight skill types, edges free across both — rather than against what would be convenient to write.
3. **Author the floor**, both limbs: the roots as the schema's own worked specimen, and the boundary register as exactly the spec's sanctioned anchor set.
4. **Dry-run the hardest specimen available** (`03_per-node-record-template.md` §6) and let it change the design. It did, three times (`dry-run/00_…` §4).
5. **Extend the registers by reference**, namespacing every new id, and **declare** every decision that rests on reasoning rather than evidence (`SOC-7-S2`).
6. **Seed the filing routes** downstream sub-tasks need, each with an owner and a procedure named in advance.

### 3.1 The constraint that shaped everything

**Five sub-tasks map in parallel immediately after this one.** NEU-932's per-cluster file ownership guarantees it, and the orchestrator has committed to dispatching NEU-934/935/936/937/938 concurrently on that basis.

Every schema choice was checked against it:

- **No shared node file.** The roots are seeded into CL-1's file **before** SUB-3 starts — sequential authorship, not concurrent. SUB-3 stays sole writer for the whole mapping phase.
- **Nobody writes `manifest.yaml` during mapping.** It is set here, amended only via the ledger.
- **Ids stay cluster-namespaced** (`cl-3.plug-dp`), so two mappers cannot mint colliding ids without touching each other's files.
- **Cross-cluster prerequisites are declared, not drawn** — the direct consequence of parallelism: a mapper **cannot see** a sibling's ids, because that file does not exist yet.

**The schema forces no shared-file design. Per-cluster file ownership holds. The five mappers can run in parallel.**

## 4. What this sub-task deliberately did **not** do

The list is longer than the list of what it did, and that is the point.

- **It maps no DP.** Zero technique nodes. Every technique named anywhere in this package is a **worked example of a schema rule** — never a claim of coverage. `cl-4.knuth-optimization` in the template is a **specimen**, not a mapping decision; SUB-6 owns whether that node exists and what it says.
- **It makes no progression decision.** SUB-7 (OUT-3) owns progression, through NEU-888's mastery semantics. Root-internal edges are kept minimal and structural precisely to avoid smuggling a progression in through the floor (`02_…` §2.3).
- **It sets no difficulty value — and does not name the dimension set.** The schema fixes the *shape*; the set is `INC-S3`, owner SUB-7. Naming dimensions would have been a progression decision wearing a schema's clothes.
- **It reaches no JavaScript-materiality verdict.** SUB-8 (OUT-5) owns it. One root carries an *observation* about recursion depth, explicitly labelled not-a-verdict.
- **It runs no audit.** No coverage, cycle, or path audit. `coverage.status` is `"unaudited"` everywhere.
- **It re-decides no NEU-932 decision.** `D-F1`…`D-F5` are consumed as binding. The one refinement (`D-S4`) sits inside NEU-932's own `D-F3a` grant and is recorded as `X-S1` rather than quietly taken.
- **It does not touch the SOS DP dispute.** `X-D1` is carried live. No cluster assignment is NEU-933's to make.
- **It decomposes no boundary anchor.** Named and versioned only. Internals are a general-algorithms concern outside the audience line.
- **It invents no anchor.** The register is exactly the spec's sanctioned five. The gap is declared (`INC-S1`) with a route (`AR-1`) rather than filled by improvisation.
- **It does not re-derive NEU-887's machinery.** Two tempting re-derivations — a DP-specific evidence class and a DP-specific materiality rule — were **considered and declined**, and the near-misses are recorded (`04_…` §2.1).
- **It ships no validator.** Deferred as `INC-S2` with its 18 checks specified, because a validator over zero technique nodes is tested only against the specimens that authored it.

## 5. Cutoff and caps

**Verification cutoff: 2026-07-16**, the same day as NEU-932's. No source was fetched for this sub-task: the schema is a **design artifact**, argued from the charter's constraints and NEU-932's decisions, not discovered in the literature. That is disclosed rather than disguised (`SOC-7-S2`), and it is why this package has five findings rather than fifty.

Caps in `05_caps-and-incomplete-scope.md`. The two that bind hardest:

- **`CAP-4` / `INC-D1`** (inherited): the dry-run is a **desk-check by the schema's own author**, not a cold handoff. It proves expressiveness, not comprehension. **OUT-9 supersedes it.**
- **`X-D3`** (inherited, non-downgradable High): **nothing in C005 measures DP learning.** A prerequisite edge in this map is a **structural claim, not a validated learning claim** — and the schema must never be read as implying otherwise.
