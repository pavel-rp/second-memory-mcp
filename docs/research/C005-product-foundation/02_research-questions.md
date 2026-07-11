# Predeclared Material Research Questions (RQ1–RQ6)

**Task:** NEU-897 · **Declared:** 2026-07-11, before findings were recorded. · **Cap:** 6 of 6 used.

Each question is framed by the fixed target audience (programmers with language and basic-algorithm competence seeking durable mastery and competitive-programming breadth) and is material because its answer could change the downstream learner model (NEU-898), a product principle, an evidence-class limitation, or a binding requirement. One record per question lives in `questions/`.

| ID | Question | Materiality (what it could change) | Primary evidence classes |
| -- | --- | --- | --- |
| **RQ1** | What does the learning-science literature establish about producing *durable* mastery (retention + transfer) in adult, already-competent learners via retrieval practice and spacing — and what are the boundary conditions? | The learner model's core mastery mechanism assumptions; success-metric framing for "durable". | [literature] |
| **RQ2** | What pedagogy is specifically supported for *algorithmic problem-solving skill acquisition* (worked examples, subgoal labeling, pattern/schema formation) as opposed to fact retention — the skill DP mastery actually requires? | Whether the product model may assume flashcard-style retention mechanics transfer to DP problem-solving; failure-mode inventory. | [literature] |
| **RQ3** | What approaches do existing competitive-programming practice tools/platforms document for mastery and retention, and what documented gaps remain? | Differentiator candidates and exclusion boundaries for the product model. | [literature] (tool documentation), existing-project research |
| **RQ4** | Which learner-state signals does the existing Second Memory codebase actually collect or expose today, and which desired signals are declared but not computed — bounding what a DP-mastery product can measure without new telemetry? | Metric feasibility for hypotheses; the proxy-to-production evidence path. | [code-evidence] |
| **RQ5** | How reliable is LLM-based grading/critique of learner answers, and what limitations must the AI-critique and automated-evaluation evidence classes carry? | The evidence-taxonomy limitation fields; trust boundaries for any AI-graded mastery signal. | [literature] |
| **RQ6** | Which jobs, motivations, and failure modes of the target learner are supportable by literature/prior research today, and which claims must wait for future real-user evidence? | The boundary between supportable learner-model statements and gaps reserved for class-7 evidence. | [literature], existing-project research |

**Cap note:** candidate questions that were considered and **not** declared (pricing/willingness-to-pay depth, curriculum sequencing specifics, UI modality) are listed with reasons in `04_caps-and-incomplete-scope.md`. Declaring any of them would have exceeded the six-question cap or another chapter's scope.
