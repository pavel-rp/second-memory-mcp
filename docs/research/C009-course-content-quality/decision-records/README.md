# Decision Records

**Package:** C009 (umbrella NEU-890) · **Shape inherited from:** `../../C005-dp-map-foundations/decision-records/`
**Model:** claude-opus-5[1m]

This folder holds one record per material C009 decision, in the house shape used across the C005 packages — **Decision · Rationale · Rejected alternatives · Consequences · Evidence · Revision trigger** — each carrying a decision id (`DR-C09-nn`) and a named owner. A record exists so a later reader can reconstruct *why* a choice was made and *what would overturn it*, without re-litigating it from scratch; a decision with no recorded rejected alternatives is an assertion, not a decision. Each sub-task writes the records for its own decisions and allocates its own `DR-C09-nn` ids; **no sub-task rewrites, renumbers, or re-argues another sub-task's record** — a disagreement is filed as a ledger challenge in `../adjudication/`, which is the only place a status flips. A record never sets its own status to `settled`.
