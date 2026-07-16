# Adjudication

**Task:** NEU-933 · **Extends (references, never rebuilds):** `../../C005-product-foundation/adjudication/` (NEU-887 adjudication method and status discipline), following NEU-932's `../../C005-dp-map-foundations/adjudication/`.

| File | What it is |
| --- | --- |
| `01_schema-decision-ledger.md` | **The sole source of truth for the status of every NEU-933 decision — and of every node in the map.** |

**No other file sets a status.** Not this README, not the package README, not `manifest.yaml` (which carries the status *legend* but adjudicates nothing), not a node's YAML.

## For downstream sub-tasks

**A mapper may not promote its own node from `provisional` to `settled` by editing YAML.** The correct default for a mapped node is `"provisional"` — that is not a weakness, it is the map's honesty. Status flips here, on correctly-classed evidence, or not at all.

The ledger's **§3 seeds the filing routes you will need**, each with an owner and a procedure named in advance, so you never have to invent one mid-task:

| Route | Use it when |
| --- | --- |
| **`D-S1a`** | A skill node's type can't be confidently determined by the S1→S8 cascade (Convention S). |
| **`AR-1`** | You need a non-DP boundary anchor that isn't registered. **Never invent one; never fake a root edge.** |
| **`D-F4a` U4** | You believe a technique is misassigned across clusters. **File in NEU-932's ledger, not this one.** The existing assignment stands until adjudicated, and the technique **stays mapped** — the map never has a hole while an argument is in progress. |
| **`D-S1`/`D-S2`/`D-S3` challenge** | The schema can't express a real node, or a chain can't reach the floor. **Name the specific node.** Never locally redesign. |

**This is the skeleton SUB-11 later drives.** NEU-933 builds the frame and the routes; SUB-11 drives the filled ledger.
