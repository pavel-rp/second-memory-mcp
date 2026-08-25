# `90` — Outcome register

**Charter:** C011 (umbrella NEU-893) · **Opened:** 2026-08-25 · **Verification cutoff:** `546ee90`, 2026-08-25
**Model:** claude-opus-5[1m]

Append-only. **Each producing sub-task records its own `OUT-n` row — the outcome, its resolving
evidence, and the success measure by which that outcome was judged done — inside this register, in
the shape SUB-14 aggregates.** A success measure is authored content, not a derivation, so it has a
named author upstream of assembly. SUB-14 (NEU-1007) aggregates the rows and checks the set for
completeness and **authors none of them**; a row or a measure that does not arrive is a routed gap
against its named author, never content invented at assembly.

These per-row success measures **are** the package's success metrics (charter assumption 47). There
is no separate deliverable and no separate author.

Twenty rows are expected in the assembled package: OUT-1 … OUT-19 from their producing sub-tasks,
plus the reserved **OUT-20 row slot** SUB-17 fills at position 16.

No sub-task reflows, renumbers, or rewrites another sub-task's row. On a merge conflict in this file,
keep **both** sides.

## Entry shape

```
## OUT-<n> — <title>

**Outcome.** <statement>
**Success measure.** <the measurable clause by which this outcome was judged done>
**Verified by.** <the evidence that discharges it>
**Authored by.** SUB-<n> (NEU-<id>)
```

---

### SUB-1

## OUT-18 — Production evidence obtained read-only, registered, bounded and redacted

**Outcome.** Every claim about production that cannot be settled from the repository is closed by
read-only observation or explicitly carried as an owned open item — never assumed. Access is
read-only and non-mutating with respect to the production database, the running MCP server and the
deployment, with exactly one registered exception: obtaining a token from the production Rauthy IdP.
Captured evidence is redacted of token material before publication, and each spike is a first-class
register entry carrying its question, why the repository could not answer it, its method, date,
result, confidence and an expiry after which the conclusion is stale.

**Success measure.** OUT-18 is judged done when **all four** of the following hold, each reported as
a number rather than an assertion:

1. **Total resolution, with both counts reported.** Every uncertain-and-material production claim
   resolves either to a spike-register entry carrying all of question, justification, method, date,
   result, confidence and expiry, or to an open item with a stable id and a named owner — and the
   two counts are reported and **sum to the total**, so no claim is silently absent.
2. **Three shapes, three distinct methods.** All three principal shapes are represented, each by a
   named acquisition method distinct from the other two, or by an owned open item stating what could
   not be obtained and why. **Zero shapes are represented by a capture taken from a different flow.**
3. **Zero mutations.** The access audit reports zero mutating operations against the production
   database, the running MCP server and the deployment, and enumerates the single registered
   exception with its residue stated. Any mutation outside that exception is reported as a blocking
   finding with a named owner in `91_findings-register.md`.
4. **Zero leaked captures.** The redaction audit reports zero published captures containing token
   material, a signature, or any secret value.

**Verified by.** `96_spike-register.md` (nine entries, every field populated);
`93_open-items-and-provisional-register.md` (nine owned open items);
`01_production-evidence-and-the-access-audit.md` §2 (the per-principal-shape acquisition table), §3
(the access audit), §4 (the counts), §5 (the redaction audit) and §6 (the per-capture terms record);
`95_stand-in-assumption-register.md` (`A-33`, `A-34`);
`92_risk-register.md` (`R8`, `R13`, `R14`).

**Measured result at revision 1.** (1) Nine claims, **0 closed by observation + 9 routed as owned
open items = 9**, sum matches. (2) Three shapes, three distinct designed methods, **0 substitutions**.
(3) **Zero** mutating operations — in fact zero production operations of any kind, since the single
registered exception was registered and **not exercised**; **zero** unregistered mutations, therefore
zero blocking findings on that trigger. (4) **Zero** published captures, therefore zero containing
token material — satisfied vacuously, and stated as vacuous rather than as a clean audit of a
non-empty set.

**The measure is met, and the evidence base it produced is empty of live observation.** Those are
both true, and OUT-18 is the outcome that requires them to be reported together: the discipline held,
and it produced routing rather than closure. The consequence for the package is carried as `F-S1-2`
in `91_findings-register.md` and as `R13` in `92_risk-register.md`, not smoothed over here.

**Authored by.** SUB-1 (NEU-993).
