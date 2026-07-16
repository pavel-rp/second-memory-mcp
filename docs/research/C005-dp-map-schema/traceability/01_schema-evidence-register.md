# Schema Evidence Register

**Task:** NEU-933 · **Compiled:** 2026-07-16 · **Extends (references, never rebuilds):** `../../C005-product-foundation/traceability/` (NEU-899 trace-record schema, relation vocabulary, orphan checks) and `../../C005-product-foundation/01_evidence-taxonomy.md` (NEU-897 seven-class taxonomy), following the extension pattern NEU-888 established and NEU-932 followed (`../../C005-dp-map-foundations/traceability/01_selection-evidence-register.md`).

**What is tracked:** one row per **labeled finding** this package produced, keyed by the finding's own id verbatim (`F-S-*`) — no second numbering, per NEU-899's convention. It defines no new taxonomy, no new class, and no new relation type. **It adjudicates no status** — that is `../adjudication/01_schema-decision-ledger.md`.

**Relation vocabulary** is NEU-899's, unchanged. Exercised here: `REL:evidences` (finding → decision) and `REL:provisional-on` (finding → carried conflict).

**Read `SOC-7-S2` first.** It is the row that matters most in this register, and it says that **most of NEU-933's decisions are not evidenced at all — they are argued.**

---

## The register

| Finding | Class | Evidence type | Cutoff | Provenance | Structural limitation | Evidences (→ decision) | Carried conflict / cap |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **F-S-1** | 1 `[literature]` | source-fact | 2026-07-16 | `../02_terminal-floor.md` §2.2; the NEU-889 charter's named first principles | The charter's principle set is a **design input**, not an empirical finding about how DP is learned. That these four are *the* first principles is well-attested in the literature; that they are the right **floor for this audience** is a judgment. | `D-S2` | `X-D3` |
| **F-S-2** | 1 `[literature]` | source-fact | 2026-07-16 | `../02_…` §3; NEU-932 `04_family-cluster-partition.md` §1 and §3.2 (envelope geometry / Li Chao trees / linear algebra explicitly routed outside the partition) | Establishes these anchors are **non-DP** and outside the partition. Does **not** establish the register is **complete** over the technique space — that space does not exist yet. | `D-S3` | `CAP-5`, `INC-S1`, `INC-D3` |
| **F-S-3** | 1 `[literature]` | negative-result (absence in the surveyed set) | 2026-07-16 | `../02_…` §3.6; NEU-932 `01_taxonomy-selection.md` | **Aho–Corasick construction is a real non-DP prerequisite of automaton DP and is NOT in the sanctioned anchor set.** An argument from the spec's enumeration, **not** a proof that no further anchor is needed. Records a *foreseen absence* rather than asserting the register is complete. | `D-S3` | `INC-S1` |
| **F-S-4** | 2 `[code-evidence]` | artifact-fact (verified) | 2026-07-16 | `../../C005-dp-map/nodes/cl-1-foundational.yaml`; `../dry-run/00_schema-usability-dry-run.md` §2 | The 8 roots are a **constructed specimen** authored by the same task as the schema. Class-2 evidence that the schema **can** express a typed, floored node — **not** evidence that an independent agent uses it correctly. | `D-S1`, `D-S2` | `CAP-4`, `INC-D1` |
| **F-S-5** | 1 `[literature]` | practitioner-observation | 2026-07-16 | `../01_node-and-edge-schema.md` §2.1; `../02_…` §2.1 | That knowing a DP property and recognizing it in a statement are **separately-failing acquisitions** is a widely-held practitioner observation. It is **not** measured, and no C005 artifact measures it (`X-D3`). Motivates the knowledge/skill split; does not validate it. | `D-S1`, `D-S2` | `X-D3` |

## Orphan / completeness checks (`SOC-#-S2`)

Mirrors NEU-899's `OC-*` and NEU-932's `SOC-*`, namespaced `-S2` for this package. An item failing any check cannot silently count toward register completeness.

| Id | Check | Passing condition | Result |
| --- | --- | --- | --- |
| **SOC-1-S2** | Finding-completeness | Every labeled finding this package produced (F-S-1…5) has exactly one row. | **Pass** — 5/5. |
| **SOC-2-S2** | Class fidelity | Every row carries the finding's NEU-887 class unchanged; no class-1–6 finding is presented as class 7. | **Pass** — 4 class-1, 1 class-2. **No class-7 evidence exists anywhere in C005**; no external-user, expert, or market claim appears here. |
| **SOC-3-S2** | Provenance + cutoff present | Every row carries a source pointer and a cutoff; no cutoff silently upgraded. | **Pass** — 5/5, all 2026-07-16. |
| **SOC-4-S2** | Limitation present | Every row carries a structural limitation. | **Pass** — 5/5. |
| **SOC-5-S2** | Forward walk | Every finding names the decision it evidences. | **Pass.** **Noted honestly:** `D-S1`, `D-S4`, and `D-S5` are reachable from **no** or only **partial** `F-S-*` evidence — see `SOC-7-S2`. |
| **SOC-6-S2** | No invented value | No row asserts a value for a gap or cap. | **Pass** — F-S-3 records a *foreseen absence* (Aho–Corasick) rather than inventing the anchor; `difficulty_dimensions` is left `{}` rather than populated (`INC-S3`). |
| **SOC-7-S2** | **Reasoned-decision disclosure** | Decisions resting on **reasoning rather than external evidence** are declared, not disguised as evidenced. | **Pass, and the most material row in this register.** **`D-S1` (the schema), `D-S4` (root-edge disposition), and `D-S5` (the register extension) are DESIGN DECISIONS, NOT EMPIRICAL FINDINGS.** They rest on argued constraints — five mappers must run in parallel; the floor must be reachable at map time; the charter mandates a knowledge/skill distinction and an eight-type vocabulary — plus a desk-check against a specimen this task itself authored. **They do not rest on class-1 evidence about the world, and no `F-S-*` row claims they do.** Manufacturing findings for them would launder a design choice as a discovery. NEU-932's `SOC-7` made exactly this disclosure for `D-F3`/`D-F4`; the disclosure is **inherited, not worked around**. Their justification lives in `../01_…` §3.1/§4.2, `../02_…` §5 (FC-1…FC-12), `../04_…` §5 (RE-1…RE-12), and `../dry-run/00_…` — and is **auditable there**, as argument. |
| **SOC-8-S2** | No re-derivation | No row re-defines a taxonomy class, materiality clause, relation type, or status value; each references the product-foundation file. | **Pass** — only `-S`-namespaced ids added. §2.1 of `../04_…` records the DP-specific evidence class and materiality rule as **considered and declined**. |
| **SOC-9-S2** | Specimen-evidence honesty | No constructed specimen is presented as independent validation. | **Pass** — F-S-4 states the roots are authored by the same task as the schema. `CAP-4`/`INC-D1` (desk-check ≠ cold handoff) carried undiminished from NEU-932. |
