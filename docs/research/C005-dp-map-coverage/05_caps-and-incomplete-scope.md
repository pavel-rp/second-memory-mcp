# Caps and Incomplete Scope

**Task:** NEU-942 (SUB-10) · **Compiled:** 2026-07-16 · **Cutoff:** 2026-07-16

What this audit could not settle, and who must. Namespaced `-C` so ids never collide with NEU-887's `INC-1…5`, NEU-888's `INC-I#`, NEU-932's `INC-D#`, or NEU-933's `INC-S#`.

**Reported, never invented** (NEU-899 rule 4, inherited). Every entry names a **missing artifact and an owner**.

---

## 1. Incomplete-state markers (`INC-C#`)

| Marker | Missing artifact | Owner | Trigger |
| --- | --- | --- | --- |
| **`INC-C1`** | **CL-4 work-split coverage completion.** Ten material techniques the `D-F4` cascade assigns to CL-4 are enumerated by neither CL-4 half and mapped by nobody (`04_work-split-seam.md`). Both CL-4 mappers are merged and Done, so no running sub-task can receive the routing. **This audit may not map them** (NEU-942 out-of-scope). | **The creator** — to commission a follow-up task (recommended: Option A, a cascade-scoped CL-4 completion task). | **Now.** Blocking: OUT-7 cannot report these covered; SUB-11 must carry them as open. |
| **`INC-C2`** | **The `D-F4a` adjudication of SOS DP.** The one live cluster dispute in the map (`X-D1`, CL-3's claim open, U4 route named and unfiled). Determines which cluster owns `CV-1`'s gap. **This audit does not own NEU-932's ledger and does not flip it**; `CV-1a` records a reasoned recommendation only. | **`D-F4`/`D-F4a`'s owner (NEU-932) — a creator decision.** Routable by SUB-11 (NEU-944) at reconciliation, or by NEU-936 filing the U4 challenge. | `D-F4a` adjudicated either way. **Does not block `CV-1`** — the gap is settled regardless of which cluster wins. |
| **`INC-C3`** | **Problem-level corpus citations.** `CV-17`. CL-1's `EXC-1` and CL-2's `E0` both assigned resolution to OUT-7; **this audit cannot discharge it** — `CAP-2` is unresolved and `F-C-1` verified only the CSES section counts. Corpus-level refs stand as the strongest supportable claim. | **`D-F2`/`D-S1`'s owners** for the template illustration that invited the claim; **a later curriculum-production charter** for per-problem citation under manual verification. | `CAP-2` lifted, or a manual verification pass commissioned. |
| **`INC-C4`** | **The `AR-1` id convention, and adjudication of the four open requests.** `CV-32`, `CV-33`, `CV-34`. Four distinct anchor requests exist under two colliding label pairs (`AR-1/a`,`AR-1/b` from NEU-936; `AR-1-a`,`AR-1-b` from NEU-938), plus two more from NEU-935 that had no ids at all. Unioned and disambiguated by filer in the ledger; **the merits are not this audit's to decide**. | **`D-S3`'s owner (NEU-933)** for the merits; **SUB-11 (NEU-944)** for the id convention. | Any AR-1 request is adjudicated. |
| **`INC-C5`** | **A coverage-matrix completeness proof.** `CV-18`. The technique space does not exist as an enumerated object (`INC-D3`), so no matrix over it can be proven complete, and `RX-13` correctly refuses the claim. This audit swept the five exclusion registers, six taxonomies, and six corpora at the cutoff — it did not, and could not, sweep the technique space. | **SUB-11 (NEU-944)** for the residual at package assembly; **Convention U1** guarantees any later-surfaced T1 technique is CL-4's without a partition change. | A material CL-4-by-cascade technique is found that is neither mapped nor listed in `04_…` §4. |
| **`INC-C6`** | **The JSON Schema validator and index generator** (`INC-S2`). NEU-933 deferred both to *"the coverage-audit sub-task (OUT-7) — the first consumer needing mechanical validation and index freshness."* **This audit did not build them.** Its verdicts are judgments about *technique coverage against references*, which no validator can check; a validator checks the 18 structural rules in `../C005-dp-map-schema/01_node-and-edge-schema.md` §6, which is **SUB-9's** integrity remit, not this audit's. Building it here would have been scope this sub-task's spec does not grant, on a deliverable whose first real consumer is the integrity audit. **Recorded as consciously not-done and re-routed rather than silently inherited and dropped.** | **SUB-9 (NEU-943)** — the integrity audit is the true first consumer; or **SUB-11 (NEU-944)** at package assembly. | SUB-9 runs, or SUB-11 assembles. |

## 2. Inherited caps this audit respects and does not "fix"

| Cap | Statement | Effect on this audit |
| --- | --- | --- |
| **`CAP-1`** (NEU-932) | A reference reaching the frontier alone may exist outside `D-F1`'s sweep. | **Unresolved and untouched.** The matrix's reference columns are only as complete as `D-F1`'s selection. This audit did not re-run the reference survey — that is `D-F1`'s decision and re-opening it is not NEU-942's remit. |
| **`CAP-2`** (NEU-932) | **Codeforces returned HTTP 403 to automated fetching** (`F-T-5`); C4's entry ids are **unverified, not asserted**. | **Binding on every C4 cell.** No C4 problem id appears anywhere in this package. C4 marks record that the tag-intersection tradition covers an area — well-attested — and nothing more. **This audit did not retry the fetch and does not treat the cap as a defect to route around.** |
| **`F-C-1`** | Only the CSES **section counts** were verified (25 DP, 26 Advanced). | No problem-level citation is supportable from any corpus. `CV-17`. |
| **`F-C-4`** | Frontier techniques appear in corpora predominantly as **compositions**. | A frontier corpus mark means "an instance exists inside a composition," never "a clean isolated instance." Grounds `CV-10` upholding `RX-11`. |
| **`F-C-5`** | No corpus is ordered by **learning** dependency. | Nothing in this package is a prerequisite or difficulty claim. |
| **`X-D3` / NEU-887 `R1`** | The DP-transfer gap. Non-downgradable High. | **Carried undiminished.** No coverage verdict here is evidence that any node teaches anything. |
| **`INC-D3`** | The technique space does not exist as an enumerated object. | Why `INC-C5` exists and why `RX-13` is upheld rather than treated as a defect. |
| **`RX-13`'s own bound** | NEU-938 does not assert its exclusion list is complete; its criterion (c) leans on *"has a real corpus instance"* which it **could not verify** under `CAP-2`/`F-C-4`. | **Survey-level judgment, falsifiable — and this audit falsified none of it.** Each of the seven exotic-tail materiality claims was checked against C1…C6 and no counter-instance was found. That is corroboration at the same evidence level, **not** a promotion to verified. `RX-13` stands as written. |

## 3. What this audit deliberately did not do

- **Did not flip `D-F4a`.** Standing, not confidence: NEU-932's ledger is not this sub-task's file, and U4 forbids local re-decision. `CV-1a` is a recommendation to a named owner.
- **Did not mint or repair a node.** Ten gaps found, zero nodes written. `nodes/*.yaml` belong to the mappers (NEU-940 is writing difficulty fields concurrently).
- **Did not touch `edges/cross-cluster.yaml`.** SUB-12's (NEU-939), running concurrently. Two of this audit's gaps (`CV-1`, `CV-5`) will surface there as unresolvable attachments; the **cause** is recorded here so SUB-12 does not smooth the symptom by deleting the declaration.
- **Did not replace any ledger row.** Union only. Five pre-existing decision rows and two pre-existing AR-1 rows are preserved byte-for-byte; nodes reference them by id in `notes`, so dropping one would turn other nodes' notes into false claims.
- **Did not reintroduce problem-level citations** that two mappers correctly withdrew.
- **Did not re-litigate the plug/broken-profile wording conflict.** Verified coverage holds (`CV-6`, 3 nodes in CL-3) and recorded the verdict. SUB-13's `U4` challenge route stays open and unexercised.
