# Decision Records

**Opened by:** NEU-971 (SUB-1) · **Charter:** C010 (umbrella NEU-895) · **Opened:** 2026-08-21
**Model:** claude-opus-5[1m]
**Written by:** each sub-task, for its own decisions. **Audited by:** `NEU-985 (SUB-11)`.

**This folder is empty of records.** SUB-1 declared the shape and wrote none — it took no architecture decision. The first record lands with the first sub-task that decides something.

---

## What lands here

**One record per architecture decision.** A decision is anything that closes an option: a selected topology, a selected authority for a state category, a technology choice classified as architecture-material, a build-versus-reuse-versus-adopt answer, a rule this package will hold itself to.

**What does not land here:** a *finding* (`../02_findings-register.md`), an *open item* (`../90_open-items-and-provisional-register.md`), a *cap* (`../91_caps-and-incomplete-scope.md`), or a *spike* (`../92_spike-register.md`). A decision record may — and usually should — **cite** all four.

## Required contents (all six, on every record)

A record missing any of these fails `NEU-985 (SUB-11)`'s audit. The set is the C005 house shape, matched rather than invented:

| Section | What it must contain |
| --- | --- |
| **Decision** | What was decided, stated so it has a wrong answer. One decision per record. |
| **Rationale** | Why, against the criteria set the owning outcome names — with each criterion's weight stated **before** the scoring, not reverse-engineered from the conclusion. |
| **Rejected alternatives** | **Every** credible alternative, each with the specific consequence that decided against it. A record with no rejected alternatives is not a decision record; it is an announcement. Silent elimination is a defect — an option ruled out by a confirmed input still carries its recorded rationale. |
| **Consequences** | What this commits the programme to, what it forecloses, and what it makes more expensive. Include the migration path where one is implied. |
| **Evidence** | Real paths with lines where the claim is line-specific; upstream packages with their version or compilation date; spike records by id, inheriting their expiry; stand-ins by id (`A-28`), **named in the rationale itself, not only here**. |
| **Revision trigger** | The **observable event** that would reopen this decision. Never a date, never a party's satisfaction — the same rule `../92_spike-register.md` §5 states for spikes, and for the same reason. |

## Naming and allocation

**`DR-C10-S<n>-<k>_<slug>.md`** — where `<n>` is the sub-task number and `<k>` restarts at `1` inside that sub-task. SUB-7 writes `DR-C10-S7-1_repository-topology.md`, `DR-C10-S7-2_…`; SUB-8 writes `DR-C10-S8-1_…`, concurrently and without coordination.

**Each sub-task allocates only inside its own `S<n>` namespace, and never renumbers another's record.** This is the same rule the shared registers carry, applied to filenames. A flat global `DR-C10-<nn>` sequence would put two concurrent sub-tasks on a collision course for the same number — and the fix, renumbering, would break every citation already written against the old id, in artifacts whose entire purpose is that citations resolve.

Cite a record by its id (`DR-C10-S7-1`), not by its filename, so a slug correction never breaks a citation.

## Relationship to the outcome register

Every record names the outcome it discharges, by this package's own id — `OUT-7`, `OUT-8` — resolving into `../01_outcome-register.md` and **never** into `_local/` or `docs/wf-plans/`. Program-level outcomes are written owner-attached (`NEU-850's OUT-7`). See `../00_method-and-provenance.md` §2.5 and §3.
