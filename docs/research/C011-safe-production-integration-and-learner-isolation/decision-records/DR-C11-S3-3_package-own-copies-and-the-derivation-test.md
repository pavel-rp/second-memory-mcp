# `DR-C11-S3-3` — Inventory the sixth copy class as a class with zero known members, and admit or exclude every candidate on its derivation

**Task:** NEU-995 (SUB-3) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `86fb38a`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-9 (`../90_outcome-register.md`) — *"the copies this package's own activity creates … are first-class entries with an owner and a retention bound, not work product outside the frame"*

## Decision

Three parts.

1. **The sixth copy class is inventoried as `LD-S3-31` — a class with zero known members whose terms
   exist anyway.** Empty membership is **not** collapsed into "no such class". The entry carries the
   owner, retention bound, destruction condition and redaction discipline **exactly as SUB-1 recorded
   them at position 1**; this chapter reads those terms and sets none of its own.

2. **Membership is decided by a derivation test, never by a label.** The test is: *does this artifact
   contain data derived from real learner rows?* Applied to SUB-6's synthetic dry-run dataset, the
   answer is no, and the dataset is **excluded** — recorded as an exclusion with its test and its
   reason, not silently omitted. The aggregate result set is inventoried separately as `LD-S3-32`, for
   what it is: per-disposition counts and pathology-probe results, never rows.

3. **The flow is forward-only: SUB-1 records → SUB-3 inventories → SUB-9 propagates.** No entry in
   this section sets a term for an artifact that does not exist, and no entry waits on a term a later
   sub-task has yet to record.

## Rationale

**On empty membership.** SUB-1 produced zero captures, because it executed zero of nine designed
spikes for want of any production credential (`F-S1-2`). It nonetheless *set the terms*, at position 1,
before any consumer existed — and said why: *"Empty membership is not absent terms."* Honouring that
distinction is this chapter's job, and it is load-bearing rather than pedantic. **SUB-9, at position
11, has to propagate a data right through this class.** A class that was never inventoried because it
happened to be empty on the day the inventory was written is a class SUB-9 cannot route through, and
the *"no unowned copy"* audit would then be provably incomplete against the one copy class this
package itself creates. The class is a standing obligation on all future C011 activity; its membership
is a fact about one day.

**On derivation over label.** This is the correction charter assumption 44 made at round 3, and the
inventory applies it rather than restating it. The dry-run dataset was previously admitted to the
class on the strength of the phrase *"production-shaped"* — a label that was never a statement about
derivation, which is exactly what round-3 finding F3.1 caught. Under the aggregate-in-place decision
the dataset is **generated** from the real schema and read-only aggregate counts: no learner row
leaves production, so there is no copy for a duty to attach to and nothing in it to erase. Admitting
it anyway would attach an erasure duty to synthetic data while teaching a reader that membership turns
on how an artifact is described.

**On recording the exclusion rather than omitting it.** A candidate that simply does not appear is
indistinguishable from a candidate nobody considered. Recording the test and the result lets a reader
check the reasoning and disagree with it. It also fixes the boundary for SUB-6: the exclusion is
stated here, and **SUB-6 at position 8 evidences it** with its generation record and its
no-copied-rows audit — which is SUB-6's acceptance, not this chapter's.

**On the aggregate result set being a separate entry.** It is derived from production, so it is not
nothing; but counts over rows are not the rows, and it carries no learner value. Giving it its own
entry with `not personal data` status states both facts without stretching the copy class to cover
something whose whole design point is that it holds no learner data.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Omit the sixth copy class because it currently has no members.** | Collapses "empty membership" into "no such class" — the exact conflation the class was fixed at position 1 to prevent. SUB-9 would have nothing to propagate a data right through, and the unowned-copy audit would be silently incomplete against this package's own activity. It would also mean the class re-appears the first time anyone captures anything, with terms nobody had reviewed. |
| 2 | **Admit the dry-run dataset on the strength of *"production-shaped"*.** | Membership turns on derivation, not on a label (charter assumption 44). The dataset is generated, not copied; admitting it would attach an erasure duty to data containing nothing to erase, and would re-introduce the ambiguity round-3 finding F3.1 closed. |
| 3 | **Omit the dry-run dataset silently**, since it is not a member. | Indistinguishable from not having considered it. A later reader — or SUB-17's audit — cannot tell an excluded candidate from an overlooked one, and the derivation test would exist nowhere a reader could apply it to the next candidate. |
| 4 | **Set this chapter's own terms for the captures** — a fresh owner, retention bound and destruction condition. | Breaks the forward-only flow and creates two records of one set of terms, which would then be free to diverge. SUB-1 set them at position 1 specifically so that SUB-3 and SUB-9 could read rather than re-derive; a second authority over the same terms is the failure the one-question-one-record contract is written against. |
| 5 | **Fold the aggregate result set into the sixth copy class** as a member. | It holds no learner-derived value — only counts and probe outcomes — so admitting it would fail the same derivation test the dry-run dataset fails, applied inconsistently. It gets its own entry instead, which states what it is without weakening the class's admission rule. |
| 6 | **Specify terms for the dry-run dataset anyway, defensively**, in case it turns out to contain copied rows. | It does not exist at position 3, and specifying terms for a non-existent artifact is exactly what OUT-9's success criterion forbids. If SUB-6's no-copied-rows audit ever fails, that is a finding SUB-6 raises against its own acceptance — with the derivation test recorded here as the criterion it failed. |

## Consequences

1. SUB-9 (OUT-12) receives a copy class that exists, with terms it can route a propagation action
   through, whether or not any capture was ever taken.
2. SUB-6 (OUT-2) receives a stated boundary: this chapter sets no owner, no retention bound and no
   specification for the dry-run dataset, and does not audit its contents. SUB-6 evidences the
   exclusion.
3. **The derivation test is published**, so the next candidate copy — from any sub-task — is admitted
   or excluded on a criterion a reader can apply, rather than on how it is described.
4. **A cost, stated:** `LD-S3-31`'s terms are quoted from another sub-task's chapter, so if SUB-1's
   §6 is ever amended, this entry becomes a stale copy. The entry cites its source at every use for
   that reason, and the mitigation is citation rather than duplication of authority — but the copy is
   still a copy, and SUB-14's cross-register consistency check is the place it would be caught.
5. The redaction discipline SUB-1 specified remains **untested**, because there was no capture to test
   it against. That residual is SUB-1's `R8`, not re-raised here.

## Evidence

| Claim | Source |
| --- | --- |
| The sixth copy class's seven terms, quoted as recorded | `../01_production-evidence-and-the-access-audit.md` §6 |
| Members at revision 1: none; zero captures produced | `../01_production-evidence-and-the-access-audit.md` §5, §6; `../91_findings-register.md` § `F-S1-2` |
| Empty membership is not absent terms; the flow is SUB-1 → SUB-3 → SUB-9 | `../01_production-evidence-and-the-access-audit.md` §6, closing paragraph |
| The package's own copies are a sixth copy class, not an exemption | Charter assumption 39 |
| Membership narrowed by derivation; the dry-run dataset is not a member | Charter assumption 44; intake Q6; round-3 review finding F3.1 |
| Aggregate-in-place: counts from production, dry-run against synthetic data | Charter assumption 44 |
| The redaction discipline is untested against a real capture | `../92_risk-register.md` § `R8` |

## Revision trigger

- **The first capture is produced** under `SPK-S1-1` … `SPK-S1-9` — `LD-S3-31`'s membership stops
  being empty, and the terms move from standing obligation to live application.
- **SUB-1's §6 terms are amended**, which would make this entry's quoted copy stale and require it to
  be re-read against the source.
- **SUB-6's no-copied-rows audit fails** — the dry-run dataset would then contain data derived from
  real learner rows, the derivation test would admit it, and the exclusion recorded here would be
  overturned by SUB-6's own evidence at position 8.
- **A new candidate copy appears** from any C011 sub-task, requiring the derivation test to be applied
  and the result recorded as an admission or an exclusion.
