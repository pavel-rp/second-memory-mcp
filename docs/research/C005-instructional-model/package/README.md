# The Adjudicated, Prompt-Ready Instructional & Mastery Decision Package

- **Program:** C005 (AI-backed dynamic-programming course) · **Umbrella:** NEU-888 (OUT-7, final sub-task) · **Task:** NEU-925 · **Compiled:** 2026-07-13
- **Status: provisional. Standalone and prompt-ready.** Assembly + adjudication only — this package authors **no** new mechanism decision, threshold, reconciliation verdict, or experiment. Everything it binds is inherited from NEU-915…NEU-924.

---

## What this package is (read this first)

For any single instructional mechanism, its **decision** lives in a cluster record, its **reconciliation** in the conflict register, its integrated **mastery signal/threshold** in the mastery model, and its **experiment evidence** in the experiment sub-task — four different outputs. Without unification a cold-context downstream agent cannot recover a mechanism's full picture in one hop, or tell binding decisions from open ones.

This package is that unification. It is the **single standalone artifact** a C005 chapter agent (curriculum, content/assessment, tutoring, interaction-design) consumes as complete context — no need to reconstruct intent from the upstream sub-tasks. It binds the synthesis, the ten mechanism decision records, the durable-vs-speed framework, the operational mastery model, the live-code reconciliation, and the experiment evidence through **one adjudication ledger** that marks every element `settled` / `provisional` / `unresolved`, and it presents a **per-mechanism unified view** so that, in one hop, an agent recovers a mechanism's evidence, behavior, mastery signal, reconciliation verdict, uncertainty, rejected alternative, and experiment evidence — and can tell binding from open.

**The one-sentence state of the model:** ten instructional mechanisms are each decided to a **binding observable behavior** (six carry a non-prose enforceable control); every decision is **`provisional`** because no class-7 evidence exists and DP-domain effectiveness is unmeasured (`INC-I1`); the six literature-vs-code conflicts are **confirmed against live source and `unresolved`** pending an implementation charter; and every deferred calibrated value is banded-provisional in the mastery model.

## ▶ Reading order

| Step | File | What it gives you |
| --- | --- | --- |
| 1 | **This README** | The map: what the package is, how to consume a mechanism, the final tally, the standing caveats. |
| 2 | **`00_per-mechanism-index.md`** | **The load-bearing deliverable.** One block per mechanism (M01–M10): all seven recovery axes + binding-vs-open status, each cell one hop from its source. Start here for any mechanism question. |
| 3 | **`02_ships-without-evidence.md`** | The decisions shipping **without dogfooding evidence** (D-1…D-6, creator unavailable) and **without cap-covered experiment evidence** (O-1, O-2), symmetric, each provisional with a revision trigger; plus the untestable residue (U-1). |
| 4 | **`03_completeness-gate-and-dry-run.md`** | The package-completeness gate (4/4 PASS) and the written cold-context dry-run handoff over M08 and M10 (no missing hop). |
| 5 | **`../adjudication/01_instructional-decision-ledger.md` §DRIVE / §SELF-CHECK-925** | The driven ledger: every element re-tested against the flip criteria, the final adjudication tally, and why nothing flips to `settled`. |

Everything the package binds sits one directory up (`../`): the synthesis + mechanism evidence (`../README.md`, `../mechanisms/`, `../03_synthesis.md`), the decision records (`../decision-records/DR-M01…DR-M10`), the framework (`../framework/00_…`), the mastery model (`../mastery-model/00_…`), the reconciliation register (`../reconciliation/00_…`), and the experiments (`../experiments/00…07`).

## How to consume a mechanism (for a downstream chapter agent)

1. Open `00_per-mechanism-index.md` and find the mechanism's block (M01–M10).
2. Read its seven-axis table top to bottom — that **is** the mechanism's full picture. Each cell names its authoritative source for a deeper read.
3. Read the status line: `provisional` + learning-critical yes/no. **Binding shape / open value** means the observable behavior (and, if learning-critical, the enforceable control) is fixed and buildable now; the calibrated number (`→ LINK-I2`, in `../mastery-model/00_…` §5) and the DP-effectiveness claim (`INC-I1`) are open.
4. If you need to know what the live code does today, the reconciliation verdict cell gives the ALIGNMENT/GAP/CONFLICT against source facts L1–L12.
5. If you need to know what evidence is missing and what would change the decision, the uncertainty + experiment cells and `02_ships-without-evidence.md` give the revision trigger.

You will **not** find a settled answer, an invented threshold, or a claim of DP effectiveness. Those are firewall-forbidden here; the package is honest about being provisional.

## Final adjudication tally (from the driven ledger)

| Status | Count | What it means |
| --- | --- | --- |
| **settled** | **0** | Firewall-reserved; no instructional element is eligible while class-7 is absent and `INC-I1` is open. |
| **provisional** | **15** | M01–M10 (10) · durable-vs-speed framework (1) · mastery model + `LINK-I2` binding (2) · G4, G7 (2) — binding shape, open value. |
| **unresolved** | **14** | 2 framing rows · C1–C6 (6 confirmed live divergences) · G1, G2, G3, G5, G6, G8 (6 open gaps). |

Derivation and per-element flip test: `../adjudication/01_…` §DRIVE.

## Standing caveats (true of the whole package)

- **No class-7 evidence exists** project-wide. Nothing here is external-user, expert, or market validation; no decision is `settled`.
- **DP transfer is unmeasured** (`INC-I1` / G1, controlling and non-downgradable). Every mechanism's effect in the dynamic-programming domain is an analogy to be measured, never an established result.
- **Conflicts are confirmed, not smoothed.** C1–C6 were read against live source (facts L1–L12) and stand `unresolved`; C1–C4 are non-downgradable. Their fix routes to a later implementation charter — this package specifies the required behavior + control, it changes no code.
- **Provisional by default.** Every element is revisable by correctly-classed evidence per its named revision trigger; the package states, per element, exactly what is binding and what is open.

## Provenance

Final sub-task of the NEU-888 charter. Inherits NEU-887's evidence taxonomy, materiality rule, caps, and privacy gate; the NEU-916 adjudication ledger is the single source of decision status; the NEU-922 mastery model owns every calibrated value; the NEU-923 reconciliation owns every live-code verdict; the NEU-924 experiments attach evidence only. This package unifies them and drives the ledger — nothing more.
