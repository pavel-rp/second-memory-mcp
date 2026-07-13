# Decision Records — How to Author One

**Task:** NEU-916 (authors the template only) · **Compiled:** 2026-07-13

This folder holds the **per-mechanism decision-record template** (`00_decision-record-template.md`) and, later, the filled records (`DR-M01…DR-M10`) authored by the mechanism-decision sub-tasks (NEU-917…921). **NEU-916 authors no record** — it makes no instructional decision. This folder is scaffolding.

## For a downstream decision agent (cold start)

1. Read `00_decision-record-template.md` — the field schema, the enforceable-control rule (§2), the learning-critical designation table (§3), and the blank template (§4).
2. Read your mechanism's evidence: `../mechanisms/Mxx_*.md` (labeled findings) and its rows in `../traceability/01_instructional-evidence-register.md` (the `F-*` ids to cite).
3. Read the cross-cutting framing once: `../02_cognitive-load-desirable-difficulty-transfer.md` (the load / difficulty framing rule your record must satisfy).
4. Copy the blank template into `DR-Mxx_<mechanism>.md`, fill every field, and run the §5 conformance checklist.
5. Mirror your claimed status (`settled`/`provisional`/`unresolved`) into `../adjudication/01_instructional-decision-ledger.md` under your cluster section.

## The one rule that trips records up

If your mechanism is **learning-critical** (M03, M04, M06, M08, M09, M10 — see template §3), the **enforceable-control field is required and must not be prose-only**: it must name a failure mode, a machine-checkable check, and an enforcement point (template §2). A prose aspiration ("the grader should be reliable") is a detectable unmet requirement — the conformance check flags it. The threshold *value* inside the check may be deferred (`UNRESOLVED → LINK-I2`); the check's shape and enforcement point may not.

You will **not** find a decision here from NEU-916. If you need one authored, you are the sub-task that authors it.
