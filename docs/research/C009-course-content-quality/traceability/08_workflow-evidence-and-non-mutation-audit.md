# 08 — Workflow Evidence, the Reserved-Slot Audit, and the Non-Mutation Check

**Task:** NEU-963 (SUB-8) · **Charter:** C009 (umbrella NEU-890) · **Covers:** OUT-8 · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Status:** deferred — **this file SETS no status.** Status lives in a ledger
**Model:** claude-opus-5[1m]

**Companion to** `../08_authoring-workflow-and-in-situ-review-loop.md`. Claims SUB-8's
already-exclusive number `08` inside `traceability/`, so no sibling can collide with it.

---

## 1. What this register is

One row per material claim in `../08_…`, each carrying **exactly one** NEU-887 evidence class
(`../../C005-product-foundation/01_evidence-taxonomy.md`), its provenance, its cutoff, and its
**structural limitation** — the column that records what a claim can never prove. **No claim in this
register is class 7 `[future-real-user]`, and no class 1–6 claim is summarised as one.**

**Class 7 does not exist here**, matching the rest of the package. **Class 3 `[dogfooding]` appears
in this package for the first time — as a *specified* class for a *future* datum, never as a datum
collected by this sub-task.** That distinction is load-bearing and is stated in row **C-08** below.

---

## 2. The claim register

| Id | Claim in `../08_…` | Class | Provenance | Cutoff | Structural limitation |
| --- | --- | --- | --- | --- | --- |
| **C-01** | The unit state set is closed at eight states with exactly three terminals (§3.1) | **—** (definitional) | Authored here; SUB-8's own construction | 2026-08-10 | A definition proves nothing about the world. **It has never been applied to a real unit** — `CAP-S8-2`. |
| **C-02** | Every transition in §3.2 names a reviewer role and emits a record type | **—** (definitional) | Authored here | 2026-08-10 | Completeness is over the **enumerated** transitions only; §9's residual clause governs the rest, and an unenumerated case is a gap (`OI-S8-1`), not an absence. |
| **C-03** | All three terminals are reachable from `draft` by an enumerated path | **—** (definitional, walked in §3.2 and §10.1) | Authored here; walked | 2026-08-10 | Reachability in the graph, not in any implementation. Nothing executes this graph. |
| **C-04** | The `RR-QUARANTINE` record carries `reason`, `owner`, `exit_condition`, present and unpopulated, SUB-9-supplied | **—** (definitional; audited in §3 below) | Authored here; SUB-9's ownership is stated by SUB-4 (`../04_…`, `DR-C09-04` §"SUB-9 inherits the gate") and SUB-5 (`../05_…` §"licenses SUB-9") | 2026-08-10 | The **shape** is fixed; the **meaning** does not exist. SUB-9 may define slots this shape did not anticipate — `OI-S8-2`. |
| **C-05** | The `AI` mechanism belongs to exactly one SUB-4 standard (Explanation), which is why H1 fires there | **2 `[code-evidence]`** | `../04_correctness-standards-and-authoring-languages.md`, read 2026-08-10 | 2026-08-10 | Records what SUB-4 declares; proves nothing about whether an AI reviewer is in fact worse than a human one at this task — **no comparison was run**. |
| **C-06** | `creator_review: "deferred-provisional"` is set on 179/179 non-root nodes across six provisional dimensions, zero creator-confirmed | **2 `[code-evidence]`** | `../07_difficulty-calibration.md` §0, §4.1, §7 (consumed, not re-derived); the key is present in `../../C005-dp-map/nodes/*.yaml` | 2026-08-10 | Shows what the map **declares**. It does not show that any of the six values is right or wrong — that is precisely what the loop exists to find out. |
| **C-07** | `prerequisite_depth` is class **MD** and therefore out of the loop's scope (§7.3) | **2 `[code-evidence]`** | `../07_…` §4.1, §5.1 — SUB-7's re-derivation, **consumed, not re-run here** | 2026-08-10 | Inherits SUB-7's own limitation: re-derivability proves rubric agreement, not pedagogical correctness. |
| **C-08** | A creator while-learning judgement is class **3 `[dogfooding]`**, a labelled proxy, never class 7 | **—** (a **classification rule**, not a datum) | `../../C005-product-foundation/01_evidence-taxonomy.md` class 3 definition + rule 3 | 2026-08-10 | **This sub-task collected ZERO class 3 evidence.** No protocol run, no date, no journey id exists. The class is *specified for a future datum*. Reporting this row as class 3 evidence *held* would be exactly the laundering rule 3 forbids — `CAP-S8-1`. |
| **C-09** | All twelve sources are `Restricted`; the citation step reaches `V0` and records `none — gate` | **2 `[code-evidence]`** | `../03_problem-citation-verification-and-access-paths.md` §4.1, §11; `../01_provenance-and-rights.md` §3 — **consumed, not re-verified** | 2026-08-10 | **The twelve rows are restricted by the restricted-default rule**, SUB-1 having had no network access — **restricted-by-default, not verified-restricted.** This register does not upgrade them, and nothing here licenses a fetch (`OI-S3-2`: capability is not authority). |
| **C-10** | Zero citations are asserted anywhere in SUB-8's output; no field beyond `stable_id` + `canonical_url` is stored | **2 `[code-evidence]`**, verified by scan | §4 below, scan **A** | 2026-08-10 | Proves absence in **this** output only. Says nothing about any other sub-task's output. |
| **C-11** | The dry-run judgement (§10.3) carries no evidential weight and flips nothing | **—** (a disclosure) | §10.3's own labelling; §5 below | 2026-08-10 | A disclosure is only as good as the check behind it. §5's count check is the check. |
| **C-12** | `qa-execution:engine` is unconfigured; an automated QA pass is a Core Article 8 no-op | **2 `[code-evidence]`** | The repository capability registry resolves `git` and `linear` only, read 2026-08-10 | 2026-08-10 | Records the registry's contents. **It is not a QA pass, and is never to be reported as one** — `CAP-S8-3`. |
| **C-13** | Only additions were made to the three shared files; the map is unwritten | **2 `[code-evidence]`**, verified by command | §4 below, scans **B**, **C**, **D** | 2026-08-10 | Proves the diff at this cutoff on this branch. A later hand-edit is outside its reach. |

---

## 3. The reserved-slot audit

**The check that `reason`, `owner` and `exit_condition` are reserved rather than defined.**

| Check | Passing condition | Result |
| --- | --- | --- |
| **RS-1** | All three slots appear in the `RR-QUARANTINE` specification (`../08_…` §4.3, §5) | **Pass** — all three, named, in both places. |
| **RS-2** | All three appear in the produced dry-run record (`../08_…` §10.2) | **Pass** — all three, each marked `[SUB-9-SUPPLIED · UNPOPULATED]`. |
| **RS-3** | **No value, default, placeholder value, worked example or enumerated candidate set** is given for any of the three, anywhere in SUB-8's output | **Pass** — every occurrence is the `—` absence marker or the words *unpopulated* / *SUB-9-supplied*. §5's scan **E** is the executed check. |
| **RS-4** | No statement is made about quarantine's **semantics** — its distinctness from `blocked`, its reason vocabulary, its owner, or its exit | **Pass** — `../08_…` §5 asserts only the slots' presence and SUB-9's ownership. §9 states why the residual defaults to `blocked` **and not** `quarantined`, which is a statement about `blocked`'s definedness, **not** about quarantine's meaning. |
| **RS-5** | Omitting a slot is stated to be a failure, symmetrically with filling one | **Pass** — `../08_…` §5, "two symmetric failure modes". |

---

## 4. The non-mutation check

Executed as real commands against the working tree at the 2026-08-10 cutoff, base `dc08e89`.

| Scan | What it looks for | Result |
| --- | --- | --- |
| **A** | Any problem-level citation, problem id, external URL or `canonical_url` **value** asserted in SUB-8's output | **0 matches.** The strings `stable_id` and `canonical_url` occur only as **field names** inside the storage-ceiling prohibition. |
| **B** | Deletions in `../../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` | **0** — `git diff --numstat` reads `N 0`. `D-R5` and `D-R6` present and unmodified. |
| **C** | Deletions in `../90_open-items-and-provisional-register.md` and `../91_caps-and-incomplete-scope.md` | **0** on both — `N 0`. Every prior `### SUB-n` section byte-for-byte. |
| **D** | Any change under `../../C005-dp-map/` | **Empty diff.** `cl-1-foundational.yaml` was **read** for §10; no node, edge, `progression_stage`, `entry_gate`, difficulty value, `creator_review` value, `manifest.yaml` entry or boundary-register entry was created or altered. |
| **E** | An assigned value on `reason`, `owner` or `exit_condition` | **0 matches.** Every occurrence is a reservation. |
| **F** | Any edit to a sibling sub-task's topic doc, `### SUB-n` section, or `92_package-completeness-gate.md` | **0** — the only files SUB-8 writes are `../08_…`, this file, and appended sections in the three shared files. |

**`creator_review` after this sub-task: `"deferred-provisional"` on 179/179 non-root nodes.
Unchanged. Zero creator-confirmed.**

---

## 5. The dry-run count check

| Check | Passing condition | Result |
| --- | --- | --- |
| **DR-1** | The in-situ loop dry run produces **exactly one** candidate ledger entry | **Pass** — one, in `../../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` §3.12.1. Not zero, not two, not a merged summary. |
| **DR-2** | The entry is **correctly classed** and its class is stated with its structural limitation | **Pass** — class **3 `[dogfooding]`** named as the class the route requires, and the entry is explicitly labelled `dry-run` because the provenance triple (protocol run, date, journey id) is **absent**. **A dry-run entry is not a class 3 datum**, and the entry says so on its face. |
| **DR-3** | The entry is filed **by union** — a new terminal subsection, no prior byte modified | **Pass** — scan **B**. |
| **DR-4** | The flag's path to flipping is observable end to end | **Pass** — `../08_…` §7.5 enumerates five artifacts, in order, each with the party authorised to change it. **Steps 3–5 are not performed** and are recorded as `CAP-S8-2`. |
| **DR-5** | No status was self-promoted (`A4`) | **Pass** — `D-R7` ships **`unresolved`**; the dry-run entry is a **candidate**, adjudicated by nobody. |

---

## 6. Self-check caveat — inherited, not rediscovered

This register is written by the same sub-task whose claims it registers. **A self-check is the
weakest form of check**, and the package has said so since SUB-1. It is recorded here rather than
implied: nothing in this file is independent verification, and the two checks that are mechanical
(§4 scans **B**, **C**, **D**, and §5's `DR-1` count) are the only rows a reader should treat as
resistant to the author's own optimism. **The rest are the author auditing the author.** SUB-9's
reconciliation and NEU-969's package gate are the first genuinely external reads.
