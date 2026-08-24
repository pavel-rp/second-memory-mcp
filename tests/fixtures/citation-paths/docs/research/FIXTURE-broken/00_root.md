# Fixture — package root with deliberately seeded defects

Every non-resolving citation below is seeded on purpose. This file exists so the
gate can be demonstrated to FAIL, rather than trusted to be looking — the second
half of `OI-S12-1`'s restated resolving event. Do not repair these.

**Seeded C1 (spurious `../`).** A package-root file must cite a package-root
sibling bare, so this `../` is wrong: `../01_sibling.md`.

**Seeded C3 (bare upstream).** A document that lives in another package, cited
without its package directory: `02_only-here.md`.
