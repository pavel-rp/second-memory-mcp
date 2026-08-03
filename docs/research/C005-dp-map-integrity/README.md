# C005 DP Map — Graph-Integrity Audit (SUB-9 / NEU-943)

**Charter:** NEU-889 · **Covers:** OUT-2 (audit), OUT-6 · **Author:** NEU-943 (SUB-9)
**Audited artifact:** `../C005-dp-map/` at `map_version: 0.1.0` — 187 nodes, edge-complete.

---

## What this package is

A **graph-integrity audit** over the edge-complete DP map. It proves — by executed check,
not by assertion — the traversal, path, and skill-type-coverage guarantees the charter
claims. Four deliverables:

| # | Deliverable | File | Verdict |
| - | ----------- | ---- | ------- |
| 1 | Dependency & cycle audit (acyclic-or-justified; anchors are clean terminals) | `01_dependency-and-cycle-audit.md` | **PASS** — acyclic, 0 cycles, 0 ungrounded chains |
| 2 | Eight-skill-type union-completeness | `02_skill-type-union-completeness.md` | **PASS with 1 flagged fragility** — all 8 instantiated |
| 3 | Representative path set vs OUT-6's fixed criterion | `03_representative-paths.md` | **PASS** — 4/4 clusters + research-tier |
| 4 | AI adversarial gap-and-prerequisite analysis | `04_adversarial-gap-analysis.md` | **7 findings recorded** |

All findings consolidate in **`05_findings-register.md`**. Scope limits and what this
audit does **not** license are in **`06_caps-and-incomplete-scope.md`**.

## The headline

The graph's **structure** is clean: acyclic, fully grounded, referentially intact, all
eight skill types instantiated, and OUT-6's path criterion met on all five counts.

The graph's **annotation** was not. This audit's single most consequential result:

> 🔴 **NEU-940's `difficulty_dimensions` values were computed against the pre-NEU-939
> graph** — before the 25 cross-cluster edges existed. Two independent defect classes
> (**26** under-reported `prerequisite_depth` values, **6** `progression_stage`
> inversions) both fell out of that one cause, and both were confined **exactly** to
> nodes whose dependency chain leaves their own cluster.
>
> The isolation was unambiguous: **intra-cluster edges — 293 checked, 0 inversions.
> Cross-cluster edges — 25 checked, 6 inversions.**

This was **F-943-1**, and it is why NEU-940 routed its own unreviewed values here. The
finding was **flagged and routed**, not repaired: SUB-9 audits, it does not edit nodes.
**It has since been repaired by NEU-954 and is CLOSED** — both fields were re-derived over
the edge-complete graph (26 depth corrections, 16 stage changes, 1 `entry_gate` change),
leaving **0 inversions**. The discharging ledger entry is **`D-R4`**.

## 🔴 File ownership — this audit edited nothing it audited

This package writes **only** the files listed above. It edited **zero** node files
(`nodes/*.yaml`), **zero** edge files (`edges/cross-cluster.yaml`), and did not touch
`manifest.yaml` or `boundary-register.yaml`. Per the SUB-9 spec, *"mapping or repairing
nodes/edges"* is out of scope: a structural defect routes back to a family cluster (nodes)
or SUB-12 (edges) as a **finding**. NEU-941 held concurrent write on the node files during
this audit; not editing them was both a correctness rule and a merge-safety one.

## Reproducing

Every number in this package is produced by a checked-in script, not by reading:

```
node docs/research/C005-dp-map-integrity/validator/audit-graph-integrity.mjs
```

It parses the YAML directly and re-derives the whole audit from source. Prose here that
disagrees with the script is wrong — the script is the artifact.

## What this audit does NOT cover

- **Coverage / gap adjudication** — that is **NEU-942 (OUT-7)**, already merged. This
  audit *consumes* its verdicts (notably on F-939-A / F-939-B) and does not re-decide them.
- **JavaScript materiality** — NEU-941.
- **Progression-stage definition** — NEU-940 defines; this audit consumes and checks.
- **Repairing anything.** See the ownership note above.
