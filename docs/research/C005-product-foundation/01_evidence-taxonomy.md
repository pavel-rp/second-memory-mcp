# Evidence Taxonomy & Claim Discipline

**Task:** NEU-897 · **Compiled:** 2026-07-11
Operationalizes NEU-887 **OUT-4** (evidence taxonomy, privacy gate, claim discipline) for the C005 product foundation. Every claim in this package is tagged with exactly one of the seven classes below and carries the provenance that class requires.

---

## The seven evidence classes

| # | Class label | Definition (what it is) | Required provenance | Structural limitation (what it can never prove) |
| - | --- | --- | --- | --- |
| 1 | **[literature]** | Published research, meta-analyses, standards, or vendor documentation external to this project. | URL + verification cutoff; prefer verbatim datapoint/effect size. | Study populations/tasks rarely match *this* product's target learner or DP domain; effect sizes do not transfer automatically. Never external-user validation of *this* product. |
| 2 | **[code-evidence]** | Facts about what the Second Memory codebase declares, computes, or exposes. | Repo path + line + commit base. | Shows capability/availability, not that a signal is *pedagogically valid* or that learners behave as assumed. |
| 3 | **[dogfooding]** | The creator running benchmark journeys as a first-class learner. | Recorded protocol run, date, journey id. | One skilled learner; overfits; not representative of the target population. **Not collected in this task.** |
| 4 | **[ai-critique]** | An AI reviewer's judgment of evidence or artifacts. | Reviewer identity, provider/model+version, prompt, run date. | Systematic biases (self-preference, verbosity, position); agreement can be false confidence. Not human/expert validation. **Not collected in this task.** |
| 5 | **[automated-eval]** | Deterministic/versioned automated evaluation against an oracle. | Case-set version, oracle, config digest, seed, environment. | Only tests what the oracle encodes; green ≠ product-correct. **Not collected in this task.** |
| 6 | **[operational-log]** | Evidence derived from production request/operation logs. | Query scope, time range, field allowlist, aggregate counts, snapshot id — **never raw payloads**. | Gated by the OUT-4 privacy gate; describes observed system behavior, not intent or generalizable preference. **Not accessed in this task** (see method §5). |
| 7 | **[future-real-user]** | Evidence from real external users. | Recruitment record, consent, method. | **Does not yet exist.** The only class that can support external-user/market generalization — and it is unavailable until later program work. |

## Claim-labeling discipline

1. **One class per claim.** A synthesized statement that leans on two classes is split into two labeled claims, or labeled with the weaker class and its limitation.
2. **Provisional by default.** Every claim states or inherits a cutoff and is revisable. Downstream chapters may overturn any claim with stronger, correctly-classed evidence.
3. **No cross-class laundering.** Classes 1–6 may **never** be relabeled or summarized as class 7. Phrases such as "users want", "the market validates", "experts confirm", or "proven to work for our learners" are prohibited unless backed by class 7 evidence — which does not exist here.
4. **Gaps are first-class.** Where no correctly-classed source was found within caps, the item is recorded in the unresolved-gap inventory (`03_synthesis.md`) rather than asserted.

## Privacy gate summary (class 6)

Operational-log evidence is admissible only through NEU-887 OUT-4's privacy gate: least-privilege, time-bounded access tied to a documented question; field allowlist with redaction of everything unnecessary; credentials always excluded; bounded retention with a deletion owner; provenance via aggregates/query-scope rather than raw payloads; and an independent zero-sensitive-content check before any downstream handoff. **This task does not exercise that gate** — it only records the constraint so downstream chapters inherit it. Reason it matters: `src/shared/logger.ts` leaves learner response text unredacted.
