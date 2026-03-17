export type PromptName =
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

export type PromptContext = {
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
export class PromptPack {
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
      'Produce:',
      '1) HIGH-LEVEL OVERVIEW: key concepts and components',
      '2) CHUNK BREAKDOWN: a reasonable number of logically ordered, digestible chunks',
      '2.1) CHUNK ORDER: the order of the chunks should be based on the logical progression of the concepts',
      '2.2) CHUNK CONTENT: Each chunk should contain a single digestible concept following cognitive load theory principles.',
      '2.3) CHUNK NUMBER: the number of chunks should be based on the complexity of the concept. As a guideline: use 3–5 chunks for simple concepts, 5–8 for moderate complexity, and 8–12 for highly complex topics. Adjust as needed for optimal learning.',
      '3) PREREQUISITE MAPPING: what must be mastered before each chunk',
      '4) DIFFICULTY ASSESSMENT: overall difficulty (1–10)',
      '5) ESTIMATED TIMELINE: realistic progression',
      '',
      'Constraints:',
      '- Manage cognitive load; prefer concrete examples before abstractions',
      '- Keep explanations concise and supportive',
      '- Include comprehensive content for each chunk (examples, explanations, exercises)',
      '- Provide a topic summary that captures the overall learning objectives',
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
      'Approach:',
      '1) Present the core concept using simple, concrete examples',
      '2) Build understanding gradually with scaffolded explanations',
      '3) Use analogies or visual descriptions if helpful',
      '4) Check for understanding before moving on',
      `5) End with a retrieval check using format: ${drillFormat}`,
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
      feedbackSection
        ? '- Address previously reported difficulties with extra scaffolding or hints'
        : '',
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
      'Plan:',
      '1) Quick recall check (no re-teaching)',
      '2) If successful: brief reinforcement + harder application',
      '3) If failed: targeted re-explanation + practice drill (two-attempt policy)',
      '4) Use interleaving with related concepts when helpful',
      '5) End with confidence assessment',
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
      "2) Intake problem → request 'scaffolding' prompt (produce 5–9 chunks)",
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
      '4) Record the result: submit_answer({ question: "...", response: "...", passed: true/false, feedback: "...", time_spent_ms: <elapsed_ms> }). If result is "retry", ask the learner to try again and resubmit until it returns "recorded".',
      '5) Repeat steps 2–4 for each additional chunk',
      '6) Finish: complete_session({ session_id: "...", feedback: "..." })',
      '',
      '## Getting Recommendations (Single Call)',
      '',
      '- Use: what_to_learn_today({ fetchFromDatabase: true, timeAvailable: 30 })',
      '- This automatically fetches and ranks items in one efficient call',
      '- Supports filters: subjectFilter, dueOnly, limit',
      '- Saves ~95% on token usage vs old two-step approach',
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
      'Produce 5–9 proposed chunks, each including:',
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
      '1. Get recommendations: `what_to_learn_today({ fetch_from_database: true' +
        (time ? `, time_available: ${time}` : '') +
        (subject ? `, subject_filter: "${subject}"` : '') +
        ' })`',
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
      '5. After each chunk, record results with `record_review_result`',
      '',
      '## Session Continuation',
      '',
      '- Check progress: `session_progress({ session_id: "..." })`',
      '- Get next phase: `session_workflow({ session_id: "..." })`',
      '- Check if done: `session_completion({ session_id: "..." })`',
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
      '2. If not found, use the `chunk_generation` prompt to propose chunks',
      '3. Create with: `create_topic_with_chunks({ ... })`',
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
