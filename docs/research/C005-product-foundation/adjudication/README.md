# Evidence & Decision Adjudication Ledger (NEU-906) — LINK-4

**Task:** NEU-906 · **Status:** in progress · **Binds:** LINK-4 (mutable STATUS authority).

This package is the mutable-status adjudication layer over the frozen C005 product foundation. It reconciles every material element and evidence link from `../traceability/`, applies each item's frozen `../measurement-contracts/` MC-* rule (never changing a frozen rule), and sets the mutable evidence + decision status per material hypothesis/requirement. It is the sole owner of mutable evidence/decision status (deferred from NEU-899, `../traceability/03_…` §3 LINK-4).

Scope covers OUT-2, OUT-4, OUT-5, OUT-7.

## Files
- `00_adjudication-method-and-rule-versions.md` — method, frozen-rule-version binding, evidence-class discipline.
- `01_evidence-item-adjudication.md` — per-evidence-item ledger under its applicable MC-* contract.
- `02_operational-log-admissibility.md` — PLA-1…3 admissibility gate for class-6 log evidence.
- `03_decision-status-register.md` — per-hypothesis/requirement decision status (accepted/provisional/withheld/contradicted/unresolved).
- `04_proxy-replacement-dry-run.md` — PRX replacement dry run with history preservation.
- `05_orphan-and-unsupported-claims-audit.md` — orphan checks + adversarial self-audit.
- `06_link4-binding-and-self-check.md` — LINK-4 binding + package self-check.
