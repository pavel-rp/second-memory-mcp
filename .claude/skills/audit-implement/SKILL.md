# audit-implement

Execute one audit finding's implementation plan, step by step. Reads `01_plan.md` from the working folder, implements each unchecked step in order, ticks the checkbox on completion, and stops immediately if anything unexpected is found.

**One finding at a time. No skipping steps. No assumptions.**

---

## Command Syntax

```
/audit-implement <finding-id> --docs-root "<PATH>" --project-root "<PATH>"
```

### Arguments

| Argument                | Required | Description                                                   |
| ----------------------- | -------- | ------------------------------------------------------------- |
| `<finding-id>`          | YES      | Finding ID matching an existing plan folder (e.g. `C1`, `H3`) |
| `--docs-root <path>`    | YES      | Absolute path to the working documents root                   |
| `--project-root <path>` | YES      | Absolute path to the project repository root                  |

**Validation:**

- If any argument is missing, stop and ask.
- Compute the plan folder: `<docs-root>/<finding-id>__*/` — find the folder whose name starts with `<finding-id>__`.
- If no matching folder is found, stop: "No plan folder found for `<finding-id>` under `<docs-root>`. Run `/audit-fix` first."
- If `01_plan.md` does not exist in the folder, stop: "No plan file found. Run `/audit-fix` first."

---

## Safety Rules (NON-NEGOTIABLE)

**Allowed:**

- Read any file in the project
- Edit/create source files in `--project-root` (this skill is the implementer)
- Write to `01_plan.md` in the working folder (checkbox updates only)
- Read-only git commands
- `git add` and `git commit` (final step only)
- Run build, typecheck, and test commands (verification step only)

**Forbidden:**

- `git push`
- `git commit --amend` or any history-rewriting git operation
- Installing packages (`npm install`, `pnpm add`, etc.) — unless the finding's fix explicitly requires it and that exact command is in the plan
- Modifying any file outside `--project-root` or the plan folder
- Skipping STEP-001 under any circumstances
- Marking a step complete before its changes are verified

---

## Execution Procedure

### Phase 0: Load the Plan

Read `01_plan.md` in full. Extract:

- **Finding ID and title**
- **Severity and complexity**
- **Depends on** — if a dependency is listed, check that its plan folder exists and that its final commit step is checked. If not: stop and report which dependency is incomplete.
- **All steps** — ordered list with their current checkbox state (`[ ]` or `[x]`)
- **Done When** — the acceptance criterion
- **All files listed** in each step's Files table

Identify the **first unchecked step**. If all steps are already checked, report: "All steps complete for `<finding-id>`. Done When criterion: `<done-when text>`" and stop.

---

### Phase 2: STEP-001 Gate (Always Enforced)

STEP-001 is always "Read affected files and confirm finding applies."

**Execute it literally:**

1. Read every file listed in STEP-001's file list
2. Locate the specific code the finding describes (use the line numbers from the report as a starting point, but search for the actual pattern — line numbers may have shifted)
3. Make a judgment:

**If the finding still applies as described:** Tick STEP-001's checkbox in `01_plan.md`, report what you found, proceed to the next step.

**If the finding is partially addressed** (e.g. a prior fix touched the same code): Stop. Report exactly what was found and what changed. Do not proceed. The plan may need revision before implementing.

**If the finding no longer applies** (already fully fixed): Stop. Report this. Tick STEP-001 and add a note to `01_plan.md`:

```markdown
> ⚠️ Finding no longer applies as of YYYY-MM-DD. Confirmed by: [what you observed]. No implementation needed.
```

---

### Phase 3: Implement Steps in Order

For each unchecked step after STEP-001, in order:

**Before starting the step:**

- Read all files listed in that step's Files table
- Re-read the step's Goal and Changes description
- Confirm you understand what the change is and why

**Implement the step:**

- Make only the changes described in that step
- Do not fix other issues you notice along the way (note them, but do not touch them)
- Do not refactor beyond what the step requires
- Do not implement steps ahead of the current one

**After completing the step:**

- Re-read the changed file(s) to verify the change is correct
- Tick the step's checkbox in `01_plan.md`
- Write a one-line implementation note below the checkbox (what was actually done, if it differed from the plan):

```markdown
### - [x] STEP-002: <title>

> Implemented: <one sentence describing what was actually done, or "as planned" if exact>
```

**If something unexpected is encountered mid-step:**

- Stop immediately
- Do not partially implement the step
- Revert any partial changes to that step's files
- Report what was found and why it blocks the step
- Leave the checkbox unchecked

---

### Phase 4: Verification Step

The second-to-last step is always a build/typecheck/test command.

**Run the command exactly as written in the plan.** Do not substitute or modify it.

**If it passes:** Tick the checkbox. Proceed to commit.

**If it fails:**

- Stop immediately
- Do not commit
- Report the full error output
- Revert the changes that caused the failure if they can be isolated
- Leave the commit step unchecked
- Add a failure note to `01_plan.md`:

```markdown
### - [ ] STEP-NNN: Run build/typecheck

> ⚠️ Failed on YYYY-MM-DD: [error summary]. Changes reverted. Needs investigation.
```

---

### Phase 5: Commit Step

The final step is always a commit.

**Before committing:**

- Run `git diff --stat` to confirm only the expected files were modified
- If unexpected files appear in the diff, stop and report. Do not commit.

**Commit:**

```bash
git add <only the files listed in the plan's Files tables>
git commit -m "fix(<finding-id>): <lowercase title from plan>"
```

Do not use `git add .` or `git add -A`. Add only the files explicitly listed across all steps.

**After committing:** Tick the commit step checkbox. Write the commit hash as a note:

```markdown
### - [x] STEP-NNN+1: Commit

> Committed: <hash>
```

---

### Phase 6: Completion Report

After all steps are ticked, output a completion summary:

```
✅ <finding-id> — <title>

Steps completed: N/N
Commit: <hash>

Done When criterion:
"<done-when text from plan>"

Verification: <PASS / NEEDS MANUAL CHECK>

Notes:
- <any deviations from the plan>
- <any adjacent issues noticed but not fixed>
```

If any adjacent issues were noticed during implementation, list them with file and line number so they can be filed as follow-up findings. Do not fix them.

---

## Checkpoint Behavior

After each step completes, pause and output:

```
✓ STEP-00N complete: <title>
Next: STEP-00N+1 — <title>
Proceed? (or type 'stop' to pause here)
```

This gives the developer a natural inspection point after each atomic change. If the session is interrupted, the plan's checkboxes record exactly where work stopped — re-running the skill will resume from the first unchecked step.

---

## Resumability

If the skill is invoked on a finding that already has some steps checked, it resumes from the first unchecked step. It does not re-execute completed steps.

Exception: if STEP-001 is unchecked, it always starts from STEP-001 regardless of what else is checked.

---

## Edge Cases

- **Package install required by the fix** (e.g. C2: `pnpm remove zod && pnpm add zod`, C6: `pnpm add rehype-sanitize`): These are allowed only if the exact command appears in the plan's Recommended Fix block. Run the command exactly as written. Do not install additional packages.
- **Fix requires creating a new file:** Create it in the correct location. Add it to the git add list for the commit step.
- **Step's file list is incomplete** (the actual fix requires touching a file not listed): Stop. Report the unlisted file. Do not modify it without updating the plan first. This prevents scope creep disguised as implementation.
- **Complexity L finding:** After STEP-001, output a warning: "⚠️ This is an L-complexity item. Each step may take significant time. Checkpoints are enforced after every step." Proceed normally.
- **Merge conflict during the implementation:** Stop immediately. Report the conflict. Do not attempt to resolve it automatically.exit
