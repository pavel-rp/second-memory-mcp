# Finding — Leech resolutions do not re-present content (DR-M09 behavior 1 unmet in live code)

- **Finding id:** F-NEU-930-01
- **Raised by:** NEU-930 (charter C007, OUT-3) — parent NEU-926
- **Status:** confirmed shortfall, **routed to a later charter**
- **Source controls:** DR-M09 behavior 1 (reformulate/re-present); deferral register O-2 (closed by this record)
- **Date:** 2026-07-15

## Statement

None of the live `resolve_leech` resolutions changes **how a flagged leech's content is
presented**. The presentation-changing / reformulation action DR-M09 behavior 1 calls for
is **absent from live code** — confirmed by test, not merely contingent.

`resolveLeech` (`src/orchestration/review-workflows.ts:184–251`) offers exactly three
resolutions, and each leaves the chunk's presented content (`content`, `title`) untouched:

| Resolution       | Effect                                                                                  | Re-presents content?                 |
| ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------ |
| `reset_progress` | Resurfaces the **same** chunk — resets ease/repetitions/interval, `nextReviewAt = now`. | No — same presentation, rescheduled. |
| `archive`        | Sets the chunk aside — `nextReviewAt = now + ~100y`.                                    | No — suspend/set-aside.              |
| `mark_reviewed`  | Clears the leech flag — `chunkType = 'review'`, `consecutiveFailures = 0`.              | No — flag clear only.                |

A bare reschedule (`reset_progress`) and a suspend (`archive`) are explicitly **not** the
reformulation behavior; `mark_reviewed` is a flag clear. No resolution regenerates or
reformulates the content the learner sees.

## Evidence

`tests/integration/workflows/leech-trigger-provenance.test.ts` seeds a flagged leech and
exercises each resolution through the real `resolveLeech` path, asserting the chunk's
`content` and `title` are byte-identical before and after — proving the presentation-changing
action is absent.

## Disposition (per NEU-930 spec / charter C007)

OUT-3 is delivered here as **verification plus this routed finding**, not as a delivered
presentation-changing behavior. Building a genuine content-reformulation/regeneration engine
(or any new `resolve_leech` resolution) is **out of scope for C007** and is routed to a later
charter. This record closes deferral O-2 and documents the gap so the later charter can pick
it up with full context.

## Route

- **To:** a later charter owning DR-M09 behavior 1 (leech reformulation/re-presentation).
- **Carries:** the confirmed absence above, the enforcement point (`resolveLeech` + the leech
  flag path), and the DR-M09 evidence base (F-M09-1 reformulate-not-suspend).
- **Does not expand C007 scope** — recorded as a first-class artifact, referenced from the
  NEU-930 PR and Linear.
