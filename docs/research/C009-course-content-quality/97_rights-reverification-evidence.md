# 97 — Rights re-verification evidence, dated 2026-08-13

**Model:** claude-opus-5
**Date:** 2026-08-13
**Base:** `origin/develop` @ `e3ea7c0`
**Engine:** repository-external HTTPS reads, one request per URL, no retries, no crawling.

`01_provenance-and-rights.md` §3 records all twelve sources as `Restricted`, every row reading
**"Unestablished at cutoff ⇒ restricted"** — restricted because nothing had been read, not because
anything prohibitive had been found. §11.2 names one route out: *"a dated re-verification pass
reads each source's own terms, robots directives and stated rate limits and re-dates its §3 row."*

**This document is the reading half of that pass. It re-dates no row and promotes no source.**
Re-dating is the authority act §3.1 reserves; this supplies the evidence it consumes. Every
recommendation below is a proposal to the creator, and **silence in a source's terms is recorded
as silence, never converted into permission.**

## What was requested

Nine URLs, all policy surfaces: five `robots.txt`, two terms pages, two landing pages. **Zero
problem pages were requested, zero problem statement text was read, and no enumerating endpoint
was called.** The `01_` §6 retention bound is not engaged because nothing enumerable was
retrieved. No identifier and no problem-level URL appears anywhere in this document.

## Per-source evidence

| Source | Read | What it says | Recommendation |
| --- | --- | --- | --- |
| **C4** Codeforces | `robots.txt` **200** · `/terms` **403** | `robots.txt` blocks a named list of AI agents with a bare `Disallow: /`, including **`anthropic-ai`** and **`Claude-Web`** — no `Allow: /api/` exemption, unlike `curl`/`Wget`/`Scrapy`/`python-requests` which do get one. `/terms` returned **403 Forbidden** to this reader. | **Remain `Restricted` — now on a finding, not a default.** |
| **C6** Library Checker | `robots.txt` **200** · repo | `robots.txt` is `User-agent: *` / `Disallow:` — an explicit empty disallow, i.e. **nothing restricted**. Problems repository is **Apache-2.0**. | **Recommend permissive** for a single targeted fetch. |
| **C2/C3** AtCoder | `robots.txt` **200** · `/tos` **200** | `robots.txt` `User-agent: *` disallows standings, submissions, clarifications, servertime and user history. **Task paths are not disallowed.** `Google-Extended` and `Applebot-Extended` are `Disallow: /`; **`anthropic-ai` is not named.** Terms of Use contains **no clause** on automated access, scraping, crawling, API use, rate limits, or problem reuse. | **Recommend permissive for task paths, with the caveat below.** |
| **C1** CSES | `robots.txt` **404** · `/` and `/problemset/` **200** | **No `robots.txt` exists.** No copyright notice, terms of use, licence statement or policy link appears on the landing page or the problem-set index. **No directive of any kind was found.** | **Creator's call. Do not promote on silence.** |
| **T1** CP-Algorithms | `robots.txt` **404** | No `robots.txt`. Licence already on record as CC BY-SA. | Unchanged — a teaching source, not a problem source. |
| **C5** archives · **T2, T3, T5, T6** | not read | Heterogeneous per-host or per-publisher terms; a reading of one host does not transfer to another, so a class-level pass is not possible. | **Unchanged, `Restricted`, unread.** |

### Stated rate limits

**None found.** The only crawl-delay directive encountered anywhere is AtCoder's
`Crawl-Delay: 30` scoped to `bingbot`. No source states a rate limit applying to this reader.
A source that states no rate limit has not thereby granted an unlimited one.

## The three findings that matter

**1. Codeforces prohibits this agent by name.** `anthropic-ai` and `Claude-Web` both carry a bare
`Disallow: /`. This is materially stronger than the default that was standing: C4 moves from
*"restricted because unread"* to **"restricted because read, and it says no."** The distinction
matters because the old row invited a future pass to re-litigate it; this one closes it. Note the
asymmetry deliberately — `curl`, `Wget`, `Scrapy` and `python-requests` each receive
`Allow: /api/` after their disallow, and the AI-agent block does not. Using one of those user
agents to obtain what this one is refused would be circumvention, not compliance.

**2. `CAP-2`'s 403 is now reproduced.** `D-R5` recorded that the 2026-07-16 HTTP 403 from
Codeforces was *"neither reproduced nor refuted, and no new information about it exists."* A 403
from the same host on a different path, dated 2026-08-13, is new information: the refusal is not a
one-off on one endpoint. It does not tell us the API would 403 — that was not requested — but it
removes the reading that the original 403 was incidental.

**3. Two sources are cleanly readable, and one of them is a DP corpus.** Library Checker's
`robots.txt` is an explicit blanket allow over an Apache-2.0 problem set. AtCoder's directives
enumerate what is off-limits and task paths are not on the list, with terms silent. **C2 is the
AtCoder Educational DP Contest** — a corpus whose entire subject is this course's subject. If
those two rows are promoted, the citation gate opens on the sources that matter most for CL-1.

## The caveat on AtCoder, stated rather than buried

AtCoder's `robots.txt` blocks `Google-Extended` and `Applebot-Extended` — both AI-training
crawlers — while leaving `User-agent: *` free to read task paths. Two readings are available and
this document does not choose between them:

- **Literal:** the directives name what is disallowed; task paths are not named; `anthropic-ai` is
  not named. A single targeted fetch conforms.
- **Intent:** the operator has signalled that it does not wish its content used for AI training,
  and an AI agent fetching task pages is closer to the blocked class than to `bingbot`.

**The literal reading governs a robots check; the intent reading governs a rights judgement.** §3
asks for a rights disposition, not a robots verdict, so the creator decides. What this pass can say
is that under either reading, *storing problem statement text* remains prohibited by `01_` §5
independently — the interim `problem-reference` field set is `stable_id` + `canonical_url` only,
which is a citation, not a reproduction.

## What this does not establish

- **CSES's silence is not permission.** No robots, no terms, no notice found — that is an absence
  of evidence in both directions. CSES is a single-maintainer site; **the cheap, correct move is to
  ask.** A one-line email answering "may we cite problem ids and URLs" would settle it better than
  any inference from a missing file.
- **Nothing here was verified against a problem.** No `V0`–`V7` step ran. `CAP-2`, `CAP-S3-1` and
  cluster coverage 0/4 are untouched. Those close when a citation returns PASS on all seven steps,
  not when a row is re-dated.
- **Four sources and one heterogeneous class remain unread.** They are listed as unread rather than
  quietly omitted.

## The route from here

1. The creator rules on C6, C2/C3, and C1 — three decisions, evidence above.
2. On a promotion, **NEU-957 re-dates the `01_` §3 rows.** This document is cited as the reading;
   it is not itself the re-dating.
3. `03_` §5's `V0`–`V7` procedure then runs against the promoted sources. **68 of 179 nodes require
   a `problem-reference` and cannot be authored until at least one source permits a citation**
   (`content/FINDINGS-first-authoring-run.md`, finding 2).
