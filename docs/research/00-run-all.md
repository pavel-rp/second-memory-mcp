Run the four research prompts in docs/research/ by fanning out four parallel subagents.

Launch four general-purpose agents IN A SINGLE MESSAGE (so they run concurrently). Give each agent this exact instruction, substituting NN-name:

---
Read the file B:\Projects\second-memory\docs\research\<NN-name>.md and execute it as your task, following every instruction in it exactly. You have web access (WebSearch/WebFetch) — use it as the prompt requires; verify claims against live sources and mark anything unverifiable as UNVERIFIED. You may read files in this repo but must NOT edit any source files. Write your complete report to B:\Projects\second-memory\docs\research\results\<NN-name>.md (create the directory if needed). Your final message should be a 5-line summary of your top findings — the full report goes in the file.
---

The four files:
1. 01-mcp-spec-compliance-audit.md
2. 02-mcp-new-features-survey.md
3. 03-pedagogy-evidence-audit.md
4. 04-monetization-market-research.md

After all four agents finish:
1. Verify all four files exist in docs/research/results/ and each is a substantive report (more than 100 lines, contains the sections its prompt demanded). If any is missing or thin, re-run that single agent once.
2. Do not summarize or synthesize the reports yourself — the files are the deliverable.
3. Finish by listing the four result file paths and each agent's 5-line summary verbatim.
