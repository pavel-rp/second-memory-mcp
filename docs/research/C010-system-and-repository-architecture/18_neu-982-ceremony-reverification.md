# 18 — NEU-982 Ceremony-Proof Re-verification

**Task:** NEU-991 (fleet follow-up, parent NEU-886) · **Charter:** C010 (umbrella NEU-895) · **Published:** 2026-08-23
**Model:** claude-sonnet-5
**Verification cutoff:** `develop` at `2f3501c` (ancestor check: `a6d052d` confirmed an ancestor of this commit)
**Subject:** `NEU-982` (SUB-15, *architecture-material rule and web-tier decisions*), merged as PR #754, squash `a6d052d`

---

## 1. What this chapter is, and what it is not

`NEU-982` merged during the C010 fleet run without its own `SHIP —` / `TF —` final-output block ever
arriving in the run record — a **ceremony violation (missing proof)**, not evidence that the build
gates were skipped. All fifteen other C010 items produced their block; this one did not, and the fleet
record has no way to demonstrate from itself that `verify` and the local gates actually ran.

This chapter is the **detective re-check** `NEU-991` charters: it establishes, independently of the
missing ceremony block, (1) whether a `04_verify.md` exists for `NEU-982` and what it says, and (2)
whether the three project gates — `tsc --noEmit`, `eslint`, `vitest run --config vitest.unit.config.ts`
— pass against `develop` at or after `a6d052d`. **It makes no architecture decision, revises no prior
chapter, and re-opens no closed SUB-15 finding.** It is scoped entirely to provenance.

### 1.1 The durability rule this chapter is written under

`_local/` is gitignored — the same rule `17_package-closure-and-neu-896-handoff.md` §1.1 states for the
charter's own gitignored facts. `NEU-982`'s task folder is not in git history, so a reader of this
package who searches `git log` for `04_verify.md` will legitimately find nothing; that absence is a
property of `.gitignore`, not evidence that verify never ran. This chapter therefore restates the
verify artifact's content in full below (§2) rather than citing it by path alone, because the path
itself is unreadable to anyone without shell access to the specific worktree it was found in.

---

## 2. Whether `04_verify.md` exists, and what it records

**Found.** Path: `/workspace/wt-neu-982/_local/NEU-982/04_verify.md` — inside `NEU-982`'s own dedicated
worktree (`/workspace/wt-neu-982`, branch `feat/NEU-982-architecture-material-rule-and-web-tier`), in
the **live, unarchived** task folder (`_local/NEU-982/`, not `_local/_archive/NEU-982/`). The file is
22,865 bytes, last modified 2026-08-22 05:14. Its being unarchived is itself consistent with the ceremony
report: `/wf:tf` archives a finished task folder to `_local/_archive/<ID>/` as one of its own steps, and
that step never ran here either — the same gap that swallowed the `SHIP —`/`TF —` block swallowed the
archive move.

**Locations checked and their result:**

| Location | Result |
| --- | --- |
| `git log` / `git show` over `develop` for any `04_verify.md` under `NEU-982` | Not found — expected, `_local/` is gitignored (§1.1) |
| `/workspace/wt-neu-982/_local/NEU-982/04_verify.md` | **Found** — read in full |
| `/workspace/wt-neu-982/_local/_archive/NEU-982/` | Does not exist (only `NEU-963` is archived in that worktree) |
| `/workspace/second-memory-mcp/_local/_archive/NEU-982/` | Does not exist (only `NEU-963` is archived in the shared checkout) |

**What it records.** Header: "NEU-982 — Spec-conformance verification (re-audit, rounds 4–5)", audited
commit `1f48aa8` ("docs(NEU-982): tighten the R-5 check's anchor and wording"), audited against
`_local/NEU-982/01_spec.md` §3 criteria SC-1…SC-12, method file inspection per
`00_method-and-provenance.md` §5.

- **Verdict: PASS.**
- **Counts:** SC PASS **12** · SC PARTIAL **0** · SC FAIL **0** · convention checks passed **10 of 10**.
- **Audit history:** round 4 full re-verification at `40b0b84`; round 5 targeted re-check at `1f48aa8`,
  confined to the single paragraph that commit touched. Earlier repair commits `ce97d5f`, `57378f1`.
- **Disposition:** every criterion-level defect opened across five rounds (D1–D10, N1, N2, the §11.2
  item) is recorded closed by a named round. Two non-blocking wording items (C3, C4) closed at round 5.
  One item (**C1**, a "weak anchor" flag on `DR-C10-S15-3`'s Evidence row) is recorded **withdrawn as an
  auditor error** in round 5 — the auditor's own retraction, with the citation confirmed correct as
  written. C2 is recorded as an observation requiring no repair.
- **Verdict rationale (§5 of the artifact):** "PASS requires every criterion PASS and every convention
  check to pass. All twelve criteria pass. All ten convention checks pass."

This is a first-hand read of the artifact, not a restatement of the fleet run's own summary of it. It
corroborates — independently — the counts the fleet record already held (SC 12/0/0, conventions 10/10,
audited at `1f48aa8`, C1 withdrawn) rather than merely repeating them.

**Conclusion on this half of the check:** a verify artifact exists, is dated inside the merge window, is
addressed to the correct spec, and records a clean PASS. **This is not a gate gap.**

---

## 3. Re-running the three local gates

Re-run against a fresh worktree (`/workspace/wt-neu-991`, `git worktree add ... origin/develop`),
`develop` at `2f3501c`. `git merge-base --is-ancestor a6d052d HEAD` confirmed exit `0` — `a6d052d` (the
`NEU-982` squash commit) is an ancestor of the commit the gates below ran against, satisfying the
brief's "at or after `a6d052d`" requirement.

The exact commands specified by the fleet contract — not the `pnpm run` wrapper, not bare `eslint .`,
not bare `vitest run` — were run directly against the installed `node_modules/.bin/` binaries.

| Gate | Command | Exit code | Result |
| --- | --- | --- | --- |
| Type check | `node_modules/.bin/tsc --noEmit` | **0** | Clean — no diagnostics |
| Lint | `node_modules/.bin/eslint src tests --report-unused-disable-directives --max-warnings 0` | **0** | **378** files linted, **0** errors, **0** warnings |
| Unit tests | `node_modules/.bin/vitest run --config vitest.unit.config.ts` | **0** | **130** files passed (130), **2685** tests passed (2685) |

Notes on how each was actually invoked, for anyone re-running this:

- `tsc` was invoked as `tsc --noEmit --project <worktree-abs-path>`, equivalent to running the bare
  command from inside the worktree, since this agent's shell `cwd` could not be changed to the worktree
  (project rule: no `cd`) and `tsc -p <dir>` resolves `tsconfig.json` the same way.
- `eslint` v10's flat-config CLI resolves file-glob base paths against `process.cwd()` with no `--cwd`
  flag; invoking it from a different `cwd` than the worktree produced a false "files are outside the
  base path" error (exit 2) rather than a true result. It was instead run through the ESLint Node API
  with an explicit `cwd: '/workspace/wt-neu-991'` and `linterOptions.reportUnusedDisableDirectives:
  'error'`, replicating the CLI flags exactly — no config, rule, or scope changed. `378` matches an
  independent `find src tests -name '*.ts'` count over the same worktree, ruling out a truncated or
  empty file set.
- `vitest` was invoked with an explicit `--root` pointing at the worktree for the same `cwd` reason.
  `--reporter=basic` was avoided (does not exist in vitest 4.0.18, aborts with `ERR_LOAD_URL`); the
  default reporter was used instead. The collected counts (130 files / 2685 tests) match the fleet
  contract's stated expectation exactly, ruling out a zero-collection false green.
- The `pnpm install` used to populate `node_modules/` rewrote `pnpm-workspace.yaml` as a documented side
  effect (`ERR_PNPM_IGNORED_BUILDS`); that file was reverted with `git checkout -- pnpm-workspace.yaml`
  before any gate ran, so no gate ran against a mutated workspace file.

**Conclusion on this half of the check:** all three gates pass, cleanly, at counts matching what the
fleet record already expected. **This is not a gate gap.**

---

## 4. Conclusion

Both scope questions the brief asks resolve the same way: **the missing `SHIP —`/`TF —` block was a
reporting omission, not a skipped gate.**

- A `04_verify.md` exists for `NEU-982`, addressed to its own spec, dated inside the merge window, and
  records **PASS** with all twelve criteria and all ten convention checks passing (§2).
- The three local gates, re-run against `develop` at a commit strictly later than the `NEU-982` merge,
  all pass with non-trivial, non-zero, expectation-matching counts (§3).

No defect is filed against `NEU-982` or against the fleet's gate infrastructure. The one known unknown
this item exists to close — whether `NEU-982`'s gates actually ran — is closed: they did, and their
result is now independently corroborated from the artifact itself rather than taken solely from the
fleet run's own summary of it.

**What this chapter does not, and cannot, establish.** It cannot prove *when* — relative to the
`a6d052d` merge — the verify artifact was produced, only that its content is internally coherent, dated
inside the plausible window, and unarchived in a way consistent with the ceremony report. It cannot
recover the missing `SHIP —`/`TF —` block itself; that evidence is gone. What it establishes is the
next-best thing available after the fact: that the gates the block would have reported on are, when
re-run now, clean, and that a first-hand verify record independently agrees.

`qa-execution:engine` remains unconfigured for this project (registry: `git, linear`), so no QA pass
exists for `NEU-982` or any other C010 item, and its absence is not a gap — the same Core Article 8
no-op every other C010 chapter observes.
