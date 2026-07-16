# Traceability

**Task:** NEU-933 · **Extends (references, never rebuilds):** `../../C005-product-foundation/traceability/` (NEU-899 trace-record schema, relation vocabulary, orphan checks) and `../../C005-product-foundation/01_evidence-taxonomy.md` (NEU-897 seven-class taxonomy), following the pattern NEU-888 established and NEU-932 followed.

| File | What it is |
| --- | --- |
| `01_schema-evidence-register.md` | One row per labeled finding this package produced (`F-S-1…5`), keyed by the finding's own id — no second numbering. Plus the `SOC-*-S2` orphan/completeness checks. |

**It adjudicates no status** — that is `../adjudication/01_schema-decision-ledger.md`.

**It defines no taxonomy, no class, and no relation type.** NEU-899's relation vocabulary is used unchanged; NEU-887's seven classes are referenced, never restated. Only `-S`-namespaced ids are added.

## Read `SOC-7-S2` first

It is the most material row in the register, and it says something a reader should not have to dig for:

> **Most of NEU-933's decisions are not evidenced. They are argued.**

`D-S1` (the schema), `D-S4` (root-edge disposition), and `D-S5` (the register extension) are **design decisions, not empirical findings**. They rest on argued constraints — five mappers must run in parallel, the floor must be reachable at map time, the charter mandates a knowledge/skill distinction — **not** on class-1 evidence about how DP is learned. **No such evidence exists anywhere in C005** (`X-D3`, non-downgradable High).

**The register says so rather than manufacturing `F-S-*` rows to make them look evidenced** — which would launder a design choice as a discovery. NEU-932's `SOC-7` made exactly this disclosure for `D-F3`/`D-F4`; it is **inherited, not worked around**.

That is also why this package has **five findings rather than fifty**: no source was fetched, because the schema is a design artifact and none was needed. **A padded register would misrepresent what this package is.**
