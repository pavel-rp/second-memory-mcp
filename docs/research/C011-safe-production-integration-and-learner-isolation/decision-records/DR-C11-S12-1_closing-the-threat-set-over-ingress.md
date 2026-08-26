# `DR-C11-S12-1` — Closing the threat set over ingress

**Sub-task:** SUB-12 (NEU-1005) · **Covers:** OUT-17 · **Written:** 2026-08-26
**Model:** claude-opus-5[1m] · **Codebase cutoff:** `origin/develop` @ `57aeba3`
**Carried in:** `../12_threat-model-and-the-gates-that-authorize-implementation.md` §2

---

## Decision

**The threat set is closed over *ingress*: a learner-state access occurs only where a request
entered.** The ingress set is the process's own entry points (`IN-1` HTTP, `IN-2` STDIO, `IN-3` the
boot migrator) plus the paths that reach the state **without entering the process** (`IN-4` a direct
database session, `IN-5` the host shell, `IN-6` the delivery pipeline, `IN-7` operator-run repository
scripts), plus `IN-8`, the prospective general web API, which under `M-A` is a *client of `IN-1`*
rather than a new ingress to the database.

Three clauses.

**Clause 1 — the partition is over entry points, not over tools.** A survey of tools is
unfalsifiable in the way a survey of stores is: a tool nobody thought of is invisible to a survey of
tools somebody thought of. It is also the wrong shape, because the paths that matter most in this
model — the operator's and the migrator's — are not tools.

**Clause 2 — the partition must extend beyond the source tree, and this is where it differs from
SUB-9's.** SUB-9 closed its copy set over egress and could bound it by the source tree, because
*"a copy exists only where a write put it, and the write set is bounded by the source tree"*
(`../09_proving-a-data-right-reaches-every-copy.md:96`–`:97`). A threat model cannot borrow that
bound: `IN-4` and `IN-5` execute no code in this repository. Four of the eight surfaces are outside
`src/` entirely, and saying so is the substance of modelling the operator rather than exempting it.

**Clause 3 — the falsifier is a procedure, and the extension shapes are named in advance.** The
falsifier is *"the claim is false if anyone exhibits a read or write of learner state that enters
through none of `IN-1` … `IN-8`"*, and the procedure is *enumerate the entry points and show each
terminates in an enumerated surface*. It is deliberately **not** a fixed number of greps. Five
extension shapes are published with the argument (`X-1` … `X-5`), one of which — a database-side
execution path — is structurally unobservable from this repository and is therefore a **blocking
finding** (`F-S12-5`) rather than a caveat.

## Rationale

The package's own record names its most-repeated defect precisely: *"a grep written from a mental
list of APIs, whose green result was then read as a property of the system rather than a property of
the pattern"* (`../09_proving-a-data-right-reaches-every-copy.md:156`–`:158`). SUB-9 reproduced it
three times in one section before its enumeration held.

This chapter reproduced it once more, during its own preparation: a delegated enumeration searched
`src/server/*.ts` for registered entry points and concluded that zero MCP prompts exist. Three do,
at `src/transport/create-server.ts:25`, `:45` and `:80`. The search was correct about the directory
and wrong about the system.

**That is the argument for clause 3.** A falsifier that names what would extend the enumeration is
worth more than a green result, because the green result is a property of the pattern while the list
is a property of the argument. Publishing the extension shapes in advance converts the model's
weakest point from something a reviewer must discover into something the model already concedes.

## Alternatives rejected

**A1 — Enumerate the 49 registered entry points and treat that as the path set.** Rejected: it
covers `IN-1` and `IN-2` and nothing else. The operator path, the migrator and the pipeline carry no
tool, and OUT-17 names the operator path explicitly as one that must be modelled.

**A2 — Reuse SUB-9's `W-1a` … `W-8` egress partition directly as the threat partition.** Rejected,
though tempting because it is already published and already adversarially reviewed. It answers *where
a copy comes to rest*, which is the wrong question: a read that discloses without copying — the
unkeyed aggregate — has no `W-*` row, and neither does an actuation channel. Reusing it would have
made `F-S12-1` structurally invisible, which is a concrete demonstration rather than a hypothetical
objection.

**A3 — Enumerate by threat actor (learner, service principal, operator, external attacker).** Rejected:
actor and path are orthogonal, and an actor-first partition duplicates every path across every actor
who can reach it while still needing a path enumeration underneath. The actor is carried as a column
of the path rather than as the partition.

**A4 — Close over the 45 state categories, mirroring C010.** Rejected: the categories are the
*objects* accessed, not the *routes* by which they are accessed, and OUT-17 asks for paths. It would
also have inherited C010's 18-question universe wholesale, which charter assumption 4 declines to
re-derive but does not require this chapter to re-adopt as a partition.

**A5 — State the enumeration as closed and let review find the gaps.** Rejected as the failure this
package keeps producing. A run that surfaced no extension shapes would be indistinguishable from a
run that did not look.

## Consequences

1. **Four of the eight surfaces are outside `src/`**, so no reading of this repository can complete
   the model. This is stated as a property of the partition rather than discovered as a limitation.
2. **`X-3` is a blocking finding, not a caveat.** A trigger created through `IN-4` would read and
   write learner rows forever and leave no repository artifact. `SPK-S12-2` names the one query that
   would settle it and is recorded `not executed`.
3. **`IN-8` costs almost nothing to model**, because C010 already fixed that the web API holds zero
   of the 45 categories and no database credential
   (`../../C010-system-and-repository-architecture/11_web-api-scope-and-resource-inventory.md:114`,
   `:124`–`:126`). Consuming that boundary is what keeps the chapter from re-deciding it.
4. **The enumeration must be re-run, not inherited**, on any change to
   `src/transport/main.ts`'s transport branch, on any dependency bump that could add an SDK client,
   and whenever the off-repo compose stack changes.

## Revision trigger

- A read or write of learner state is exhibited that enters through none of `IN-1` … `IN-8`.
- A third arm is added to the transport branch at `src/transport/main.ts:46`–`:59`.
- `SPK-S12-1` or `SPK-S12-2` executes and returns a surface this partition does not name.
- `DR-C10-S6-1`'s `M-A` is revised such that the web tier acquires a database credential, at which
  point `IN-8` becomes a genuine ingress rather than a client of `IN-1`.
