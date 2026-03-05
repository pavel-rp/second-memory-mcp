import type { RecommendationEngine } from '../domain/services/recommendation-engine.js';
import type {
  ConversationRequest,
  ConversationResponse,
  RecommendationInput,
  LearningItem,
  SessionHistory,
  SessionContext,
} from '../domain/types/recommendations.js';
import type { SessionInput } from '../domain/types/session.js';
import { logger } from '../shared/logger.js';

export interface ConversationManagerDeps {
  recommendationEngine: RecommendationEngine;
  listChunksAsLearningItems: (filter?: {
    dueOnly?: boolean;
    limit?: number;
  }) => Promise<LearningItem[]>;
  getActiveSession: () => Promise<{ id: string } | null>;
  convertSessionToInput: (sessionId: string) => Promise<SessionInput | null>;
}

/**
 * Manages conversational "teach me" workflows with zero friction
 * Handles session guidance, clarifying questions, and learning orchestration
 */
export class ConversationManager {
  private recommendationEngine: RecommendationEngine;
  private listChunksAsLearningItems: ConversationManagerDeps['listChunksAsLearningItems'];
  private getActiveSession: ConversationManagerDeps['getActiveSession'];
  private convertSessionToInput: ConversationManagerDeps['convertSessionToInput'];

  constructor(deps: ConversationManagerDeps) {
    this.recommendationEngine = deps.recommendationEngine;
    this.listChunksAsLearningItems = deps.listChunksAsLearningItems;
    this.getActiveSession = deps.getActiveSession;
    this.convertSessionToInput = deps.convertSessionToInput;
  }

  /**
   * Conduct a learning session conversation
   */
  async conductLearningSession(request: ConversationRequest): Promise<ConversationResponse> {
    const intent = this.parseIntent(request);

    switch (intent.type) {
      case 'create_topic':
        return await this.handleTopicCreation(
          request,
          intent.details ?? {
            topicTitle: '',
            originalInput: request.userInput ?? request.intent,
          }
        );
      case 'start_learning':
        return await this.handleStartLearning(request);
      case 'continue_session':
        return await this.handleContinueSession(request);
      case 'need_clarification':
        return this.handleClarification(request);
      case 'session_feedback':
        return this.handleSessionFeedback(request);
      case 'get_help':
        return this.handleGetHelp(request);
      default:
        return await this.handleGeneralLearning(request);
    }
  }

  /**
   * Parse user intent from request
   */
  private parseIntent(request: ConversationRequest): {
    type: string;
    confidence: number;
    details?: { topicTitle: string; originalInput: string };
  } {
    const input = request.userInput?.toLowerCase() || request.intent.toLowerCase();

    // Topic creation intent - detect "I want to learn X" patterns
    const topicCreationPatterns = [
      /i want to learn (.+)/i,
      /teach me (.+)/i,
      /i wanna learn (.+)/i,
      /learn (.+)/i,
      /start learning (.+)/i,
    ];

    for (const pattern of topicCreationPatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        const topicTitle = match[1].trim();
        if (topicTitle.length > 0 && topicTitle.length < 100) {
          return {
            type: 'create_topic',
            confidence: 0.9,
            details: { topicTitle, originalInput: input },
          };
        }
      }
    }

    // Explicit intents
    if (
      request.intent === 'start_learning' ||
      input.includes('teach me') ||
      input.includes('start learning') ||
      input.includes('what should i learn')
    ) {
      return { type: 'start_learning', confidence: 1.0 };
    }

    if (input.includes('continue') || input.includes('next') || input.includes('keep going')) {
      return { type: 'continue_session', confidence: 0.9 };
    }

    if (input.includes('how long') || input.includes('what subject') || input.includes('time')) {
      return { type: 'need_clarification', confidence: 0.8 };
    }

    if (input.includes('help') || input.includes('?') || input.includes('explain')) {
      return { type: 'get_help', confidence: 0.7 };
    }

    // Session feedback indicators
    if (input.includes('done') || input.includes('finished') || input.includes('completed')) {
      return { type: 'session_feedback', confidence: 0.8 };
    }

    // Default to general learning
    return { type: 'general_learning', confidence: 0.5 };
  }

  /**
   * Handle topic creation request
   */
  private async handleTopicCreation(
    request: ConversationRequest,
    details: { topicTitle: string; originalInput: string }
  ): Promise<ConversationResponse> {
    const topicTitle = details?.topicTitle;
    const context = (request.context ?? {}) as Record<string, unknown>;

    if (!topicTitle) {
      return {
        message: "I'd love to help you learn something new! What topic would you like to explore?",
        needsInput: true,
        suggestedInputs: ['I want to learn DFS', 'Teach me React', 'Learn about algorithms'],
      };
    }

    // Extract subject from context or infer from topic
    const subject =
      typeof context.subject === 'string' ? context.subject : this.inferSubject(topicTitle);

    // Guide the client through instruction-based chunk generation workflow
    const topicDescription = `Learn ${topicTitle} through structured, scaffolded lessons`;
    const searchLimit = 10;
    const subjectLine = subject ? `\n- subject: "${subject}"` : '';

    return {
      message:
        `I'll help you create a structured learning path for "${topicTitle}".\n\n` +
        `**Step 1 — Check for existing content**\n` +
        `Call the \`search_learning_content\` tool to see if we already have relevant topics or chunks:\n` +
        `- query: "${topicTitle}"\n` +
        `- limit: ${searchLimit}${subjectLine}\n\n` +
        `If you find a match, you can reuse it right away. If not, continue to Step 2.\n\n` +
        `**Step 2 — Generate new learning chunks**\n` +
        `Call the \`chunk_generation\` prompt with these parameters:\n` +
        `- topicTitle: "${topicTitle}"\n` +
        `- topicDescription: "${topicDescription}"\n` +
        `- subject: "${subject}"\n\n` +
        `This will generate 5-9 scaffolded learning chunks with titles, content summaries, and prerequisites. ` +
        `Once you have the chunk proposals, you can then use the \`create_topic_with_chunks\` tool to create the complete learning topic.`,
      needsInput: false,
      suggestedInputs: [
        'Run search for existing content',
        'Call chunk_generation prompt now',
        'Tell me more about the chunk generation process',
        'Choose a different topic',
      ],
      sessionUpdated: true,
      // Store guidance context for next steps
      recommendations: {
        recommendations: [],
        sessionSummary: {
          totalItems: 0,
          totalDuration: 0,
          totalCognitiveLoad: 0,
          newItems: 0,
          reviewItems: 0,
          remediationItems: 0,
          subjects: [subject],
        },
        estimatedDuration: 0,
        rationale: `Guiding duplicate check and chunk generation workflow for "${topicTitle}"`,
        nextActions: [
          'Call search_learning_content tool with topic keywords',
          'Review search results to reuse existing content if available',
          'Call chunk_generation prompt with topic details',
          'Review generated chunk proposals',
          'Create topic with create_topic_with_chunks tool',
        ],
      },
    };
  }

  /**
   * Infer subject from topic title
   */
  private inferSubject(topicTitle: string): string {
    const title = topicTitle.toLowerCase();

    if (
      title.includes('algorithm') ||
      title.includes('dfs') ||
      title.includes('bfs') ||
      title.includes('sorting') ||
      title.includes('tree') ||
      title.includes('graph')
    ) {
      return 'CS';
    }

    if (
      title.includes('react') ||
      title.includes('javascript') ||
      title.includes('typescript') ||
      title.includes('node') ||
      title.includes('web') ||
      title.includes('frontend')
    ) {
      return 'SWE';
    }

    if (
      title.includes('calculus') ||
      title.includes('algebra') ||
      title.includes('geometry') ||
      title.includes('statistics') ||
      title.includes('probability')
    ) {
      return 'Math';
    }

    if (
      title.includes('spanish') ||
      title.includes('french') ||
      title.includes('german') ||
      title.includes('language') ||
      title.includes('vocabulary')
    ) {
      return 'Language';
    }

    // Default to CS for technical topics
    return 'CS';
  }

  /**
   * Handle initial learning request
   */
  private async handleStartLearning(request: ConversationRequest): Promise<ConversationResponse> {
    const context = (request.context ?? {}) as Record<string, unknown>;

    let learningItems = Array.isArray(context.learningItems)
      ? (context.learningItems as LearningItem[])
      : [];

    // Fetch from database when no items are provided in context
    if (learningItems.length === 0) {
      try {
        learningItems = await this.listChunksAsLearningItems({ dueOnly: true, limit: 50 });
      } catch (error) {
        logger.error('Failed to fetch learning items from database:', error);
      }
    }

    if (learningItems.length === 0) {
      return {
        message:
          "I'd love to help you learn! However, I don't see any learning items available. Please make sure you have content set up in your learning system first.",
        needsInput: false,
        suggestedInputs: ['Set up learning content', 'Check my learning database'],
      };
    }

    // Try to generate recommendations with minimal information
    try {
      const recommendationInput: RecommendationInput = {
        mode: 'guided',
        learningItems,
        userHistory: context.userHistory as SessionHistory | undefined,
        sessionContext: context.sessionContext as SessionContext | undefined,
      };

      const recommendations = await this.recommendationEngine.generateRecommendations(
        recommendationInput,
        new Date()
      );

      if (recommendations.recommendations.length === 0) {
        return {
          message:
            "You're all caught up! No items are due for review right now. Would you like to explore new content or adjust your learning preferences?",
          needsInput: true,
          suggestedInputs: [
            'Show me new content',
            'Check again in a few hours',
            'Change learning preferences',
          ],
        };
      }

      // Provide immediate guidance with minimal friction
      const guidance = recommendations.conversationGuidance;
      const baseMessage = guidance
        ? `Perfect! ${guidance.nextAction}\n\n${
            guidance.encouragement || ''
          }\n\n${guidance.progressUpdate || ''}`.trim()
        : 'Perfect! I have a learning plan ready for you.';
      return {
        message: baseMessage,
        recommendations,
        needsInput: false,
        suggestedInputs: ["Let's start", 'Tell me more about this session', 'Adjust the plan'],
        sessionUpdated: true,
      };
    } catch (error) {
      return this.handleError('generating your learning plan', error);
    }
  }

  /**
   * Handle session continuation
   */
  private async handleContinueSession(request: ConversationRequest): Promise<ConversationResponse> {
    let sessionState = request.sessionState;

    // Hydrate session state from DB if not provided
    if (!sessionState || !sessionState.currentRecommendations) {
      try {
        const activeSession = await this.getActiveSession();
        if (activeSession) {
          const sessionInput = await this.convertSessionToInput(activeSession.id);
          if (sessionInput) {
            sessionState = {
              currentItemIndex: sessionInput.chunks.filter(c => c.status === 'completed').length,
              currentRecommendations: sessionInput.chunks.map((c, idx) => ({
                item: {
                  id: c.chunk_id,
                  title: c.title,
                  estimatedDuration: c.estimated_duration ?? 10,
                  difficulty: c.difficulty ?? 5,
                  repetitions: c.repetitions ?? 0,
                  easeFactor: c.ease_factor ?? 2.5,
                  nextReviewDate: c.next_review_date ?? new Date().toISOString(),
                  chunkType: (c.chunk_type as 'new' | 'review' | 'remediation') ?? 'review',
                  subject: c.subject ?? '',
                },
                reason: 'Active session item',
                priority: 50,
                order: idx + 1,
                cognitiveLoad: 5,
              })),
            };
          }
        }
      } catch (error) {
        logger.error('Failed to hydrate session from database:', error);
      }
    }

    if (!sessionState || !sessionState.currentRecommendations) {
      return {
        message:
          "It looks like we don't have an active session. Would you like to start a new learning session?",
        needsInput: true,
        suggestedInputs: ['Start new session', "Show me what's available"],
      };
    }

    // Check session progress and provide next steps
    const currentIndex = sessionState.currentItemIndex || 0;
    const recommendations = sessionState.currentRecommendations;

    if (currentIndex >= recommendations.length) {
      return this.handleSessionCompletion(sessionState);
    }

    const nextItem = recommendations[currentIndex];
    const remaining = recommendations.length - currentIndex - 1;

    let message = `Great! Next up: "${nextItem.item.title}" (${nextItem.item.estimatedDuration} min).\n\nReason: ${nextItem.reason}`;

    if (remaining > 0) {
      message += `\n\nAfter this, you have ${remaining} more item${
        remaining > 1 ? 's' : ''
      } to complete your session.`;
    } else {
      message += '\n\nThis is your final item for this session!';
    }

    return {
      message,
      needsInput: false,
      suggestedInputs: ['Start this item', 'Skip to next', 'Tell me about this topic'],
      sessionUpdated: true,
    };
  }

  /**
   * Handle requests for clarification
   */
  private handleClarification(request: ConversationRequest): ConversationResponse {
    const input = request.userInput?.toLowerCase() || '';

    // Time-related questions
    if (input.includes('how long') || input.includes('time')) {
      return {
        message:
          'How much time do you have available for learning right now? I can tailor a session to fit your schedule perfectly.',
        needsInput: true,
        suggestedInputs: ['15 minutes', '30 minutes', '1 hour', 'I have plenty of time'],
      };
    }

    // Subject-related questions
    if (input.includes('subject') || input.includes('topic') || input.includes('what')) {
      return {
        message:
          'What would you like to focus on today? I can recommend based on your priorities or you can choose a specific subject.',
        needsInput: true,
        suggestedInputs: [
          "Show me what's most important",
          'Computer Science',
          'Math',
          'Software Engineering',
          'Language',
        ],
      };
    }

    // General clarification
    return {
      message:
        "I'm here to help! You can ask me about time available, subjects to focus on, or just say 'teach me' and I'll suggest the best learning plan for you right now.",
      needsInput: true,
      suggestedInputs: ['Just teach me', 'I have 30 minutes', 'Show me CS topics'],
    };
  }

  /**
   * Handle session feedback and completion
   */
  private handleSessionFeedback(request: ConversationRequest): ConversationResponse {
    const sessionState = request.sessionState;

    if (sessionState) {
      return this.handleSessionCompletion(sessionState);
    }

    return {
      message: 'Thanks for the feedback! How did your learning session go?',
      needsInput: true,
      suggestedInputs: ['It went well', 'I had some difficulties', 'Start another session'],
    };
  }

  /**
   * Handle help requests
   */
  private handleGetHelp(_request: ConversationRequest): ConversationResponse {
    return {
      message: `I'm your intelligent learning assistant! Here's what I can do:

• **"Teach me"** - I'll create an optimal learning session based on what's due
• **Time-aware** - Tell me how much time you have and I'll plan accordingly
• **Subject focus** - Ask for specific subjects or let me prioritize across all topics
• **Session guidance** - I'll guide you through each step with encouragement

Just say "teach me" and I'll take care of the rest!`,
      needsInput: true,
      suggestedInputs: ['Teach me', 'I have 20 minutes', 'Show me CS topics', "What's due today?"],
    };
  }

  /**
   * Handle general learning requests
   */
  private async handleGeneralLearning(request: ConversationRequest): Promise<ConversationResponse> {
    // Extract any time or subject hints from user input
    const timeHints = this.extractTimeHints(request.userInput);
    const subjectHints = this.extractSubjectHints(request.userInput);

    let message = "I'd be happy to help you learn! ";

    // Ask clarifying questions only if needed
    if (!timeHints && !subjectHints && !request.context?.learningItems) {
      message += 'To give you the best recommendations, could you tell me:';
      return {
        message,
        needsInput: true,
        suggestedInputs: [
          'I have 30 minutes',
          "Show me what's most important",
          'Focus on Computer Science',
          'Just teach me anything',
        ],
      };
    }

    // Try to proceed with available information
    return await this.handleStartLearning(request);
  }

  /**
   * Handle session completion
   */
  private handleSessionCompletion(sessionState: SessionContext): ConversationResponse {
    const completedItems = sessionState.currentItemIndex ?? 0;
    const totalItems = sessionState.currentRecommendations?.length ?? 0;

    let message = `Excellent work! You've completed ${completedItems} out of ${totalItems} items in this session.`;

    if (completedItems === totalItems) {
      message += "\n\n🎉 Session complete! You're making great progress with your learning goals.";
    } else {
      message += `\n\nYou still have ${
        totalItems - completedItems
      } items remaining if you'd like to continue.`;
    }

    message += '\n\nWhat would you like to do next?';

    return {
      message,
      needsInput: true,
      suggestedInputs: [
        completedItems < totalItems ? 'Continue session' : 'Start new session',
        'Take a break',
        'Review what I learned',
        'Check my progress',
      ],
    };
  }

  /**
   * Extract time hints from user input
   */
  private extractTimeHints(input?: string): number | null {
    if (!input) return null;

    const timePatterns = [
      /(\d+)\s*minutes?/i,
      /(\d+)\s*mins?/i,
      /(\d+)\s*hours?/i,
      /(\d+)\s*hrs?/i,
    ];

    for (const pattern of timePatterns) {
      const match = input.match(pattern);
      if (match) {
        const value = parseInt(match[1]);
        if (input.includes('hour') || input.includes('hr')) {
          return value * 60; // Convert to minutes
        }
        return value;
      }
    }

    // Common time expressions
    if (input.includes('quick') || input.includes('short')) return 15;
    if (input.includes('long') || input.includes('extended')) return 60;

    return null;
  }

  /**
   * Extract subject hints from user input
   */
  private extractSubjectHints(input?: string): string | null {
    if (!input) return null;

    const subjects = [
      'CS',
      'Computer Science',
      'Math',
      'Mathematics',
      'SWE',
      'Software Engineering',
      'Language',
    ];

    for (const subject of subjects) {
      if (input.toLowerCase().includes(subject.toLowerCase())) {
        // Normalize to standard subject codes
        if (subject.toLowerCase().includes('computer')) return 'CS';
        if (subject.toLowerCase().includes('math')) return 'Math';
        if (subject.toLowerCase().includes('software')) return 'SWE';
        if (subject.toLowerCase().includes('language')) return 'Language';
        return subject;
      }
    }

    return null;
  }

  /**
   * Handle errors gracefully
   */
  private handleError(action: string, error: unknown): ConversationResponse {
    logger.error(`ConversationManager error while ${action}:`, error);

    return {
      message: `I encountered an issue while ${action}. Please try again, or let me know if you need help with something specific.`,
      needsInput: true,
      suggestedInputs: ['Try again', 'Get help', 'Start over'],
    };
  }
}
