# C008 — probe record: reviewable chunk size

Probes: 3 · All closed unmerged · **Per-file diff size cap CONFIRMED by direct observation** · **Working chunk size named: ~1,200 added lines per file.**

This is SUB-10's deliverable (NEU-949). It records a measurement, not a review. The probe PRs it names are instruments and were never merged; this file is the only thing SUB-10 ships.

The two verdicts below are stated **independently and are decoupled on purpose**. Verdict 1 is what the record owes the charter — the cause. Verdict 2 is what SUB-11, SUB-12 and SUB-13 actually consume — a size observed to work. Verdict 2 rests on its own direct observation and does not depend on Verdict 1 being right.

---

## Method

Three pull requests were opened against `pavel-rp/second-memory-mcp`, base `develop`, on 2026-08-03.

Each probe PR added **exactly one new file, at the same path** — `probe/neu-949/chunk.yaml`. The content was a truncated copy of an existing repository node file, `docs/research/C005-dp-map/nodes/cl-2-combinatorial.yaml`, cut at a node boundary (a `  - id:` line) so that every probe remained a valid YAML document.

**Content type and file path were held constant across all three probes; only the added-line count varied.** Size is therefore the only variable under test. Because every probe adds a brand-new file, the PR's added-line count equals the file's line count exactly.

### Reviewer registration

The reviewer was requested by a **direct `gh api` POST** to `/repos/{owner}/{repo}/pulls/{n}/requested_reviewers`, naming `copilot-pull-request-reviewer[bot]`.

`gh pr edit --add-reviewer` was **deliberately not used and not trusted** — it is known to report success while silently failing to register a reviewer, and a probe that never obtained a reviewer would prove nothing. Registration was **API-confirmed for all three probes**: the POST response body listed the reviewer under `requested_reviewers`, and a review from `copilot-pull-request-reviewer[bot]` subsequently landed on every probe. No probe in this series relies on a command exit code for its registration claim.

---

## Results

| Probe | PR | Added lines | Files | Registration API-confirmed | Observed outcome |
| ----- | --- | ----------- | ----- | -------------------------- | ---------------- |
| A | [640](https://github.com/pavel-rp/second-memory-mcp/pull/640) | **2504** | 1 | yes | **Zero files resolved** — "Copilot wasn't able to review any files in this pull request." |
| B | [641](https://github.com/pavel-rp/second-memory-mcp/pull/641) | **1893** | 1 | yes | **File resolved** — a pull-request overview naming the file, plus a line-anchored finding at `probe/neu-949/chunk.yaml:57`. |
| C | [642](https://github.com/pavel-rp/second-memory-mcp/pull/642) | **1215** | 1 | yes | **File resolved** — a pull-request overview naming the file, plus a line-anchored finding at `probe/neu-949/chunk.yaml:57`. |

The B and C outcomes are unambiguous resolutions: the reviewer produced a file-level summary *and* anchored a comment to a specific line of the file, which is only possible if the file resolved. The A outcome is the exact failure string observed on PRs 615, 617 and 618 — the failure reproduces on demand.

### Prior corroborating evidence

From the charter's own measurements of the pre-existing PR record (`03_review-log.md`, Round-1 host disposition):

- 147 added lines (max per file, PR 610) — reviewed.
- **1,747** added lines (PR 616) — reviewed, 2/2 files resolved.
- **2,185** (PR 618), **2,244** (PR 615), **2,931** (PR 617) — all resolved zero files.

The probes are consistent with every one of these data points and add three controlled observations to them.

---

## Verdict 1 — causal

**The per-file diff size cap is CONFIRMED by direct observation.**

A single-file diff of 2,504 added lines resolved zero files, while the same content type at the same path resolved normally at 1,893 and at 1,215 added lines. The only variable that changed was size.

**The boundary lies between 1,893 added lines (resolves) and 2,504 added lines (zero).** Combined with the prior record — 1,747 resolves, 2,185 resolves zero — it narrows to **between ~1,893 and ~2,185 added lines**.

The boundary is reported as an **interval, not a point**: no probe was run between 1,893 and 2,185, so no exact threshold is asserted here. This is a time-boxed spike; the deliverable is a recorded answer, not a complete theory of the reviewer.

This verdict replaces the pre-probe `[INFERENCE — not proven]` label the charter carried for root cause 1. The cap is now a measured fact and should be cited as one.

---

## Verdict 2 — the working chunk size

**A chunk of ~1,200 added lines per file is observed to resolve, and is the recommended re-presentation unit for SUB-11, SUB-12 and SUB-13.**

This rests on a direct observation and nothing else: probe C presented 1,215 added lines in one file and the reviewer resolved it, producing both an overview and a line-anchored finding. That observation stands on its own — **it remains true and usable regardless of whether Verdict 1's account of the cause is correct.**

- **Recommended unit: ~1,200 added lines per file.** It carries real margin on either referent: roughly **985 lines** below the lowest observed non-resolving measurement (2,185, PR 618), and roughly **690 lines** below the lower edge of the boundary interval (1,893, the largest measurement observed to resolve).
- **Largest size observed to resolve in this series: 1,893 added lines.** Usable, but it sits directly against the lower edge of the boundary interval and leaves no margin; ~1,200 is the safer unit.

The floor was never reached. The brief's ~200-line floor branch — "no chunk size obtains a review" — **did not occur**, so OUT-3's method has a landing site and needs no re-scoping. SUB-11, SUB-12 and SUB-13 are unblocked.

---

## Standing rule, restated

**A review that resolves zero files is a failure signal, never a clean bill.** This binds regardless of the cause. The "0 findings" reported on PRs 615, 617 and 618 means the content was never read; it is not evidence that the content is clean.

---

## Closure

All three probe PRs were closed unmerged. No probe branch content lands on `develop`.

```
$ gh pr view 640 --json number,state,mergedAt,changedFiles,additions
{"additions":2504,"changedFiles":1,"mergedAt":null,"number":640,"state":"CLOSED"}

$ gh pr view 641 --json number,state,mergedAt,changedFiles,additions
{"additions":1893,"changedFiles":1,"mergedAt":null,"number":641,"state":"CLOSED"}

$ gh pr view 642 --json number,state,mergedAt,changedFiles,additions
{"additions":1215,"changedFiles":1,"mergedAt":null,"number":642,"state":"CLOSED"}
```

---

**Recorded by:** claude-opus-5[1m]
**Date:** 2026-08-03
**Slice:** SUB-10 (NEU-949), charter C008, umbrella NEU-945
