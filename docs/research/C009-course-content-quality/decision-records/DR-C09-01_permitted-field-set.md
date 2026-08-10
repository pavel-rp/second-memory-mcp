# DR-C09-01 — The Permitted Problem-Reference Field Set

**Task:** NEU-957 (SUB-1) · **Charter:** C009 (umbrella NEU-890) · **Decision id:** `DR-C09-01` · **Owner:** **the creator** (default), as the party carrying the rights exposure; the contested half is owned by `D-F5`'s own owner, **NEU-932**, through ledger challenge `CH-F5-1` · **Status:** deferred — **this record sets no status of its own.** The admitted half rests on the already-`settled` `D-F3a` constraint recorded in `../../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md`; the contested half is open there as `CH-F5-1` · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10
**Model:** claude-opus-5[1m]

Follows the house decision-record shape (`../../C005-dp-map-foundations/decision-records/DR-F04_family-cluster-partition.md` — Decision · Rationale · Rejected alternatives · Consequences · Evidence · Revision trigger), referenced rather than re-derived. **A producing task may not promote its own artifact**, so this record argues a position and files a challenge; it does not adjudicate one.

---

## Decision

A problem reference stores **`stable id` and `canonical URL` — and nothing else.**

1. **`stable id` — ADMITTED**, on the rationale `D-F3a` already records — *"no field may hold verbatim external content"* (`../../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md:27`), which in full at its source reads *"no node field may hold verbatim external content; problem references, if any, are URLs and identifiers only"* (`../../C005-dp-map-foundations/05_provenance-and-rights.md:54`). No ledger challenge is required or filed: the field is *inside* the recorded bar, and the challenge route is reserved for fields that exceed it.
2. **`canonical URL` — ADMITTED**, on the same recorded rationale, which names URLs in its own words.
3. **`title`, numeric `constraints`, `difficulty signal` and `curriculum placement` — NOT ADMITTED on this package's judgment.** Each is routed to ledger challenge **`CH-F5-1`**, filed against **`D-F5`** by append in `../../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md`.
4. **The interim stored set is `stable id` + `canonical URL` only, and it binds every C009 sub-task from the moment `../01_provenance-and-rights.md` lands, until `CH-F5-1` resolves.** A sub-task that needs a wider set does not widen it; it cites `CH-F5-1` by id and carries the unresolved field set as a cap with a named owner.

Full statement, with the per-field rights rationale for all six candidates: `../01_provenance-and-rights.md` §4 and §4.1.

## Rationale

- **`D-F3a` is the bar to argue against, not around.** `D-F5` §5 requires that a proposal to store anything beyond ids and canonical URLs **files a ledger challenge and never proceeds on local judgment**. Two of the six fields need no argument at all — the ledger's own words admit them. The other four need an argument this package is not entitled to settle by itself, so it files one.
- **The admitted two need no local reasoning, and that is the point.** They are admitted by quoting an already-`settled` constraint, not by constructing a fresh rights theory. A field set that a downstream sub-task can verify against one ledger line is a field set nobody has to re-litigate.
- **The four contested fields fail on two independent grounds, and either alone is enough.** They are not ids or URLs, so `D-F3a`'s plain text does not reach them; and a *stored table* of titles, bounds or ratings across many problems is a legible reproduction of a source's **selection and evaluative curation**, which `../../C005-dp-map-foundations/05_provenance-and-rights.md` §2 forbids **independently of any no-text rule**. Charter assumption 19 answers only the first ground and is itself `[unconfirmed]`.
- **`curriculum placement` is ours, and still entangled.** The placement value carries no source expression at all; the rights question is the **join**. A table of placements is meaningful only next to a problem reference, so it is also a table of *our* stored selection of *their* problems. That is a whole-field-set question, not a field-by-field one, which is why it travels with the other three rather than being admitted on its own merits.
- **Narrow is the correct failure direction while a question is open.** Recording an interim narrow set is **not** a finding that the wider set is impermissible. It is a refusal to act on an undecided question in the permissive direction — the same discipline that records an unread licence as restricted rather than as permissive by omission (`../00_method-and-provenance.md` §4.4).
- **Deciding it here would be the exact category error the status discipline exists to prevent.** SUB-1 produced the argument; SUB-1 may not also ratify it. The ledger ratifies, and `D-F5`'s owner holds the pen.

## Rejected alternatives

| Alternative | Why rejected |
| --- | --- |
| **Admit `title` and numeric `constraints` locally, on charter assumption 19** (they are *provisionally* facts about a source rather than its expression). | The single most tempting option, because assumption 19 is plausible and the product design already assumes it. It fails on standing, not on merit: assumption 19 is **`[unconfirmed]`**, and `D-F5` §5 forbids proceeding on local judgment against `D-F3a` by name. Admitting on an unconfirmed assumption would also produce the worst artifact of all — a stored field set that *looks* adjudicated, that twelve sibling sub-tasks would build citations against, and that a later ledger reading could invalidate wholesale. A challenge costs one appended section; an unwind costs every downstream record. |
| **Store nothing at all** — not even the stable id and the canonical URL — until the whole question is adjudicated. | Maximally safe and materially wrong. It exceeds the recorded rights position rather than tracking it: `D-F3a` **admits** ids and URLs in its own words, and `05_…` §2 explicitly permits citing a source by URL with attribution. Storing nothing would also make the reference-only product impossible to build at all — a reference that cannot name what it references is not a reference — and would push every sub-task into some ad-hoc local substitute, which is worse than a narrow sanctioned set. **Over-restriction that nobody can work under does not survive contact with delivery; it gets quietly circumvented.** |
| **Defer the whole question to SUB-3's execution experience** — decide the field set once a citation run has shown which fields are actually needed. | Inverts the ordering the rights discipline depends on. A field set decided *after* the first citation request is not a precondition; it is a post-hoc rationalisation of whatever was already stored, and the record would be written by the party with an interest in the wider answer. It also mistakes a **rights** question for a **utility** question: what SUB-3 finds convenient is not evidence about what the sources permit, and no access outcome SUB-3 records can promote a restricted position (`../01_provenance-and-rights.md` §3.1). SUB-3 consumes this decision; it does not supply it. |

## Consequences

- **Every C009 sub-task is bound to two fields until the ledger says otherwise.** A citation, a lesson reference, an exercise wrapper, an assessment item and a stored reference record all carry `stable id` and `canonical URL`, plus attribution per `../01_provenance-and-rights.md` §7 — and nothing else about the problem.
- **SUB-3 (NEU-959) consumes this as a precondition.** It resolves citations against the admitted set, records which access path resolved each one, and re-decides nothing. A field it cannot store is not a field it may store once a fetch succeeds.
- **A sub-task that needs a wider set has exactly one route, and it is cheap.** Cite `CH-F5-1` by id, state its own record for **both** dispositions (what it does if the challenge succeeds, and what it does if it fails), and carry the unresolved field set as a cap in `../91_caps-and-incomplete-scope.md` with a named owner. It never widens locally, and it never blocks on the challenge either.
- **Nothing else in the package moves either way.** The dispositions (§1), the access-permission record (§3), the no-text rule (§5) and the retention rule (§6) are all independent of the field set. If `CH-F5-1` resolves in favour of the wider set, the four fields become admissible with **no other change to this package**; if it resolves against, nothing already written has to be withdrawn. That independence is deliberate — it is what makes filing the challenge cheap enough to be the honest option.
- **Difficulty calibration must not quietly depend on a stored rating.** While `CH-F5-1` is open, an external difficulty signal is read from a **dated verification observation** and never from a stored field, and every calibrated output that depends on one carries that observation date. The sub-tasks owning calibration inherit that constraint from here rather than discovering it later.
- **Charter assumption 19 stays `[unconfirmed]`,** visibly, in the register (`../90_open-items-and-provisional-register.md`). This record does not confirm it, refute it, or let it lapse into fact by being built on.

## Evidence

This is a **rights judgment resting on recorded constraints plus reasoning — not an empirical finding**, and it is declared as such rather than dressed in manufactured evidence rows (`../traceability/01_rights-evidence-register.md`, check `ROC-7`, following the disclosure discipline of `../../C005-dp-map-foundations/traceability/01_selection-evidence-register.md` SOC-7).

| What it rests on | Class | Provenance |
| --- | --- | --- |
| `D-F3a`'s field constraint — *"no field may hold verbatim external content"* (ledger row), stated in full at its source as *"no node field may hold verbatim external content; problem references, if any, are URLs and identifiers only"* | 2 `[code-evidence]` | `../../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md:27` and `../../C005-dp-map-foundations/05_provenance-and-rights.md:54`, commit base `c558ff9` |
| `D-F5` §5's requirement that a wider proposal file a ledger challenge rather than proceed on local judgment | 2 `[code-evidence]` | `../../C005-dp-map-foundations/05_provenance-and-rights.md:73`; ledger row `D-F5` at `:26` |
| The §2 selection-and-curation bright line, as the ground for treating a stored table of titles, bounds or ratings as retained curation | 2 `[code-evidence]` | `../../C005-dp-map-foundations/05_provenance-and-rights.md` §2; restated at `../01_provenance-and-rights.md` §2 |
| The twelve dated source dispositions this field set is stored against | 1 `[literature]`, documentary re-read at the 2026-08-10 cutoff — **no source was fetched** | `../01_provenance-and-rights.md` §1; `../00_method-and-provenance.md` §4 |
| The warning that an external rating is a contest-performance proxy, never a learning-difficulty measurement | 1 `[literature]` | `../../C005-dp-map-foundations/02_corpus-selection.md` F-C-3 |
| Charter assumption 19 — **`[unconfirmed]`**, and relied on by nothing here | — (an unconfirmed assumption, recorded as one) | C009 charter (umbrella NEU-890), assumption 19 |

**No class-7 `[future-real-user]` evidence supports any part of this record, and none could:** a rights position is a reading of a document and a judgment about it, never a finding about people. Class 7 does not exist for this package.

## Revision trigger

- **`CH-F5-1` resolves in the foundations ledger.** The four not-admitted fields are re-decided by whatever the ledger records, and §4.1's interim stored set is superseded — not amended locally. This is the primary and expected trigger.
- **A downstream sub-task proposes to store or reproduce anything beyond the admitted set.** It files a ledger challenge against `D-F5` and never proceeds on local judgment; that challenge, if it succeeds, revises this record.
- **`D-F3a` is bound by SUB-2** in a way that changes the bar this record quotes — the constraint is currently carried on an `unresolved — by design` row, and the node schema it will govern does not yet exist.
- **A source's terms are read and dated**, or terms change, in a way that bears on whether a title, a bound or a rating may be retained.
