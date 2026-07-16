# Method and Provenance

**Task:** NEU-932 · **Compiled:** 2026-07-16 · **Verification cutoff:** 2026-07-16

How this selection was produced, what it inherits, and what it did not attempt.

---

## 1. What this task was asked to decide

NEU-932 is SUB-1 of the NEU-889 charter — the setup task the other twelve sub-tasks build on. It has exactly four deliverables:

| # | Deliverable | Where |
| --- | --- | --- |
| a | Selected reference DP taxonomies and problem corpora, each with a comparison and recorded rejected alternatives | `01_…`, `02_…` |
| b | The map representation format, validated versioned-and-prompt-ready by a dry-run | `03_…`, `dry-run/00_…` |
| c | The fixed four-cluster DP-family partition, its rule, and its unassigned-technique convention | `04_…` |
| d | Provenance-and-rights marking, rights-sensitive corpora inform-only | `05_…` |

Everything else is another sub-task's job. The boundaries this task refused to cross are in §5.

## 2. Inherited machinery (referenced, never re-derived)

The NEU-889 charter is explicit: this feature *extends, never re-derives* NEU-887's machinery. Concretely:

| Inherited | From | How this package uses it |
| --- | --- | --- |
| **The seven-class evidence taxonomy** | NEU-887 `../C005-product-foundation/01_evidence-taxonomy.md` | Every finding here carries exactly one class. No class is redefined. This package produced only class 1 `[literature]` and class 2 `[code-evidence]` findings. |
| **The materiality rule** | NEU-887 | Drives what counts as a *material* choice needing a recorded rationale, and what may be excluded (e.g. CP4 in `01_…` §4). |
| **The traceability register** | NEU-887 `../C005-product-foundation/traceability/` via NEU-888's extension pattern | Extended, not rebuilt, in `traceability/`. |
| **The adjudication ledger** | NEU-887 `../C005-product-foundation/adjudication/` | Extended in `adjudication/`. **Status flips only there** — no file in this package sets its own status. |
| **Status discipline** | NEU-887 | Conflicts and gaps are preserved, not smoothed. |
| **The mastery/progression semantics** | NEU-888 `../C005-instructional-model/` | *Consumed, not used here.* This package makes no progression claim; OUT-3 does, through NEU-888. |

**Structural precedent:** the package layout (numbered topic files, topic subdirectories, `traceability/`, `adjudication/`, `decision-records/`) mirrors `../C005-product-foundation/` and `../C005-instructional-model/`. The one deliberate divergence — choosing YAML data files over pure markdown registers for the *map* (not for this package) — is argued in `03_…` §2 and is driven by the map being a graph that must be machine-audited, which neither precedent package was.

## 3. How the selection was made

1. **Candidate sweep.** Enumerated candidate DP taxonomies and competitive-programming corpora from prior knowledge of the domain, deliberately spanning four tiers (canonical/edited, pedagogically ordered, community/frontier, primary/research) because the maximalist bar is unreachable from the canonical tier alone.
2. **Inclusion test.** A candidate is selected only if it supplies a capability no already-selected source does. Redundant candidates are rejected *even when good* (Kattis, CP4) — an extra coverage-matrix column that duplicates another is cost without signal.
3. **Verification.** Rights and structural claims were machine-verified where the source permitted automated fetching, on 2026-07-16. Verified: CP-Algorithms' license and DP section contents; the USACO Guide's tiering and its reproduction bar; the CSES DP/Advanced section problem counts. **Not verified:** Codeforces returned HTTP 403 to automated fetching (`CAP-2`); T2's license is asserted from the work's stated terms.
4. **Rights disposition** recorded per source before selection was finalized, so a source's rights status could disqualify it (it did not, but it downgraded every corpus to inform-only).
5. **Partition justification.** Per the spec, the four clusters were *given*; the work was constructing a rule that makes them disjoint and exhaustive, then stress-testing it against the hard cases the spec names (plug DP, automaton DP) plus genuinely contested ones found during the sweep (SOS DP, Steiner-tree DP).
6. **Representation dry-run** run against a constructed specimen; it changed the decision twice (`dry-run/00_…` §5).

## 4. Evidence classes produced

| Class | Count | Where |
| --- | --- | --- |
| 1 `[literature]` | 10 | `01_…` F-T-1…5, `02_…` F-C-1…5 |
| 2 `[code-evidence]` | 0 | — (this package touches no source; the charter forbids it) |
| 3–7 | 0 | Not collected. **No class-7 evidence exists** anywhere in C005 — no external-user, expert, or market validation. No claim here is or implies one. |

## 5. What this task did not do (and why that is correct)

| Not done | Owner |
| --- | --- |
| Author the graph schema / node-type / skill-type vocabulary | **SUB-2** — builds inside `D-F3`'s container |
| Map any DP node or prerequisite edge | The five family-mapping sub-tasks |
| Enumerate the DP technique space | The family-mapping sub-tasks. **A list here would be topic volume masquerading as coverage** — the charter's standing anti-goal. |
| Draw cross-cluster edges | The integration sub-task |
| Adjudicate disagreements between the selected references | The coverage-audit sub-task (OUT-7). Disagreements found during the sweep were **preserved for it**, not settled here. |
| Define progression stages or difficulty dimensions | OUT-3, through NEU-888's semantics |
| Select problem licenses | A later curriculum-production charter |
| Copy any rights-sensitive content | Nobody — prohibited (`05_…`) |

## 6. Provenance of this package

**Inputs:** the NEU-932 Linear issue (spec of record); the NEU-889 charter; `../C005-product-foundation/` (NEU-887) and `../C005-instructional-model/` (NEU-888) as inherited machinery; the twelve external sources in `01_…`/`02_…`, verified as recorded in §3.

**Consumers:** SUB-2 (bound by `D-F3`), SUB-3/4/5/6/13 (each bound to exactly one cluster of `D-F4`), the coverage-audit sub-task (`D-F1`/`D-F2`), the representative-path sub-task (OUT-6 counts against `D-F4`'s four clusters), and the final packaging sub-task.

**This package modifies no source file, no MCP behavior, and no test** — per the charter's scope line.
