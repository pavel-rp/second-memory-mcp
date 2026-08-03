# Representation Dry-Run — Versioned and Prompt-Ready

**Task:** NEU-932 · **Validates:** `D-F3` (`../03_representation-format.md`) · **Run:** 2026-07-16 · **Method:** desk-check against a constructed cold-context probe

**Acceptance scenario under test** (NEU-932): *"Given the chosen representation format, when the representation dry-run runs, then it is confirmed versioned and prompt-ready — a cold-context downstream agent consumes it as complete context and distinguishes settled from provisional decisions."*

---

## 1. What this dry-run is, and its honest limitation

The representation is validated **before the map exists** — that is the point of being SUB-1. So this dry-run cannot exercise the real map. It exercises a **constructed specimen** in the chosen format: a minimal slice containing one settled node, one provisional node, and one `D-F4a`-style indeterminate assignment, plus the manifest that governs them.

**Recorded limitation (this is a real one, not a formality):** a desk-check against a specimen the same author constructed is **class 1/2 evidence about the format's expressiveness, not class 4 `[ai-critique]` evidence that a real cold agent succeeded.** It can prove the format *can* carry the required distinctions; it cannot prove a downstream agent *will* read them correctly. A true cold-context handoff is possible only once SUB-2's schema and at least one mapper's nodes exist. **This is registered as `INC-D1`** and is the natural gate for the final packaging sub-task's cold-context dry-run (OUT-9), which supersedes this one. This dry-run is deliberately scoped to *"can the format express what the charter binds?"* — a question that is answerable now and blocks SUB-2 if the answer is no.

## 2. The specimen

**Post-review correction (2026-08-03), recorded rather than folded in silently:** the desk-check below ran on 2026-07-16 against a specimen whose cluster entries listed `files` and `owners` as two parallel lists and left the `status` enums unquoted. Review of PR 610 caught both. The cluster entries now render ownership **per file** (`sole_writer` on each `files` entry, the shape `../../C005-dp-map/manifest.yaml` ships) and the `status` enums are quoted per `../03_representation-format.md` §3's constraint. **The probe's 9/9 result is retained and now rests on the corrected shape** — the format's expressiveness was never in question, only this specimen's rendering of it was incomplete, and Q8 is answerable against the corrected specimen exactly as the table claims.

`manifest.yaml`:

```yaml
map_version: 0.1.0            # semver; the map is pre-1.0 until the graph is adjudicated
schema_version: 0.1.0         # owned by SUB-2, not by this package
status_legend:                # the settled/provisional distinction, defined ONCE, here
  settled: >-
    Adjudicated in the ledger on correctly-classed evidence. Binding on downstream
    consumers. Change requires a ledger entry, never a local edit.
  provisional: >-
    Recorded and usable, but NOT binding. Carries a named revision trigger.
    A consumer relying on it must surface that reliance.
  unresolved: >-
    Known open. Carries a named owner. A consumer MUST NOT invent a value here.
clusters:
  - id: CL-1
    name: Foundational / linear-sequence
    files:                     # every file carries its OWN sole writer — one shape, everywhere
      - path: nodes/cl-1-foundational.yaml
        sole_writer: SUB-3
  - id: CL-4
    name: DP-optimization (mainstream + research-tier frontier)
    files:                     # ONE cluster, TWO files, ONE sole writer EACH — sizing, not partition
      - path: nodes/cl-4-optimization/mainstream.yaml
        sole_writer: SUB-6
      - path: nodes/cl-4-optimization/frontier.yaml
        sole_writer: SUB-13
```

`nodes/cl-4-optimization/mainstream.yaml` (specimen slice):

```yaml
cluster: CL-4
nodes:
  - id: cl-4.knuth-optimization
    title: Knuth's optimization (quadrangle-inequality speedup)
    status: "settled"                  # ← the distinction under test
    adjudicated_at_map_version: 0.1.0
    ledger_ref: DR-F04                 # why this cluster owns it
    partition_test: T1                 # ← traceable to the rule that assigned it
    rationale: >-
      Defining contribution is cost reduction of an already-correct interval
      recurrence; T1 fires before T3, so CL-4 owns it and CL-2 may link only.

  - id: cl-4.sos-dp
    title: SOS DP (sum-over-subsets / zeta-Mobius transform)
    status: "provisional"              # ← a genuinely contested assignment
    adjudicated_at_map_version: 0.1.0
    ledger_ref: D-F4a
    partition_test: T1
    contested_by: CL-3                 # the disagreement is CARRIED, not smoothed
    revision_trigger: >-
      SUB-5 files a U4 challenge arguing the mask encoding, not the speedup,
      is the defining contribution.
    rationale: >-
      T1 fires: accelerates an already-correct subset-indexed transition.
      CL-3 has a real claim; see 04_family-cluster-partition.md section 4.2.
```

## 3. The probe: what a cold-context agent must answer

A downstream agent is given the specimen **and nothing else** — no conversation, no upstream sub-task context. It must answer:

| # | Question | Answerable from the specimen alone? | How |
| --- | --- | --- | --- |
| **Q1** | What version of the map am I reading? | ✅ | `map_version: 0.1.0` in the manifest. Pre-1.0 signals the graph is not yet adjudicated. |
| **Q2** | Is `cl-4.knuth-optimization` binding on me? | ✅ | `status: "settled"` → the legend defines settled as binding, changeable only via the ledger. |
| **Q3** | Is `cl-4.sos-dp` binding on me? | ✅ | `status: "provisional"` → legend: not binding, carries a revision trigger, reliance must be surfaced. **The two nodes are adjacent in one file and read differently.** This is the exact distinction the charter binds. |
| **Q4** | Why is SOS DP in CL-4 and not CL-3? | ✅ | `partition_test: T1` + `rationale` + `ledger_ref` → one hop to `04_…` §4.2. The agent recovers the *reasoning*, not just the *verdict*. |
| **Q5** | Does anyone disagree about SOS DP? | ✅ | `contested_by: CL-3` + `revision_trigger`. **The disagreement survives in the artifact** rather than being smoothed — the charter's hard requirement. |
| **Q6** | May I invent a value for something marked unresolved? | ✅ | The legend forbids it explicitly. |
| **Q7** | Is CL-4 one cluster or two? | ✅ | The manifest registers one `id: CL-4` whose `files` list carries two entries, each its own file with its own sole writer. **OUT-6 counts it once.** Had the layout used two cluster entries, this would silently become a five-cluster count — the manifest shape is what prevents that. |
| **Q8** | Which file do I write if I am SUB-13? | ✅ | `nodes/cl-4-optimization/frontier.yaml` — the CL-4 `files` entry whose `sole_writer` is `SUB-13` carries that `path`. The mapping is per file, so SUB-13 resolves to exactly one file in one hop. No ambiguity, no shared file. |
| **Q9** | When was this node's status last decided? | ✅ | `adjudicated_at_map_version` distinguishes a currently-settled node from one settled under an older schema. |

**9/9 answerable from the specimen alone.** No question required reconstructing intent from an upstream sub-task — the failure mode the charter names.

## 4. Result

| Requirement | Verdict | Evidence |
| --- | --- | --- |
| **Versioned** | **Pass** | `map_version` (semver) + per-node `adjudicated_at_map_version` + git history. Q1, Q9. |
| **Prompt-ready** | **Pass** | The specimen is plain text an LLM reads natively; every probe question resolved in ≤1 hop. Q1–Q9. |
| **Settled vs provisional distinguishable** | **Pass** | Required `status` field + a legend defined once in the manifest; two adjacent nodes demonstrably read differently. Q2, Q3. |
| **Disagreement preserved, not smoothed** | **Pass** | `contested_by` + `revision_trigger` carry the live CL-3/CL-4 dispute in-band. Q5. |
| **Per-cluster file ownership** | **Pass** | Manifest maps each cluster to one or more files, each carrying its own `sole_writer` — sole ownership is **per file**, which is what the layout rules require; CL-4's one-cluster/two-file shape holds without becoming a fifth cluster. Q7, Q8. |
| **Cold-context sufficiency (real agent)** | **Deferred — `INC-D1`** | Not provable before nodes exist. Superseded by OUT-9's cold-context handoff. Recorded honestly rather than claimed. |

## 5. What the dry-run changed

A dry-run that confirms everything is a dry-run that tested nothing. Two findings **changed `D-F3`**:

1. **`adjudicated_at_map_version` was added to the node shape.** The first specimen carried only `status`, and Q9 was unanswerable: a reader could not tell a node settled under the current schema from one settled long ago. The field is now a `D-F3` requirement handed to SUB-2.
2. **The manifest's cluster registry was restructured to one entry with a `files` **list**.** The first specimen gave CL-4's two files two cluster entries — and Q7 immediately exposed that this makes the map read as **five** clusters, silently breaking OUT-6's per-cluster path count. The one-id/many-files shape is now load-bearing and is recorded as such in `03_…` §4 rule 2. **This is the dry-run's most valuable result**: a plausible layout would have quietly corrupted the partition's cardinality downstream.
