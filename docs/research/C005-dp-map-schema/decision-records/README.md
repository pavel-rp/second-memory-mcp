# Decision Records

**Task:** NEU-933 · One record per material decision, following NEU-932's `../../C005-dp-map-foundations/decision-records/`.

Each record carries: the decision, its rationale, its **rejected alternatives**, its status, and its **revision trigger**.

**These records do not set status.** `../adjudication/01_schema-decision-ledger.md` is the sole source of truth. A record's Status line is a pointer to the ledger, not an assertion.

| Record | Decision | Status |
| --- | --- | --- |
| `DR-S01_node-and-edge-schema.md` | The node/edge schema: `node_kind`, the eight-type closed vocabulary, the S1→S8 cascade, edge semantics, the four prerequisite fields. **Resolves NEU-932's `D-F3a`.** | settled |
| `DR-S02_foundational-roots.md` | The 8 DP first-principle root nodes — four principles × (knowledge + skill), typed, frozen. | settled |
| `DR-S03_boundary-register.md` | The assumed-knowledge boundary register `1.0.0` — 5 sanctioned non-DP anchors, named and versioned, none decomposed. | settled |
| `DR-S04_root-edge-disposition.md` | **The highest-blast-radius record.** Root edges are DRAWN directly by every mapper, not declared for SUB-12 — a refinement of a literal reading of NEU-932's rule 4. Carried as `X-S1`. | settled |
| `DR-S05_register-extension.md` | NEU-887's machinery extended by reference; only `-S`-namespaced ids added. Two tempting re-derivations declined. | settled |

**If you read one, read `DR-S04`.** It is the package's load-bearing judgment call, the one most likely to be wrong, and the one that affects SUB-12 and the dependency audit most directly.
