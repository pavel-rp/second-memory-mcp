# Caps and Incomplete Scope

**Task:** NEU-933 · **Compiled:** 2026-07-16

The honest statement of what this package ran under and what it does not cover. Inherits NEU-887's caps and status discipline: **gaps are recorded, never smoothed.**

---

## 1. Caps this sub-task ran under

Namespaced `-S` so they never collide with NEU-932's `CAP-1…5`.

| Id | Cap | Consequence | Owner |
| --- | --- | --- | --- |
| **CAP-S1** | The schema is a **design artifact**, argued from the charter's constraints and NEU-932's decisions — **not derived from evidence about how DP is learned.** | This is the package's defining limitation and it is structural, not fixable here: **no such evidence exists anywhere in C005** (`X-D3`, non-downgradable High). The eight skill types, the cascade order, and the knowledge/skill split are **reasoned**, not measured. Declared at `SOC-7-S2` rather than laundered into `F-S-*` findings. | This task; only a real learning study could lift it, and none is in scope |
| **CAP-S2** | The dry-run is a **desk-check against a specimen the schema's own author wrote**, run before any mapper exists. | Proves the schema **can express** the required distinctions; does **not** prove a cold agent **reads** them correctly. Inherits NEU-932's `CAP-4` / `INC-D1` unchanged. **Superseded by OUT-9's cold-context handoff.** | Final packaging sub-task (OUT-9) |
| **CAP-S3** | The dry-run tests **one specimen** — chosen as the hardest available case, but one. | The schema is stress-tested, **not exhaustively exercised**. Mirrors NEU-932's `CAP-5` exactly (19 worked examples, not the full space). The `>10 D-S1a` trigger on `D-S1` exists precisely to catch a cascade that survives one hard case and fails at scale. | The five family-mapping sub-tasks |
| **CAP-S4** | The boundary register is **exactly the spec's sanctioned anchor set**, and completeness over the technique space is **unprovable now** — that space does not exist yet (`INC-D3`). | The register is **not asserted complete** (`INC-S1`). Route **AR-1** exists so a missing anchor becomes a logged request rather than an invented anchor or a faked root edge. **A concrete case is already foreseen: Aho–Corasick** (`F-S-3`). | The five mappers, via AR-1 |
| **CAP-S5** | **No JSON Schema validator and no index generator were written**, though NEU-932 `D-F3` §5 assigns both to SUB-2. | A real deviation from the grant, so it is logged (`INC-S2`) rather than quiet. The 18 checks a validator must enforce **are specified** (`01_…` §6), so the deferral loses content but not intent. Until it lands, compliance rests on the template, the worked roots, and review. | Coverage-audit sub-task (OUT-7) |
| **CAP-S6** | No source was fetched. The **cutoff is inherited** from NEU-932 (2026-07-16) rather than independently established. | Any drift in NEU-932's sources between its cutoff and this one is not detected here. Low impact — nothing in this package rests on a fetched fact — but recorded rather than assumed harmless. | This task |

## 2. What this package does not cover

- **Any DP technique node.** Zero, deliberately. Every technique named is a worked example of a schema rule. **A list here would be topic volume masquerading as coverage** — the charter's standing anti-goal.
- **Progression, stages, ordering.** SUB-7's (OUT-3), through NEU-888's semantics. The roots' internal edges are structural, minimal, and explicitly not a progression.
- **Difficulty dimensions or values.** The schema fixes the shape; the dimension **set** is `INC-S3`, owner SUB-7. Mappers write `{}` and **must not invent**.
- **JavaScript materiality.** SUB-8's (OUT-5). One root carries an observation, explicitly not a verdict. NEU-932 records that OUT-5 has **no reference support** — every selected reference assumes the C++ competitive default.
- **Coverage, cycle, and path audits.** OUT-2/OUT-6/OUT-7's. `coverage.status` is `"unaudited"` everywhere.
- **Cross-cluster edges.** Declared here as a *shape*; realized by SUB-12. `edges/cross-cluster.yaml` is empty and that is correct.
- **The internals of any boundary anchor.** Named and versioned only — a general-algorithms concern outside the audience line.
- **Adjudicating the SOS DP dispute.** `X-D1` carried live. No cluster assignment is NEU-933's.
- **Re-deriving NEU-887's machinery.** Extended by reference. Two tempting re-derivations declined and recorded (`04_…` §2.1).

## 3. Inherited gaps carried undiminished

| Inherited | From | Status here |
| --- | --- | --- |
| **R1 / X1 / X-D3 — the DP-transfer gap** | NEU-887 (non-downgradable High), via NEU-932 | **Carried undiminished, and directly binding on this schema.** A prerequisite edge is a **structural claim, not a validated learning claim.** Nothing in C005 measures DP learning. The map must not import any corpus's ordering as a prerequisite claim, and `coverage.corpus_refs` is a **reference**, never evidence that a prerequisite is real. |
| **The class-7 evidence gap** | NEU-887 | **Absolute.** No external-user, expert, or market validation exists anywhere in C005. No claim in this package is or implies one. `evidence_class: 7` must never appear in a node. |
| **`CAP-2` — Codeforces 403** | NEU-932 | Carried. Surfaces where a mapper will hit it: `coverage.corpus_refs` guidance in the template, and the map README. **C4 entry ids are unverified; never assert one as verified.** |
| **`INC-D1` — desk-check ≠ cold handoff** | NEU-932 | Carried as `CAP-S2`. This package's dry-run has the **same** limitation and says so rather than implying it improved on it. |
| **`X-D1` — SOS DP CL-4 vs CL-3** | NEU-932 | Carried live, `provisional`, U4 route named. Surfaced in CL-3's and CL-4's file headers so the mappers meet it at the point of use. |
| **`X-D2` — naming instability** | NEU-932 | Carried. The optional `aliases` field is a **mitigation** so OUT-7 doesn't read a synonym as a coverage gap — **not a resolution**. |
| **`INC-D3` — no technique inventory** | NEU-932 | Carried; it is why `CAP-S4` cannot be lifted here. |

## 4. The one thing most likely to be wrong

Recorded explicitly rather than left for a reader to discover, mirroring NEU-932 `06_caps` §4.

**`D-S4` — that root edges are DRAWN by every mapper rather than declared for SUB-12 — is the load-bearing judgment call in this package.**

It refines a *literal* reading of NEU-932 `03_…` §4 rule 4 (`X-S1`). The argument (`01_…` §4.2) rests on **what rule 4 is for** — resolving references to things that don't exist yet — and roots **do** exist, frozen, before any mapper starts. If that judgment is wrong, the symptom will be **an audit reporting a flood of "missing cross-cluster edges" that are really root edges**, or SUB-12 re-drawing them and **duplicating every floor edge in the graph**.

**The detection mechanisms are shipped, not hoped for:** **R5** in `edges/cross-cluster.yaml` (named at SUB-12's most likely wrong turn), `manifest.yaml`'s `edge_disposition` block (so an audit classifies by **field, not endpoint span**), and check **V-7**. Named here so the signal is recognized as **`D-S4` being wrong** rather than as a scatter of unrelated audit failures.

**The runner-up, and it is a coupling rather than a choice:** the cascade's **S2/S5 boundary** (`optimization` vs `strategic`) is *deliberately* the same test as `D-F4`'s **T1**, so that a CL-4 node's skill type and its cluster agree by construction rather than coincidence. The cost of that coupling: **if T1's ordering is wrong — which NEU-932 names as its own most-likely-wrong choice — this schema inherits the error.** The coupling is recorded now rather than discovered later. The joint symptom would be `D-S1a` entries **and** U4 challenges concentrating on the **same CL-3/CL-4 boundary** simultaneously; either alone is noise, both together is the shared premise failing.
