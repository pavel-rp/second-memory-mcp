# `DR-C10-S2-2` — The authoring-time execution environment is a component, and its boundary is a liveness boundary

**Task:** NEU-972 (SUB-2) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-21
**Model:** claude-opus-5[1m]
**Discharges:** `OUT-9`, second of its three conclusions. Closes `OI-S1-1`.
**Chapter:** `../03_execution-environment-and-citation-drift-component.md` §3
**Rests on:** **`SPK-S2-1`** — and therefore **inherits its expiry**, per `../00_method-and-provenance.md` §2.6.

---

## Decision

**An authoring-time execution environment is an architectural component of the selected system.** It carries:

- an **isolation boundary the host can terminate**, one isolate per executed unit; and
- a **wall-clock resource bound**, enforced by the host from outside the executing thread.

**Its trust boundary is `first-party, creator-authored code`. The isolation exists for liveness and resource reclamation — not for containment of hostile code.** No learner-submitted code crosses it (`DR-C10-S2-1`).

Its full eight-field specification is chapter §3.5. This record decides the boundary; the specification records it.

## Rationale

The criteria, weighted **before** the evidence was scored:

| Criterion | Weight | Why |
| --- | --- | --- |
| **Can `EQ-S4-6` actually run?** | **Highest.** It is an `automated`, **`blocks`** gate — the check SUB-4 calls *"the one that matters"*. | A gate that is specified and unrunnable is worse than an absent one: the quality system reads as enforcing something it cannot enforce. |
| **Is the component's boundary decided by evidence rather than by analogy?** | High. `../92_spike-register.md` §2 forbids asserting an uncertain, material claim. | "Executing code obviously needs a sandbox" is an analogy imported from the untrusted-code case, and it would fix the **wrong** boundary — a security boundary where a liveness one is needed. |
| **Is the component no larger than the evidence supports?** | High. | Over-specifying a boundary costs a substrate choice, a resource budget and an authority assignment that `SUB-10`, `SUB-13` and `SUB-4` would each inherit. |
| Runtime performance of the gate battery | **Low weight**, and deliberately so. | There are **0 content units** and no battery to measure. Weighting performance here would be scoring against numbers that do not exist. |

**What reading settled.** Two things, and they are worth separating. First, an authoring-time execution **is required**: `automated` is defined as the class whose verdict requires *"running something whose output is not already written down"*, and its stated cost is *"An execution environment, and a re-run budget"* (`09_…:70`); `EQ-S4-6` sits in that class, blocks, and is authoring-time (`09_…:216`, `:325`). Second, the code executed is **first-party** — it is the creator's own approach, run over the node's own `test` instances — so there is **no untrusted-code trust boundary** to draw.

**What reading could not settle**, and why that residue is the whole decision: whether that execution needs an **isolation and resource boundary**. This is exactly the line between *a component with a boundary* and *an unremarkable function call inside the authoring pipeline*. `09_…:70` names the cost and stops. `DR-C09-04:92` explicitly *"selects no runtime, no compiler, no sandbox and no execution environment."* `06_…:409` states NEU-890 *"implements no grader, judge, or submission surface."* The repository offers nothing to inspect — `src/` contains zero execution primitives. `OI-S1-1` records precisely this gap and names SUB-2 its owner.

**So the question was spiked, not asserted.** `SPK-S2-1` ran a stand-in authored unit three ways under Node v22.23.1. The load-bearing arrangement is the middle one: a **non-terminating** authored unit run in-process, with a 1000 ms same-thread timer guard armed **before** the unit started. **The guard never fired.** The process produced no output after entering the unit and had to be killed from outside at 6000 ms. The same unit inside a `worker_threads` Worker was reclaimed at **1007 ms** by a host-side `terminate()`, and the host survived.

**The consequence is not "runaway code is bad".** It is that **the gate runner cannot observe or report the failure it exists to catch** when it runs in-process — the runaway holds the very thread the guard would run on — and every gate queued behind it dies with the process. That is a liveness property of the component, established by experiment, and it is what makes this a component with a boundary.

**And the failing unit is an ordinary authoring mistake, not an attack** — a loop whose increment is guarded by a condition that is never true. The boundary is therefore justified by the **expected** case. A boundary justified only by an adversarial case would be the wrong boundary here, because §2's decision means no adversary supplies code to this component.

`OI-S1-1` is `[unconfirmed]` and is named **in this record's own decision sentence**, per `../00_method-and-provenance.md` §2.3.

## Rejected alternatives

| Alternative | Why it was rejected |
| --- | --- |
| **No boundary — run the authored approach in-process, as a function call in the authoring pipeline.** The cheapest option, and the one implied by treating `EQ-S4-6` as an unremarkable build step. | `SPK-S2-1` arrangement B refutes it directly: a same-thread guard **cannot fire**, the process required an external `SIGKILL`, and no verdict was produced. In this arrangement the gate does not merely fail slowly — it takes the whole authoring pipeline down and reports nothing. This is the alternative the spike was run to test, and it is the one the spike killed. |
| **A full security sandbox** — OS-level or container-level containment, seccomp/namespace isolation, network denial. | Over-specification against a trust boundary that does not exist. The executed code is first-party and creator-authored (`DR-C10-S2-1`); there is no untrusted supplier. Adopting a containment boundary would fix a substrate requirement on `SUB-10 (NEU-984)` and an operational surface on whoever runs it, both justified by a threat model this system does not have. Named explicitly because it is the *reflexive* answer to "we execute code", and reflexes are what `../92_spike-register.md` §3 exists to catch. |
| **Cap it** — record "we cannot determine whether a boundary is needed" with a named owner, and move on. | Fails `../92_spike-register.md` §2's three-way rule. A cap is admissible only where **no** experiment available to this package settles the claim. An experiment settled it in three runs of a throwaway harness. Filing a cap here would have been the expensive way to avoid a cheap answer. |
| **Assert it** — state that an isolation boundary is obviously required, cite the `automated` class definition, and skip the experiment. | Explicitly barred: *"Asserting it is not an available fourth option"* (`../92_spike-register.md` §2). It is also substantively wrong in a way that matters — asserting it from the class definition would have produced the *security* boundary of the row above, because that is what "we execute code" suggests when nobody checks. The experiment is what produced the **liveness** framing. |
| **Defer to `SUB-10 (NEU-984)`** — let the substrate sub-task decide whether isolation is needed when it selects the deployment substrate. | Confuses two questions. *Whether a boundary is required* is an architecture question this package's `OUT-9` owns; *which primitive implements it* is a substrate question SUB-10 owns. Deferring the first with the second would leave `SUB-4 (NEU-974)` unable to place the component at all, because a component whose boundary is undecided has no shape to place. |

## Consequences

- **Committed:** the architecture contains an authoring-time execution component with a terminable isolate per unit and a host-enforced wall-clock bound. `SUB-4 (NEU-974)` places it; `SUB-13 (NEU-987)` assigns exactly one authority to the gate-verdict state it writes (`OI-S2-2`).
- **Foreclosed:** running `EQ-S4-6` inline in whatever process the authoring pipeline occupies.
- **Made more expensive:** the authoring pipeline. It gains a per-unit isolate, a timeout policy, and a failure state — *unit exceeded its bound* — that the quality system must map onto a gate verdict.
- **Deliberately left cheap:** no containment substrate, no network policy, no OS-level isolation is implied. A later charter that admits learner-submitted code inherits a **different** trust boundary and must revisit this record (see the revision trigger).
- **Migration path:** none is implied. No execution component exists today, so this is a greenfield placement rather than a change to something running.
- **Sizing correction handed forward:** `F-S2-2` — only **2 of the 11** `automated` rows execute authored code. A reader sizing this component from the class label over-provisions it about five-fold.

## Evidence

- `../../C009-course-content-quality/09_enforceable-quality-system.md:70` (NEU-890, compiled 2026-08-10) — the `automated` membership test and its stated cost, *"An execution environment, and a re-run budget."*
- `../../C009-course-content-quality/09_enforceable-quality-system.md:216`, `:315`, `:325` — `EQ-S4-6`, `automated` · `blocks` · authoring-time; and *"§3.3 bars all three from a learner's latency path."*
- `../../C009-course-content-quality/09_enforceable-quality-system.md:302` — the mechanism distribution, `automated` 11 of 89.
- `../../C009-course-content-quality/decision-records/DR-C09-04_authoring-languages.md:92`; `../../C009-course-content-quality/06_assessment-evidence-out-of-band.md:409` — what NEU-890 explicitly did **not** select or implement.
- **`SPK-S2-1`** — the isolation experiment, result stated in full in `../92_spike-register.md`. **This citation inherits that record's expiry**; past it, this decision is stale until the spike is re-run or re-labelled.
- **`OI-S1-1`** — `[unconfirmed]`, named in the decision sentence above, and closed by this record.
- Repository scan of `src/` for seven execution primitives — **zero** hits, 2026-08-21, establishing that nothing in the current codebase constrains or contradicts the placement.

## Revision trigger

**Any of these observable events reopens this record:**

1. **`SPK-S2-1` reaches its expiry with no re-run** — at which point the decision is stale by `../92_spike-register.md` §6, and the citation above is a citation of a stale conclusion.
2. **A published requirement admits code from a party other than the creator into this component** — for example a learner-submitted artifact, or an approach imported from an external source. The trust boundary in the decision sentence is then wrong, and a containment boundary must be re-argued from scratch.
3. **`SUB-10 (NEU-984)` publishes a substrate selection on which a host-side terminate of a running isolate is unavailable** — the mechanism `SPK-S2-1` arrangement C relied on. The decision's *requirement* would survive; its *feasibility* would have to be re-established on that substrate.
