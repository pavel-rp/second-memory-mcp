# Dry Runs

**Package:** C009 (umbrella NEU-890) · **Shape inherited from:** `../../C005-dp-map-foundations/dry-run/`
**Model:** claude-opus-5[1m]

This folder holds the cold-context dry-runs that test a C009 artifact against the way it will actually be consumed — a specification handed to a reader (or an agent) with no prior context, exercised against a constructed specimen, with the run's failures recorded as findings rather than smoothed away. A dry-run is evidence about an artifact's **expressiveness and legibility**, not evidence that a downstream agent succeeded; each run states which of those it is and carries the structural limitation of its evidence class. Each sub-task writes its own dry-run files, records the runs that changed its decisions as well as the ones that confirmed them, and **no sub-task edits or re-runs another sub-task's recorded run** — a superseding run is a new file that cites the one it supersedes.
