# Adjudication

**Package:** C009 (umbrella NEU-890) · **Extends (references, never rebuilds):** `../../C005-product-foundation/adjudication/` (NEU-887 adjudication method and status discipline), following `../../C005-dp-map-foundations/adjudication/`
**Model:** claude-opus-5[1m]

This folder holds the C009 decision ledgers — **the sole source of truth for the status of every decision this package makes**, under the inherited `settled` / `provisional` / `unresolved` values and the `A1`–`A5` discipline (union rows, never replace; a producing sub-task may not promote its own artifact to `settled`). No topic document, README, decision record, or register in this package sets a status; each defers here in its header line. Every sub-task may add its own ledger file or append its own rows to an existing one, and **no sub-task edits, reorders, renames, or deletes another sub-task's row** — a status that needs changing is changed by a new, appended entry that names the row it supersedes. Challenges against decisions owned by another package (notably `D-F5` and `D-F3a`) are filed in **that** package's ledger by append, never here and never by editing the original.
