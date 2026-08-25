# `DR-C11-S1-2` — An unobtainable observation routes to an owned open item, and every spike conclusion carries a mandatory expiry

**Task:** NEU-993 (SUB-1) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `546ee90`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-18 (`../90_outcome-register.md`) — the clause requiring every uncertain-and-material claim to resolve to a spike record or an owned open item with both counts reported, and requiring each spike entry to carry an expiry after which its conclusion is stale.

## Decision

Four rules govern how C011 handles a production claim it cannot settle.

1. **A designed-but-unexecuted spike is still a spike-register entry.** It records its question, why
   the repository could not answer it, its exit condition, its **method in repeatable detail**, its
   date, an honest `Result: not executed` with the reason, `Confidence: none`, and an expiry. It does
   not vanish because it did not run.
2. **The unclosed claim routes to a paired open item** in `../93_open-items-and-provisional-register.md`
   with a stable id, a named owner and an **observable resolving event** — never a date, never a
   party's satisfaction.
3. **An open item and a stand-in are different records of different things.** The open item is the
   unanswered *question* and is the single record of the fact. The stand-in is the *assumption the
   design provisionally rests on* while the question is open, carrying a tolerance envelope, an
   invalidating outcome and a re-validation trigger. The stand-in's trigger **is** the open item's
   resolving event, so the pair closes together and neither restates the other.
4. **Every spike entry carries a mandatory expiry — never blank, never "N/A"** — including the
   unexecuted ones, because an unexecuted spike records an *unobtainability*, and an unobtainability
   is a property of a moment, not of the system.

## Rationale

Rules 1 and 2 exist because the alternative — recording only what closed — makes the register a
report of successes and leaves the questions invisible. Thirteen sub-tasks depend on knowing what was
asked, not just what was answered. Preserving the **method** on an unexecuted entry is what makes it
worth keeping: the next party to hold a credential can run it without re-deriving it, which is the
difference between a routed item and a lost one.

Rule 3 resolves a real tension in this sub-task's brief. One clause requires the backups status to
appear as *"an owned open item… rather than as an assumption"*; another requires a **stand-in entry**
for charter assumption 33 where observation did not close it. Read as alternatives these conflict.
They are not alternatives: they are records of two different things, and the package needs both. The
question *"do backups exist?"* is unanswered and owned — that is `OI-S1-8`, and it is the single
record of the fact that SUB-15, SUB-7 and SUB-9 cite. The claim *"backups exist, and here is the
range of answers the design tolerates and the one that breaks it"* is what downstream design rests on
in the meantime — that is `A-33`. Recording only the open item would leave no tolerance envelope and
no invalidating outcome; recording only the stand-in would present an unanswered question as a
settled assumption, which is the exact failure the first clause forbids.

Rule 4 addresses a failure mode specific to this package's outcome. The conventional stale-spike risk
is that an old *observation* is cited after the system has changed. C011 SUB-1 has the inverse: its
conclusions are *"this could not be obtained"*, and the tempting misreading is that the shape is
**inherently** unobtainable rather than that it was unobtainable from one environment on one date. An
expiry forces the re-read. This is recorded explicitly in `../92_risk-register.md` at `R14`.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | Record only open items; omit unexecuted spikes from the spike register. | Loses the designed method, so the next party re-derives it. Also leaves the spike register empty at revision 1, which under the charter's own rule is a routed gap against SUB-1 — its named author — rather than a legitimate empty. |
| 2 | Record only spikes; treat the open-items register as redundant. | Open items carry an owner and a resolving event; spike entries carry a method and an expiry. Collapsing them loses accountability in one direction or repeatability in the other. |
| 3 | Treat `OI-S1-8` / `A-33` as one record to avoid apparent duplication. | The two answer different questions and are consumed by different parties. Collapsing them would either strip `A-33`'s tolerance envelope or present an open question as a settled assumption. |
| 4 | Leave expiry blank on unexecuted entries, since there is no conclusion to go stale. | There *is* a conclusion — "not obtainable" — and it is the one most likely to be misread as permanent. Blank expiry is exactly what the charter forbids. |
| 5 | Set expiry to the package's publication date. | An expiry that has already passed on publication tells a reader nothing about when to re-check. |

## Consequences

1. `../96_spike-register.md` carries nine entries at revision 1, **none executed**, each with a
   repeatable method and an expiry of 2026-11-25.
2. `../93_open-items-and-provisional-register.md` carries nine paired open items, each with the
   creator named as owner and an observable resolving event.
3. Two of the nine are additionally paired with stand-ins — `OI-S1-8`/`A-33` and `OI-S1-9`/`A-34`. The
   pairing is stated in both registers so SUB-14's cross-register consistency check reads it as one
   fact with one owner rather than as two ids for one question.
4. The counts are reportable and sum: **0 closed by observation + 9 routed = 9**.
5. **After 2026-11-25 the register requires maintenance.** Each entry must be re-run or re-labelled;
   an entry cited past its expiry without either is the `R14` residual. The cost is real and is
   accepted in exchange for not letting "not obtainable" harden into a fact.
6. A later sub-task citing `SPK-S1-3` must cite it as *"could not be obtained from the authoring
   environment on 2026-08-25"*, not as *"cannot be obtained"*.

## Evidence

| Claim | Source |
| --- | --- |
| Nine designed spikes, none executed, each with method, confidence and expiry. | `../96_spike-register.md` |
| Nine paired open items, each with a named owner and an observable resolving event. | `../93_open-items-and-provisional-register.md` |
| The two stand-ins and their pairing with `OI-S1-8` / `OI-S1-9`. | `../95_stand-in-assumption-register.md` |
| No credential was present, so no spike could execute. | `../01_production-evidence-and-the-access-audit.md` §3 |
| C010 handed an analogous production-evidence item forward rather than observing it. | `../../C010-system-and-repository-architecture/decision-records/DR-C10-S10-2_deployment-shape.md`, published 2026-08-22 |

## Revision trigger

1. **Any of `OI-S1-1` … `OI-S1-9` closes** — the paired spike entry gains a real result, a real
   confidence and a re-based expiry.
2. **2026-11-25 passes** with entries un-re-run — every unexpired conclusion becomes an `R14`
   residual, owned by the creator as sole operator.
3. **SUB-14's cross-register consistency check** finds the open-item/stand-in pairing reads as two
   ids for one question — which would mean rule 3 is stated here but not legible in the registers,
   and routes back to SUB-1 rather than being reconciled at assembly.
4. **A later charter supersedes the open-item / stand-in distinction** with a single register shape.
