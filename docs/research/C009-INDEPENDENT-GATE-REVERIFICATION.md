# C009 — Independent gate re-verification brief

**Purpose:** close the eleven C009 caps that are open **solely** because the package's completeness
gate was run by the same model that authored every document it audits.
**Model (this brief):** claude-opus-5

`91_caps-and-incomplete-scope.md` §R.2 states the remedy verbatim:

> **All nine remain open**, re-owned at `OI-S12-2` **to a reader whose model id differs.**

and `CAP-S12-1` states the negative form:

> **A second run by the same model closes nothing.**

The condition is a **differing model id**, not a human reader. This brief is the paste-ready
instrument for that run.

---

## How to run it

1. Open a session with a model that authored **nothing** in `docs/research/C009-course-content-quality/`
   — i.e. anything other than `claude-opus-5[1m]`. A different vendor is the strongest form of the
   condition, not merely an acceptable one.
2. Give that session read access to the repository.
3. Paste **everything inside the fence below**, verbatim, as one message. Add nothing.
4. The run writes exactly one new file: `docs/research/C009-course-content-quality/94_independent-gate-reverification.md`.

### The two rules that make this worth doing

**Do not tell the executing model what the previous gate concluded.** The brief below deliberately
carries no verdicts, no PASS/FAIL counts, and no findings. A brief that says *"confirm that §1 passes"*
produces agreement, not independence — which is exactly the failure this run exists to repair.

**`94_` is the correct landing slot.** `90`–`92` are allocated, `93` was taken by NEU-970's correction
pass, and `93_review-correction-pass.md` §6.4 records `94`–`99` as free for package-level registers.
The new file must carry a `**Model:**` line naming the executing model — **that line is the artifact
that discharges `C-3`**, and the run is worthless without it.

---

## The brief (paste everything inside the fence)

```
You are performing an INDEPENDENT re-verification of a documentation package's completeness gate.

WHY YOU: the package's own gate was executed by the same model that authored every document it
audits, so the package's contamination check (`C-3`) failed for it and eleven caps stayed open. You
were chosen because you authored none of it. Your independence is the entire value of this run. If
you find yourself reasoning toward what a previous run "probably concluded", stop — you have no
access to its conclusions and must not infer them.

THE PACKAGE: `docs/research/C009-course-content-quality/` — 38 markdown files plus the subfolders
`adjudication/`, `decision-records/`, `traceability/`, `dry-run/`.

READ FIRST, in this order:
  1. `README.md` — the package's own entry point, numbering convention, and status discipline.
  2. `../C005-dp-map-package/02_authoring-requirements.md` §8 — the 13-item acceptance checklist.
  3. `92_package-completeness-gate.md` §§1–8 ONLY FOR ITS METHOD — the checks it declares it runs.
     DO NOT read its §0, §9, §10, §11 or §12, and do not read any Result/Verdict cell in §§1–8.
     You need to know WHAT was checked, not what was found. If a verdict is unavoidably visible,
     record that you saw it and re-derive the value yourself before comparing.

RE-RUN THESE EIGHT AREAS. For each, execute the check yourself against the working tree and report
what YOU find, with the command or file evidence that produced it:

  §1  File-set and layout completeness — recursive directory read; file count; every file in either
      the `00`–`89` per-sub-task range or the reserved `90`–`99` package range; nothing squatting in
      the reserved range; no file renumbered across sub-tasks; every charter outcome allocated to
      C009 has a landed topic document with a named owning sub-task.
  §2  House-form conformance — every file carries a `**Model:** <id>` attribution line (constitution
      Article 4); report the distinct model ids you find and their counts; every topic document
      carries a house header whose status DEFERS rather than decides.
  §3  Evidence discipline — (a) search for class-7 `[future-real-user]` claims and classify every
      occurrence as prohibitive/definitional or as an actual claim; (b) assess whether this run of
      yours satisfies the independence condition, and say so plainly either way.
  §4  Status discipline — no file outside a ledger sets a status. Report whether the audit "every
      node whose `creator_review` is not `deferred-provisional` has an adjudicated ledger entry whose
      id its `notes` cite verbatim" runs over a NON-EMPTY set. If the set is empty, say the check
      passes VACUOUSLY and report the denominator.
  §5  Register integrity — parse `90_open-items-and-provisional-register.md` and
      `91_caps-and-incomplete-scope.md` mechanically. Report: total entries per section; duplicate
      ids; id collisions across sections; numbering gaps; dangling references in BOTH directions
      (ids cited but not defined, and ids defined but never cited).
  §6  Rights obligations, re-checked over the whole package — re-run the package's own content scans
      for problem statement text, problem-level URLs, and enumerated candidate sets. Report each
      scan's regex, its raw hit count, and your adjudication of every hit as genuine breach or
      benign. Do not accept a prior adjudication; make your own.
  §7  Cross-reference resolution — every inter-document reference resolves to an existing file and,
      where a section is named, to an existing section.
  §8  The 13-item §8 acceptance checklist — item by item. Where an item passes only because its
      subject set is empty, label it VACUOUS, not PASS.

THEN, TWO ARITHMETIC RE-DERIVATIONS. Do each one BEFORE looking at any published figure:

  A. `11_package-end-to-end-proof-and-exemplars.md` §10.1 — parse the rows yourself and count the
     mechanism classes (`deterministic`, `schema`, `AI`, `automated`). Write down YOUR counts. ONLY
     THEN read §10.2's published roll-up and report whether they agree. If they disagree, give both
     numbers and identify which rows account for the difference.
  B. `91_…` §R.1 — re-derive the caps count per sub-task section and the package total. Write down
     YOUR figures, then compare to the published ones.

OUTPUT — write exactly one file:
  `docs/research/C009-course-content-quality/94_independent-gate-reverification.md`

It must carry, in its header: the task line, a `**Model:** <your model id>` line naming YOU, the date,
and the commit base you read (`git rev-parse HEAD`). The `**Model:**` line is the point of the whole
exercise — a file without it discharges nothing.

Structure the file as: the result stated before the evidence; then one section per area above with
your evidence; then the two re-derivations; then a section "What I could not verify" naming every
check you could not execute and why.

HARD CONSTRAINTS:
  - Write ONLY `94_…`. Modify NO existing file — not a register, not a ledger, not a topic document,
    not `92_`. Verify with `git diff --numstat` before you finish and report the output.
  - Set NO status. This package's rule is that status flips only in a ledger, and you are not the
    ledger's owner. Report findings; do not adjudicate them.
  - Do not mark any cap closed. State what you verified; the ledger's owner decides what that closes.
  - Where you disagree with the package, say so plainly and give evidence. A re-verification that
    agrees with everything is indistinguishable from one that did nothing, and the package's own
    caps say a confirming run is the LESS useful outcome. Finding something the previous run
    classified benign and is not is the more valuable result.
  - If a check is not executable, record it as UNVERIFIABLE with the reason. Never report an
    unexecuted check as a pass.
```

---

## What a successful run closes

| Cap | Why it closes |
| --- | --- |
| `CAP-S1-4` · `CAP-S2-5` · `CAP-S3-7` · `CAP-S4-6` · `CAP-S5-5` · `CAP-S6-4` · `CAP-S7-5` · `CAP-S10-5` · `CAP-S11-2` | The nine named at `91_` §R.2, each closing on *"an independent reader re-runs the checks and reviews the judgment calls."* Re-owned at `OI-S12-2` to a differing model id. |
| `CAP-S9-4` | Closes on *"the probe is executed by a model that authored nothing under review, or a `C-3`-conforming cross-model correctness review is recorded."* |
| `CAP-S12-1` | Closes on *"a party other than the producing task re-opens the 40 blocks and the 25 occurrences and records agreement — or finds one the gate classified benign and is not."* |

**Closing them is the ledger owner's act, not the run's.** The run produces `94_`; an owner reads it
and records the dispositions. A model marking its own output as cap-closing would repeat the `A4`
violation this whole exercise exists to avoid.

## What it does not close

- **`OI-S7-1`** and the **179/179 `creator_review: "deferred-provisional"`** values. Those name the
  creator as *"the only qualified reviewer of the map's provisional values — not a default assignment
  of convenience."* A cross-model pass is class 4 `[ai-critique]`, never class 3 `[dogfooding]`, and
  no volume of it substitutes.
- The gate's **arithmetic failure** (`OI-S13-1`, the `11_` §10.2 roll-up). Re-derivation A above
  *confirms or refutes* it independently; **repairing** it is a separate edit to `11_`, owned by that
  document's sub-task.
- Any cap whose closure condition names network access, a registered `qa-execution:engine`, a built
  gate, or a real content unit. Those are unaffected by who reads the package.
