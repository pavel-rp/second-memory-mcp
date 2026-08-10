# Traceability

**Package:** C009 (umbrella NEU-890) · **Extends (references, never rebuilds):** `../../C005-product-foundation/traceability/` (NEU-887 evidence register), following `../../C005-dp-map-foundations/traceability/`
**Model:** claude-opus-5[1m]

This folder holds the evidence registers that tie every claim in the package back to what supports it — one row per claim carrying its **evidence class** (the NEU-887 seven-class taxonomy, one class per claim, no cross-class laundering, class 7 does not exist here), its **evidence type**, its **cutoff**, its **provenance**, and its **structural limitation** — followed by the orphan-and-completeness checks that prove no claim in the package is unregistered and no register row is orphaned. The registers are what make a claim auditable rather than merely stated, and the structural-limitation column is load-bearing: it is where a claim records what it can never prove. Each sub-task writes the register rows for its own claims and **no sub-task edits, reclassifies, or removes another sub-task's rows** — a disputed classification is raised in `../adjudication/`, not corrected in place.
