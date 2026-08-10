# Form × Mechanism × Placement Matrix (SUB-2)

**Task:** NEU-958 (SUB-2) · **Charter:** C009 (umbrella NEU-890) · **Compiled:** 2026-08-10 · **Cutoff:** 2026-08-10 · **Subject:** `../02_content-and-exercise-forms.md` · **Status:** **this register SETS no status**
**Model:** claude-opus-5[1m]

The auditable register for the form catalogue: the form → mechanism trace in both directions, the placement claims, the fabrication-probe result, and the misconception/edge-case structural check. Each sub-task writes the register rows for its own claims; these are SUB-2's.

**No class-7 `[future-real-user]` claim appears in this register.** Every row below is checkable against a document that exists at this cutoff.

---

## 1. Form → mechanism trace (RG-S2-01 … RG-S2-10)

Provenance for every mechanism id, name and learning-critical flag: `../../C005-instructional-model/package/00_per-mechanism-index.md` · class 2 `[code-evidence]` · cutoff 2026-08-10.

| Row | Form | Mechanism(s) | Learning-critical | Evidence | Structural limitation |
| --- | --- | --- | --- | --- | --- |
| `RG-S2-01` | lesson | `M01` | no | `02_…` §8 | Trace is a design claim by this sub-task; no gate validates it yet (SUB-9). |
| `RG-S2-02` | example | `M02`, `M07` | no, no | `02_…` §8 | as above |
| `RG-S2-03` | visualization | `M02` | no | `02_…` §8 | as above |
| `RG-S2-04` | problem-reference | `M05` | no | `02_…` §8 | Trace holds for the interim field set only; a `CH-F5-1` resolution may widen it. |
| `RG-S2-05` | solution | `M06` | **yes** | `02_…` §8, §3.5 | `exposure_precondition` expresses the control; no runtime enforces it yet. |
| `RG-S2-06` | proof | `M07` | no | `02_…` §8 | as `RG-S2-01` |
| `RG-S2-07` | test | `M08` | **yes** | `02_…` §8, §3.7 | as `RG-S2-01` |
| `RG-S2-08` | reflection | `M09` | **yes** | `02_…` §8, §3.8 | `remediation_hook` expresses the control; no runtime enforces it yet. |
| `RG-S2-09` | retrieval | `M03`, `M04` | **yes**, **yes** | `02_…` §8, §3.9 | `hint_ladder` and `spacing_eligible` express the controls; thresholds are open in value. |
| `RG-S2-10` | assessment | `M08`, `M10` | **yes**, **yes** | `02_…` §8, §3.10 | `rubric_payload` and `gate_relevance` express the controls; the durability threshold is not set here. |

**Zero untraced forms.** All ten rows carry at least one mechanism.

## 1.1 Reverse trace — zero unserved mechanisms

| Mechanism | Served by | Outcome |
| --- | --- | --- |
| `M01` Sequencing | lesson | served |
| `M02` Worked Examples | example, visualization | served |
| `M03` Retrieval Practice | retrieval | served |
| `M04` Spacing | retrieval | served |
| `M05` Interleaving | problem-reference | served |
| `M06` Feedback | solution | served |
| `M07` Productive Struggle | example, proof | served |
| `M08` Assessment | test, assessment | served |
| `M09` Remediation | reflection | served |
| `M10` Progression | assessment | served |

**Ten of ten mechanisms served; no `OI-S2-k` gap entry was required for an unserved mechanism at this cutoff.** The residual clause remains standing and unexercised — filed as `OI-S2-1` so it stays live rather than reading as discharged.

---

## 2. Placement claims (RG-S2-11 … RG-S2-12)

| Row | Claim | Evidence | Structural limitation |
| --- | --- | --- | --- |
| `RG-S2-11` | Placement is stated against the map's id grammar — technique, root, boundary-anchor, anchor-reference and cross-cluster-attachment shapes — and against exactly the eight skill-type literals `proof`, `optimization`, `debugging`, `transfer`, `strategic`, `implementation`, `procedural`, `conceptual`, with no ninth value. | `../../C005-dp-map-schema/01_node-and-edge-schema.md` §2, §5.1 · class 2 `[code-evidence]` | The matrix asserts which forms a node *requires*; it is not derived from per-node inspection of the 187 mapped nodes. |
| `RG-S2-12` | Edges are classified **by field** — `prerequisites.intra_cluster`, `prerequisites.roots`, `prerequisites.boundary_anchors` (DRAWN); `cross_cluster_attachments` (DECLARED ONLY) — never by endpoint span, which reports 223 false positives. A prerequisite edge is a **structural** claim and is nowhere presented as a validated learning sequence (`R1`, non-downgradable High). A `boundary_anchor` terminal is a sanctioned stop and takes no forms. | `../../C005-dp-map-schema/01_node-and-edge-schema.md` §4.1–4.2 · class 2 `[code-evidence]` | Consumed without re-derivation (187 nodes, 572 edges, 8/8 skill types, 4 clusters). |

---

## 3. Fabrication-probe result (RG-S2-13)

Full verbatim per-template output: `../dry-run/02_template-fabrication-probe.md`. Not duplicated here.

| Row | Claim | Result | Structural limitation |
| --- | --- | --- | --- |
| `RG-S2-13` | A cold agent with no prior context, handed all ten templates and asked to fill them for a technique node — with no priming toward refusal — produced **zero invented identifiers, zero invented addresses, and zero produced citations of any kind**. The problem-reference template returned `REFUSED — not verifiable` in **both** fields and stopped. | **10/10 PASS** at this run's stated condition (refusal-or-placeholder). | **One run, one agent — an observation, not a distribution.** The admitting run (which may pass a *verified* citation) is **SUB-3's**, against a verification procedure that does not exist at this cutoff. One sub-threshold observation — an unsourced provenance characterization, no identifier — is recorded as `OI-S2-4`. |

---

## 4. Misconception / edge-case structural check (RG-S2-14 … RG-S2-16)

| Row | Check | Result |
| --- | --- | --- |
| `RG-S2-14` | Every discriminative form carries **both** `misconception_or_edge_case` and `separating_distractor_or_boundary_input`, each marked **REQUIRED**, in **both** its §3 field definition and its §7 template. | **PASS** — 7/7: example, visualization, proof, test, reflection, retrieval, assessment. |
| `RG-S2-15` | No template marks either field optional, and the words `optional` / "consider adding" attach to neither field anywhere in the catalogue. | **PASS** — the word `optional` appears only in `OPTIONAL` field marks on non-discriminative fields and in §2's definition of the mark itself. |
| `RG-S2-16` | Each discriminative form states that a submission omitting either field is **rejected by the form definition itself** — not accepted with a note, not warned. | **PASS** — 7/7, stated per form in §7 and once in §4. |

**The floor was exceeded, as the task permits.** The five enumerated discriminative forms (retrieval, assessment, reflection, test, worked example) are a floor, not a boundary; **visualization** and **proof** were decided discriminative here with per-form rationale (§4). **solution** was decided non-discriminative and the decision filed as reviewable (`OI-S2-2`) rather than settled silently.

---

## 5. Scope boundaries honoured (RG-S2-17)

| Row | Claim | Evidence |
| --- | --- | --- |
| `RG-S2-17` | The problem-reference form gained **no** access-path, resolution-route or fetch-date field; the catalogue sets **no** correctness bar, **no** gate, **no** severity tier, and fills **no** template with real content; no `INC-C1` technique was authored and no node minted; `../../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` was not written. | `02_…` §9 · `git diff` over this branch lists only the five C009 paths. |

**Provisional-data caveat inherited.** SUB-1's twelve source access-permission rows are **restricted by default** — no network access, zero requests issued — and are **not** verified-restricted. Every statement here that depends on them carries that qualification.

**No QA-engine run is claimed.** `qa-execution:engine` is unconfigured; the QA-execution phase is a genuine Core Article 8 no-op (`CAP-S2-2`).
