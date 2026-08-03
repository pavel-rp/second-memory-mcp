# Cognitive Science Foundations for Learning Content Chunking and Hierarchical Organization

**Research Report — March 31, 2026**

---

## 1. Terminology Mapping

### 1.1 Cognitive Load Theory: The "Unit of Instruction"

Sweller's Cognitive Load Theory (CLT) does not define a named "unit of instruction" in the way instructional design standards do. Instead, CLT frames everything through **element interactivity** — the extent to which elements of a task must be learned simultaneously because they interact with each other (Sweller, 1994; Sweller, 2010).

The operative concept is the **element** — a schema or piece of information that must be processed in working memory. CLT distinguishes between:

- **Low element interactivity material**: Elements can be learned independently and serially. Example: foreign-language vocabulary, where each word can be learned without reference to others. This maps closely to what your system calls a "chunk."
- **High element interactivity material**: Multiple elements must be processed simultaneously for learning to occur. Example: grammar rules, algebraic manipulation, or understanding how a Fenwick Tree's update operation relates to its query operation.

The critical implication: **CLT does not prescribe a fixed "unit" — it prescribes that a single learning episode should not require simultaneous processing of more interacting elements than working memory can hold.** The unit boundary is therefore defined by the interaction structure of the content, not by a predetermined size.

Sweller and colleagues describe working memory as being able to handle "possibly no more than two or three novel interacting elements" simultaneously (Sweller, 2010; Sweller & Chandler, 1994). When material exceeds this threshold, CLT recommends the **isolated-interacting elements effect**: present interacting elements in isolated form first (each without reference to other interacting elements), then present the fully interacting form once individual elements have been learned and can be retrieved from long-term memory as schemas (Pollock, Chandler & Sweller, 2002).

**Evidence strength**: Strong. Element interactivity is supported by multiple meta-analyses and RCTs. The specific number (2–3 novel interacting elements) comes from experimental work but precise thresholds remain debated. A 2023 paper by Chen, Kalyuga, and Sweller provides the most comprehensive formal treatment of element interactivity as a measure of task complexity (Chen et al., 2023, _Educational Psychology Review_).

**Your mapping**: Your "chunk" (atomic unit targeting a single concept) maps to what CLT would call a learning episode scoped to **low element interactivity** — either a single element or a set of elements whose interactions have been isolated. Your "topic" (group of chunks with shared dependency chain) maps to what CLT calls a set of **interacting elements** that ultimately need to be integrated, where each chunk teaches elements in isolated form before the full interaction is presented.

### 1.2 Schema Theory: The Target Knowledge Structure

Schema theory (Piaget, 1926; Bartlett, 1932; Anderson, 1977; Chi, Feltovich & Glaser, 1981) uses the term **schema** (plural: schemata) for the organized knowledge structure that learning produces. A schema is a cognitive framework that organizes and interprets information, stored in long-term memory and retrieved as a single unit.

Key properties of schemas relevant to your design:

- **Schemas are hierarchical**: They contain sub-schemas and are contained within super-schemas. This directly supports your chunk/topic hierarchy.
- **Schemas reduce working memory load**: Once formed, an entire schema can be processed as a single element in working memory, regardless of its internal complexity (this is the mechanism by which expertise reduces cognitive load).
- **Schema acquisition is the goal of learning**: In CLT terms, the purpose of instruction is to help learners construct schemas in long-term memory.

What one learning unit should produce: **One schema, or one meaningful extension/modification of an existing schema.** Anderson's ACT-R theory (Anderson, 1983) further specifies that knowledge consists of **production rules** (condition-action pairs), and learning involves acquiring and strengthening individual productions. Chi's work on expert-novice differences (Chi et al., 1981) shows that experts organize knowledge into larger, more abstract schemas while novices have fragmented, surface-level schemas.

**Your mapping**: A single "chunk" should target the construction of **one schema** (or one production rule, in ACT-R terms). A "topic" should correspond to a **schema family** — a set of related schemas that share a common superordinate structure and whose elements interact.

**Evidence strength**: Schema theory is foundational and well-established. The specific claim that "one learning unit → one schema" is a theoretical inference, not a directly tested empirical finding. It is, however, the standard interpretation across CLT, ACT-R, and instructional design literature.

### 1.3 Merrill's Component Display Theory and Reigeluth's Elaboration Theory

**Component Display Theory (CDT)** (Merrill, 1983) operates at the micro level — it defines how to teach a single idea. CDT classifies content into four types: **facts, concepts, procedures, and principles**. Each content type can be taught at different performance levels (remember, use, find). CDT does not explicitly define granularity levels within a lesson, but its content types map to natural atomic units:

- A **fact** is inherently atomic.
- A **concept** is a category with defining attributes (one chunk).
- A **procedure** is a sequence of steps toward a goal (potentially multiple chunks, depending on step count and interactivity).
- A **principle** is a cause-effect relationship (one chunk if the relationship is simple; multiple if it involves interacting variables).

**Elaboration Theory** (Reigeluth, 1979; Reigeluth & Stein, 1983) operates at the macro level — how to sequence an entire course. It uses the **"zoom lens" analogy**: begin with an **epitome** (a simplified but complete overview showing major parts and their relationships without detail), then progressively "zoom in" to elaborate on each part. The key structural levels are:

- **Epitome**: Simplified overview of the domain (maps roughly to your "topic" summary or "module" level).
- **First-level elaboration**: Expands one aspect of the epitome in detail.
- **Second-level elaboration**: Further expands sub-aspects.
- **Supporting content**: Prerequisites, analogies, summaries.

Reigeluth explicitly delegates micro-level design to Merrill's CDT. The two theories are complementary: Elaboration Theory scopes the sequence and hierarchy; CDT scopes the individual instructional unit.

**Your mapping**: In these frameworks, your "chunk" corresponds to a single CDT content element (one fact, concept, procedure, or principle at one performance level). Your "topic" corresponds roughly to one elaboration sequence — a section of the course that progressively elaborates one aspect of the epitome.

**Evidence strength**: CDT and Elaboration Theory are theoretical frameworks, not empirically tested in the same way CLT effects are. They are widely cited in instructional design but lack the controlled experimental validation of CLT. Best characterized as expert-consensus heuristics.

### 1.4 Miller (1956) vs. Oakley's Usage — Has "Chunk" Drifted?

**Miller's original definition (1956)**: A chunk is a unit of information in short-term memory. Miller's key insight was that short-term memory capacity is limited to approximately 7 ± 2 chunks, where a chunk is defined by the observer's familiarity with the material. A single letter is a chunk for someone unfamiliar with the language; an entire word is a chunk for a fluent speaker. Crucially, **Miller's "chunk" is about grouping items together into larger units** — it is a process of _recoding_ that increases effective capacity. Miller was describing a memory phenomenon, not an instructional design principle.

**Cowan's revision (2001)**: Cowan argued that when rehearsal is controlled for, the true capacity of the "focus of attention" (the active part of working memory) is approximately **3–5 chunks, with a central tendency around 4** (Cowan, 2001, _Behavioral and Brain Sciences_). This "magical number four" has been more consistently replicated than Miller's seven. Cowan emphasizes that the 4-chunk limit applies to genuinely novel, unrelated items — learned associations and schemas allow effective capacity to exceed this.

**Oakley's usage**: In _A Mind for Numbers_ (2014) and _Learning How to Learn_, Oakley uses "chunk" to mean something closer to a **schema** — a compact, well-practiced unit of knowledge stored in long-term memory that can be retrieved and used fluently. She writes about "chunking" as the process of building these compact knowledge structures through focused practice. She also cites the 4-chunk working memory limit (following Cowan, not Miller's 7).

**The drift**: Oakley's usage conflates two distinct concepts:

1. **Miller's chunk**: A unit in working memory, defined by what the observer treats as one item (a perceptual/memory phenomenon).
2. **A learned knowledge structure (schema)**: The product of successful learning, stored in long-term memory.

Miller's chunk is about _input capacity_; Oakley's chunk is about _learned output_. The conflation is understandable because forming schemas _is_ the mechanism by which effective working memory capacity increases — but these are different things. In instructional design, "chunking content" typically means the _decomposition_ direction (breaking content into smaller pieces), which is essentially the opposite of Miller's original _composition_ direction (grouping small pieces into larger units).

**Your system's usage**: Your "chunk" (an atomic unit of learning content targeting a single concept) is closer to a **learning objective** or a **single schema target** than to Miller's perceptual chunk. This is a legitimate and useful concept, but calling it a "chunk" invites confusion with the memory literature. The closest established term is probably a **knowledge component** (from the Knowledge-Learning-Instruction framework, Koedinger et al., 2012) or an **instructional object** (from the learning objects literature).

**Evidence strength**: Miller (1956) is one of the most cited papers in cognitive psychology. Cowan (2001) is a well-replicated revision. The terminological drift from Miller to instructional design is well-documented in review articles.

### 1.5 Modern Instructional Design Standards: Content Granularity Levels

The major e-learning standards define the following hierarchy:

**SCORM (Sharable Content Object Reference Model)**:

- **Asset**: The most granular atomic unit — a single media element (image, text segment, video clip, HTML page). Not independently trackable.
- **SCO (Sharable Content Object)**: The smallest _trackable_ and _reusable_ unit of instruction. A SCO communicates with the LMS to report completion, scores, etc. Ideally, a SCO should be "the smallest piece of content that is both reusable and independent."
- **Aggregation**: A collection of SCOs, forming a lesson or module.
- **Organization**: A collection of aggregations, typically a full course.
- **Curriculum**: Multiple courses forming a learning path.

**IEEE LOM (Learning Object Metadata)** defines four aggregation levels:

- **Level 1**: Most granular/atomic — raw media (images, text segments, video clips).
- **Level 2**: Collection of Level 1 atoms — a lesson (e.g., HTML document with embedded images).
- **Level 3**: Collection of Level 2 objects — a course (e.g., linked HTML pages).
- **Level 4**: Largest granularity — a set of courses leading to a certificate.

**xAPI (Experience API / Tin Can)**: More flexible than SCORM. Uses **statements** (actor-verb-object triples) and treats courses, SCOs, and objectives as **activities**. xAPI does not impose a fixed hierarchy but allows arbitrary nesting.

**IMS Global**: Aligns with IEEE LOM since version 1.3.

**Your mapping**: Your "chunk" maps most closely to a **SCORM Asset** or **IEEE LOM Level 1** (atomic content) in terms of granularity, but to a **SCO** in terms of function (it's the smallest independently testable/reviewable unit). Your "topic" maps to a **SCORM Aggregation** or **IEEE LOM Level 2**.

---

## 2. Empirical Sizing Heuristics

### 2.1 Maximum Interacting Elements per Learning Unit

CLT research consistently finds that working memory can handle a very limited number of novel interacting elements simultaneously. The specific findings:

- **Cowan (2001)**: 3–5 chunks (central tendency ~4) in the focus of attention, when rehearsal is prevented.
- **Sweller and colleagues**: "possibly no more than two or three" novel interacting elements (Sweller, 2010). This is more restrictive than Cowan because it refers specifically to elements that _interact_ (must be processed in relation to each other), not merely co-present items.
- **Practical implication**: If a learning unit requires the learner to simultaneously hold and relate more than ~3 novel interacting elements, it should be split using the isolated-interacting elements approach.

However, a critical caveat: **element interactivity is relative to the learner's expertise**. An element that is "novel" for a beginner (and therefore occupies one working memory slot) may be a well-learned schema for an expert (and therefore takes negligible working memory). This means the optimal granularity of your chunks depends on your target learner's prior knowledge — the same content may need finer granularity for novices and can be coarser for experts. This is the mechanism behind the **expertise reversal effect** (Kalyuga et al., 2003): instructional techniques that help novices can actually _hurt_ experts.

**Evidence strength**: Strong for the general principle (meta-analyses support CLT effects). The specific number (2–3 interacting elements) is a rough heuristic derived from experimental work, not a precise universal constant. The expertise reversal effect is well-replicated.

### 2.2 Optimal Grain Size for Spaced Repetition Items

The SRS literature provides the clearest guidance on atomic item sizing:

**Wozniak's "Twenty Rules of Formulating Knowledge" (1999)** — the foundational document for SRS item design — establishes several key principles:

1. **"Do not learn if you do not understand"** (Rule 1): Comprehension must precede memorization. Items should test knowledge the learner already understands conceptually.
2. **"Minimum information principle"** (Rule 4): Formulate items so that each targets a **single, simple memory connection**. "Simple items are easier to schedule, and you save time because you do not have to review the entire complex item when only one component has been forgotten."
3. **Avoid sets and enumerations** (Rules 8–9): Do not ask learners to recall unordered sets or ordered lists as single items. These create complex memories that are unreliable in SRS. Instead, convert them to individual items using cloze deletions or other techniques.
4. **Use cloze deletion** (Rule 5): Blank out a single element in a sentence. This naturally enforces atomicity.
5. **Optimize wording** (Rule 7): Items should be as concise and unambiguous as possible.

**Why atomicity matters for SRS specifically** (from Wozniak's analysis of memory complexity): When reviewing a simple question-answer pair, you rely on a single memory connection and can uniformly refresh it. Complex memories "may have their concepts activated in an incomplete fashion, or in a different sequence that depends on the context." As a result, "it is hard to produce a uniform increase in memory stability at review." Furthermore, if an item is composed of two sub-items, repetitions must be scheduled at the pace of the _harder_ sub-item, wasting time on the easier one.

**Pimsleur (1967)**: Focused on audio-lingual foreign language learning. Pimsleur's graduated-interval recall method treats a single vocabulary item or short phrase as the atomic review unit. He did not formalize granularity beyond this.

**Leitner (1972)**: The Leitner box system operates on individual flashcards, but Leitner did not define what should go on a card beyond common sense. The system is a scheduling algorithm, not a content design framework.

**Evidence strength**: Wozniak's rules are based on decades of practical experience with SuperMemo and have been adopted across the SRS community (Anki, Mnemosyne, etc.), but they are **practitioner-derived heuristics, not peer-reviewed experimental findings**. No RCT has directly tested, for example, whether items with exactly one memory connection outperform items with two. The principles are theoretically grounded in CLT and memory research, but the specific rules are best characterized as expert-consensus best practice.

### 2.3 Time-Based Heuristics: Duration of a Single Focused Learning Episode

The microlearning literature provides some evidence on duration, though it is less rigorous than one might hope:

- **Microlearning research**: A 2024 systematic review found that sessions of **2–5 minutes** per single learning objective are commonly recommended, with **5–12 minutes** as the broader effective range. Sessions focused on single learning objectives produce superior outcomes compared to multi-objective sessions (multiple studies reviewed in Heliyon, 2024).
- **Attention and encoding**: There is no clean experimental finding that says "concept X takes exactly Y minutes." Duration depends on complexity, modality, and learner expertise. What the literature consistently supports is that a single focused learning episode should target **one clear objective** and should be **short enough to maintain focused attention throughout**.
- **Deliberate practice (Ericsson)**: Ericsson et al. (1993) found that expert performers typically engage in focused practice sessions of approximately **1 hour**, but these sessions contain many individual practice units. Ericsson does not define the duration of a single practice unit beyond saying it should be a "well-defined task with immediate feedback."

**Evidence strength**: Weak to moderate. The microlearning duration findings come mostly from applied studies in corporate training and medical education, with significant variation in methodology. There is no peer-reviewed meta-analysis establishing a precise optimal duration for a single-concept learning episode. The 2–5 minute figure for microlearning is a rough consensus, not a hard empirical finding.

### 2.4 Element Interactivity and the Split-vs-Keep Decision

CLT provides the most principled guidance on when to split content into separate units vs. keep it together:

**Split when**: The material contains more than ~3 novel interacting elements for the target learner. Use the isolated-interacting elements approach: teach each element independently first, then integrate.

**Keep together when**: The elements are so tightly interacting that teaching them in isolation would strip them of meaning. For example, the concept of "division" requires simultaneous understanding of dividend, divisor, and quotient — teaching any one in isolation doesn't work. In this case, the entire interacting set is one learning unit, but you should minimize extraneous cognitive load (clear presentation, worked examples, etc.).

**The isolated-interacting elements effect** (Pollock, Chandler & Sweller, 2002): This experimental finding shows that for complex material, presenting elements first in isolated form and then in interacting form produces better learning than presenting them only in interacting form. This directly validates a "teach the parts, then teach the whole" approach — which maps to your chunk → topic architecture.

**Evidence strength**: The isolated-interacting elements effect is supported by experimental studies (Pollock et al., 2002; Ayres, 2006, 2013). The ~3 element threshold is a rough heuristic.

---

## 3. Grouping and Sequencing

### 3.1 When to Group vs. Separate: Interleaving Research

The interleaving literature provides nuanced guidance:

**Blocking** (studying all items from one category before moving to the next) is better when:

- Learners are complete novices who haven't yet formed initial category schemas.
- Categories are very dissimilar (low similarity), so within-category comparison is more informative than between-category contrast (Carvalho & Goldstone, 2014).
- The goal is initial rule learning or concept formation.

**Interleaving** (mixing items from different categories) is better when:

- Learners have some basic familiarity with the categories.
- Categories are highly similar and the learning goal is **discrimination** — telling them apart (Birnbaum et al., 2013; Kang & Pashler, 2012).
- The goal is long-term retention and transfer, not immediate performance.

**Practical implication for your system**: Within a topic, chunk sequence should generally be **blocked** for initial learning (teach all chunks of one concept before moving to related concepts). Across topics, **interleaving** during review helps learners discriminate between similar concepts. The often-recommended pattern is: **blocked study first, then interleaved review** (Rohrer, 2012; Taylor & Rohrer, 2010).

**Evidence strength**: Strong. Interleaving effects are supported by multiple meta-analyses (Brunmair & Richter, 2019; Firth et al., 2021). The moderating role of similarity is well-established. The blocked-then-interleaved recommendation is supported but less extensively tested.

### 3.2 Prerequisite Chains and Grouping

**Gagné's learning hierarchies** (Gagné, 1965, 1985) provide the most direct treatment of prerequisites. Gagné argues that intellectual skills can be organized hierarchically: mastering a higher-level skill requires mastering its prerequisites. The hierarchy levels (from simple to complex) are: stimulus recognition → response generation → procedure following → use of terminology → discrimination → concept formation → rule application → problem solving.

The key principle: **each level requires mastery of the levels below it.** Instruction should be sequenced bottom-up through the hierarchy, with mastery verified at each level before proceeding. This implies that **tight prerequisite chains should be grouped together** — they form a natural instructional unit because you cannot teach the higher-level skill without the lower-level prerequisites being in place.

**Reigeluth's Elaboration Theory** offers a complementary view: content should be organized from simple to complex, starting with an epitome (overview) and progressively elaborating. This is a "zoom in" approach rather than a "bottom up" approach, but both agree that **dependent concepts belong together in sequence**.

**Is there a cognitive basis for "tight dependency = one group"?** Yes — schema theory provides this basis. Schemas are hierarchical structures where sub-schemas are components of larger schemas. If concept B requires concept A as a prerequisite, then the schema for B _contains_ the schema for A as a component. They are related by **structural dependency**, not merely **topical association**. Your system's definition of topic as "a group of chunks with a shared dependency chain" aligns well with this: it corresponds to a **schema hierarchy** where lower-level schemas are prerequisites for higher-level ones.

In contrast, concepts that are merely **topically related** but not structurally dependent (e.g., "Fenwick Tree" and "Segment Tree" — both range-query data structures, but neither is prerequisite to the other) should be separate topics. They share a **superordinate category** but not a **dependency chain**. Grouping them into one topic is the "survey course" failure mode you described.

**Evidence strength**: Gagné's hierarchy is well-established in instructional design but has been criticized for being overly rigid (some learning does not follow strict hierarchies). The general principle that prerequisites should precede dependents is uncontested. The specific claim that "dependency chain = one group" is a reasonable inference from schema theory but is not directly experimentally tested as a grouping principle.

### 3.3 Schema Acquisition Conditions and Unit Relationships

Three key findings constrain how learning units should relate to each other:

**Worked examples and fading** (Sweller & Cooper, 1985; Renkl et al., 2002): Novices learn better from studying worked examples than from solving problems. As expertise develops, worked example steps should be progressively **faded** (removed), forcing the learner to supply them. This implies a **sequence within a topic**: early chunks should provide more scaffolding (worked examples, full explanations), and later chunks should progressively withdraw scaffolding, eventually requiring the learner to solve problems independently. This is sometimes called the "completion strategy" — moving from complete worked examples to completion problems to full practice problems.

**Zone of Proximal Development (Vygotsky, 1978)**: Learning occurs most effectively when the task is just beyond the learner's current independent ability but achievable with support. This implies that each chunk should be calibrated to be **slightly beyond** what the learner can do after mastering the previous chunk — not so easy as to be boring, not so hard as to be impossible. The ZPD is the conceptual basis for **scaffolding** and **fading**.

**Evidence strength**: The worked example effect is one of the most robust findings in CLT (supported by meta-analyses). ZPD is a theoretical construct that is difficult to operationalize precisely but is widely accepted as a useful framework. The fading effect is well-supported experimentally (Renkl et al., 2002; Atkinson et al., 2003).

### 3.4 Ericsson's Deliberate Practice: Scope of a "Practice Unit"

Ericsson et al. (1993) define deliberate practice as activities that meet these criteria:

1. **Well-defined task** with a specific goal.
2. **Immediate, informative feedback**.
3. **Opportunities for repetition** and error correction.
4. **Designed to improve specific aspects of performance** (not just general playing/performing).

Ericsson does not explicitly define the scope or duration of a single "practice unit." However, the characteristics imply:

- The task must be specific enough to have a clear success/failure criterion.
- It must be focused on **one skill or sub-skill** at a time.
- It should be at the edge of current ability (analogous to ZPD).

This maps to your chunk concept: each chunk, when used as a practice/review unit, should target one specific skill with a clear criterion for success, and should be at the appropriate difficulty level for the learner.

**Evidence strength**: The deliberate practice framework is well-established (Ericsson et al., 1993; Ericsson, 2006). However, the specific claim about practice unit scope is inferred from the definition rather than directly tested. The "10,000 hours" popularization (Gladwell, 2008) is an oversimplification; what matters is the structure and quality of practice, not just duration.

---

## 4. Hierarchical Organization

### 4.1 How Many Levels Does the Literature Support?

There is no single, universally agreed-upon taxonomy of learning content granularity. Different frameworks propose different numbers of levels:

**IEEE LOM**: 4 levels (atom → lesson → course → curriculum). This is the most widely adopted standard.

**SCORM**: 5 levels (asset → SCO → aggregation → organization → curriculum).

**Gagné's Conditions of Learning (1985)**: Gagné organizes learning outcomes into 5 types (verbal information, intellectual skills, cognitive strategies, motor skills, attitudes) and intellectual skills into a hierarchy (discriminations → concrete concepts → defined concepts → rules → higher-order rules / problem solving). This is a _type_ hierarchy, not a _granularity_ hierarchy, but it implies at least 3–4 levels of content organization.

**Reigeluth's Elaboration Theory**: Uses a "zoom lens" model with theoretically unlimited levels: epitome → first elaboration → second elaboration → ... → fine detail. In practice, courses typically use 2–4 levels of elaboration.

**Merrill's CDT**: Operates at one level (the individual content element: fact, concept, procedure, or principle). Does not define higher levels; delegates that to Elaboration Theory.

**Clark & Mayer (2016, _e-Learning and the Science of Instruction_)**: Distinguish between topics, lessons, and courses, but do not formalize the hierarchy.

**Koedinger et al.'s Knowledge-Learning-Instruction (KLI) framework (2012)**: Defines **knowledge components** (KCs) as "an acquired unit of cognitive function or structure that can be inferred from performance on a set of related tasks." KCs are atomic and compose into larger structures, but KLI does not specify a named hierarchy above the KC level.

**A practical synthesis** across frameworks suggests **4 levels** as a reasonable working taxonomy:

| Level                                   | Description                                   | Approximate scope                                 | Framework analogs                                                                               |
| --------------------------------------- | --------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1. Atomic concept / Knowledge component | Single testable piece of knowledge            | One fact, concept, rule, or procedure step        | CLT element, Merrill content element, KLI knowledge component, SCORM asset, Wozniak atomic item |
| 2. Skill cluster / Learning unit        | Group of interacting KCs that form one schema | 2–5 related atomic concepts with dependencies     | CLT interacting element set, SCORM SCO, IEEE LOM Level 2, Gagné prerequisite chain              |
| 3. Module / Lesson                      | Complete treatment of one sub-domain          | Multiple skill clusters, one elaboration sequence | Reigeluth first-level elaboration, SCORM aggregation, IEEE LOM Level 3                          |
| 4. Course / Curriculum                  | Full treatment of a domain                    | Multiple modules                                  | Reigeluth epitome + all elaborations, IEEE LOM Level 4                                          |

**Are the boundaries between levels empirically validated?** No. The level distinctions are **heuristic and conventional**, not experimentally established. No study has tested, for example, whether a 4-level hierarchy produces better learning outcomes than a 3-level or 5-level hierarchy. The levels reflect practitioner consensus about useful organizational distinctions, informed by cognitive theory (especially the schema hierarchy concept) but not directly validated.

### 4.2 Naming Conventions Across Frameworks

| Framework                      | Level 1 (atomic)    | Level 2 (cluster)       | Level 3 (module)       | Level 4 (course)                 |
| ------------------------------ | ------------------- | ----------------------- | ---------------------- | -------------------------------- |
| CLT (Sweller)                  | Element             | Interacting element set | (not defined)          | (not defined)                    |
| Schema theory                  | Schema (atomic)     | Schema (composite)      | Schema (domain-level)  | (not defined)                    |
| CDT (Merrill)                  | Content element     | (delegates to ET)       | (delegates to ET)      | (delegates to ET)                |
| Elaboration Theory (Reigeluth) | Fine detail         | Elaboration             | Epitome section        | Epitome (full course)            |
| Gagné                          | Subordinate skill   | Learning hierarchy      | (not named)            | Conditions of learning (by type) |
| SCORM                          | Asset               | SCO                     | Aggregation / Activity | Organization / Curriculum        |
| IEEE LOM                       | Level 1             | Level 2                 | Level 3                | Level 4                          |
| KLI (Koedinger)                | Knowledge component | (not named)             | (not named)            | (not named)                      |
| Wozniak/SRS                    | Atomic item         | (not defined)           | (not defined)          | (not defined)                    |
| Oakley                         | Chunk               | (not named)             | (not named)            | (not named)                      |

The table illustrates a notable gap: most frameworks define the atomic level clearly but are vague about intermediate levels. This is likely because the intermediate levels are more domain- and context-dependent than the atomic level.

---

## 5. Areas Where the Literature Is Contested or Thin

1. **Precise element count thresholds**: The "2–3 interacting elements" heuristic from CLT is directionally correct but not a universal constant. Element interactivity depends on what counts as an "element," which is partly subjective and depends on learner expertise.

2. **Optimal SRS item granularity**: Wozniak's minimum information principle is practitioner wisdom, not peer-reviewed experimental evidence. No RCT has directly compared SRS items at different granularity levels with controlled content.

3. **Time-based heuristics for single concepts**: The microlearning literature (2–5 minutes per concept) is based mostly on applied studies with significant methodological variation. No controlled experiment has isolated "concept duration" as an independent variable.

4. **Hierarchical level count**: Whether 3, 4, or 5 levels are optimal is entirely conventional. No study has empirically compared different numbers of hierarchical levels.

5. **Grouping by dependency chain vs. topical similarity**: The principle that dependency chains should define groups is well-grounded in schema theory and Gagné's work, but it has not been directly tested as a content organization strategy. Most studies test _sequencing_ (order) rather than _grouping_ (what belongs together).

6. **Interleaving boundary conditions**: While interleaving is generally beneficial for discrimination and long-term retention, the specific conditions under which blocking is superior (novice learners, low-similarity categories, rule learning) are still being mapped out. The 2021 systematic review by Firth et al. notes significant heterogeneity across studies.

---

## 6. Consolidated Terminology Mapping Table

| Your current term                                                           | Recommended term(s) from literature                                                                                                                               | Primary source                                                                | Notes                                                                                                                                                              |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Chunk** (atomic unit of learning content targeting a single concept)      | **Knowledge component** (KLI); **Element** (CLT); **Atomic item** (Wozniak/SRS); **Content element** (Merrill CDT); **SCO** (SCORM, for trackable unit)           | Koedinger et al. (2012); Sweller (1994, 2010); Wozniak (1999); Merrill (1983) | "Knowledge component" is the most precise match from a cognitive science perspective. "Chunk" is fine colloquially but risks confusion with Miller's memory chunk. |
| **Topic** (group of chunks with shared dependency chain)                    | **Learning hierarchy** (Gagné); **Interacting element set** (CLT); **Schema family** / **Composite schema** (schema theory); **Elaboration sequence** (Reigeluth) | Gagné (1965, 1985); Sweller (2010); Reigeluth (1979)                          | "Learning hierarchy" best captures the dependency-chain aspect. "Interacting element set" best captures the CLT rationale for grouping.                            |
| **Atomic concept** (smallest teachable/testable unit)                       | **Knowledge component** (KLI); **Production rule** (ACT-R); **Fact/Concept/Procedure/Principle** (Merrill CDT)                                                    | Koedinger et al. (2012); Anderson (1983); Merrill (1983)                      | Merrill's four-way distinction may be useful for distinguishing _types_ of atomic units.                                                                           |
| **Skill cluster** (group of interacting atomic concepts forming one schema) | **Schema** (schema theory); **Interacting element set** (CLT); **SCO** (SCORM)                                                                                    | Piaget; Anderson (1977); Sweller (2010)                                       | This is the level at which the isolated-interacting elements effect operates.                                                                                      |
| **Module** (complete sub-domain treatment)                                  | **Elaboration** (Reigeluth); **Aggregation** (SCORM); **IEEE LOM Level 3**                                                                                        | Reigeluth (1979); SCORM 2004                                                  |                                                                                                                                                                    |
| **Course** (full domain treatment)                                          | **Epitome + elaborations** (Reigeluth); **Organization** (SCORM); **IEEE LOM Level 4**                                                                            | Reigeluth (1979); SCORM 2004                                                  |                                                                                                                                                                    |

---

## 7. Key References

- Anderson, J.R. (1983). _The Architecture of Cognition_. Harvard University Press.
- Anderson, R.C. (1977). The notion of schemata and the educational enterprise. In _Schooling and the Acquisition of Knowledge_.
- Atkinson, R.K., Renkl, A., & Merrill, M.M. (2003). Transitioning from studying examples to solving problems. _Journal of Educational Psychology_, 95(4), 774–783.
- Bartlett, F.C. (1932). _Remembering_. Cambridge University Press.
- Birnbaum, M.S. et al. (2013). Why interleaving enhances inductive learning. _Memory & Cognition_, 41, 392–402.
- Brunmair, M. & Richter, T. (2019). Similarity matters: A meta-analysis of interleaved learning. _Psychological Bulletin_, 145(11), 1029–1052.
- Carvalho, P.F. & Goldstone, R.L. (2014). Effects of interleaved and blocked study on delayed test of category learning generalization. _Frontiers in Psychology_, 5, 936.
- Chen, O., Kalyuga, S., & Sweller, J. (2023). A cognitive load theory approach to defining and measuring task complexity through element interactivity. _Educational Psychology Review_, 35, 63.
- Chi, M.T.H., Feltovich, P.J., & Glaser, R. (1981). Categorization and representation of physics problems by experts and novices. _Cognitive Science_, 5, 121–152.
- Clark, R.C. & Mayer, R.E. (2016). _e-Learning and the Science of Instruction_ (4th ed.). Wiley.
- Cowan, N. (2001). The magical number 4 in short-term memory: A reconsideration of mental storage capacity. _Behavioral and Brain Sciences_, 24, 87–185.
- Cowan, N. (2010). The magical mystery four: How is working memory capacity limited, and why? _Current Directions in Psychological Science_, 19(1), 51–57.
- Ericsson, K.A., Krampe, R.T., & Tesch-Römer, C. (1993). The role of deliberate practice in the acquisition of expert performance. _Psychological Review_, 100(3), 363–406.
- Ericsson, K.A. (2006). The influence of experience and deliberate practice on the development of superior expert performance. In _The Cambridge Handbook of Expertise and Expert Performance_.
- Firth, J., Rivers, I., & Boyle, J. (2021). A systematic review of interleaving as a concept learning strategy. _Review of Education_, 9(2), 642–684.
- Gagné, R.M. (1965). _The Conditions of Learning_. Holt, Rinehart & Winston.
- Gagné, R.M. (1985). _The Conditions of Learning and Theory of Instruction_ (4th ed.). Holt, Rinehart & Winston.
- Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. _Educational Psychologist_, 38, 23–31.
- Koedinger, K.R., Corbett, A.T., & Perfetti, C. (2012). The Knowledge-Learning-Instruction framework. _Cognitive Science_, 36(5), 757–798.
- Leitner, S. (1972). _So lernt man lernen_. Herder.
- Merrill, M.D. (1983). Component display theory. In C.M. Reigeluth (Ed.), _Instructional Design Theories and Models_.
- Miller, G.A. (1956). The magical number seven, plus or minus two. _Psychological Review_, 63(2), 81–97.
- Oakley, B. (2014). _A Mind for Numbers_. Tarcher/Penguin.
- Piaget, J. (1926). _The Language and Thought of the Child_. Harcourt Brace.
- Pimsleur, P. (1967). A memory schedule. _Modern Language Journal_, 51(2), 73–75.
- Pollock, E., Chandler, P., & Sweller, J. (2002). Assimilating complex information. _Learning and Instruction_, 12, 61–86.
- Reigeluth, C.M. (1979). In search of a better way to organize instruction: The elaboration theory. _Journal of Instructional Development_, 2(3), 8–15.
- Reigeluth, C.M. & Stein, F.S. (1983). The elaboration theory of instruction. In _Instructional Design Theories and Models_.
- Renkl, A., Atkinson, R.K., Maier, U.H., & Staley, R. (2002). From example study to problem solving. _Journal of Experimental Psychology: Applied_, 8(4), 218–232.
- Rohrer, D. (2012). Interleaving helps students distinguish among similar concepts. _Educational Psychology Review_, 24, 355–367.
- Sweller, J. (1994). Cognitive load theory, learning difficulty, and instructional design. _Learning and Instruction_, 4(4), 295–312.
- Sweller, J. (2010). Element interactivity and intrinsic, extraneous, and germane cognitive load. _Educational Psychology Review_, 22, 123–138.
- Sweller, J. & Chandler, P. (1994). Why some material is difficult to learn. _Cognition and Instruction_, 12(3), 185–233.
- Sweller, J. & Cooper, G.A. (1985). The use of worked examples as a substitute for problem solving in learning algebra. _Cognition and Instruction_, 2(1), 59–89.
- Taylor, K. & Rohrer, D. (2010). The effects of interleaved practice. _Applied Cognitive Psychology_, 24, 837–848.
- Vygotsky, L.S. (1978). _Mind in Society_. Harvard University Press.
- Wozniak, P. (1999). Effective learning: Twenty rules of formulating knowledge. SuperMemo.
