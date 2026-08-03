# Ubiquitous Language Design for an AI-Agent-Consumed Learning Domain Model

**Research Report #2 — March 31, 2026**

---

## Executive Summary

This report addresses four questions about designing a canonical domain language for Second Memory, a spaced-repetition system where AI agents are the primary consumers of the domain model via MCP tool calls. Building on Research #1's cognitive science terminology mapping and 4-level content hierarchy, we recommend: (1) coining domain-specific terms rather than reusing overloaded ones, with specific names for each level; (2) keeping the 2-level data model (card + skill) for MVP but adding explicit relation types; (3) a hybrid documentation strategy combining inline tool descriptions, MCP instructions, and a queryable glossary tool; and (4) representing topical and structural relationships as distinct, typed edges rather than conflating them in grouping.

---

## 1. Canonical Term Selection

### 1.1 The Core Tradeoff: Familiar-but-Redefined vs. Novel-but-Precise

Research #1 identified that our current term "chunk" maps to Knowledge Component (Koedinger et al., 2012) and Element (CLT), but risks confusion with Miller's (1956) memory chunk. The question is whether to keep "chunk" with a formal definition, adopt a science term directly, or coin something new.

Recent research on LLM instruction-following provides strong guidance here.

**Semantic override is a documented LLM failure mode.** When a familiar word is given a domain-specific definition that differs from its common usage, LLMs systematically revert to pretrained default interpretations despite explicit prompt-level redefinition. A 2025 paper, "When Models Ignore Definitions: Measuring Semantic Override Hallucinations in LLM Reasoning" (arXiv:2602.17520), demonstrates that frontier LLMs show "persistent noncompliance with local specifications, confident but incompatible assumptions, and dropped constraints even in elementary settings." Correctly reasoning with redefined semantics requires models to "temporarily suppress globally learned conventions in favor of prompt-local definitions" — and LLMs fail at this reliably.

**This is worse for smaller models.** Research on semantic anchors in in-context learning (arXiv:2511.21038) found that models under 12B parameters literally cannot override semantic priors: "semantic override rate is exactly zero, not near-zero but exactly zero, across thousands of predictions." Larger models can partially override priors, but this ability is fragile and emergent.

**LLMs specifically struggle with common words given uncommon meanings.** A dedicated study, "Can large language models understand uncommon meanings of common words?" (arXiv:2405.05741), found that LLMs show "inferior performance on basic lexical-meaning understanding tasks when common words are given uncommon meanings." This directly applies to "chunk" — a word with strong pretrained associations to Miller's memory research, cognitive psychology, and NLP tokenization.

**Practical implication:** The term "chunk" is actively harmful for AI agent comprehension. Every time an agent encounters "chunk" in a tool description, it must suppress associations with Miller's chunking, NLP chunks, and Oakley's schema-like usage — all well-represented in training data. This is exactly the "soft contamination" problem (arXiv:2602.12413) where semantically similar training data pulls the model toward unintended interpretations.

**Confidence: HIGH** — Multiple peer-reviewed papers directly support the claim that redefined familiar terms cause measurable LLM performance degradation.

### 1.2 Why Science Terms Also Carry Risk

Adopting science terms directly (e.g., "knowledge component") avoids the redefinition problem but introduces different risks:

- **"Knowledge component"** (Koedinger et al., 2012): Precise but verbose for parameter names. An LLM trained on KLI literature will associate it correctly, but it's a two-word term that doesn't work well as a database field name or API parameter.
- **"Element"** (CLT): Massively overloaded in programming contexts — HTML elements, array elements, React elements, XML elements. An LLM seeing `element_id` in a tool schema will not default to "CLT learning element."
- **"Schema"** (schema theory): Even more overloaded — database schema, JSON schema, GraphQL schema, XML schema. Unusable.
- **"SCO"** (SCORM): Unfamiliar enough to avoid interference, but its meaning ("Sharable Content Object") doesn't convey the SRS-specific semantics of an independently reviewable, atomically testable unit.

### 1.3 The Case for Coined Terms with Explicit Definitions

Novel terms have no pretrained semantic anchor, so they can be flexibly bound to new meanings through explicit definitions. This is the safest approach for AI agent comprehension.

The key design constraints for coined terms:

1. **Unambiguous to an LLM** — no strong pretrained associations pulling toward wrong meanings
2. **Self-documenting** — the term should hint at its meaning even without the full definition
3. **API-friendly** — works as a snake_case parameter name, database table name, and prose noun
4. **Distinctive within the system** — each level's term should be phonologically and visually distinct from the others

Anthropic's own guidance on tool design supports this: "Every word in your tool's name, description, and parameter documentation shapes how agents understand and use it" (Anthropic Engineering, "Writing Effective Tools for AI Agents"). Parameter names should be "semantically meaningful" with "explicit descriptions" — not cryptic, but also not overloaded.

### 1.4 Recommended Terms

After weighing the tradeoffs, here are the recommended canonical terms for each level of the hierarchy:

#### Level 1: **Card** (atomic unit — the SRS review item)

**Rationale:** "Card" has a strong and _correct_ pretrained association in the SRS context — flashcard, Anki card, Leitner card. Unlike "chunk," this semantic prior _helps_ rather than hurts: an LLM encountering `card` in an SRS tool schema will correctly infer "a single reviewable item." The term is monosyllabic, API-friendly (`card_id`, `create_card`), and universal in SRS literature. It also aligns with Wozniak's minimum information principle — one card, one memory connection.

**What it replaces:** "chunk" (current system term).

**Formal definition for tool descriptions:** _A card is the atomic unit of review in Second Memory. Each card targets exactly one knowledge component — a single fact, concept, rule, or procedure step that can be independently tested and scheduled. A card follows the minimum information principle: one card, one memory connection. Cards should not require the learner to simultaneously process more than 2–3 novel interacting elements._

**Why not "knowledge component"?** Too verbose for API parameters, and the abbreviation "KC" is opaque. "Card" is universally understood in SRS contexts and carries the right connotations.

**Confidence: HIGH** — "card" leverages correct pretrained associations rather than fighting incorrect ones.

#### Level 2: **Skill** (cluster of interacting cards forming one teachable schema)

**Rationale:** "Skill" has a clear pretrained association with "something you learn to do" — which is exactly what a cluster of interacting knowledge components represents. It maps to Gagné's learning hierarchy concept, to CLT's "interacting element set," and to SCORM's SCO (the smallest trackable and reusable unit). The term is monosyllabic, API-friendly (`skill_id`, `list_skills`), and distinct from "card."

**What it replaces:** "topic" (current system term — which Research #1 identified as ambiguous, conflating dependency chains with topical grouping).

**Formal definition:** _A skill is a group of 2–7 cards that share a dependency chain and together form one coherent schema. Cards within a skill interact — they must eventually be understood in relation to each other. A skill is scoped to what a learner can acquire in one focused learning session (roughly 5–15 minutes of new material). Skills are defined by structural dependency (prerequisite chains), not topical similarity. Two cards that are topically related but structurally independent belong in separate skills._

**Why not "topic"?** Research #1 showed that "topic" invites topical grouping (the Fenwick Tree failure mode). "Skill" emphasizes capability and dependency: you _have_ a skill, you _build_ a skill from components.

**Why not "learning unit"?** Too generic; "unit" is overloaded (CSS unit, organizational unit, test unit). Also two words.

**Confidence: HIGH** — "skill" carries correct connotations and avoids the ambiguity problems of "topic."

#### Level 3: **Module** (complete treatment of a sub-domain — NOT a first-class data entity in MVP)

**Rationale:** For Level 3 (a collection of skills forming a complete lesson or sub-domain treatment), "module" is the standard term across SCORM, IEEE LOM, and general instructional design. It has minor programming associations (Python module, Node module) but in the presence of "card" and "skill" context, an LLM will correctly interpret it as a learning module.

**This level is NOT recommended as a first-class data entity in the MVP** (see Section 2). It exists as a conceptual organizing principle, referenced in documentation and agent prompts, but without its own database table.

**Formal definition:** _A module is a collection of related skills that together provide complete treatment of one sub-domain. Modules sequence skills by prerequisite order, starting from foundations and building to integration. A module corresponds roughly to one chapter or one lesson in traditional instructional design. In the current system, modules are not first-class entities — they are represented as tags, Linear projects, or manual groupings._

#### Level 4: **Course** (full domain treatment — NOT a first-class data entity)

**Rationale:** "Course" is universally understood and unambiguous. Like module, it exists as a conceptual term in documentation but not as a data entity.

**Formal definition:** _A course is a complete learning path spanning multiple modules, covering an entire domain from foundations to mastery. Courses define the full prerequisite graph and specify the recommended sequence of modules._

### 1.5 Naming Summary Table

| Level       | Recommended Term | Replaces | Key Rationale                                               |
| ----------- | ---------------- | -------- | ----------------------------------------------------------- |
| 1 (Atomic)  | **card**         | chunk    | Correct SRS associations; no semantic override risk         |
| 2 (Cluster) | **skill**        | topic    | Emphasizes dependency/capability; avoids topical conflation |
| 3 (Module)  | **module**       | (new)    | Standard instructional design term; conceptual only in MVP  |
| 4 (Course)  | **course**       | (new)    | Universal; conceptual only in MVP                           |

---

## 2. Data Model Extension: Hierarchy Depth

### 2.1 What the Learning Objects Literature Says

**No empirical evidence supports the claim that explicit multi-level hierarchies improve learning outcomes.** This is the most important finding from the standards literature:

- **SCORM implementations flatten in practice.** Despite SCORM's theoretical 5-level hierarchy (asset → SCO → aggregation → organization → curriculum), most LMS implementations use 2–3 levels. The SCORM specification itself notes that maintaining deep hierarchies with evolving content "insidiously doubles workload, balloons expenses, and adds complexity to maintenance." SCORM implementation requires "man-years of effort" and "the burden of complexity" is placed on the LMS.

- **xAPI was designed to escape rigid hierarchy.** xAPI (Experience API) moved away from SCORM's fixed hierarchy specifically because it was too rigid: "SCORM focuses on essential learning metrics inside an LMS, while xAPI captures detailed activity streams across multiple tools and environments." xAPI uses flat statement-based tracking (actor-verb-object triples) and does not impose hierarchical nesting. The lesson: the learning technology community moved _away_ from deep hierarchy after experiencing its costs.

- **IEEE LOM's 4 levels are theoretical.** While the standard defines 4 aggregation levels, organizations create "application profiles" that are "either abbreviated versions of complete standards or heterogeneous mixes of elements from different metadata schemas." No empirical study compares learning outcomes across systems using different numbers of levels.

- **The learning object research explicitly identifies the granularity tradeoff:** "Usefulness and reusability are counterposed dimensions." Smaller objects are more reusable; larger objects are more self-contained. But no study shows that representing this tradeoff as explicit hierarchy levels (rather than, say, tags or metadata) produces better outcomes.

**Confidence: HIGH** — Multiple sources confirm this. The absence of evidence for hierarchy depth is itself a well-documented finding.

### 2.2 How Existing SRS Systems Handle Hierarchy

All major SRS systems use 2-level hierarchies:

- **Anki**: Deck + Card. Supports nested sub-decks but the community consensus is that "anything more than 3–4 levels and the benefits of organization start to be outweighed by the complexity." Power users advocate "Decks as structure, Tags as function" — using the 2-level hierarchy for scheduling and tags for flexible cross-cutting categorization.
- **SuperMemo**: Collection + Item. Favors macro-interleaving (mixing all subjects).
- **RemNote**: Document + Flashcard. Supports concept/descriptor hierarchy but doesn't mandate it.

No SRS system has found 2 levels insufficient for learning outcomes. The Fenwick Tree failure in Second Memory was not caused by insufficient hierarchy levels — it was caused by incorrect _scoping_ of the Level 2 entity (grouping by topic instead of dependency). Adding more levels wouldn't fix this; correct scoping would.

### 2.3 Prerequisite Graphs vs. Tree Hierarchies

Research #1 identified that prerequisite chains define groups (Gagné). But prerequisite relationships are naturally graph-structured (DAGs), not tree-structured:

- A skill can have multiple prerequisites (e.g., "Fenwick Tree update" requires both "binary indexing" and "prefix sums").
- A skill can be prerequisite to multiple downstream skills.
- Trees (strict parent-child) cannot represent this. DAGs can.

The knowledge graph literature confirms this: "each node may have more than one parent, which makes DAGs more flexible for modeling complex dependencies." Learning path recommendation systems using graph structures outperform those using tree hierarchies.

**Implication for the data model:** If you add hierarchy, add it as a prerequisite _graph_ (typed edges between skills), not a containment _tree_ (skills inside modules inside courses). The tree representation "induces exponential repetition of common terms with depth of nesting" and cannot represent multi-parent prerequisites.

### 2.4 Recommendation: 2-Level Data Model + Typed Relations

**Keep the 2-level model (card + skill) as first-class entities.** Handle Level 3 (module) and Level 4 (course) externally via tags, Linear projects, or future extensions.

**Add typed relations between skills:**

- `requires(skill_A, skill_B)` — skill_A is a prerequisite of skill_B (directed, structural)
- `related_to(skill_A, skill_B)` — skill_A and skill_B are topically related but structurally independent (undirected, informational)

This avoids the Fenwick Tree failure mode without adding hierarchy levels. The failure was misclassification (a module-scope topic crammed into a single skill), not missing hierarchy. With proper scoping and prerequisite edges, the system can:

1. Decompose "teach me Fenwick Trees" into correctly-scoped skills
2. Sequence them by topological sort of the prerequisite graph
3. Surface "related" skills without implying dependency

**Minimum viable hierarchy that avoids the Fenwick failure:**

1. Cards scoped to one knowledge component (Wozniak's minimum information principle)
2. Skills scoped to one dependency chain of 2–7 interacting cards (CLT's element interactivity)
3. Prerequisite edges between skills (Gagné's learning hierarchy)
4. Tags or labels for topical grouping (cross-cutting, non-structural)

**What this explicitly defers:**

- Module-level metadata (summaries, learning objectives per module) — handle via skill summaries + tags
- Course-level prerequisite graphs — handle via skill-to-skill edges (the graph IS the course structure)
- Curriculum planning — handle externally (Linear, manual planning)

**Confidence: HIGH** for the 2-level recommendation. The risk is that as the system scales to hundreds of skills, the absence of module-level grouping makes navigation harder — but this is an organizational convenience problem, solvable with tags, not a learning outcomes problem requiring first-class entities.

---

## 3. Documenting and Injecting Ubiquitous Language into AI Agent Tooling

### 3.1 The State of the Art: DDD for AI Agents

This is a rapidly emerging field (2024–2026). The intersection of Domain-Driven Design and AI agent architecture has moved from theoretical to practiced, though published guidance remains sparse relative to traditional DDD.

**Key finding: LLMs amplify clarity or chaos.** Eric Evans (DDD's creator) has encouraged practitioners to experiment with LLMs in DDD contexts (InfoQ, 2024). Practitioners report that when given ambiguous terms, agents "amplify chaos by generating confusing code, but when a precise definition like 'order' means 'a customer commitment in the Order Management context' is first established, the AI amplifies clarity." This directly validates the ubiquitous language principle for AI-consumed APIs.

**Emerging framework: Domain-Integrated Context Engineering (DICE).** An emerging pattern treats domain objects as first-class context units: typed domain models filter and trim the context window to business semantics, avoiding token bloat while maintaining domain precision.

**Published patterns from practitioners:**

- Russ Miles published "Domain Driven Agent Design" on the Engineering Agents Substack, arguing that bounded contexts should map to agent capabilities.
- Sathiyan Bakthavachalu published "Revolutionizing Enterprise AI: Applying Domain-Driven Design for Agentic Applications" (Medium), exploring DDD + agent architecture in enterprise contexts.
- Microsoft's developer blog published guidance on "AI Coding Agents and Domain-Specific Languages," recommending that domain glossaries be exposed via MCP, custom agents, or structured documentation injected into instructions.

**Confidence: MEDIUM** — Multiple practitioners publishing, Eric Evans endorsement, but no peer-reviewed research specifically on ubiquitous language in MCP tool design. Recommendations below are reasoned hypotheses grounded in LLM tool-use research, not established practice.

### 3.2 Tool Description Design: What the Research Says

Research on LLM tool-use provides the strongest empirical guidance for this section.

**Tool descriptions significantly affect agent behavior.** This is established in multiple studies:

- **"Learning to Rewrite Tool Descriptions for Reliable LLM-Agent Tool Use"** (Guo et al., arXiv:2602.20426, 2026): Found that human-oriented tool descriptions "become a bottleneck when agents must select from large tool sets." Their Trace-Free+ framework rewrites human-centric API docs into agent-optimized descriptions, achieving consistent gains on unseen tools and strong cross-domain generalization. Key insight: tool description optimization is "a practical and deployable complement to agent fine-tuning."

- **AvaTaR: Optimizing LLM Agents for Tool Usage via Contrastive Reasoning** (NeurIPS 2024, arXiv:2406.11200): Uses a comparator LLM to generate holistic instructions via contrastive reasoning (comparing positive and negative examples). Results: 14% improvement in Hit@1 for retrieval. This validates example-based tool descriptions.

- **Anthropic's guidance** ("Writing Effective Tools for AI Agents"): "Every word in your tool's name, description, and parameter documentation shapes how agents understand and use it." Recommends treating descriptions as prompts, using consistent style, and including semantic metadata.

**Optimal tool description structure** (synthesized from multiple sources):

1. **Purpose line**: One sentence stating what the tool does and when to use it
2. **Domain term definitions**: Inline definitions for any domain-specific terms in parameters (see 3.3 below)
3. **Parameter descriptions**: Explicit type, format, constraints, and semantic meaning — not just `name: string` but `name: string — The display name for this skill, typically a short phrase describing the capability being learned (e.g., "Binary search on sorted arrays")`
4. **Usage guidance**: When to use this tool vs. alternatives
5. **Examples**: 1–2 concrete parameter examples showing correct usage
6. **Constraints**: What NOT to do, common mistakes

**Inline definitions vs. referenced definitions:**

| Approach                         | Pros                                                 | Cons                                                                         | When to Use                                             |
| -------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Inline** (in tool description) | Always visible; no extra call needed; proven to work | Duplicated across tools; increases per-tool token cost                       | For 2–5 core terms used across most tools               |
| **Referenced** (glossary tool)   | Centralized; consistent; no duplication              | Requires agent to recognize when to query; extra API call; agent may skip it | For edge cases, rarely-used terms, extended definitions |
| **MCP instructions**             | Injected every session; conditions all tool use      | Size-limited; doesn't scale to large glossaries                              | For the 3–5 most critical domain rules                  |

**Recommendation: Use all three in a layered strategy** (see 3.4 below).

**Confidence: HIGH** for the claim that tool descriptions significantly affect behavior (peer-reviewed). MEDIUM for the specific structural recommendations (practitioner consensus, not experimentally validated structure).

### 3.3 The Layered Documentation Strategy

Based on the research, we recommend a three-layer approach:

#### Layer 1: MCP Server Instructions (Session-Level Context)

The MCP protocol's server-level instructions field provides session-wide context injected before any tool call. Use this for:

- **The 5 canonical terms** with one-line definitions (card, skill, module, course, prerequisite)
- **The cardinal rule**: "Skills are defined by structural dependency (prerequisite chains), not topical similarity. Two cards that are topically related but structurally independent belong in separate skills."
- **The sizing heuristic**: "A single card targets one knowledge component. A skill contains 2–7 interacting cards. If creating content that requires more than ~3 novel interacting elements to be processed simultaneously, split it into multiple cards."

This should be kept concise — under 500 tokens. The MCP instructions field is injected every session and consumed on every interaction. Brevity is critical to avoid diluting the context window.

**Example MCP instructions block:**

```
Second Memory Domain Language:
- CARD: Atomic review unit. One card = one knowledge component = one testable fact, concept, rule, or procedure step. Follows the minimum information principle.
- SKILL: Group of 2–7 interacting cards sharing a dependency chain, forming one coherent schema. Scoped to one focused learning session (~5–15 min of new material). Defined by STRUCTURAL DEPENDENCY, not topical similarity.
- PREREQUISITE: A directed relationship between skills. skill_A requires skill_B means B must be mastered before A.
- RELATED: An undirected relationship between skills indicating topical connection without dependency.
CRITICAL RULE: Never group cards into a skill based on topical similarity alone. The question is not "are these about the same subject?" but "does understanding card X require understanding card Y?"
```

#### Layer 2: Inline Tool Descriptions (Tool-Level Context)

Each MCP tool description should include domain-relevant definitions for its parameters. This is the most reliable layer because it's always visible when the agent is deciding how to use the tool.

**Example for `create_card`:**

```
create_card: Create a new card (atomic review unit) within a skill.

A card targets exactly ONE knowledge component — a single fact, concept, rule,
or procedure step. Apply the minimum information principle: one card, one memory
connection. If the content requires understanding multiple interacting concepts,
split into multiple cards with prerequisites.

Parameters:
  skill_id: string — The skill this card belongs to. Cards in the same skill
    share a dependency chain.
  front: string — The question or prompt. Should be specific and unambiguous,
    targeting exactly one retrievable piece of knowledge.
  back: string — The answer. Should be concise and complete.
  content_type: enum [fact, concept, procedure, principle] — The type of knowledge
    component (Merrill's CDT classification).
  prerequisites: string[] — IDs of other cards within this skill that must be
    understood before this card makes sense.
```

**Example for `create_skill`:**

```
create_skill: Create a new skill (group of interacting cards forming one schema).

A skill contains 2–7 cards that share a STRUCTURAL DEPENDENCY chain. Cards within
a skill interact — they must be understood in relation to each other. A skill is
NOT a topical grouping. The question is: "does understanding card X require
understanding card Y?" If yes, they belong in the same skill. If they merely share
a topic but can be learned independently, they belong in separate skills.

ANTI-PATTERN: Do not create a skill called "Fenwick Trees" containing all BIT-related
concepts. Instead: create separate skills for "Prefix sum computation" (prerequisite),
"Binary indexing" (prerequisite), and "Fenwick tree operations" (depends on both).

Parameters:
  name: string — Short phrase describing the capability, e.g., "Binary search on
    sorted arrays" or "Fenwick tree point-update operation"
  summary: string — 2–3 sentence description of what the learner will be able to do
    after mastering this skill.
  prerequisites: string[] — IDs of other skills that must be mastered first.
  related: string[] — IDs of topically related skills (no dependency implied).
```

#### Layer 3: Queryable Glossary Tool (On-Demand Context)

Provide a dedicated MCP tool that the agent can call when it needs extended definitions, examples, or clarification:

```
get_domain_glossary: Retrieve the full domain glossary for Second Memory.

Returns definitions, sizing heuristics, anti-patterns, and examples for all
domain terms. Call this tool when:
- Creating content and uncertain about scoping (card vs. skill boundary)
- The user requests content on a broad topic that may need decomposition
- You need the full prerequisite chain guidelines

This is a reference tool — call it proactively before creating content, not
only when confused.
```

The glossary tool returns a structured document (not a wall of text) with sections: Terms, Sizing Heuristics, Anti-Patterns, Examples, Prerequisite Rules.

**Why all three layers?**

The research on LLM tool-use shows that different layers serve different cognitive functions:

- **MCP instructions** = always-on priming (like a developer's mental model of the domain)
- **Inline tool descriptions** = just-in-time guidance (like function documentation)
- **Glossary tool** = reference material (like a domain glossary in a wiki)

No single layer is sufficient. MCP instructions are too short for examples. Tool descriptions can't carry the full glossary without bloating every tool. The glossary tool requires the agent to proactively call it — which it won't always do unless prompted by the other layers.

### 3.4 Living Documentation Patterns

How should the glossary be maintained as the domain evolves?

| Approach                | Verdict                        | Rationale                                                                                         |
| ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------- |
| Static markdown in repo | **Use as source of truth**     | Simple, version-controlled, diffable. The canonical glossary lives here.                          |
| MCP instructions field  | **Use as injection mechanism** | Auto-generated from the markdown source. Keeps MCP server and glossary in sync.                   |
| Glossary MCP tool       | **Use for extended reference** | Returns the full markdown glossary on demand. Generated from the same source.                     |
| Vector store            | **Defer**                      | Overkill for a glossary of 5–10 terms. Useful if the system grows to hundreds of domain concepts. |
| Knowledge graph         | **Defer**                      | The prerequisite graph between skills IS a knowledge graph. No need for a separate one yet.       |

**The recommended pattern: single-source glossary.**

1. Maintain a `GLOSSARY.md` file in the repository as the canonical source of truth
2. The MCP server reads this file at startup and injects a compressed version into the `instructions` field
3. The `get_domain_glossary` tool returns the full file contents
4. CI/CD validates that tool descriptions reference terms defined in the glossary

This is the "AGENTS.md" pattern — an emerging standard for providing living documentation specifically designed for AI consumption. The key insight from living specification research (Augment Code): "Static specs fail AI agent workflows because they only move information in one direction, letting implementation drift compound across regeneration cycles." The glossary must be the single source from which all three layers are derived.

### 3.5 Verification Without Server-Side Enforcement

How can we verify that the agent has internalized the domain language correctly?

**Established approaches:**

- **Compliance scoring**: The CALLM (Compliance Alignment LLM) framework defines a Compliance Score (CS) as the fraction of outputs correctly conforming to domain rules. For Second Memory: sample agent-created content and check whether cards follow minimum information principle, skills follow dependency-chain scoping, etc.

- **Anti-pattern detection**: Define a set of known anti-patterns (e.g., "skill containing >7 cards," "skill grouping topically-unrelated cards," "card requiring >3 interacting elements") and run automated checks on agent output. This is documentation-level enforcement — the glossary defines the anti-patterns, and a validation script checks for them.

- **Contrastive evaluation**: Following AvaTaR (NeurIPS 2024), create positive and negative examples of content creation. Positive: correctly-scoped Fenwick Tree skills. Negative: the original monolithic Fenwick Tree topic. Test whether agents produce content matching positive examples after reading the glossary.

**Speculative approaches (emerging, not yet validated):**

- **EU-Agent-Bench-style domain benchmarks**: Create a benchmark of 50–100 content creation scenarios with known-correct decompositions. Run periodically against agent output to detect drift.

- **Glossary comprehension probes**: Before content creation, ask the agent to restate the domain rules in its own words. Check for correct paraphrasing. This is analogous to checking a student's understanding before an exam.

**Confidence: MEDIUM** — Compliance scoring and anti-pattern detection are straightforward engineering. Contrastive evaluation is supported by NeurIPS research. Benchmarks and comprehension probes are reasonable hypotheses but not yet validated for this specific use case.

---

## 4. The Superordinate Category Problem

### 4.1 The Problem Restated

Research #1 identified that the Fenwick Tree failure was caused by grouping concepts by topical similarity (all BIT-related) rather than structural dependency (prerequisite chains). But users and agents naturally think in topical categories. The system must support both views without conflating them.

### 4.2 What the Standards Say

**IEEE LOM relation types partially address this.** The standard defines relation types including:

- `requires` / `isRequiredBy` — prerequisite dependency
- `isPartOf` / `hasPart` — composition
- `references` / `isReferencedBy` — cross-reference
- `isVersionOf`, `isFormatOf` — representation variants

However, IEEE LOM does **not** clearly distinguish between "topical relatedness" and "prerequisite dependency" as first-class, semantically distinct relation types. The taxonomy treats `requires` and `references` as different types, but doesn't define a dedicated "topically related but structurally independent" relation.

**Educational knowledge graphs do better.** Modern educational ontologies explicitly model:

- **Prerequisites**: Directed edges (A → B means "learn A before B")
- **Topical similarity**: Undirected edges (A ↔ B means "A and B are about similar things")
- **Composition**: Directed edges (A → B means "A is part of B")

Research on prerequisite-based recommendation (ACE, Journal of Educational Data Mining, 2023) found that prerequisite-based approaches achieve ~85% correctly-ordered recommendations vs. ~61% for content-based (topical) approaches. This validates that the distinction matters for learning outcomes.

**Knowledge Space Theory** (Doignon & Falmagne, 1999) formalizes prerequisites as "surmise relations" — a quasi-order on knowledge items where mastering item B implies mastering prerequisite item A. This mathematical foundation supports representing prerequisites as a partial order (DAG), separate from any topical clustering.

### 4.3 Recommended Representation

**Use two distinct, typed edge sets in the data model:**

1. **`prerequisite(skill_A, skill_B)`**: Directed edge. Means: skill_B must be mastered before skill_A can be taught. Used for sequencing. Enforced during content creation and session planning.

2. **`related_to(skill_A, skill_B)`**: Undirected edge. Means: skill_A and skill_B are about the same broader domain. Used for navigation, discovery, and "see also" suggestions. NOT used for sequencing. Explicitly does NOT imply dependency.

**Additionally, support tags for cross-cutting topical grouping:**

Tags like `fenwick-tree`, `range-query`, `binary-indexed-tree` allow the user to say "show me everything about Fenwick Trees" without the system treating that as a structural unit. Tags are metadata, not containers.

### 4.4 Handling "Teach Me Fenwick Trees"

When a user says "teach me Fenwick Trees," the system should:

1. **Resolve the tag**: Find all skills tagged `fenwick-tree` (or semantically matched to the query).
2. **Expand prerequisites**: For each matched skill, recursively collect all prerequisite skills (even those NOT tagged `fenwick-tree`).
3. **Topological sort**: Order the combined set by prerequisite graph, producing a learning sequence.
4. **Filter mastered skills**: Remove skills the learner has already mastered (based on SRS data).
5. **Present as a learning path**: Show the user the sequence: "To learn Fenwick Trees, you'll first review prefix sums, then learn binary indexing, then learn BIT point-update, then BIT range-query."

This decomposition works at the skill level using prerequisite edges and tags. It does NOT require Module or Course entities — the prerequisite graph IS the structural organization.

**The key insight:** The user's topical query ("Fenwick Trees") is a search operation over tags. The system's response is a traversal of the prerequisite graph. These are different operations using different data structures, and the system should not conflate them by making "Fenwick Trees" a structural container.

### 4.5 Cross-References Without Dependency

The `related_to` edge type serves the "see also" function:

- After mastering "Fenwick Tree range query," the system can surface: "Related skill: Segment tree range query (similar capability, different data structure)"
- This does not create a prerequisite relationship — the learner is not forced to learn segment trees before or after Fenwick trees
- The agent can use `related_to` edges to suggest comparative study: "You've learned how Fenwick Trees handle range queries. A segment tree provides similar functionality with different tradeoffs. Want to explore that?"

**Confidence: HIGH** for the dual-edge-type model. The distinction between prerequisite and topical relations is well-established in educational knowledge graph literature. The specific implementation (two edge types + tags) is a reasonable engineering choice consistent with the research.

---

## 5. Concrete Proposal

### 5.1 Recommended Terms

| Level | Term       | Database Entity?   | Definition (for tools)                                                                                                                  |
| ----- | ---------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | **card**   | Yes                | Atomic review unit. One card = one knowledge component = one testable fact/concept/rule/procedure. Minimum information principle.       |
| 2     | **skill**  | Yes                | Group of 2–7 interacting cards sharing a dependency chain, forming one schema. Scoped by structural dependency, not topical similarity. |
| 3     | **module** | No (tags/projects) | Collection of related skills providing complete sub-domain treatment. Conceptual only in MVP.                                           |
| 4     | **course** | No (tags/projects) | Complete learning path spanning modules. Conceptual only in MVP.                                                                        |

### 5.2 Recommended Hierarchy Depth

**2-level data model** (card + skill) with:

- Prerequisite edges between skills (directed, structural)
- Related-to edges between skills (undirected, topical)
- Tags for cross-cutting topical grouping
- No Module or Course entities in the data model

### 5.3 Recommended Documentation Strategy

**Three-layer approach:**

| Layer                        | Content                                                                   | Update Frequency          |
| ---------------------------- | ------------------------------------------------------------------------- | ------------------------- |
| **MCP instructions**         | 5 term definitions + cardinal rule + sizing heuristic (~300 tokens)       | Every server release      |
| **Inline tool descriptions** | Domain terms relevant to each tool + anti-pattern examples                | Every tool change         |
| **Glossary MCP tool**        | Full glossary with examples, heuristics, and anti-patterns (~2000 tokens) | Every domain model change |

**Source of truth:** `GLOSSARY.md` in repository. All three layers derive from this file.

### 5.4 Recommended Approach to the Superordinate Category Problem

- **Two typed edge sets**: `prerequisite` (directed, structural) and `related_to` (undirected, topical)
- **Tags** for user-facing topical grouping (e.g., `fenwick-tree`, `dynamic-programming`)
- **"Teach me X" decomposition**: Tag lookup → prerequisite expansion → topological sort → mastery filter → learning path
- **"See also" suggestions**: Via `related_to` edges, surfaced after skill mastery

---

## 6. Confidence Summary

| Recommendation             | Confidence  | Basis                                                                                                   |
| -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| Rename "chunk" → "card"    | HIGH        | Semantic override research (arXiv:2602.17520, 2511.21038, 2405.05741); Anthropic tool design guidance   |
| Rename "topic" → "skill"   | HIGH        | Research #1 Fenwick failure analysis; Gagné's learning hierarchy; avoids topical conflation             |
| 2-level data model         | HIGH        | SCORM/xAPI experience; Anki community practice; no evidence for deeper hierarchy improving outcomes     |
| Prerequisite graph (DAG)   | HIGH        | Knowledge Space Theory; educational knowledge graph literature; DAG vs tree comparison                  |
| Three-layer documentation  | MEDIUM-HIGH | Tool description research (NeurIPS 2024, arXiv:2602.20426); MCP community patterns; AGENTS.md standard  |
| Glossary MCP tool          | MEDIUM      | Logical extension of reference tool pattern; no direct validation for SRS domain                        |
| Anti-pattern verification  | MEDIUM      | CALLM framework; contrastive evaluation (NeurIPS 2024); reasonable engineering practice                 |
| Tag-based topical grouping | MEDIUM      | Common practice (Anki, knowledge management systems); not specifically validated for agent-consumed SRS |

---

## 7. Key References

### Cognitive Science (from Research #1)

- Koedinger, K.R., Corbett, A.T., & Perfetti, C. (2012). The Knowledge-Learning-Instruction framework. _Cognitive Science_, 36(5), 757–798.
- Sweller, J. (2010). Element interactivity and intrinsic, extraneous, and germane cognitive load. _Educational Psychology Review_, 22, 123–138.
- Gagné, R.M. (1985). _The Conditions of Learning and Theory of Instruction_ (4th ed.).
- Wozniak, P. (1999). Effective learning: Twenty rules of formulating knowledge. SuperMemo.
- Miller, G.A. (1956). The magical number seven, plus or minus two. _Psychological Review_, 63(2), 81–97.
- Cowan, N. (2001). The magical number 4 in short-term memory. _Behavioral and Brain Sciences_, 24, 87–185.
- Doignon, J.-P. & Falmagne, J.-C. (1999). _Knowledge Spaces_. Springer.

### LLM Semantic Override and Term Comprehension

- "When Models Ignore Definitions: Measuring Semantic Override Hallucinations in LLM Reasoning" (arXiv:2602.17520)
- "Semantic Anchors in In-Context Learning: Why Small LLMs Cannot Flip Their Labels" (arXiv:2511.21038)
- "Can large language models understand uncommon meanings of common words?" (arXiv:2405.05741)
- "Soft Contamination Means Benchmarks Test Shallow Generalization" (arXiv:2602.12413)
- "The Strong Pull of Prior Knowledge in Large Language Models" (arXiv:2403.17125)

### Tool-Use and Agent Design

- Guo, R., Dong, K., Gao, X., & Das, K. (2026). Learning to Rewrite Tool Descriptions for Reliable LLM-Agent Tool Use. arXiv:2602.20426.
- AvaTaR: Optimizing LLM Agents for Tool Usage via Contrastive Reasoning. NeurIPS 2024 (arXiv:2406.11200).
- Anthropic Engineering. "Writing Effective Tools for AI Agents." https://www.anthropic.com/engineering/writing-tools-for-agents
- "54 Patterns for Building Better MCP Tools." Arcade. https://www.arcade.dev/blog/mcp-tool-patterns
- "Less is More: 4 Design Patterns for MCP." Klavis AI. https://www.klavis.ai/blog/less-is-more-mcp-design-patterns-for-ai-agents

### DDD and AI Agents

- InfoQ (2024). "Eric Evans Encourages DDD Practitioners to Experiment with LLMs."
- Miles, R. "Domain Driven Agent Design." Engineering Agents Substack.
- Microsoft DevBlogs. "AI Coding Agents and Domain-Specific Languages."
- Augment Code. "Living Specs for AI Agent Development."
- AGENTS.md standard. https://agents.md/

### Learning Objects and Hierarchy

- SCORM Content Aggregation Model specification.
- IEEE 1484.12.1 Learning Object Metadata standard.
- xAPI (Experience API) specification.
- "ACE: AI-Assisted Construction of Educational Knowledge Graphs with Prerequisite Relations." _Journal of Educational Data Mining_ (2023).

### Verification and Compliance

- CALLM: Compliance Alignment LLM framework.
- EU-Agent-Bench (arXiv:2510.21524).
- Patronus AI. "LLM Testing Best Practices."
