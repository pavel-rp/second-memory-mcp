# Method and Provenance

**Task:** NEU-957 (SUB-1) · **Charter:** C009 (umbrella NEU-890) · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Prior cutoff:** 2026-07-16 · **Status:** deferred — set only in `adjudication/` (this package) and `../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md` (inherited C005 decisions)
**Model:** claude-opus-5[1m]

How this sub-task's re-verification was produced, what it inherits, **what it could not do**, and the rule that follows from that inability. This file exists so that no reader of `01_provenance-and-rights.md` has to guess how strong its evidence is: the answer is stated here, once, in the open.

---

## 1. What this sub-task was asked to decide

SUB-1 is the first-landing sub-task of the C009 charter and the residual owner of **OUT-7**. It has one substantive deliverable and one enabling one:

| # | Deliverable | Where | Traces to |
| --- | --- | --- | --- |
| a | A dated re-verification of all 12 `D-F5` source dispositions, the per-source access-permission record, the permitted-field decision, the no-text rule, the enumerating-response retention disposition, per-source attribution, the generated-content policy, the extended rights-check self-check, and the repository-scan result | `01_provenance-and-rights.md` | **OUT-7** |
| b | The shared package skeleton — package folder, README, the two shared registers, the completeness-gate stub, and the four folder stubs | `README.md`, `9x_…`, `adjudication/`, `decision-records/`, `traceability/`, `dry-run/` | **no outcome.** Enabling scaffolding, created once and empty, because SUB-1 lands first |

The trigger is explicit and inherited: `../C005-dp-map-foundations/05_provenance-and-rights.md` §5 records that *"a later curriculum-production charter that intends to use problems (not merely be informed by them) must re-verify every disposition — it operates under a stricter bar than this map does, because it would reproduce content this map never touches."* C009 is that charter. No such pass existed before this one.

## 2. The two cutoffs

| Cutoff | Date | What it is |
| --- | --- | --- |
| **Prior cutoff** | **2026-07-16** | The cutoff NEU-932 recorded all 12 dispositions against (`../C005-dp-map-foundations/05_provenance-and-rights.md:3`). It is the **baseline** this pass re-verifies against, and it stays visible in every row of `01_…` §1. |
| **Current cutoff** | **2026-08-10** | This pass. Every disposition, access-permission row, attribution obligation and retention rule in `01_…` is dated here, and nothing in this package is asserted as true after it. |

The gap between them is **25 days**. That is short enough that a wholesale change of terms across twelve independent sources would be surprising, and *not* short enough to be evidence that nothing changed. The distinction matters, and §4 states exactly what this pass can and cannot say about it.

## 3. Evidence classes used (NEU-887, referenced and not re-derived)

The seven-class taxonomy at `../C005-product-foundation/01_evidence-taxonomy.md` governs every claim in this package. **One class per claim; mandatory provenance; no cross-class laundering.** This sub-task produced claims in exactly two classes:

| Class | Used here for | Required provenance, as supplied |
| --- | --- | --- |
| **1 `[literature]`** | Every claim about an external source — its licence, its terms, its stated reproduction bar, its API surface, its robots directives and rate limits, and its disposition. | The cited document or work, plus the cutoff at which it was read. **Where this pass read a prior record rather than the source itself, the row says so** (§4). |
| **2 `[code-evidence]`** | Every claim about this repository — what the C005 packages record, what this package's files contain, and what the repository scan of `01_…` §10 returned. | Repo path, and where a line is load-bearing, the line number; commit base `c558ff9` on branch `feature/847-surface-the-correct-answer-after-a`. |

**Classes 3–6 were not collected.** No dogfooding run, no AI-critique round, no automated evaluation, and no operational-log access was performed for this sub-task; none of them could bear on a rights question in any case.

**Class 7 `[future-real-user]` does not exist anywhere in this package, and no claim in it is or implies one.** No statement here says or implies that users want something, that the market validates something, that experts confirm something, or that a rights position has been externally validated. A rights disposition is a reading of a document, not a finding about people. This is the single explicit mention of class 7 in the package, and it exists to record its absence.

## 4. What was machine-verified, and what was not

**This is the most important section in this file.** It is stated plainly because the alternative — a re-verification whose reader assumes it was live — is worse than no re-verification at all.

### 4.1 No network re-fetch was available or permitted

**No network access was available to this task, and none was permitted.** Not one of the twelve sources was fetched on 2026-08-10. No licence page was retrieved, no `robots.txt` was read, no terms-of-service document was opened, no API endpoint was called, and no rate-limit header was observed. **Zero HTTP requests were issued by this sub-task.**

### 4.2 The pass is therefore a **documentary re-verification**

What this pass actually did, source by source, is: **re-read the recorded 2026-07-16 disposition and its recorded evidence in `../C005-dp-map-foundations/05_provenance-and-rights.md`, `01_taxonomy-selection.md` and `02_corpus-selection.md`; re-read the charter-level access assumptions (23 and 24) that were themselves recorded from creator decisions rather than from a fetch; check that the disposition remains internally consistent with the stricter bar C009 operates under; and re-date the disposition at the 2026-08-10 cutoff as a documentary position.** Every "what was checked" cell in `01_…` §1 says this explicitly. **No row in this package implies a live 2026-08-10 fetch,** and the tables are written so that a reader cannot mistake one for the other.

### 4.3 Fabricating a live fetch result is an absolute prohibition

**No fetch result may be invented, inferred, or written as though it had been observed.** A fabricated "verified 2026-08-10" cell is not an optimistic estimate — it is a false rights record that a downstream sub-task would consume as a precondition and act on. This prohibition is unconditional: it is not relaxed by a source whose terms are "obviously" unchanged, by a licence that "certainly" still applies, or by time pressure. Where the honest answer is *unestablished*, the honest answer is what gets written.

### 4.4 The restricted-by-default rule that follows

The three statements above force one rule, and `01_…` applies it without exception:

> **Where a source's terms, robots directives, or stated rate limits could not be established at the 2026-08-10 cutoff, the source is recorded restricted — never permissive by omission — and the gap is filed as an open item with a named owner and a revision trigger.**

At this cutoff **that is every one of the twelve sources**, because no network read was available for any of them. The consequence is deliberate and is the correct failure direction: the package becomes **more** restrictive than the 2026-07-16 baseline, never less. **An inability to read a source's terms is not evidence that the terms permit anything.** The inverse reading — "we could not find a prohibition, therefore it is allowed" — is precisely how rights leak, and it is prohibited here by name.

Two consequences bind downstream work:

1. **The baseline is preserved, not weakened.** The 11 inform-only/cite-only dispositions and T1's CC BY-SA 4.0 reusable-with-attribution-and-share-alike disposition all stand, unchanged, and stay visible in every row. The restricted-by-default rule is applied to the **access-permission** reading, which the 2026-07-16 pass never made at all — it is a new, stricter layer, not a revision of the old one.
2. **A restricted record cannot be promoted by an execution result.** `01_…` §3 states this as a rule: **no access outcome SUB-3 later records can promote a restricted source to permissive.** A successful fetch proves a server answered; it does not prove a licence.

## 5. Inherited machinery (referenced, never re-derived)

| Inherited | From | How this package uses it |
| --- | --- | --- |
| The **seven-class evidence taxonomy** | NEU-887, `../C005-product-foundation/01_evidence-taxonomy.md` | Every claim carries exactly one class. No class is redefined and none is added. |
| The **12 source dispositions** (`D-F5`) | NEU-932, `../C005-dp-map-foundations/05_provenance-and-rights.md` §1 | Re-verified at a new cutoff and **never edited in place**. The baseline stays visible in every row of `01_…` §1. |
| The **§2 selection-and-curation bright line** | NEU-932, same file §2 | Restated in `01_…` §2 as covering the rights of **reproduction and retention**, and used as the ground for the enumerating-response retention disposition (`01_…` §6). |
| The **`RC-1`…`RC-6` rights checks** | NEU-932, same file §4 | Extended in `01_…` §9 with `RC-7` and `RC-8`. Existing checks are restated with their passing conditions and re-resolved at this cutoff, not renumbered. |
| **`D-F3a`'s field constraint** | NEU-932, `../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md:27` | *"No field may hold verbatim external content; problem references are URLs and identifiers only."* Used as the **admission** rationale for the two fields inside the bar (`01_…` §4), and as the **bar to argue against, not around**, for the four outside it. |
| **Status discipline** (`settled` / `provisional` / `unresolved`, `A1`–`A5`) | NEU-887 via NEU-932's ledger §1 | Applied to every ledger interaction. Union rows, never replace. **This package does not promote its own artifacts to `settled`.** |
| The **sanctioned corpus-access hierarchy** | C009 charter assumptions 23 and 24 (both **confirmed**) | Recorded per source as a rights fact in `01_…` §3. This sub-task records the hierarchy's **rights half**; it exercises no part of it. |

## 6. What this sub-task did not do (and why that is correct)

| Not done | Owner |
| --- | --- |
| Fetch or verify any individual problem | **SUB-3 (NEU-959)** — this sub-task writes the precondition SUB-3 consumes |
| Exercise any part of the sanctioned access hierarchy | **SUB-3** — SUB-1 records the rights half only; **zero requests were issued here** |
| The AI-contamination control and its probe | **SUB-9 (NEU-965)** — one explicitly carved-out part of OUT-7 |
| Select or license a corpus | Nobody in C009 — `C1`–`C6` are selected by `D-F2`; commercial licensing is out of scope charter-wide |
| Edit `D-F5`, `05_provenance-and-rights.md`, or any existing ledger row in place | Prohibited. A change is filed as an **appended** ledger challenge |
| Decide charter assumption 19 (`title` / numeric `constraints` as facts rather than expression) | The `D-F5` ledger challenge. **This sub-task files it; it does not decide it** |
| Fill the shared registers with anything other than SUB-1's own entries | Each sub-task writes its own; **NEU-969 (SUB-12)** reconciles the caps register |
| Claim any QA pass | Nobody — `qa-execution:engine` is unconfigured in this repository (registry: `git, linear`), so the QA-execution phase is a genuine no-op |

## 7. Provenance of this file

**Inputs:** the NEU-957 issue and its spec of record; the C009 charter (umbrella NEU-890) and its assumptions 19, 20, 23 and 24; `../C005-dp-map-foundations/` at verification cutoff 2026-07-16 (`05_provenance-and-rights.md`, `01_taxonomy-selection.md`, `02_corpus-selection.md`, `adjudication/01_selection-decision-ledger.md`); `../C005-product-foundation/01_evidence-taxonomy.md`.

**Consumers:** every C009 sub-task, and **SUB-3 (NEU-959)** in particular, which consumes `01_…` §3 and §6 as dated preconditions.

**This package modifies no source file, no MCP behaviour, no schema, no migration, and no test.**
