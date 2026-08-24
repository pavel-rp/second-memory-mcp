# Fixture — clean package root

A package-root file cites a package-root sibling by BARE filename: `01_sibling.md`.

It cites a subfolder document with the folder prefix:
`decision-records/DR-FIXTURE-1_example.md`.

It cites a document in another package with one `../`:
`../FIXTURE-broken/01_sibling.md`.

Prose nouns and non-corpus references are not part of the gate and appear here so
the fixture exercises the exclusion paths too: `src/domain/algorithms`,
`docs/GLOSSARY.md`, `https://example.com/page.md`, `mailto:someone@example.com`.

A line-referenced citation must be gated on the file, not the suffix:
`01_sibling.md:12`, `01_sibling.md:12:4`, and the comma-separated form
`01_sibling.md:6,54,330`.

Fenced blocks are ignored entirely:

```
../01_sibling.md
totally-made-up-file.md
```
