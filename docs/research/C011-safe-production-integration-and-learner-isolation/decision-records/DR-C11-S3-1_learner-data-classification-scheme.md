# `DR-C11-S3-1` — Classify per column group on six fields, with a four-value personal-data vocabulary and an argued completeness method

**Task:** NEU-995 (SUB-3) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `86fb38a`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-9 (`../90_outcome-register.md`) — *"every state category carrying learner data appears exactly once, with its data class, personal-data status, lawful basis, purpose, minimization position and derived flag"*

## Decision

Three choices, taken together because each depends on the others.

1. **Individuate by column group, not by table.** A table contributes more than one inventory entry
   when two of its column groups have different purposes, different derivations and different erasure
   consequences. Ten `public` tables therefore yield **thirteen** categories. The individuation rule
   itself is **consumed** from C010's
   `../../C010-system-and-repository-architecture/decision-records/DR-C10-S3-1_state-category-individuation.md`
   with its source cited, not re-invented here.

2. **Classify on exactly six fields** — data class, personal-data status, lawful basis (position),
   purpose, minimization position, derivation — and **publish that shape** as the form SUB-8's consent
   entry must match, plus a seventh field only that category needs.

3. **Use a four-value personal-data vocabulary** — `learner-identifying`, `learner-linked`,
   **`unattributed learner content`**, `not personal data` — rather than a personal / not-personal
   binary.

Completeness is **argued** through three independent enumerations that must agree, with a **published
falsifier**, rather than asserted.

## Rationale

The four-value vocabulary is forced by a fact, not chosen for nuance: **no ownership column exists on
any table at this cutoff.** A direct read of `src/infrastructure/db/schema.ts` finds no `owner`,
`user_id` or principal column on any of the twelve tables it declares, and `context_tokens` carries
only `id`, `created_at` and `expires_at` (`:312`) — SUB-1's `F-S1-1`. Attribution today is a property
of the deployment (`n = 1`, the creator; charter assumption 31), not of any stored value. A binary
vocabulary must therefore call the entire product either "personal data" — asserting a link the schema
cannot support — or "not personal data", which is plainly false of a learner's own written answers.
The third value states the actual situation, and it is the value that makes the two log tables'
conditional classification expressible at all (`DR-C11-S3-2`).

Column-group individuation matters because the fields that share a table do not share a lifecycle.
`learning_chunks` holds study content, SM-2 scheduling state and a content-audit verdict; the first is
the product, the second is **behavioural data about how well a person remembers**, and the third is
quality metadata that may quote the first. An export duty, a retention bound and an erasure action can
land differently on each. Collapsing them into one row would hide exactly the distinctions OUT-11 and
OUT-12 have to act on. The same argument separates `session_question_attempts`' attempt-and-grade group
from its pre-review snapshot quad, whose purpose is algorithm evaluation rather than assessment.

Publishing the entry shape is what lets OUT-9 stay complete-as-written while OUT-10 creates a new
category later. Without a published shape, SUB-8 would either invent its own and break comparability,
or send a revision request back into this chapter — the back-edge charter assumption 50 forbids.

An argued completeness method with a falsifier is the difference between a claim a reader can test and
one they must trust. The falsifier fired during this sub-task's own work, which is the best available
evidence that it is a real check rather than a formality.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Classify per table** — one entry per table, ten `public` entries. | Hides the distinctions the downstream outcomes act on: SM-2 scheduling state and chunk content would share a row despite having different derivations and different erasure consequences. It also breaks the bidirectional cross-check, because C010 individuates by column group and a per-table inventory could not be matched against it entry-for-entry. |
| 2 | **A binary personal / not-personal status.** | Cannot express the actual state of the system. With no ownership column anywhere, every persisted category would have to be forced into a value that misstates it — and the two log tables' genuinely conditional classification would become unwritable, forcing exactly the silently-assumed reading `DR-C11-S3-2` exists to prevent. |
| 3 | **Add a retention/erasure field to every entry**, making the shape seven fields for all categories. | That is SUB-8's decision to make per category (OUT-11), not this chapter's. Publishing a slot for it here would either leave 32 blanks for SUB-14 to fill — forbidden — or invite this sub-task to pre-empt an outcome it does not own. The consent category needs the seventh field because its retention-after-withdrawal position is inseparable from why the record exists at all; no other category is in that position. |
| 4 | **Re-derive C010's individuation rule independently** rather than consuming it. | The charter requires C010 decisions to be consumed with the source cited, and re-deriving a settled rule invites a silent divergence that would surface as a false cross-check mismatch. Where the two packages could legitimately differ is in the *data*, which was re-derived independently; the rule is deliberately shared so that a mismatch means something. |
| 5 | **Assert completeness** — state that the inventory is complete and list what was read. | Unfalsifiable, and it is the failure mode the charter names for the lifecycle half. Without a stated falsifier the omission probe has no criterion to apply, and the six process-local structures it surfaced would have been folded in silently instead of being reported as `F-S3-2`. |

## Consequences

1. Thirty-two entries, `LD-S3-1` … `LD-S3-32`, of which thirty correspond one-to-one with C010's
   `SC-S3-1` … `SC-S3-30` — a **result** of the cross-check, since the data was derived independently.
2. SUB-8 inherits a concrete entry shape and does not have to negotiate one, and OUT-9 needs no
   revision when the consent category is created.
3. **A cost, stated:** thirteen `public` categories over ten tables means a reader counting entries
   will not get ten, and must read §3 to see why. The chapter states the arithmetic explicitly
   (13 − 3 surplus = 10) for that reason.
4. **A second cost:** the `unattributed learner content` value is a statement about *today*. Twenty-five
   of the thirty-two entries change status when OUT-8's ownership column lands. That is a transition
   the inventory names per entry rather than a defect, but it does mean this chapter is a snapshot
   whose status column has a known expiry — and the expiry is a scheduled change, not a decay.
5. The process-local group rests on a manual read plus C010's independent agreement, because no
   mechanical enumeration of module-level mutable state exists. Weaker footing than the tables, stated
   as such in §11 and capped by `CAP-S3-1`.

## Evidence

| Claim | Source |
| --- | --- |
| No ownership column exists on any table | `src/infrastructure/db/schema.ts`, full read at cutoff `86fb38a`; the only `subject` columns are the academic-subject fields at `:26` and `:57` |
| `context_tokens` carries three columns and no principal | `src/infrastructure/db/schema.ts:312`; `../91_findings-register.md` § `F-S1-1` |
| Ten `public` tables, `context_tokens` the tenth | `src/infrastructure/db/schema.ts` — `pgTable(` occurs 10 times; `:312` |
| Two Drizzle-defined `infrastructure` tables | `src/infrastructure/db/schema.ts:333`, `:364` |
| The individuation rule this record consumes | `../../C010-system-and-repository-architecture/decision-records/DR-C10-S3-1_state-category-individuation.md` |
| C010's 45 categories, for the cross-check | `../../C010-system-and-repository-architecture/04_state-category-inventory.md` §3, §8 |
| The consent category is classified where it is designed, in OUT-9's shape | Charter assumption 50 |
| `n = 1`, no multi-learner evidence anywhere | Charter assumption 31; `../92_risk-register.md` § `R13` |

## Revision trigger

- **OUT-8's ownership column lands**, at which point the `unattributed learner content` status on the
  `public` and Drizzle-`infrastructure` entries resolves to `learner-linked` and this record's
  four-value vocabulary is re-checked for whether the third value is still needed.
- **A reader falsifies the inventory** by naming a store or process-local structure holding
  learner-derived data at cutoff `86fb38a` that appears in none of `LD-S3-1` … `LD-S3-32` — the
  published falsifier in `../03_learner-data-inventory-and-classification.md` §11.
- **C010 amends `DR-C10-S3-1`'s individuation rule**, which would change how many categories the same
  ten tables yield and would require the cross-check to be re-run.
- **`OI-S3-1` closes** with a controller/processor determination that makes any stated basis position
  untenable, requiring field 3 to be re-read across all 32 entries.
