# Evidence Labeling — Inherited Taxonomy, Applied Here

**Task:** NEU-915 · **Cutoff:** 2026-07-13
This synthesis does **not** re-derive an evidence taxonomy. It inherits NEU-887's seven-class taxonomy and claim discipline verbatim from `docs/research/C005-product-foundation/01_evidence-taxonomy.md` and records here only *how that taxonomy is applied* to the findings in this package. If the two ever disagree, the NEU-887 file is authoritative.

## The seven inherited classes (reference)

| # | Class | One-line meaning | Structural limitation (never proves) |
| - | --- | --- | --- |
| 1 | `[literature]` | Published research / meta-analyses / standards external to this project. | Study populations/tasks rarely match this product's learner or DP domain. Never external-user validation of *this* product. |
| 2 | `[code-evidence]` | What the Second Memory codebase declares/computes/exposes. | Capability/availability, not pedagogical validity or that learners behave as assumed. |
| 3 | `[dogfooding]` | Creator running benchmark journeys as a learner. | One skilled learner; overfits. **Not collected in NEU-915.** |
| 4 | `[ai-critique]` | An AI reviewer's judgment. | Systematic biases; not human/expert validation. **Not collected in NEU-915.** |
| 5 | `[automated-eval]` | Deterministic evaluation against an oracle. | Only tests what the oracle encodes. **Not collected in NEU-915.** |
| 6 | `[operational-log]` | Aggregates from production logs (privacy-gated). | Observed behavior, not intent/generalizable preference; aggregate-only. **Not accessed in NEU-915.** |
| 7 | `[future-real-user]` | Real external users. | **Does not yet exist.** Only class that supports external-user/market generalization. |

Full definitions, required provenance, and the privacy gate: `docs/research/C005-product-foundation/01_evidence-taxonomy.md`.

## How labeling is applied in this package

1. **Every finding carries exactly one class** and is written as `F-Mxx-n` (mechanism) or `F-Sn`/`F-CL-n`/`F-DD-n`/`F-TR-n` (cross-cutting). A statement leaning on two classes is split, or labeled with the weaker class plus its limitation.
2. **What classes appear here.** NEU-915 produces only **class-1 `[literature]`** (published studies, fresh and reused) and **class-2 `[code-evidence]`** (facts about the existing Second Memory code, read as a compatibility fact). It reuses a small number of **class-6 `[operational-log]`** aggregate references only where the prior audit already cited them, and cites them as such. It generates **no class-3/4/5** evidence and — the hard rule — **no class-7**. There is no external-user, expert, or market validation anywhere in this package.
3. **No cross-class laundering.** Classes 1–6 are never summarized as class 7. Phrases like "users want", "the market validates", "experts confirm", or "proven to work for our learners" are prohibited and absent.
4. **Provenance is mandatory per class.** `[literature]` carries a URL and, where obtainable, a verbatim datapoint/effect size; reused `[literature]` additionally cites the prior report section and inherits its 2026-07-07 cutoff. `[code-evidence]` carries a repo path. Anything unconfirmed against a fetched source is marked **UNVERIFIED** and treated as a gap, not asserted.
5. **Cutoff is stated per finding.** Fresh findings: 2026-07-13. Reused findings: 2026-07-07 (inherited). A finding never silently upgrades a reused cutoff.
6. **Causal vs. correlational is stated per load-bearing finding.** A causal instructional claim requires causal (experimental) evidence; correlational evidence supports only correlational statements. The roll-up is in `03_synthesis.md`.
7. **Gaps are first-class.** Where no correctly-classed source was found within caps, the item is recorded in the unresolved-gap inventory (`03_synthesis.md` G-list), never asserted.

## Reading a finding

Each finding uses this shape:

> **F-Mxx-n** — `[class]` · the claim in one sentence. *Provenance:* URL or repo path (+ prior-report section if reused). *Cutoff:* date. *Evidence type:* causal / correlational / theoretical / review. *Limitation:* what it cannot establish (always includes DP-transfer uncertainty where relevant).

The label is load-bearing: a downstream decision agent must not treat a `[literature]` effect size as if it were measured on this product's learners (that would require class-7, which does not exist), and must not treat a `[code-evidence]` fact as pedagogical endorsement (the existing code is a compatibility fact, per NEU-888, not accepted pedagogy).
