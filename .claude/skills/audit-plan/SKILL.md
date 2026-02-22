# audit-plan

Create a tracked implementation checklist for one audit finding. Reads the finding from a REPORT.md, creates an isolated working folder, and writes a checkbox-driven plan. **Planning only — never modifies source code.**

---

## Command Syntax

```
/audit-plan <finding-id> --docs-root "<PATH>" --report "<PATH>"
```

### Arguments

| Argument             | Required | Description                                                    |
| -------------------- | -------- | -------------------------------------------------------------- |
| `<finding-id>`       | YES      | Finding identifier from the report (e.g. `C1`, `H3`, `M6`)     |
| `--docs-root <path>` | YES      | Absolute path to the folder where working documents live       |
| `--report <path>`    | YES      | Absolute path to `REPORT.md` (or equivalent audit report file) |

**Validation:**

- If any argument is missing, stop and ask before proceeding.
- If `--report` path does not exist, stop and report the error.
- If `<finding-id>` is not found in the report, stop and list the finding IDs that were found.

---

## Safety Rules (NON-NEGOTIABLE)

**Allowed:**

- Read any file in the project (`Read`, `Glob`, `Grep`)
- Read-only git commands (`git rev-parse`, `git branch`, `git log`)
- Write/create files ONLY inside `--docs-root`

**Forbidden:**

- Modify any source file
- Run builds, tests, linters, or installs
- Run any destructive git operation

---

## Execution Procedure

### Phase 0: Setup

**Step 0a — Parse the report:**

Read `--report` and locate the block for `<finding-id>`. The block starts at the finding heading (e.g. `### C1.` or `## C1`) and ends at the next heading of equal or higher level.

Extract:

- **Title**: the heading text after the ID (e.g. "API Key Leak to Logs via URL Query Parameters")
- **Severity**: CRITICAL / HIGH / MEDIUM / LOW (from the section it lives in)
- **Complexity**: S / M / L (from the "Fix (Complexity: X)" line)
- **Files affected**: the list under "Files affected"
- **What is wrong**: the full description paragraph(s)
- **Fix**: the recommended fix block (code or prose)
- **Dependencies**: any finding IDs mentioned as prerequisites (look for "prerequisite", "depends on", "must precede", "before" language in the finding or roadmap)

**Step 0b — Compute folder name:**

```
slug = lowercase(title), replace spaces and special chars with hyphens, truncate to 50 chars
folder = <docs-root>/<finding-id>__<slug>/
```

Example: finding `H3`, title "All API Routes Return Hardcoded 502" →

```
<docs-root>/H3__all-api-routes-return-hardcoded-502/
```

**Step 0c — Create or reuse the folder:**

- If it already exists, reuse it. Do not delete existing contents.
- If it does not exist, create it.

---

### Phase 1: Build the Checklist

Decompose the fix into 3–7 atomic, ordered steps. Apply these rules:

**Always include as the first step:**

- `STEP-001`: Read all affected files listed in the report. Confirm the finding still applies as described (file line numbers may have shifted, or a prior fix may have partially addressed it).

**Always include as the last two steps:**

- Second-to-last: Run the appropriate verification command (build, typecheck, or test — derive from the project's package.json or jest.config, do not hardcode). Confirm no regressions.
- Last: Commit with message `fix(<finding-id>): <lowercase title>`.

**Middle steps** come from the fix description. Split by concern:

- One step per distinct file or logical change area (e.g. "update schema", "update consumer", "add middleware" are separate steps)
- If the fix is a single-file, single-change S-complexity item, one middle step is fine
- If the fix involves a new abstraction used in multiple places, put "create abstraction" before "wire into consumers"

**Step heading format:** Every step heading MUST use a checkbox: `### - [ ] STEP-NNN: <title>`

**Step quality rules:**

- Each step is independently verifiable
- No step touches more than 5 files
- No exact code — describe the change in plain language
- Do not define test cases (that's the implementer's judgment)

---

### Phase 2: Write the Plan

Write `01_plan.md` to the working folder. **Overwrite if it exists** (git history preserves prior versions).

---

## Plan Document Template

```markdown
# <finding-id> — <title>

**Severity:** <CRITICAL | HIGH | MEDIUM | LOW>
**Complexity:** <S | M | L>
**Depends on:** <finding-id(s) or —>
**Created:** <YYYY-MM-DD HH:mm>

---

## What Is Wrong

<copied verbatim from the audit report finding description>

---

## Recommended Fix

<copied verbatim from the audit report fix block — prose and/or code>

---

## Progress

- [ ] STEP-001: Read affected files and confirm finding applies
- [ ] STEP-002: <title>
- [ ] ...
- [ ] STEP-NNN: Run build/typecheck — confirm no regressions
- [ ] STEP-NNN+1: Commit — `fix(<finding-id>): <lowercase title>`

---

## Execution Plan

### - [ ] STEP-001: Read affected files and confirm finding applies

**Goal:** Verify the finding is still accurate. Line numbers may have shifted or a prior fix may have partially addressed it. Do not proceed to STEP-002 if the finding no longer applies — note the discrepancy and stop.

**Files to read:**
<list from "Files affected" in the report>

**Depends on:** —

---

### - [ ] STEP-002: <title>

**Goal:** <1-2 sentences: what this step achieves>

**Changes:**

- <plain-language description of the change, not code>
- <another change if applicable>

**Files:**
| File | Action |
|------|--------|
| `path/to/file.ts` | modify |
| `path/to/new-file.ts` | create |

**Depends on:** STEP-001

---

<... repeat for each middle step ...>

---

### - [ ] STEP-NNN: Run build/typecheck — confirm no regressions

**Goal:** Verify the fix compiles and does not break existing functionality.

**Command:** <derive from project config — e.g. `pnpm tsc --noEmit`, `pnpm build`, `pnpm test --passWithNoTests`>

**Depends on:** STEP-<previous>

---

### - [ ] STEP-NNN+1: Commit

**Goal:** Produce an atomic, traceable commit for this finding.

**Message:** `fix(<finding-id>): <lowercase title>`

**Depends on:** STEP-NNN

---

## Done When

<1-2 sentences describing the observable state that confirms this finding is fully resolved.
Be specific — not "the bug is fixed" but "logError() no longer includes query parameters in its output"
or "pnpm tsc --noEmit passes with no errors after zod is moved to dependencies".>
```

---

## Output Summary

Every run produces one folder with one file:

| Path                                          | Mode      | Purpose                      |
| --------------------------------------------- | --------- | ---------------------------- |
| `<docs-root>/<finding-id>__<slug>/01_plan.md` | Overwrite | The implementation checklist |

No subdirectories. No JSON. No logs. One markdown file per finding.

---

## Batch Usage

To plan an entire phase at once, invoke the skill once per finding in dependency order:

```bash
/audit-plan C1 --docs-root "/path/to/docs" --report "/path/to/audit/REPORT.md"
/audit-plan C2 --docs-root "/path/to/docs" --report "/path/to/audit/REPORT.md"
/audit-plan C4 --docs-root "/path/to/docs" --report "/path/to/audit/REPORT.md"
# etc.
```

Each invocation is independent. The `Depends on` field in each plan captures cross-finding sequencing — the implementer is responsible for respecting that order.

---

## Edge Cases

- **Finding ID not found in report:** List available IDs and stop. Do not guess.
- **Finding has no explicit fix:** Note this in the plan under "Recommended Fix" and add a STEP-002 that says "Investigate and determine fix approach before proceeding."
- **Complexity is L:** If the finding is L-complexity, add a note at the top of the plan: "⚠️ This is an L-complexity item. Consider breaking it into sub-tickets before executing."
- **Folder already exists:** Reuse it. Overwrite `01_plan.md`. Do not touch any other files in the folder.
- **Dependency finding has no plan yet:** Note it in the `Depends on` field and add a warning: "⚠️ Plan for <dep-id> has not been created yet. Create it first."
