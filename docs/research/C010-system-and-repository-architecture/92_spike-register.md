# 92 — Spike Register

**Task:** NEU-971 (SUB-1) opens it and sets its rules · **Charter:** C010 (umbrella NEU-895) · **Opened:** 2026-08-21
**Model:** claude-opus-5[1m]
**Owner of the rules:** SUB-1 (NEU-971). **Owner of each record:** the sub-task that ran the spike. **Audited by:** `NEU-985 (SUB-11)`.

**This register is complete in rules and empty of results.** SUB-1 published the discipline and ran no spike under it. The first record is written by the first sub-task that needs one.

---

## 1. What a spike is here

A spike is a **bounded, throwaway experiment** run to settle one question that reading could not settle. It may write and run **real code**. It is never product code, it is never merged, and its conclusion **expires**.

A spike is not a prototype, not a proof of concept that graduates, and not "implementation done early". The moment a spike's output is something anyone wants to keep and extend, it has stopped being a spike and has become unreviewed implementation wearing a spike's label.

## 2. Who may run one

**Any sub-task may run a spike.** SUB-2 … SUB-16 all have the same standing under this register; so does any later charter reading this package.

This is stated explicitly because the charter *anticipated* spikes in a few places — the execution-environment question and the deployment-shape question among them — and an anticipation is not a permission list. **A sub-task that finds a claim of its own that is both uncertain and material is permitted to run a spike under this template and this quarantine path, without asking anyone**, whether or not spikes were anticipated for it.

**A cap is available only where a spike is infeasible.** The three-way rule:

| The uncertain, material claim… | Resolution |
| --- | --- |
| could be settled by a bounded experiment | **Run the spike.** Record it here. |
| could not be settled by any experiment available to this package (needs an unbuilt package, an external party, production data that does not exist, or the operator) | **File a cap** in `91_caps-and-incomplete-scope.md`, with a named owner. |
| could be settled by *reading* | **Read it.** Neither a spike nor a cap. See §3. |

**Asserting it is not an available fourth option.** Every claim that is uncertain **and** material resolves to a spike record, a cap, or a citation. `NEU-985 (SUB-11)` audits for exactly that and reports the count in each class.

## 3. The justification test — "could this have been read instead?"

**Before** a spike is run, its record states **why the question could not be settled by reading** — the codebase, an upstream package, a decision record, or the operator's answer. The test is applied against named sources, not in the abstract:

> *Which files did you read, which upstream package did you check, and what specifically did they fail to answer?*

A spike whose record cannot name what it read and what that reading failed to answer **fails the justification review** regardless of how good its result is. This is the single control against a spike becoming disguised implementation: the cheapest way to smuggle implementation in is to skip the reading that would have made the experiment unnecessary.

`NEU-985 (SUB-11)` runs the justification review over every record in this register.

## 4. Quarantine — structural, not a promise

**Working files live under `_local/scratch/`**, per the project constitution's temp-and-scratch article. That tree is gitignored (`.gitignore:100`), so quarantine is enforced by the repository rather than by anyone's discipline.

The hard rules:

- **Nothing under `src/`.** No spike writes to `src/`, `tests/`, `drizzle/`, or any other product path. Ever.
- **Nothing merged as product code.** A spike's code does not become a pull request. If the answer implies code should exist, that code is written later, by the charter that owns it, from the decision — not lifted from the scratch tree.
- **Nothing in the scratch tree is readable by a later reader.** `_local/scratch/` is gitignored and therefore invisible to everyone but its author. **Anything a later charter must be able to read lands in this package** — as the spike record below, with its result stated in full. A record that says "see the scratch output" has recorded nothing.
- **A spike that needs to touch production data does not run.** It is a cap.

`NEU-985 (SUB-11)` audits the repository to prove no spike artifact landed in `src/` or in any tracked path other than this package.

## 5. Exit conditions are observable events

**This is the register's load-bearing rule, and it is not negotiable.**

> **Every exit condition is an observable event. The passage of time is never an exit condition, and neither is anyone's satisfaction.**

A spike's exit condition is stated **before it runs**, and it names something a third party could later check actually happened:

| Not an exit condition | An exit condition |
| --- | --- |
| "until the end of the week" | "until the query returns a row with a non-null `user_id`" |
| "when we're comfortable with the approach" | "when the migration has been applied and rolled back once, with both results recorded" |
| "after enough investigation" | "when the harness has been run against both topologies and the two outputs are recorded side by side" |
| "when SUB-7 is happy with it" | "when SUB-7's decision record citing this spike lands on `origin/develop`" |
| "in two weeks" | "when NEU-891's package is published under `docs/research/`" |

**Why this rule is stated this bluntly.** The preceding C009 package's equivalent contract learned it the hard way: a condition phrased as a date or as a party's judgment cannot be checked by anyone who was not in the room, so it silently never fires, and the thing it gated stays open forever while reading as though it is under control. `"the passage of time is never an exit condition"` is that package's settled rule, and it is carried here unchanged rather than re-derived.

A record whose exit condition is a date or a satisfaction **fails the audit**, and the remedy is to restate it as an event — not to argue that everyone knew what was meant.

## 6. Expiry is mandatory — and it is not an exit condition

**Every record carries an expiry date. The field is mandatory and may not be left blank, "N/A", or "none".**

Expiry and exit are different things and the register keeps them apart:

- The **exit condition** ends the spike. It is an observable event (§5).
- The **expiry date** marks the spike's *conclusion* **stale**. On expiry the conclusion must be **re-run** or **re-labelled** — it does not close, resolve, expire-away, or quietly become true.

**Expiry never closes anything by itself.** A spike whose expiry has passed with no re-run has a stale conclusion, and anything citing it is citing a stale conclusion. That is a defect in the **citing** document as much as in the record.

**Citing a spike inherits its expiry.** `…confirmed by SPK-S7-2…` in a decision record means that decision is only as fresh as `SPK-S7-2`. `00_method-and-provenance.md` §2.6 states the citation rule; this section states the obligation it creates.

**Choosing the date.** Set it from what would make the answer wrong — a dependency version, an upstream package landing, a deployment change — and record that reasoning in the **Expiry rationale** field. An expiry with no rationale is a guess with a date on it.

## 7. Append convention

> Each sub-task appends its own `### SUB-<n>` section. No sub-task reflows, renumbers, or rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

**Do not tidy duplicates in flight.** A duplicate record is correct-by-convention until the package is complete.

## 8. Id namespacing (there is no global counter in this file)

Ids are **`SPK-S<n>-<k>`**, where `<n>` is the sub-task number and `<k>` restarts at `1` inside that sub-task's own section. SUB-2 allocates `SPK-S2-1`, `SPK-S2-2`, …; SUB-9 allocates `SPK-S9-1`, … — concurrently, without coordination, and without collision.

A global counter would oblige an appending sub-task to know what every concurrent sibling had already allocated, and a merge would then oblige someone to renumber — breaking every citation already written against the old numbers, in a register whose whole value is that citations resolve. Cite a spike in its full form (`SPK-S9-1`), never as a bare `SPK-1`.

---

## 9. Record template (copy this; every field is required)

```markdown
#### `SPK-S<n>-<k>` — <one line: the question, as a question>

- **Id:** `SPK-S<n>-<k>`
- **Sub-task:** SUB-<n> (NEU-…)
- **Question:** <the single question this spike settles, stated so it has a wrong answer>
- **Why reading could not settle it:** <the files, upstream packages and decision records that
  were read by name, and what specifically each failed to answer — see §3>
- **Exit condition:** <the OBSERVABLE EVENT that ends the spike, stated before it ran.
  Never a date. Never a party's satisfaction. See §5>
- **Method:** <what was built and run, in enough detail that someone else could repeat it>
- **Quarantine path:** `_local/scratch/<path>` — <confirmation that nothing landed under `src/`,
  `tests/` or `drizzle/`, and nothing was merged as product code>
- **Result:** <what was observed — stated IN FULL here, because the scratch tree is gitignored
  and no later reader can open it>
- **Confidence:** <high | medium | low> — <and what would raise or lower it>
- **Expiry:** <YYYY-MM-DD> — MANDATORY. Never blank, never "N/A".
- **Expiry rationale:** <what would make this answer wrong, and why that date>
- **On expiry:** re-run, or re-label the conclusion. The record does not close on this date;
  see §6.
- **Cited by:** <the decisions resting on this record, added as they land>
```

---

## 10. Records

**None. This register holds no spike results.**

SUB-1 set the rules above and ran no spike under them. The first `### SUB-<n>` heading appears when the first sub-task writes into it.

<!--
Later sub-tasks: append your own `### SUB-<n>` section BELOW this comment, containing one
`#### SPK-S<n>-<k>` block per spike, copied from the §9 template with every field filled.
Do not edit any section above your own. On conflict, keep both sides.
-->
