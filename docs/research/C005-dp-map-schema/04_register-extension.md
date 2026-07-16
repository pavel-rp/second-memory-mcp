# Extending NEU-887's Registers to the DP Map

**Task:** NEU-933 · **Decision:** `D-S5` · **Compiled:** 2026-07-16 · **Status:** see `adjudication/01_schema-decision-ledger.md` — this file sets none

**The whole content of this file is: what was NOT rebuilt.** The spec's bar is *"extends — does not re-derive — NEU-887's machinery"*, and the register-completeness audit checks exactly that. So this file's job is to make the extension boundary auditable: which machinery is inherited by reference, which ids are new, and why each new id had to be new.

---

## 1. The extension pattern, inherited not invented

This is the **third** package in C005 to extend NEU-887's machinery. NEU-888 (`../C005-instructional-model/`) established the pattern and NEU-932 (`../C005-dp-map-foundations/`) followed it. **NEU-933 follows it too — it does not invent a fourth style.**

The pattern:

1. **Reference the parent's machinery by file path.** Never restate a taxonomy class, a materiality clause, a relation type, or a status value.
2. **Namespace new ids** so they cannot collide with the parent's or a sibling's.
3. **Keep the parent's finding ids verbatim** where a finding is carried — no second numbering.
4. **Declare, don't disguise, any decision resting on reasoning rather than evidence.**

## 2. What is inherited **by reference** — and therefore NOT re-derived here

**Nothing in this table is restated, redefined, extended, or re-derived anywhere in this package.** If it appears in a NEU-933 file, it appears as a **pointer**.

| Machinery | Lives in | How NEU-933 uses it |
| --- | --- | --- |
| **The seven-class evidence taxonomy** | `../C005-product-foundation/01_evidence-taxonomy.md` | The node schema's `evidence_class` field holds **the parent's class number**. The schema defines **no** class, no new class, and no DP-specific evidence type. |
| **The materiality rule** | `../C005-product-foundation/product-model/02_materiality-rule-and-candidate-inventory.md` | Referenced. **Not re-derived.** No DP-specific materiality rule exists and none was needed. |
| **The status values** (`settled` / `provisional` / `unresolved`) | NEU-887 adjudication method, via NEU-932 `adjudication/01_selection-decision-ledger.md` §1 | The node schema's `status` field and `manifest.yaml`'s legend **quote** the three values. **No fourth value is introduced.** |
| **Status discipline** (status flips only in the ledger) | NEU-887, via NEU-932 `D-F3` §6 | Applied to nodes: a mapper may not promote its own node to `settled`. **The rule is inherited, not restated as a new rule.** |
| **The trace-record schema and relation vocabulary** | `../C005-product-foundation/traceability/00_trace-schema-and-conventions.md` | `traceability/01_schema-evidence-register.md` uses NEU-899's relations unchanged. **No new relation type.** |
| **Orphan-check discipline** (`OC-*`) | `../C005-product-foundation/traceability/04_orphan-and-inventory-reconciliation-audit.md` | Mirrored as `SOC-*-S2`, namespaced. **The checks' logic is the parent's.** |
| **Incomplete-marker discipline** ("report, never invent") | NEU-899 rule 4, via NEU-932 §3 | Applied as `INC-S#`. **The rule is inherited.** |
| **The elementary-data-structures floor** | NEU-887 | The boundary register **anchors above it** and does not restate, extend, or decompose it. |
| **Mastery semantics** | `../C005-instructional-model/` (NEU-888) | **Consumed, not re-derived.** NEU-933 makes no mastery or progression claim — SUB-7's. |
| **The representation format, taxonomies, corpora, four-cluster partition** | `../C005-dp-map-foundations/` (NEU-932, `D-F1`…`D-F5`) | **Binding.** Consumed as given; challenged only via the ledger. |

### 2.1 The two places re-derivation was tempting, and was declined

Recorded because "we didn't rebuild it" is easier to assert than to prove, and the audit deserves the near-misses:

**A DP-specific evidence class.** A "graph-structural" class — evidence that a prerequisite edge is real — was considered, since the seven classes were built for *product* evidence and a prerequisite claim is a different kind of thing. **Declined.** The parent's taxonomy already classifies the *source* (class 1 `[literature]` for "CP-Algorithms presents X as a prerequisite of Y", class 2 `[code-evidence]`), and what is new here is the **claim**, not the evidence. Adding a class would fork the taxonomy for the *third* time in the program and break the audit's ability to compare classes across packages. **`evidence_class` holds the parent's number, unchanged.**

**A DP-specific materiality rule.** Tempting because "is this node material?" feels like a map question. **Declined**: the parent's rule is about what a product decision must rest on, and the map makes no product decision. The genuine map-specific question — *is this technique covered?* — is `coverage.status`, which is **OUT-7's**, not a materiality question and not NEU-933's.

## 3. What is **new**, and why it had to be

Every new id is namespaced `-S` (schema), so it cannot collide with NEU-887's (`INC-1…5`, `OC-*`, `R1`, `X1`), NEU-888's (`INC-I#`), or NEU-932's (`-D`/`-S`-suffixed `D-F*`, `INC-D#`, `X-D#`, `CAP-#`, `SOC-#`).

| Namespace | What | Why it could not be an existing id |
| --- | --- | --- |
| `D-S1`…`D-S5` | NEU-933's decisions | New decisions. `D-S1` **resolves** NEU-932's `D-F3a`, which NEU-932 left unresolved and assigned here. |
| `D-S1a` | Indeterminate **skill-type** assignments (Convention S) | Mirrors `D-F4a`'s shape for a different subject (skill typing, not cluster placement). |
| `INC-S1`…`INC-S3` | NEU-933's incomplete-state markers | New missing artifacts, each with a named owner. |
| `X-S1` | The `D-S4` root-edge refinement, carried | A new carried item — a refinement of a NEU-932 rule that NEU-932 did not anticipate. |
| `SOC-1-S2`…`SOC-8-S2` | Orphan/completeness checks | The parent's check **logic**, namespaced for this package's register. |
| `AR-1` | The anchor-request route | A new procedure. No parent equivalent — nothing upstream had a boundary register. |
| `FC-1`…`FC-12` | Floor self-check | New verification evidence for a new artifact. |
| `V-1`…`V-18` | Schema validation checks | New. Mechanical checks over a new schema. |

**Nothing else is new.** No taxonomy class, no relation type, no status value, no materiality clause, no marker discipline.

## 4. The extension itself — what the registers now cover

### 4.1 Traceability

`traceability/01_schema-evidence-register.md` extends NEU-932's selection-evidence register to NEU-933's decisions. It tracks one row per labeled finding, keyed by the finding's own id (`F-S-*`) — no second numbering, per NEU-899.

**The register's most important row is `SOC-7-S2`**, and it is the one a reviewer should read first: **most of NEU-933's decisions are design decisions, not empirical findings**, and the register says so rather than manufacturing `F-S-*` rows to make them look evidenced. A schema is *argued* from constraints (five parallel mappers; a floor that must be reachable at map time; a knowledge/skill distinction the charter mandates), not *discovered* in the literature. NEU-932's `SOC-7` made exactly this disclosure for `D-F3`/`D-F4`; NEU-933 inherits the disclosure rather than quietly evidencing its way around it.

**Manufacturing findings for design decisions would launder a choice as a discovery** — the specific dishonesty `SOC-7` exists to prevent.

### 4.2 Adjudication

`adjudication/01_schema-decision-ledger.md` is the **sole** source of truth for the status of every NEU-933 decision, and it seeds the skeleton SUB-11 later drives:

- **Every NEU-933 decision** (`D-S1`…`D-S5`, `D-S1a`) with status, evidence, rejected alternatives, revision trigger, owner.
- **The open slots** downstream sub-tasks file into: `D-S1a` entries (Convention S skill-type indeterminacy), `AR-1` anchor requests, and `D-F4a` U4 challenges — each with its route and its owner **named in advance**, so a mapper does not have to invent a filing procedure mid-task.
- **Carried conflicts**, preserved: NEU-932's `X-D1` (SOS DP) and `X-D3` (the DP-transfer gap) inherited undiminished, plus NEU-933's own `X-S1`.
- **Incomplete markers** `INC-S1`…`INC-S3`, each with an owner.

**The seeded skeleton is the deliverable, not the filled ledger.** SUB-11 drives it; NEU-933 builds the frame and the filing routes.

## 5. Register-completeness self-check (the spec's verification evidence)

| Check | Passing condition | Result |
| --- | --- | --- |
| **RE-1** | No NEU-887 evidence class is redefined, renamed, or added to. | **Pass** — `evidence_class` holds the parent's number. §2.1 records the DP-specific class as **considered and declined**. |
| **RE-2** | No NEU-887 materiality rule is re-derived. | **Pass** — referenced only. §2.1 records the near-miss. |
| **RE-3** | No new status value. | **Pass** — the three, quoted from the parent via NEU-932. |
| **RE-4** | No new relation type in the trace register. | **Pass** — NEU-899's vocabulary, unchanged. |
| **RE-5** | Every new id is namespaced and collides with no parent or sibling id. | **Pass** — all `-S`-namespaced; §3 enumerates. |
| **RE-6** | Status is set in exactly one place. | **Pass** — the ledger. Every topic file's header defers to it; `manifest.yaml` carries the legend but adjudicates nothing. |
| **RE-7** | Conflicts are carried, not smoothed. | **Pass** — `X-D1` (SOS DP) carried live with its U4 route in three places a mapper will actually look: CL-3's and CL-4's file headers and the ledger. `X-D3` carried undiminished. `X-S1` newly recorded. |
| **RE-8** | Caps are inherited, not silently dropped. | **Pass** — `CAP-2` (Codeforces 403) surfaces in the template's `corpus_refs` guidance and the map README. `INC-D1` (desk-check ≠ cold handoff) is carried by NEU-933's dry-run explicitly. |
| **RE-9** | No class-1–6 evidence is presented as class 7. | **Pass** — no external-user, expert, or market claim exists anywhere in this package. |
| **RE-10** | Decisions resting on reasoning rather than evidence are **declared**. | **Pass, and material** — `SOC-7-S2`. NEU-933's decisions are design decisions and the register says so instead of manufacturing findings. |
| **RE-11** | The adjudication skeleton SUB-11 drives is seeded, with filing routes named. | **Pass** — `D-S1a`, `AR-1`, and the `D-F4a` U4 route each have an owner and a procedure named in advance. |
| **RE-12** | No NEU-932 decision (`D-F1`…`D-F5`) is locally re-decided. | **Pass** — consumed as binding. The one refinement (`D-S4`, root-edge disposition) is inside NEU-932's own `D-F3a` grant, and is recorded as `X-S1` **rather than quietly taken**. |
