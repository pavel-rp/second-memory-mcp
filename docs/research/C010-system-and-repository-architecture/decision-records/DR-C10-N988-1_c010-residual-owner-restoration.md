# DR-C10-N988-1 — Restore the two falsely-closed owners rather than re-route the residual

**Task:** NEU-988 · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-23
**Model:** claude-opus-5[1m]
**Discharges:** no `OUT-*`. This record is an **owner-attribution repair** over the closed package, not an architecture decision inside it — see "A note on the id namespace" below.
**Cites:** `../91_caps-and-incomplete-scope.md` (all 28 caps), `../90_open-items-and-provisional-register.md` (14 open items), `../93_stand-in-assumption-register.md` (`A-25`–`A-29`), `../02_findings-register.md` § NEU-988.

---

## A note on the id namespace

The naming rule in `README.md` is `DR-C10-S<n>-<k>`, where `<n>` is the **sub-task number**. **NEU-988 is not a C010 sub-task** — the sixteen sub-tasks are `NEU-971` … `NEU-986` and the package closed on 2026-08-22. Minting an `S17` would assert a seventeenth sub-task that does not exist, and a flat `DR-C10-<nn>` would introduce exactly the global counter this package's id namespacing was adopted to prevent (`README.md` §Naming and allocation; `../91_…md` §Id namespacing). This record therefore allocates in an **`N988` namespace keyed to its own tracker id** — the same shape (`DR-C10-<namespace>-<k>`), a namespace no sub-task can collide with, and no counter anywhere. Cite it as **`DR-C10-N988-1`**.

---

## Decision

**`NEU-896` and `NEU-893` are restored to `Backlog`**, and the eleven caps whose owners are all merged C010 sub-tasks are **additively co-named** to the restored `NEU-896` in `../91_…md` § NEU-988.

Stated so it has a wrong answer: the alternative was to accept both terminal states as correct and route the residual to a **new** owner — either a successor convergence item or a redistribution across the four unbuilt sibling packages. **That is rejected.** The claim this record makes is falsifiable: it asserts that neither `NEU-896` nor `NEU-893` performed the work its `Done` state records, and that both states were written by a sibling's merge rather than by the item's own completion. If either item produced a deliverable, this decision is wrong.

---

## Rationale

The criteria and their weights are stated **before** the scoring.

| # | Criterion | Weight | Why it carries that weight |
| --- | --- | --- | --- |
| **C1** | **Truthfulness of the tracker record** | **Decisive** | The residual's owner is not a routing slot; it is a claim about who is accountable. A disposition that leaves a false `Done` standing has repaired the symptom and preserved the defect, and the next reader inherits the same wrong answer. |
| **C2** | **Structural stability of the registers** | **High** | Three fleet items amend these same files after this one merges (`NEU-987` → `05_`/`08_`/`10_`; `NEU-990` → `94_`, possibly filing into `91_`; `NEU-989` → citation paths). The registers are append-only by declared convention and every one of them says so. A disposition that rewrites many entries in place breaks the followers and destroys audit evidence. |
| **C3** | **Number of entries left without a live owner** | **Hard gate** | The acceptance condition is that **all 28 caps and all 14 open items** name a non-terminal owner. A disposition that satisfies fewer fails outright, regardless of its other merits. |
| **C4** | **Size of the amendment** | **Moderate** | Fewer edits is better only where C1–C3 are already met. It breaks ties; it never overrides them. |

**Scoring.**

**C1 is decided by timestamps, and it decides the record.** Two closures are two milliseconds behind a *sibling's* closure:

- `NEU-896` `completedAt` `2026-08-22T09:11:58.531Z`; `NEU-986` (SUB-12) `…58.529Z`.
- `NEU-893` `completedAt` `2026-08-21T21:36:00.717Z`; `NEU-975` (SUB-5) `…00.715Z`.

No human and no agent closes a second item two milliseconds after the first with an intervening judgement. Both are **automated sweeps triggered by a merged PR**, and in each case the only attachment on the swept item is the *sibling's* PR — `#762` on `NEU-896`, `#740` on `NEU-893`. Neither item has a deliverable, and in both cases the package itself says so from the other side: `NEU-896`'s nine-package convergence gate is unreachable while `NEU-891`, `NEU-892` and `NEU-894` sit in `Backlog` and `NEU-895` closed **4m42s after it**; `NEU-893` has no package under `docs/research/` at all and `../93_…md` calls it **unbuilt** four times. The register and the tracker disagreed, and the register is right. **Restoring the two states is therefore a correction, not a workaround** — it is the only disposition that makes the tracker match the evidence.

**C2 selects the additive form of the repair, and rules out the amend authority granted for this task.** The task carries authority to amend owner attributions inline. It is deliberately **not exercised**. This package already set the precedent for exactly this situation at `../90_…md:614` — *"Each is therefore co-named to `NEU-896`, so no open item in this register points only at a party that cannot act. The original owner is not overwritten; the co-naming is additive."* Following the package's own convention reaches the same acceptance while leaving every `**Owner:**` line byte-identical, which is what the three follower items need.

**C3 is met, and the margin is what makes the shape minimal.** The two restorations alone repair **all 14** open items — so `../90_…md` needs **no edit whatsoever** — and **17** of the 28 caps (16 naming `NEU-896`, plus `CAP-S5-1` through `NEU-893`). Only **eleven** caps require the appended co-naming. `../93_…md` needs no edit either: restoring `NEU-893` restores the premise its five stand-ins already assert.

**C4 confirms rather than drives.** One appended section in `../91_…md`, one appended section in `../02_…md`, and this record. No entry edited, no id changed, no register restructured.

---

## Rejected alternatives

**Alternative A — open a successor convergence item and re-point the residual to it.**
Rejected on **C1**, decisively. It requires accepting that a convergence gate which provably never converged is correctly marked `Done`, and building on top of that record. It also **splits the convergence surface in two**: `NEU-896` remains the declared consumer of `../93_…md`, of `../02_…md`, of `17_…md` §7's backwards routes and of nine upstream packages, while a successor would hold the caps — so a later reader must reconcile two convergence owners where the package declares one. It scores worse on **C4** as well: every one of the 28 caps and each of the 14 open items co-named to `NEU-896` would need re-pointing at the new id (~42 owner references), against the eleven this decision touches. It is not rejected because a successor item is a bad instrument — it is the right instrument when the closure is genuine. **This closure is not genuine.**

**Alternative B — redistribute the residual to `NEU-891`/`NEU-892`/`NEU-893`/`NEU-894` plus a smaller convergence item.**
Rejected on **C1** and **C3**, and it is **self-defeating as specified**: it routes work to **`NEU-893`**, which is itself in a terminal state and has published no package. Distributing to it without first restoring it reproduces the exact defect this task exists to repair, one item down. Restore `NEU-893` first and the alternative has already conceded the principle this decision rests on. It fails **C3** independently: the caps are overwhelmingly *not* about tutoring, UI, isolation or handoff — `CAP-S1-1`, `CAP-S1-2`, `CAP-S2-1`, `CAP-S2-2`, `CAP-S3-1`, `CAP-S3-2`, `CAP-S11-1` and the five `CAP-S12-*` entries are about **this package's own conventions, gates, audits and unreconciled contradictions**, and none of the four sibling charters is chartered to answer them. Redistribution would hand entries to owners that cannot act, which is the failure `OI-S16-1` names by name.

**Alternative C — restore `NEU-896` only, and leave `NEU-893` closed.**
Rejected on **C3**. It satisfies 16 caps of 28 and, more importantly, leaves `OI-S1-2`, `OI-S5-2` and `CAP-S5-1` naming a terminal owner while `../93_…md`'s `A-28` continues to describe that owner's package as unbuilt — a register asserting a package is unbuilt while the tracker asserts its item is done. The same two-millisecond evidence applies to both items; applying it to one and not the other would be selective.

**Alternative D — exercise the granted inline-amend authority and rewrite the eleven `**Owner:**` lines in place.**
Rejected on **C2**. It reaches the same acceptance, but it edits eleven entries written by seven different sub-tasks, in a file whose own convention states *"No sub-task reflows, renumbers, or rewrites another sub-task's entries"* — and it does so days before three further items amend the same files. The append form costs one section and risks nothing. Authority to do something is not a reason to do it.

**Alternative E — record the ownerless residual as a new cap and stop.**
Rejected on **C3** and on the register's own rules. `../91_…md` §What belongs here states that *"a cap with no owner is an orphaned gap wearing a label, and it is the failure mode this register exists to prevent"* — capping the fact that 28 caps have no owner is that failure mode applied to itself. It also files a 29th `CAP-` id, which this task is barred from doing.

---

## Consequences

**What this commits the programme to.** `NEU-896` is live again and holds a convergence surface that is now larger than the one it was closed with: nine upstream packages, `../02_…md`'s findings, `17_…md` §7's backwards routes, the 14 open items, and 27 of the 28 caps. **That is an accurate statement of the work, not an increase in it** — every one of those entries was routed to `NEU-896` by its own author before this record existed. `NEU-893` is live again and its package is unbuilt, so the four `A-2x` stand-ins that depend on it remain `[unconfirmed]` and correctly so.

**What it forecloses.** The C010 package can no longer be described as closed with its residual discharged. It is closed with its residual **owned**, which is a different and weaker claim, and it is the one `../94_package-completeness-gate.md` actually supports.

**What it makes more expensive.** Any future automated closure sweep over this charter's items must not re-close `NEU-896` or `NEU-893` on a sibling's merge. This record does not install a guard against that — no such mechanism exists in this repository — so the cost is a standing manual check. That is stated rather than solved, per the same rule the caps register applies to itself.

**Migration path.** None is implied in code. The repair is complete on merge: two tracker states, one appended section in `../91_…md`, one in `../02_…md`, and this record. `../90_…md` and `../93_…md` are untouched.

---

## Evidence

- **Tracker, read 2026-08-23.** `NEU-896`: `completedAt` `2026-08-22T09:11:58.531Z`, `startedAt` `2026-08-22T09:04:26.474Z`, `Backlog` from `2026-07-11T10:47:46.178Z`, sole attachment PR `#762` (titled for `NEU-986`), nine declared dependencies. `NEU-986`: `completedAt` `2026-08-22T09:11:58.529Z`. `NEU-895`: `completedAt` `2026-08-22T09:16:40.532Z`. `NEU-891`, `NEU-892`, `NEU-894`: `Backlog`.
- **Tracker, read 2026-08-23.** `NEU-893`: `completedAt` `2026-08-21T21:36:00.717Z`, sole attachment PR `#740`, titled *"feat(NEU-975): state the isolation invariant and contract the split with NEU-893"*. `NEU-975`: `completedAt` `2026-08-21T21:36:00.715Z`.
- **Tracker, read 2026-08-23.** All sixteen C010 sub-tasks `NEU-971` … `NEU-986` read `Done` (`statusType: completed`).
- **`../91_caps-and-incomplete-scope.md`** — 28 caps enumerated by `**Owner:**` line; 16 name `NEU-896`, 12 do not. `:20` (*"Every cap carries a named owner … 'whoever picks this up' [is] not [an owner]"*), `:428` (*"Named alone: it is the convergence pass, **it is live**"*).
- **`../90_open-items-and-provisional-register.md`** — `:577` (*"27 distinct ids, 14 open and 13 closed, every open one naming an owner"*), `:590` (`OI-S16-1` route (c) → `NEU-896`), `:600` (*"co-named to `NEU-896`, which is live"*), **`:614`** — the additive co-naming precedent this decision follows.
- **`../93_stand-in-assumption-register.md`** — five stand-ins `A-25`–`A-29`; `A-28` (`NEU-893`, isolation) and three others describe their package as **unbuilt**. Register closed at five; not edited.
- **Repository, `origin/develop` `9514e9a`** — no `NEU-893` package exists under `docs/research/`. `git log HEAD..FETCH_HEAD -- docs/research/C010-system-and-repository-architecture/` returns nothing, so no upstream change contradicts any reading above.
- **Stand-ins named in the rationale, not only here:** `A-28` is cited in C1's scoring as the register's own independent statement that `NEU-893`'s package is unbuilt.

---

## Revision trigger

**This decision reopens when either restored item is closed again with a deliverable published on `origin/develop` that discharges what its state asserts** — for `NEU-896`, a convergence record over the nine upstream packages naming its own PR; for `NEU-893`, a package under `docs/research/` answering `OUT-9`. At that point the co-naming in `../91_…md` § NEU-988 is no longer load-bearing for the caps that item owns, and the residual routes to whatever the closing record names.

It **also** reopens on the opposite observation: **if `NEU-896` is closed a third time by a sweep with no deliverable of its own**, restoring it again is not the remedy — the record would then be evidence of a systematic closure mechanism, and the decision owed is about that mechanism rather than about this residual.

Not a trigger: elapsed time; a party's judgement that the package feels finished; the four unbuilt sibling packages landing (they change what `NEU-896` converges over, not who owns the residual).
