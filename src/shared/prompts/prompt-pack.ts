import type { TeachingApproach } from '../../domain/algorithms/classify-chunk.js';

type PromptName =
  | 'scaffolding'
  | 'learning'
  | 'retrieval'
  | 'review'
  | 'workflow_guidance'
  | 'chunk_generation'
  | 'chunk_management'
  | 'learning_session';

export type DrillFormat =
  | 'multiple_choice'
  | 'open_ended'
  | 'coding_problem'
  | 'explanation'
  | 'application';

// Historical feedback entry from past sessions
export type PromptFeedbackEntry = {
  sessionMode: string;
  completedAt: string;
  feedback: string;
};

type PromptContext = {
  // Common
  problem?: string;

  // Learning context
  chunkNumber?: number;
  totalChunks?: number;
  chunkTitle?: string;
  chunkContent?: string;
  prerequisites?: string;
  drillFormat?: DrillFormat;

  // Review context
  masteryLevel?: number; // 0..5
  lastReviewed?: string; // ISO date string
  previousAttempts?: number;
  weakAreas?: string;
  previousSessionFeedback?: PromptFeedbackEntry[]; // Feedback from past sessions on same content

  // Chunk generation context
  topicTitle?: string;
  topicDescription?: string;
  existingChunkTitles?: string[];

  // Learning session context
  sessionMode?: string;
  timeAvailable?: number;
  subject?: string;

  // Chunk management context
  operation?: 'update' | 'merge' | 'split' | 'retire';
  managedChunk?: { title: string; order?: number; content?: string; prerequisites?: string };
  intent?: string;

  // Research context (optional)
  researchRequired?: boolean;
  searchEmphasis?: 'current' | 'comprehensive' | 'authoritative';
  topicSearchTerms?: string[];
};

/**
 * PromptPack centralizes standardized prompt strings used by the MCP server.
 */
class PromptPack {
  private readonly promptHandlers: Record<PromptName, (context: PromptContext) => string> = {
    scaffolding: context => this.getScaffoldingPrompt(context),
    learning: context => this.getLearningPrompt(context),
    retrieval: context => this.getRetrievalPrompt(context),
    review: context => this.getReviewPrompt(context),
    workflow_guidance: () => this.getWorkflowGuidancePrompt(),
    chunk_generation: context => this.getChunkGenerationPrompt(context),
    chunk_management: context => this.getChunkManagementPrompt(context),
    learning_session: context => this.getLearningSessionPrompt(context),
  };

  getPrompt(name: PromptName, context: PromptContext = {}): string {
    return this.promptHandlers[name](context);
  }

  private getResearchPrefix(
    topic: string,
    searchType: 'current' | 'comprehensive' | 'authoritative' = 'comprehensive',
    additionalSearchTerms?: string[]
  ): string {
    const searchQueries = this.getSearchQuerySuggestions(topic, additionalSearchTerms);
    const sourceGuidance = this.getSourceQualityGuidance();

    const currentYear = new Date().getFullYear();
    const searchFocus = {
      current: `recent information (${currentYear - 1}-${currentYear}) and latest best practices`,
      comprehensive: 'multiple perspectives, solutions, and comprehensive coverage',
      authoritative: 'official documentation, recognized experts, and peer-reviewed sources',
    }[searchType];

    return [
      '## RESEARCH FIRST',
      `Before generating any learning content, search the web for current information about ${topic}.`,
      '',
      'Search for:',
      ...searchQueries.map(query => `- ${query}`),
      `- ${searchFocus}`,
      '',
      sourceGuidance,
      '',
      'If web search is unavailable, explicitly note this limitation and use best available knowledge with uncertainty markers.',
      '',
    ].join('\n');
  }

  private getSourceQualityGuidance(): string {
    return [
      'Prioritize:',
      '- Official documentation and authoritative sources',
      '- Peer-reviewed articles and established educational platforms',
      '- Recognized industry experts and thought leaders',
      '- Recent tutorials and guides from reputable sources',
      '',
      'When conflicting information is found:',
      '- Present multiple perspectives with noted trade-offs',
      '- Indicate areas of consensus vs. disagreement',
      '- Explicitly state limitations and uncertainties',
    ].join('\n');
  }

  private getSearchQuerySuggestions(topic: string, additionalSearchTerms?: string[]): string[] {
    const currentYear = new Date().getFullYear();
    const baseQueries = [
      `"${topic}" best practices ${currentYear - 1} ${currentYear}`,
      `"${topic}" tutorial guide comprehensive`,
      `"${topic}" official documentation`,
      `"${topic}" examples real world applications`,
    ];

    // Add topic-specific search terms if provided
    if (additionalSearchTerms && additionalSearchTerms.length > 0) {
      return [...baseQueries, ...additionalSearchTerms.map(term => `"${topic}" ${term}`)];
    }

    return baseQueries;
  }

  private getScaffoldingPrompt(context: PromptContext): string {
    const problem = context.problem ?? '<problem not provided>';
    const searchEmphasis = context.searchEmphasis ?? 'comprehensive';

    // Include research instructions if researchRequired is not explicitly false
    const includeResearch = context.researchRequired !== false;

    const researchSection = includeResearch
      ? this.getResearchPrefix(problem, searchEmphasis, context.topicSearchTerms)
      : '';

    return [
      researchSection,
      'You are an expert tutor applying evidence-based learning.',
      'Objective: Analyze the learning challenge and create an optimal scaffolding plan.',
      '',
      `PROBLEM: ${problem}`,
      '',
      'Before designing chunks:',
      '1) SEARCH EXISTING CONTENT: call search_learning_content to find topics already covering this area. Reuse or wire prerequisites to existing chunks instead of duplicating.',
      '2) ASSESS PRIOR KNOWLEDGE: ask the learner targeted questions about key prerequisites. Absence from the database does not mean the learner lacks knowledge — assess before assuming a gap.',
      '',
      'Produce:',
      '1) HIGH-LEVEL OVERVIEW: key concepts and components',
      '2) CHUNK BREAKDOWN: a reasonable number of logically ordered, digestible chunks',
      '2.1) CHUNK ORDER: the order of the chunks should be based on the logical progression of the concepts',
      '2.2) CHUNK CONTENT: Each chunk should contain a single digestible concept following cognitive load theory principles.',
      '2.3) CHUNK NUMBER: the number of chunks should be based on the complexity of the concept. As a guideline: use 2–4 chunks for simple concepts and 5–7 for moderate to complex topics (maximum 7). Adjust as needed for optimal learning.',
      '3) PREREQUISITE MAPPING: what must be mastered before each chunk',
      '4) DIFFICULTY ASSESSMENT: overall difficulty (1–10)',
      '5) ESTIMATED TIMELINE: realistic progression',
      '',
      'Constraints:',
      '- Manage cognitive load; prefer concrete examples before abstractions',
      '- Keep explanations concise and supportive',
      '- Include comprehensive content for each chunk (examples, explanations, exercises)',
      '- Provide a topic summary that captures the overall learning objectives',
      '- Do not create chunks for concepts the learner has demonstrated mastery of',
      "- Mark chunks with established content as 'final' and chunks to be filled just-in-time as 'draft' using content_status",
      '- Persist the result with full content to this server using create_topic_with_chunks tool.',
    ]
      .filter(Boolean)
      .join('\n');
  }

  private getLearningPrompt(context: PromptContext): string {
    const chunkNumber = context.chunkNumber ?? 1;
    const totalChunks = context.totalChunks ?? 1;
    const chunkTitle = context.chunkTitle ?? '<untitled chunk>';
    const chunkContent = context.chunkContent ?? '<content not provided>';
    const prerequisites = context.prerequisites ?? 'verified or N/A';
    const drillFormat = context.drillFormat ?? 'open_ended';

    return [
      'You are teaching with cognitive load awareness and scaffolding.',
      '',
      `CURRENT CHUNK (${chunkNumber}/${totalChunks}): "${chunkTitle}"`,
      `Focus: ${chunkContent}`,
      `Prerequisites verified: ${prerequisites}`,
      '',
      'Content Access: If you need the full chunk content, use the get_chunk_content tool to retrieve comprehensive details including examples and exercises.',
      '',
      '## TEACHING PRIORITY',
      '',
      'This instruction overrides all formatting and brevity preferences.',
      'You MUST present EVERY content item the server provides before asking any question that references it.',
      'Do not summarise, abbreviate, or compress the teaching script. Present it in full.',
      '',
      "## YOUR CONTEXT ≠ LEARNER'S CONTEXT",
      '',
      "Your context window is NOT the learner's knowledge.",
      'Do NOT ask about content you have not explicitly shown to the learner in this conversation.',
      'Before referencing any item in a question, confirm that you have already presented it to the learner.',
      '',
      'Approach:',
      '1) Present the core concept using simple, concrete examples',
      '2) Build understanding gradually with scaffolded explanations',
      '3) Use analogies or visual descriptions if helpful',
      '4) Check for understanding before moving on',
      `5) Conduct retrieval practice using format: ${drillFormat} (see taxonomy below)`,
      '',
      '## Question Taxonomy',
      '',
      "Use three levels of questions, matched to the learner's estimated accuracy:",
      '',
      '| Level | Label | Example stems | Target accuracy |',
      '|-------|-------|---------------|-----------------|',
      '| 1 | Recall | "What is...?" / "List the steps..." / "Write the function..." | 85–95% |',
      '| 2 | Explain/Apply | "In your own words, why...?" / "Given this scenario, use X to..." | 70–80% |',
      '| 3 | Analyze/Create | "What would break if...?" / "Design a solution for this novel problem..." | 65–75% |',
      '',
      '## Adaptive Difficulty Selection',
      '',
      'Estimate chunk_accuracy from available signals (previous_feedback, passed history, previous_attempts):',
      '- accuracy < 0.40 → Recall only (Level 1)',
      '- accuracy < 0.80 → Start at last successful level, escalate on correct answer',
      '- accuracy ≥ 0.80 → Interleave all levels',
      '',
      ...this.formatQualityRubric(),
      '',
      '## NEU-306 Teaching Approach Ceiling',
      '',
      'If the response includes `teaching_approach` with value `reteach` or `scaffold`, stay at Level 1 (Recall) only. Save Explain/Apply for the next review session.',
      '',
      'Style: concise, supportive, and precise.',
    ].join('\n');
  }

  private getRetrievalPrompt(context: PromptContext): string {
    const chunkTitle = context.chunkTitle ?? '<untitled chunk>';
    const drillFormat = context.drillFormat ?? 'open_ended';
    const mastery = context.masteryLevel ?? 2;
    const feedbackSection = this.formatPreviousFeedbackSection(context.previousSessionFeedback);

    return [
      'You are generating a retrieval practice drill.',
      '',
      `CHUNK: "${chunkTitle}"`,
      `FORMAT: ${drillFormat}`,
      `TARGET MASTERY: ${mastery}/5`,
      feedbackSection,
      '',
      'Requirements:',
      '- Test core understanding, not rote memorization',
      '- Enforce a two-attempt policy before revealing answers',
      '- Provide immediate, constructive feedback',
      '- Include a near-transfer application if appropriate',
      '- Use taxonomy levels: start at Recall; escalate to Explain/Apply only if mastery target ≥ 3. Do not use Analyze/Create on re-queued chunks — save Level 3 for fresh review sessions.',
      feedbackSection
        ? '- Address previously reported difficulties with extra scaffolding or hints'
        : '',
      '',
      ...this.formatQualityRubric(),
    ]
      .filter(Boolean)
      .join('\n');
  }

  private getReviewPrompt(context: PromptContext): string {
    const lastReviewed = context.lastReviewed ?? '<unknown>';
    const mastery = context.masteryLevel ?? 2;
    const previousAttempts = context.previousAttempts ?? 0;
    const weakAreas = context.weakAreas ?? 'focus foundational gaps';
    const feedbackSection = this.formatPreviousFeedbackSection(context.previousSessionFeedback);

    const basePlan = [
      'Plan (taxonomy-aware):',
      '1) Quick recall check — Level 1 question (no re-teaching yet)',
      '2) If successful → escalate to Level 2 (Explain/Apply) for reinforcement',
      '3) If failed → targeted re-explanation + practice drill at same level (two-attempt policy)',
      '4) Use interleaving with related concepts when helpful',
      '5) Assess quality using the rubric below',
    ];

    // Add feedback-informed instruction if feedback exists
    if (feedbackSection) {
      basePlan.push('6) Pay special attention to previously reported pain points');
    }

    return [
      'You are conducting a spaced review session.',
      '',
      `LAST REVIEWED: ${lastReviewed}`,
      `CURRENT MASTERY: ${mastery}/5`,
      `PREVIOUS ATTEMPTS: ${previousAttempts}`,
      `FOCUS AREAS: ${weakAreas}`,
      feedbackSection,
      '',
      ...basePlan,
      '',
      ...this.formatQualityRubric(),
    ]
      .filter(Boolean)
      .join('\n');
  }

  private getWorkflowGuidancePrompt(): string {
    return [
      'WORKFLOW GUIDANCE',
      '',
      '## CRITICAL: Session Requirement for Recall/Review',
      '',
      'MANDATORY: For ANY recall, review, or retrieval practice:',
      '1) Search for topic/chunks using search_learning_content or batch_fetch_chunks_minimal',
      '2) Create a session BEFORE teaching: create_session({ mode: "retrieval" or "review", chunk_ids: [...] })',
      '3) The session automatically loads historical feedback showing what the learner struggled with previously',
      '4) Use this feedback to adapt your teaching - give extra scaffolding where they had difficulty',
      '',
      'DO NOT skip session creation and go directly to get_chunk_content or get_topic_summary for recall.',
      'The session workflow ensures learning science principles are applied (spaced repetition, feedback-informed teaching).',
      '',
      '## End-to-end Learning Flow',
      '',
      '1) Research phase → Search web for current information about the learning topic',
      '   - Use authoritative sources, official documentation, and recent best practices',
      '   - Gather multiple perspectives and real-world examples',
      '   - Note any limitations if web search is unavailable',
      "2) Intake problem → request 'scaffolding' prompt (produce 2–7 chunks)",
      "3) For each chunk → request 'learning' prompt → conduct retrieval",
      '4) Retrieval checks enforce a two-attempt policy with immediate feedback',
      '5) After retrieval → call tools to schedule next review:',
      '   - calculate_next_review(quality, repetitions, ease_factor, interval) → { interval, repetitions, ease_factor, next_review }',
      '   - calculate_priority_score(next_review_date, ease_factor, repetitions, difficulty) → { priority }',
      "6) Persist topic/chunk/schedule/analytics/logs via this server's tools",
      "7) Use 'review' prompt during scheduled sessions; apply interleaving when helpful",
      '',
      '## Review/Recall Flow (MUST follow this)',
      '',
      '1) User requests recall/review of a topic',
      '2) Search: search_learning_content({ query: "topic name" }) or batch_fetch_chunks_minimal({ topic_id: "..." })',
      '3) Create session: create_session({ mode: "retrieval", chunk_ids: [...found chunk IDs...] })',
      '4) Get active session: get_active_session() - this returns historical_feedback from past sessions',
      '5) Review the historical_feedback to see what was difficult before',
      '6) Conduct retrieval practice, giving extra attention to previously difficult areas',
      '7) Record results and complete session with detailed feedback',
      '',
      '## Rolling Session Flow (Interactive)',
      '',
      'Use this when the learner picks chunks on the fly rather than pre-declaring all chunks upfront.',
      '',
      '1) Create an empty session: create_session({ mode: "learning" }) — no chunk_ids',
      '2) Add and activate the chunk: create_session_chunk({ session_id: "...", chunk_id: "...", status: "in_progress" })',
      '3) Retrieve and teach: get_chunk_content({ chunk_id: "..." })',
      '4) Record: submit_answer({ prompt_text: "...", chunk_ids: ["..."], response: "...", passed: true, feedback: "...", time_spent_ms: 5000 }) — set passed and time_spent_ms to the actual result values. On "retry", ask the learner to try again and resubmit with session_question_id from the response until "recorded". After "recorded", call teach_next to advance: if status is "teach", go to step 3 for that chunk (already in_progress — do not call create_session_chunk). If status is "blocked" or "error", surface the message to the learner and stop. Loop to step 2 only when status is "complete" or no chunk is currently in_progress.',
      '5) Repeat steps 2–4 for each chunk the learner selects',
      '6) Finish: complete_session({ session_id: "...", feedback: "..." })',
      '',
      '## Getting Recommendations',
      '',
      '- Use: what_to_learn_today({ subject_filter: "Math", limit: 10 })',
      '- Returns topic-level recommendations ranked by urgency',
      '- Each topic includes urgency_score, urgency_reason, due_chunk_ids, estimated_duration, and has_new_chunks',
      '- Supports optional filters: subject_filter, limit',
      '',
      '## Assessment-First Scaffolding (Proactive Flow)',
      '',
      'When the learner asks to learn a new topic:',
      "1) Identify prerequisites using your own knowledge (e.g., Kruskal's needs Union-Find, MST basics, graph fundamentals)",
      '2) Search: call search_learning_content for each prerequisite to check existing coverage',
      '3) Assess: for prerequisites not found in the database, ask the learner targeted questions — e.g., "Can you explain path compression in Union-Find?"',
      '4) If the learner demonstrates mastery → skip creation, proceed to the requested topic',
      '5) If the learner cannot answer → confirmed gap. Create the prerequisite topic, wire edges, teach it first',
      '6) The prerequisite graph grows only where real gaps exist',
      '',
      '## Reactive Gap Detection',
      '',
      'When a gap is discovered mid-session:',
      '1) Learner struggles with a drill → probe to confirm the gap: "Let\'s step back — can you explain [prerequisite concept]?"',
      '2) If the learner demonstrates understanding → not a real gap. Adjust your teaching approach instead',
      '3) If the learner cannot explain → confirmed gap:',
      '   - search_learning_content for the prerequisite',
      // interim: using "confusion" note type until a dedicated "gap" type exists
      '   - add_note({ note_type: "confusion", ... }) to record the gap',
      '   - complete_session with feedback describing the gap',
      '   - Create the prerequisite topic with create_topic_with_chunks',
      '   - Teach the prerequisite, then return to the original topic',
      '',
      '## Bootstrap Workflow (New Topics from Scratch)',
      '',
      'When creating a topic that mixes known and unknown content:',
      '1) Search existing content and assess the learner (see Assessment-First Scaffolding above)',
      "2) Create the topic with mixed content_status: 'final' for chunks with established content, 'draft' for chunks to be filled just-in-time",
      '3) Start teaching from the first chunk the learner needs (skip mastered prerequisites)',
      '4) Wire prerequisites to existing chunks where they already exist in the database',
      '',
      '## Just-in-Time Content Fill',
      '',
      "For chunks with content_status: 'draft':",
      "1) Teach the current chunk → observe the learner's responses and difficulties",
      '2) Use those observations to generate tailored content for the next draft chunk via update_chunk_content',
      '3) Teach the now-filled chunk, repeat until all draft chunks are finalized',
      'This produces content adapted to the specific learner rather than generic explanations.',
      '',
      '## Content Persistence Best Practices',
      '',
      '- When creating topics: include comprehensive summaries using topicSummary field',
      '- When creating chunks: provide detailed content with examples, explanations, and exercises',
      '- Use create_topic_with_chunks tool with full content for new topics',
      '- Retrieve existing content using get_chunk_content or get_topic_summary tools',
      '- Use list_items_with_content for batch operations and overview sessions',
      '- Content is automatically versioned and timestamped for tracking changes',
      '',
      '## Session Completion Best Practices',
      '',
      '- ALWAYS complete sessions with detailed feedback using complete_session',
      '- Feedback MUST include: what was difficult, what was easy, specific pain points',
      '- This feedback is surfaced in future review sessions to improve teaching',
      '- Poor feedback = poor future learning adaptation',
      '',
      '## Scope boundaries',
      '',
      '- Only exposes prompts/resources/tools via MCP capabilities',
      '- Web search performed by client using their own capabilities',
      '- Write the data to the server as soon as you produce new artifacts like chunks or schedules',
      '',
      '## Per-Chunk Probing Algorithm',
      '',
      'For each chunk in the session:',
      '1) Ask a question at the current taxonomy level (start at Recall)',
      '2) If correct → escalate one level if time permits (Recall → Explain/Apply → Analyze/Create)',
      '3) If wrong → provide feedback → ask another question at the same level (max 3 attempts per level → move on)',
      '4) Guardrails: minimum 1 Recall + 1 Explain question for non-trivial chunks; max 5–7 total attempts per chunk',
      '5) Scale attempt budget to chunk complexity — simple facts need fewer probes than multi-step procedures',
      '',
      '## Style and pedagogy',
      '',
      '- Manage cognitive load; use concrete → abstract progression',
      '- Keep explanations concise, supportive, and precise',
    ].join('\n');
  }

  private getChunkGenerationPrompt(context: PromptContext): string {
    const topicTitle = context.topicTitle ?? '<topic not provided>';
    const topicDescription = context.topicDescription ?? '<description not provided>';
    const existing = Array.isArray(context.existingChunkTitles) ? context.existingChunkTitles : [];
    const existingList =
      existing.length > 0
        ? `Existing chunk titles: ${existing.join(', ')}`
        : 'No existing chunk titles provided.';
    const searchEmphasis = context.searchEmphasis ?? 'current';

    // Include research instructions if researchRequired is not explicitly false
    const includeResearch = context.researchRequired !== false;

    const researchSection = includeResearch
      ? this.getResearchPrefix(topicTitle, searchEmphasis, context.topicSearchTerms)
      : '';

    const constraints = [
      '- Avoid duplication with existing titles',
      '- Manage cognitive load; keep chunks digestible',
      "- Reference 'Learning Chunks' fields as per schemas",
    ];

    // Only add research-based constraint if research is included
    if (includeResearch) {
      constraints.push(
        '- Base chunks on current examples and best practices found through research'
      );
    }

    return [
      researchSection,
      'You are assisting with chunk generation for a learning topic.',
      '',
      `TOPIC: ${topicTitle}`,
      `DESCRIPTION: ${topicDescription}`,
      existingList,
      '',
      'Produce 2–7 proposed chunks, each including:',
      '- title',
      '- order (1..n)',
      '- content (2–3 sentence summary)',
      '- prerequisites (bulleted list or concise text)',
      '',
      'Constraints:',
      ...constraints,
    ]
      .filter(Boolean)
      .join('\n');
  }

  private getChunkManagementPrompt(context: PromptContext): string {
    const op = context.operation ?? 'update';
    const chunk = context.managedChunk ?? { title: '<untitled>' };
    const intent = context.intent ?? '<intent not provided>';

    return [
      'You are assisting with chunk maintenance (update/merge/split/retire).',
      '',
      `OPERATION: ${op}`,
      `TARGET CHUNK: ${chunk.title}`,
      chunk.order != null ? `ORDER: ${chunk.order}` : undefined,
      chunk.content ? `CONTENT (current): ${chunk.content}` : undefined,
      chunk.prerequisites ? `PREREQUISITES (current): ${chunk.prerequisites}` : undefined,
      `INTENT: ${intent}`,
      '',
      'Output a proposed result with:',
      '- resulting chunk(s) with title, order, content summary, prerequisites',
      '- brief rationale for the change',
      '- explicit mapping of any splits/merges',
    ]
      .filter(Boolean)
      .join('\n');
  }

  private getLearningSessionPrompt(context: PromptContext): string {
    const mode = context.sessionMode ?? 'start';
    const time = context.timeAvailable;
    const subject = context.subject;

    const timeNote = time ? `The learner has ${time} minutes available.` : '';
    const subjectNote = subject ? `Focus area: ${subject}.` : '';
    const contextLine = [timeNote, subjectNote].filter(Boolean).join(' ');

    return [
      'LEARNING SESSION ORCHESTRATION',
      '',
      `Mode: ${mode}`,
      contextLine,
      '',
      'You are orchestrating a spaced-repetition learning session. Use the tools available on this MCP server to manage the session end-to-end.',
      '',
      '## Starting a Session',
      '',
      '1. Get recommendations: `what_to_learn_today({' +
        (subject ? ` subject_filter: "${subject}",` : '') +
        ' limit: 10 })`',
      '2. Review the recommendations and present them to the learner',
      '3. Create a session: `create_session({ mode: "learning", chunk_ids: [...recommended IDs...] })`',
      '4. Begin teaching the first chunk using the `learning` prompt',
      '',
      '## Conducting Reviews',
      '',
      '1. Search for content: `search_learning_content({ query: "topic" })` or `batch_fetch_chunks_minimal({ topic_id: "..." })`',
      '2. Create a review session: `create_session({ mode: "retrieval", chunk_ids: [...] })`',
      '3. Get session with feedback: `get_active_session()` — includes historical_feedback',
      '4. Use the `review` or `retrieval` prompt, adapting to past difficulties',
      '5. After each chunk, record results with `submit_answer`',
      '',
      '## Session Continuation',
      '',
      '- Check status: `session_status({ session_id: "..." })` — returns progress, quality, and continue/complete/break recommendation',
      '',
      '## Completing a Session',
      '',
      '- Complete with feedback: `complete_session({ session_id: "...", feedback: "detailed notes on what was difficult/easy" })`',
      '- Detailed feedback is critical — it informs future review sessions',
      '',
      '## Creating New Topics',
      '',
      'If the learner wants to learn something new:',
      '1. Search existing content first: `search_learning_content({ query: "topic" })`',
      '2. Assess: if not found, ask the learner targeted questions about the topic before assuming a gap — absence from the DB does not mean the learner lacks knowledge',
      '3. If confirmed gap, use the `chunk_generation` prompt to propose chunks',
      '4. Create with: `create_topic_with_chunks({ ... })`',
      '',
      '## Key Principles',
      '',
      '- Always create a session before teaching — sessions track progress and surface historical feedback',
      '- Record review results promptly so spaced repetition scheduling stays accurate',
      '- Complete sessions with detailed feedback for future adaptation',
      '- Use `what_to_learn_today` for efficient single-call recommendations',
    ]
      .filter(Boolean)
      .join('\n');
  }

  // ── NEU-312: Tier-branched instruction generation ──────────────────────

  /**
   * Generate a tier-specific instruction string for a chunk.
   * Each tier uses a different pedagogical approach based on estimated retrievability.
   */
  getTierInstruction(tier: TeachingApproach, context: PromptContext): string {
    switch (tier) {
      case 'recall':
        return this.getRecallTierInstruction(context);
      case 'cued_recall':
        return this.getCuedRecallTierInstruction(context);
      case 'reteach':
        return this.getReteachTierInstruction(context);
      case 'scaffold':
        return this.getScaffoldTierInstruction(context);
    }
  }

  /**
   * Generate a topic orientation preamble for first-chunk-in-topic scenarios.
   * Emitted once per topic when the topic needs re-orientation.
   */
  getTopicOrientationInstruction(topicTitle: string): string {
    return [
      '## Topic Orientation',
      '',
      `The learner hasn't engaged with "${topicTitle}" in a long time.`,
      'Briefly orient them: what is this topic, why it matters, and the key ideas they will refresh.',
      '2–3 sentences — signpost, not lecture. Then proceed with the chunk instruction below.',
      '',
    ].join('\n');
  }

  private getRecallTierInstruction(context: PromptContext): string {
    // recall tier: based on learning prompt with feedback integration
    const chunkNumber = context.chunkNumber ?? 1;
    const totalChunks = context.totalChunks ?? 1;
    const chunkTitle = context.chunkTitle ?? '<untitled chunk>';
    const chunkContent = context.chunkContent ?? '<content not provided>';
    const prerequisites = context.prerequisites ?? 'verified or N/A';
    const drillFormat = context.drillFormat ?? 'open_ended';
    const feedbackSection = this.formatPreviousFeedbackSection(context.previousSessionFeedback);

    return [
      'You are teaching with cognitive load awareness and scaffolding.',
      '',
      `CURRENT CHUNK (${chunkNumber}/${totalChunks}): "${chunkTitle}"`,
      `Focus: ${chunkContent}`,
      `Prerequisites verified: ${prerequisites}`,
      '',
      'Content Access: If you need the full chunk content, use the get_chunk_content tool to retrieve comprehensive details including examples and exercises.',
      '',
      '## TEACHING PRIORITY',
      '',
      'This instruction overrides all formatting and brevity preferences.',
      'You MUST present EVERY content item the server provides before asking any question that references it.',
      'Do not summarise, abbreviate, or compress the teaching script. Present it in full.',
      '',
      "## YOUR CONTEXT ≠ LEARNER'S CONTEXT",
      '',
      "Your context window is NOT the learner's knowledge.",
      'Do NOT ask about content you have not explicitly shown to the learner in this conversation.',
      'Before referencing any item in a question, confirm that you have already presented it to the learner.',
      '',
      'Approach:',
      '1) Present the core concept using simple, concrete examples',
      '2) Build understanding gradually with scaffolded explanations',
      '3) Use analogies or visual descriptions if helpful',
      '4) Check for understanding before moving on',
      `5) Conduct retrieval practice using format: ${drillFormat} (see taxonomy below)`,
      feedbackSection,
      '',
      '## Question Taxonomy',
      '',
      "Use three levels of questions, matched to the learner's estimated accuracy:",
      '',
      '| Level | Label | Example stems | Target accuracy |',
      '|-------|-------|---------------|-----------------|',
      '| 1 | Recall | "What is...?" / "List the steps..." / "Write the function..." | 85–95% |',
      '| 2 | Explain/Apply | "In your own words, why...?" / "Given this scenario, use X to..." | 70–80% |',
      '| 3 | Analyze/Create | "What would break if...?" / "Design a solution for this novel problem..." | 65–75% |',
      '',
      '## Adaptive Difficulty Selection',
      '',
      'Estimate chunk_accuracy from available signals (previous_feedback, passed history, previous_attempts):',
      '- accuracy < 0.40 → Recall only (Level 1)',
      '- accuracy < 0.80 → Start at last successful level, escalate on correct answer',
      '- accuracy ≥ 0.80 → Interleave all levels',
      '',
      ...this.formatQualityRubric(),
      '',
      'Style: concise, supportive, and precise.',
    ]
      .filter(Boolean)
      .join('\n');
  }

  private getCuedRecallTierInstruction(context: PromptContext): string {
    const chunkNumber = context.chunkNumber ?? 1;
    const totalChunks = context.totalChunks ?? 1;
    const chunkTitle = context.chunkTitle ?? '<untitled chunk>';
    const chunkContent = context.chunkContent ?? '<content not provided>';
    const prerequisites = context.prerequisites ?? 'verified or N/A';
    const feedbackSection = this.formatPreviousFeedbackSection(context.previousSessionFeedback);

    return [
      'You are conducting a cued-recall review with graduated hints.',
      '',
      `CURRENT CHUNK (${chunkNumber}/${totalChunks}): "${chunkTitle}"`,
      `Focus: ${chunkContent}`,
      `Prerequisites verified: ${prerequisites}`,
      '',
      'Content Access: If you need the full chunk content, use the get_chunk_content tool.',
      '',
      '## CUED RECALL APPROACH',
      '',
      'The learner has partial memory of this material. Use graduated prompting:',
      '',
      '1) Start with an open recall question — "What do you remember about [concept]?"',
      '2) If they struggle, provide a contextual cue — "This relates to [broader topic]..."',
      '3) If still struggling, provide a structural hint — "There are N key aspects: the first is..."',
      '4) Confirm understanding after each successful recall',
      '5) Fill any remaining gaps with a brief explanation',
      feedbackSection,
      '',
      'Guardrails:',
      '- Max 3 graduated hints before revealing the answer',
      '- After revealing, always ask a follow-up retrieval check',
      '- Stay at Recall and Explain/Apply levels — do not escalate to Analyze/Create',
      '',
      ...this.formatQualityRubric(),
      '',
      'Style: patient, encouraging. Normalize partial recall as a learning signal.',
    ]
      .filter(Boolean)
      .join('\n');
  }

  private getReteachTierInstruction(context: PromptContext): string {
    const chunkNumber = context.chunkNumber ?? 1;
    const totalChunks = context.totalChunks ?? 1;
    const chunkTitle = context.chunkTitle ?? '<untitled chunk>';
    const chunkContent = context.chunkContent ?? '<content not provided>';
    const prerequisites = context.prerequisites ?? 'verified or N/A';
    const feedbackSection = this.formatPreviousFeedbackSection(context.previousSessionFeedback);

    return [
      'You are reteaching material the learner has largely forgotten.',
      '',
      `CURRENT CHUNK (${chunkNumber}/${totalChunks}): "${chunkTitle}"`,
      `Focus: ${chunkContent}`,
      `Prerequisites verified: ${prerequisites}`,
      '',
      'Content Access: If you need the full chunk content, use the get_chunk_content tool.',
      '',
      '## RETEACH APPROACH',
      '',
      'The learner has low retrievability for this material. Use compressed re-presentation:',
      '',
      '1) Brief recall probe — one quick question to gauge what remains',
      '2) Compressed re-presentation — hit the key points at ~60% of original detail',
      '3) Highlight what changed or what the learner missed last time',
      '4) Retrieval check — verify the re-taught material stuck',
      feedbackSection,
      '',
      'Guardrails:',
      '- Keep re-presentation concise — the learner saw this before, they need refresh not full lecture',
      '- Stay at Recall level only (Level 1) — save Explain/Apply for the next review session',
      '- If the recall probe shows more knowledge than expected, switch to cued_recall approach',
      '',
      ...this.formatQualityRubric(),
      '',
      'Style: efficient, matter-of-fact. Frame as "refreshing" not "relearning".',
    ]
      .filter(Boolean)
      .join('\n');
  }

  private getScaffoldTierInstruction(context: PromptContext): string {
    const chunkNumber = context.chunkNumber ?? 1;
    const totalChunks = context.totalChunks ?? 1;
    const chunkTitle = context.chunkTitle ?? '<untitled chunk>';
    const chunkContent = context.chunkContent ?? '<content not provided>';
    const prerequisites = context.prerequisites ?? 'verified or N/A';
    const feedbackSection = this.formatPreviousFeedbackSection(context.previousSessionFeedback);

    return [
      'You are rebuilding knowledge the learner has almost entirely forgotten.',
      '',
      `CURRENT CHUNK (${chunkNumber}/${totalChunks}): "${chunkTitle}"`,
      `Focus: ${chunkContent}`,
      `Prerequisites verified: ${prerequisites}`,
      '',
      'Content Access: If you need the full chunk content, use the get_chunk_content tool.',
      '',
      '## SCAFFOLD APPROACH',
      '',
      'The learner has very low retrievability — treat this almost like a first encounter:',
      '',
      '1) Re-teach with concrete examples — present the core idea with a fresh worked example',
      '2) Recognition questions first — "Does this look familiar?" / "Which of these is correct?"',
      '3) Escalate to recall only after recognition succeeds',
      '4) Frame forgetting as normal — "It\'s been a while, let\'s rebuild this step by step"',
      feedbackSection,
      '',
      'Guardrails:',
      '- Start with recognition (multiple choice or true/false), not open recall',
      '- Stay at Recall level only (Level 1) — save higher levels for future sessions',
      '- Use shorter, more frequent checks rather than one long assessment',
      '- If the learner shows unexpected recall, escalate to cued_recall approach',
      '',
      ...this.formatQualityRubric(),
      '',
      'Style: warm, normalizing. Emphasize that forgetting is part of learning.',
    ]
      .filter(Boolean)
      .join('\n');
  }

  private formatQualityRubric(): string[] {
    return [
      '## Quality Rubric',
      '',
      'QUALITY 5: Immediate, confident, correct. No hints.',
      'QUALITY 4: Correct after minor self-correction. No hints from tutor.',
      'QUALITY 3: Correct with difficulty. OR: correct after 1 hint (CEILING — quality cannot exceed 3 with 1 hint).',
      'QUALITY 2: Partially correct. OR: correct after 2+ hints (CEILING — quality cannot exceed 2 with 2+ hints).',
      'QUALITY 1: Incorrect, no partial knowledge.',
      'QUALITY 0: Complete blackout.',
      '',
      'Rules:',
      '- Be a fair judge. Quality 3 is healthy — target 3–4 as the normal range.',
      '- Quality must be based on demonstrated understanding, not self-report.',
      '- If you hinted or reteaught, quality CANNOT exceed the ceiling (1 hint → max 3, 2+ hints → max 2).',
    ];
  }

  /**
   * Format previous session feedback into a prompt section.
   * Returns empty string if no feedback is available.
   */
  private formatPreviousFeedbackSection(feedback?: PromptFeedbackEntry[]): string {
    if (!feedback || feedback.length === 0) {
      return '';
    }

    const feedbackLines = feedback.map((entry, idx) => {
      const date = entry.completedAt.split('T')[0];
      return `  ${idx + 1}. [${date}, ${entry.sessionMode}]: ${entry.feedback}`;
    });

    return [
      '',
      'PREVIOUS SESSION FEEDBACK (learner-reported difficulties and successes):',
      ...feedbackLines,
      '',
      'NOTE: Address any reported pain points with extra care and scaffolding.',
    ].join('\n');
  }
}

export const promptPack = new PromptPack();
