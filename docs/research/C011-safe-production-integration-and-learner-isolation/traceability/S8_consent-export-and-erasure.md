# `S8` — Consent, export and erasure: outcome-to-evidence traceability

**Task:** NEU-1002 (SUB-8) · **Charter:** C011 (umbrella NEU-893) · **Outcomes:** OUT-10, OUT-11
**Model:** claude-opus-5[1m] · **Written:** 2026-08-25 · **Verification cutoff:** `d2e2b55`, 2026-08-25

Every row resolves into `docs/research/`, never into `_local/`. **A green type-check or lint line is
not evidence about this package's content**, and none is cited as such below.

**Evidence classes used here:** `read-at-cutoff` — a real path and line read directly at `d2e2b55`;
`derived` — a conclusion computed from cited reads, with the computation shown; `consumed` — an
upstream record cited rather than re-derived; `authored-position` — a product-and-engineering
position this sub-task takes, which no observation backs and none could. **`observed-in-production`
is used zero times, as it is everywhere else in this package.**

## OUT-10 — What consent covers, what withdrawal does, and what does not rest on consent

| Outcome | Claim | Discharged by | Evidence class | Status | Residual |
| --- | --- | --- | --- | --- | --- |
| OUT-10 | Consent state resolves to **exactly one** authority — `CMP-S4-7` — under **clause 2** of C010's ordered, first-match-wins assignment rule, and authority is not split | `../08_consent-and-what-a-learner-can-export-and-erase.md` §2; `../decision-records/DR-C11-S8-1_the-consent-record-and-the-consent-boundary.md` | `consumed` (the rule, from `../../C010-system-and-repository-architecture/08_per-state-authority-matrix.md:103`, `:110`–`:113`, `:128`) + `derived` (its application to a category C010 never inventoried) | confirmed | The application is a judgement, not a lookup — C010 has no consent category to look up. The clause-5 reading is recorded as `DR-C11-S8-1` rejected alternative 3 so a reader who reaches it sees why it loses. |
| OUT-10 | A versioned consent record **mints a new category** rather than widening an existing one | `../08_consent-and-what-a-learner-can-export-and-erase.md` §2; `../decision-records/DR-C11-S8-1_the-consent-record-and-the-consent-boundary.md` § Rationale | `consumed` (`../../C010-system-and-repository-architecture/decision-records/DR-C10-S3-1_state-category-individuation.md:11`–`:13`) + `derived` | confirmed | The re-runnability inference from `../../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:143` is **this package's**, and is labelled as such in the record rather than attributed to C010. |
| OUT-10 | Consent covers **exactly three** purposes — `CP-S8-1`, `CP-S8-2`, `CP-S8-3` — selected by a published severability test | `../08_consent-and-what-a-learner-can-export-and-erase.md` §3 | `authored-position`, grounded in `read-at-cutoff` for each purpose's severability mechanism | confirmed | `CP-S8-3` is **conditionally** severable; the condition is `OI-S8-1` and is **not** asserted satisfied. |
| OUT-10 | The negative boundary is stated purpose by purpose: **14 of 14** purposes carry an explicit yes/no, and every `no` names the basis that carries it | `../08_consent-and-what-a-learner-can-export-and-erase.md` §4 | `derived` from `../03_learner-data-inventory-and-classification.md` §4–§8's basis positions | confirmed | Every basis is a **position**, never a determination — `../93_open-items-and-provisional-register.md` § `OI-S3-1`. |
| OUT-10 | The withdrawal walk is exhaustive: **33 of 33** categories, **3** affected, **0** omitted | `../08_consent-and-what-a-learner-can-export-and-erase.md` §6 | `derived` | confirmed | Exhaustive against **SUB-3's inventory**, whose own completeness is `../94_caps-and-incomplete-scope.md` § `CAP-S3-1` and whose falsifier stands unretired. Carried as `../92_risk-register.md` § `R-S8-2`. |
| OUT-10 | The consent category carries **all seven** fields — SUB-3's six, in SUB-3's order, plus the retention position after withdrawal | `../08_consent-and-what-a-learner-can-export-and-erase.md` §5 (`LD-S8-1`) | `derived`, checked field for field against `../03_learner-data-inventory-and-classification.md` §1 | confirmed | Whether **SUB-9** in fact consumes it is SUB-9's acceptance at position 11; this file asserts only that the entry exists and matches the shape. |
| OUT-10 | **Zero** back-edge edits to SUB-3's inventory are produced, requested or owed | `../08_consent-and-what-a-learner-can-export-and-erase.md` §5, §15; `../97_package-completeness-gate.md` § `G-S8-6` | `read-at-cutoff` — `git diff --numstat` shows `../03_learner-data-inventory-and-classification.md` untouched | confirmed | — |
| OUT-10 | A purpose that would rest on non-withdrawable consent is **reported as a finding with a named owner** | `../91_findings-register.md` § `F-S8-1`; `../08_consent-and-what-a-learner-can-export-and-erase.md` §4.1 | `read-at-cutoff` for all three limbs | confirmed | Limb (c) is `consumed` from `../91_findings-register.md` § `F-S16-5`, cited and not re-derived. |
| OUT-10 | The consent boundary is **created here, not documented** — zero of the 32 inventory entries rests on consent | `../91_findings-register.md` § `F-S8-4` | `read-at-cutoff` (both the inventory and the `src/`/`drizzle/` greps) | confirmed | Corroborates charter assumption 37 from a second, independent direction; the charter established it from a sweep of C010. |

## OUT-11 — Export, erasure, the completion deadline and the retention exceptions

| Outcome | Claim | Discharged by | Evidence class | Status | Residual |
| --- | --- | --- | --- | --- | --- |
| OUT-11 | Export is complete against the union at **25 of 25** categories: 32 − 8 = 24, +1 | `../08_consent-and-what-a-learner-can-export-and-erase.md` §7.2, §7.3 | `derived`, with the eight excluded entries named by id and the table-top's sub-counts summing to 25 | confirmed | Complete **against the inventory**, not against the database — `../92_risk-register.md` § `R-S8-2`; the undeclared-store question is `OI-S1-4`, cited. |
| OUT-11 | The artifact is **learner-readable, not a database dump**, against seven stated properties, five of them readability | `../08_consent-and-what-a-learner-can-export-and-erase.md` §7.1 | `authored-position` | confirmed | **Capped by `../94_caps-and-incomplete-scope.md` § `CAP-S8-1`** — the table-top is a paper exercise; **no artifact was rendered**. |
| OUT-11 | A possibly-truncated value is **labelled**, never presented as complete | `../08_consent-and-what-a-learner-can-export-and-erase.md` §7.1 | `consumed` (`../16_attribution-and-detection.md` §7) + `read-at-cutoff` (`src/transport/audit-middleware.ts:14`; `src/transport/pg-audit-transport.ts:36`) | confirmed | — |
| OUT-11 | `LD-S3-31` is dispositioned as a class with **zero members and terms that hold**, not as "no such class"; `LD-S3-32` is excluded as aggregate, with the reason stated | `../08_consent-and-what-a-learner-can-export-and-erase.md` §7.4 | `consumed` (`../01_production-evidence-and-the-access-audit.md` §6, whose terms are read and not extended) | confirmed | This sub-task sets **no term** for `LD-S3-31`; SUB-1's recorded terms stand and SUB-9 propagates through the class. |
| OUT-11 | Every category carries an erasure disposition with its reason — **33 of 33**, the consent category included | `../08_consent-and-what-a-learner-can-export-and-erase.md` §8 | `derived`, per category | confirmed | `LD-S3-10`'s disposition is the decision `../03_learner-data-inventory-and-classification.md` §4 explicitly handed here; it is taken, not deferred. |
| OUT-11 | Personal data no per-learner predicate selects is named **`unreachable`**, not recorded as deleted | `../08_consent-and-what-a-learner-can-export-and-erase.md` §8, §8.2 | `consumed` (`../91_findings-register.md` § `F-S16-5`; `../92_risk-register.md` § `R-S16-1`) | confirmed | The **disposition** of that population is **SUB-9's** under OUT-12. This file asserts nothing about which SUB-9 chooses. |
| OUT-11 | **6** retention exceptions audited against all four fields; **5 pass, 1 fails**; **zero** indefinite accepted; the consent record audited as **one of them** | `../08_consent-and-what-a-learner-can-export-and-erase.md` §9 | `derived`, with each bound's enforcement mechanism cited or its absence stated | confirmed | Exception #4's 30-day bound is stated; its **cron registration exists only as a comment**, so enforcement is not asserted — `OI-S1-9`, cited. |
| OUT-11 | The exception that cannot be given all four is a **blocking finding**, not accepted | `../91_findings-register.md` § `F-S8-2` | `derived` from `consumed` inputs | confirmed | **Blocking**, with a named owner (SUB-9) and a resolving event. **No row count is asserted** — the population's size rests on `OI-S1-5`, `OI-S1-6`, `OI-S16-1`. |
| OUT-11 | A retention position is stated for `operation_event_log`, discharging what `../92_risk-register.md` § `R-S16-4` named SUB-8 for | `../08_consent-and-what-a-learner-can-export-and-erase.md` §9 | `authored-position` | confirmed | A **position**, not the legal determination `R-S16-4` declined to make — that stays `OI-S3-1`. **No mechanism enforces it** — `../92_risk-register.md` § `R-S8-4`. |
| OUT-11 | `deadline_at` has a value with stated provenance — 30 days export and erasure, next request plus 7 days withdrawal | `../08_consent-and-what-a-learner-can-export-and-erase.md` §9.1; `../95_stand-in-assumption-register.md` § `A-S8-1` | `authored-position`, derived from the ratified GDPR-shaped baseline | `[unconfirmed]` | **Not observed, not calibrated, not a legal determination.** Carried as `A-S8-1` with a tolerance envelope, an invalidating outcome and `OI-S3-1` as its re-validation trigger. |
| OUT-11 | `SIG-S16-3` becomes **evaluable in principle and remains unemitted** | `../08_consent-and-what-a-learner-can-export-and-erase.md` §9.1; `../92_risk-register.md` § `R-S8-3` | `consumed` (`../16_attribution-and-detection.md` §3, §4 `ME-S16-6`) | confirmed | Nothing here claims the signal works. Emission is **SUB-9's** under `ME-S16-6`. |
| OUT-11 | The purge audit reports which mechanisms exist, which are wired, and what each requires, with `deleteExpired()`'s unwired status explicit | `../08_consent-and-what-a-learner-can-export-and-erase.md` §10; `../91_findings-register.md` § `F-S8-3` | `read-at-cutoff` — every port, adapter and call-site count read directly | confirmed | Ranges over the **repository**; an operator deleting rows by hand is a use this method cannot see, exactly as `CAP-S3-1` bounds `F-S3-1`. |
| OUT-11 | The stated erasure duty **exceeds** the product's erasure surface: **3** of **13** `delete`/`cascade` categories are reachable | `../08_consent-and-what-a-learner-can-export-and-erase.md` §10.2; `../92_risk-register.md` § `R-S8-4` | `derived` from `read-at-cutoff` | confirmed | The design is published as a **specification**, and OUT-11's outcome row repeats that so a reader who never opens the chapter still meets it. |

## What this file does not establish

1. **Nothing about production.** No consent captured, no export produced, no erasure run, no row
   counted, no propagation timed. `../94_caps-and-incomplete-scope.md` § `CAP-S8-1`;
   `../92_risk-register.md` § `R13` cited for the package's evidence position.
2. **Nothing about SUB-9's artifacts.** Not its propagation matrix, not its copy-class cardinality,
   not its completion-proof design, and not the disposition it will give the pre-cutover population.
   None exists at this position, and `F-S8-2` routes that population rather than resolving it.
3. **No legal determination** — not controller/processor role, not lawful-basis selection
   (`../93_open-items-and-provisional-register.md` § `OI-S3-1`), and not whether any cross-border
   transfer is lawful (`OI-S8-1`, raised here and unanswered).
4. **No revision of any upstream chapter.** `../03_learner-data-inventory-and-classification.md` and
   `../16_attribution-and-detection.md` are both **consumed and unmodified**; zero revisions are
   produced, requested or owed. `F-S8-5` reports a citation-convention discrepancy in SUB-3 and
   **requests no edit**.
5. **No claim that any duty here is implementable today.** `F-S8-3` and `R-S8-4` state the opposite.
6. **Nothing about band placement, cross-register consistency, or the package's audit set** —
   SUB-14's at position 15 and SUB-17's at position 16.
7. **No QA pass.** No capability owns the `qa-execution` surface, so that phase is a genuine no-op
   under Core Article 8 rather than a skipped gate.
