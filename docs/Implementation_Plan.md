<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# MCP Server Implementation Plan for "Second Memory" AI Learning System

## Executive Summary

Based on comprehensive research into evidence-based learning science, spaced repetition algorithms, and MCP server architecture, this implementation plan delivers a sophisticated tutoring system that leverages Claude Desktop's MCP capabilities with Notion as the data layer. The system implements scientifically-proven learning techniques including optimized spaced repetition, cognitive load theory-based scaffolding, and adaptive review scheduling.

![MCP Server Architecture for AI Learning System](https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/c93f8b09ba32a4ce892763b7bb5d2b05/15c86c84-4d65-46b5-9fb2-66dd389a8d4f/506e5cd8.png)

MCP Server Architecture for AI Learning System

## Learning Science Foundation

### Evidence-Based Learning Principles

The system is built on four pillars of learning science research:

**1. Spaced Repetition with Optimal Algorithms**
Research consistently shows spaced repetition provides 2x better long-term retention compared to massed practice. The system implements a modified SM-2 algorithm with enhancements based on recent research showing expanding intervals are superior to uniform intervals.[^1][^2][^3]

**2. Cognitive Load Theory and Scaffolding**
Complex problems are automatically scaffolded into digestible chunks using cognitive load theory principles. The system manages intrinsic, extraneous, and germane cognitive loads, with scaffolding being most effective for complex tasks, reducing cognitive overload by providing structured support.[^4][^5]

**3. Interleaving and Retrieval Practice**
The system uses interleaving for long-term retention (effect size d=1.34) while employing blocking for initial learning. Multiple retrieval formats are implemented with a two-attempt policy that optimizes the balance between success and challenge.[^6][^7][^1]

**4. Priority-Based Review Scheduling**
Research reveals the existence of sharp phase transitions in learning systems - introducing new items beyond a critical threshold causes system collapse. The system implements optimal scheduling algorithms that balance new content introduction with review requirements.[^8]

## System Architecture

![Learning Workflow and Spaced Repetition Process](https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/c93f8b09ba32a4ce892763b7bb5d2b05/d8cc4021-195b-4cb0-8159-cbbbd9210a00/9a394184.png)

Learning Workflow and Spaced Repetition Process

The architecture consists of three main components:

### 1. MCP Learning Server (Core Intelligence)

- **Prompt Management Module**: Generates context-aware prompts for different learning phases
- **Learning Workflow Engine**: Orchestrates the complete learning journey
- **Spaced Repetition Calculator**: Implements advanced SM-2+ algorithm with priority scheduling
- **Session State Manager**: Maintains learning context across interactions


### 2. Notion MCP Server (Data Layer)

- **Learning Topics Database**: Stores problem definitions and metadata
- **Chunks Database**: Manages scaffolded learning segments
- **Review Schedule Database**: Implements priority-based scheduling
- **Performance Analytics Database**: Tracks learning patterns and success rates
- **Session Logs Database**: Maintains comprehensive learning history


### 3. Integration Layer

- **Claude Desktop Interface**: Natural language interaction
- **Notion API Integration**: Persistent data storage and retrieval
- **Algorithm Services**: Calculations and analytics endpoints


## Database Schema Design

![Notion Database Schema for Learning System](https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/c93f8b09ba32a4ce892763b7bb5d2b05/c60f75e7-3a88-4b1d-9649-3ef5340bee41/0c9fbf74.png)

Notion Database Schema for Learning System

The Notion database structure implements sophisticated relational patterns optimized for learning analytics:

### Learning Topics Database

```
Properties:
- ID (Primary Key)
- Title (Rich Text)
- Subject (Select: CS, Math, SWE, Language, Other)
- Difficulty (Number: 1-10)
- Created Date (Date)
- Status (Select: New, Learning, Review, Mastered)
- Total Chunks (Number)
- Completed Chunks (Number)
- Mastery Level (Formula: Completed/Total)
```


### Learning Chunks Database

```
Properties:
- ID (Primary Key)
- Topic ID (Relation: Learning Topics)
- Chunk Number (Number)
- Title (Rich Text)
- Content (Rich Text - stores scaffolded content)
- Prerequisites (Multi-select)
- Mastery Level (Number: 0-5 SM-2 scale)
- Ease Factor (Number: ≥1.3)
- Review Interval (Number: days)
- Repetitions (Number)
- Created Date (Date)
- Last Reviewed (Date)
- Next Review Date (Date)
```


### Review Schedule Database

```
Properties:
- ID (Primary Key)
- Topic ID (Relation: Learning Topics)
- Chunk ID (Relation: Learning Chunks)
- Review Date (Date)
- Priority Score (Number: calculated priority)
- Interval (Number: days between reviews)
- Ease Factor (Number: SM-2 ease factor)
- Repetitions (Number: review count)
- Scheduled By (Select: New, Review, Remediation)
- Status (Select: Pending, Completed, Skipped)
```


### Performance Analytics Database

```
Properties:
- ID (Primary Key)
- Topic ID (Relation: Learning Topics)
- Chunk ID (Relation: Learning Chunks)
- Session Date (Date)
- Quality Score (Number: 0-5 SM-2 scale)
- Response Time (Number: seconds)
- Attempts (Number: tries before correct)
- Success Rate (Number: percentage)
- Drill Type (Select: Initial, Review, Remediation)
- Learning Phase (Select: Chunking, Practice, Review)
```


### Session Logs Database

```
Properties:
- ID (Primary Key)
- Topic ID (Relation: Learning Topics)
- Start Time (Date & Time)
- End Time (Date & Time)
- Chunks Covered (Number)
- Average Quality (Formula: from performance data)
- Session Type (Select: New Learning, Review, Mixed)
- Total Reviews (Number)
- Successful Reviews (Number)
- Next Session Scheduled (Date)
```


## MCP Server Implementation

### Core Server Structure

```typescript
// main.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { NotionClient } from "./notion-client.js";
import { SpacedRepetitionEngine } from "./sr-engine.js";
import { LearningWorkflow } from "./workflow.js";
import { PromptManager } from "./prompts.js";

class SecondMemoryMCPServer {
  private server: Server;
  private notion: NotionClient;
  private srEngine: SpacedRepetitionEngine;
  private workflow: LearningWorkflow;
  private prompts: PromptManager;

  constructor() {
    this.server = new Server(
      {
        name: "second-memory-learning",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );
    
    this.notion = new NotionClient();
    this.srEngine = new SpacedRepetitionEngine();
    this.workflow = new LearningWorkflow(this.notion, this.srEngine);
    this.prompts = new PromptManager();
    
    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
  }
}
```


### Spaced Repetition Engine

The heart of the system implements an enhanced SM-2 algorithm with priority scheduling:

```typescript
// sr-engine.ts
export class SpacedRepetitionEngine {
  /**
   * Enhanced SM-2 Algorithm Implementation
   * Based on research findings for optimal learning
   */
  calculateNextReview(
    quality: number,      // 0-5 scale
    repetitions: number,
    easeFactor: number,
    interval: number,
    difficultyBoost: number = 1.0
  ): ReviewResult {
    let newEaseFactor = easeFactor;
    let newRepetitions = repetitions;
    let newInterval = interval;

    if (quality >= 3) {
      // Successful recall
      if (repetitions === 0) {
        newInterval = 1;
      } else if (repetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * easeFactor);
      }
      
      newRepetitions += 1;
      
      // Enhanced ease factor calculation with difficulty adaptation
      newEaseFactor = easeFactor + 
        (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)) * difficultyBoost;
      
      if (newEaseFactor < 1.3) newEaseFactor = 1.3;
    } else {
      // Failed recall - restart with penalty
      newRepetitions = 0;
      newInterval = 1;
      // Slight ease factor reduction for failures
      newEaseFactor = Math.max(1.3, easeFactor * 0.96);
    }

    return {
      interval: newInterval,
      repetitions: newRepetitions,
      easeFactor: newEaseFactor,
      nextReview: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000)
    };
  }

  /**
   * Priority Calculation Based on Research
   * Implements phase transition awareness and optimal scheduling
   */
  calculatePriority(
    nextReviewDate: Date,
    easeFactor: number,
    repetitions: number,
    difficulty: number
  ): number {
    const now = Date.now();
    const reviewTime = nextReviewDate.getTime();
    const daysOverdue = Math.max(0, (now - reviewTime) / (24 * 60 * 60 * 1000));
    
    // Base priority from overdue amount
    let priority = 100 + (daysOverdue * 10);
    
    // Lower ease factor = higher priority (difficult items)
    priority *= (3.0 / easeFactor);
    
    // Fewer repetitions = higher priority (new items)
    priority *= Math.max(1, 5 - repetitions);
    
    // Higher intrinsic difficulty = higher priority
    priority *= (1 + difficulty * 0.2);
    
    return Math.round(priority);
  }
}
```


### Learning Workflow Engine

Implements the complete learning process based on evidence-based practices:

```typescript
// workflow.ts
export class LearningWorkflow {
  async processNewProblem(problem: string): Promise<LearningSession> {
    // 1. Generate overview and scaffolding plan
    const scaffolding = await this.generateScaffolding(problem);
    
    // 2. Create learning topic in Notion
    const topic = await this.notion.createLearningTopic({
      title: scaffolding.title,
      subject: scaffolding.subject,
      difficulty: scaffolding.difficulty,
      totalChunks: scaffolding.chunks.length
    });
    
    // 3. Create chunks with cognitive load optimization
    const chunks = await this.createOptimizedChunks(
      topic.id, 
      scaffolding.chunks
    );
    
    // 4. Begin learning session
    return this.startLearningSession(topic.id, chunks);
  }

  async generateScaffolding(problem: string): Promise<ScaffoldingPlan> {
    // Use sophisticated prompting to break down complex problems
    const prompt = this.prompts.getScaffoldingPrompt(problem);
    return await this.analyzeProblemComplexity(problem, prompt);
  }

  async conductRetrievalCheck(
    chunkId: string, 
    format: DrillFormat
  ): Promise<RetrievalResult> {
    const drill = await this.generateDrill(chunkId, format);
    // Two-attempt policy from research
    return {
      drill,
      attemptsAllowed: 2,
      successCriteria: this.getSuccessCriteria(format)
    };
  }
}
```


## MCP Tool Definitions

### Core Learning Tools

```typescript
export const LEARNING_TOOLS = {
  // Primary learning flow
  "start_learning_session": {
    name: "start_learning_session",
    description: "Begin a new learning session with a problem or topic",
    inputSchema: {
      type: "object",
      properties: {
        problem: { type: "string", description: "The problem or topic to learn" },
        subject: { type: "string", enum: ["CS", "Math", "SWE", "Language", "Other"] },
        difficulty_hint: { type: "number", minimum: 1, maximum: 10 }
      },
      required: ["problem"]
    }
  },

  "continue_learning": {
    name: "continue_learning",
    description: "Continue an existing learning session",
    inputSchema: {
      type: "object", 
      properties: {
        topic_id: { type: "string" },
        chunk_id: { type: "string", description: "Optional specific chunk to work on" }
      },
      required: ["topic_id"]
    }
  },

  "conduct_retrieval_check": {
    name: "conduct_retrieval_check",
    description: "Test knowledge retention with various drill formats",
    inputSchema: {
      type: "object",
      properties: {
        chunk_id: { type: "string" },
        format: { 
          type: "string", 
          enum: ["multiple_choice", "open_ended", "coding_problem", "explanation", "application"]
        }
      },
      required: ["chunk_id", "format"]
    }
  },

  "schedule_review": {
    name: "schedule_review", 
    description: "Process learning results and schedule next review",
    inputSchema: {
      type: "object",
      properties: {
        chunk_id: { type: "string" },
        quality: { type: "number", minimum: 0, maximum: 5 },
        response_time: { type: "number" },
        attempts_used: { type: "number", minimum: 1, maximum: 2 }
      },
      required: ["chunk_id", "quality"]
    }
  },

  // Session management
  "what_to_learn_today": {
    name: "what_to_learn_today",
    description: "Get prioritized learning recommendations for today",
    inputSchema: {
      type: "object",
      properties: {
        time_available: { type: "number", description: "Minutes available for learning" },
        subject_preference: { type: "string", enum: ["CS", "Math", "SWE", "Language", "Any"] }
      }
    }
  },

  "get_learning_progress": {
    name: "get_learning_progress", 
    description: "View progress analytics and learning statistics",
    inputSchema: {
      type: "object",
      properties: {
        topic_id: { type: "string", description: "Optional specific topic" },
        time_range: { type: "string", enum: ["week", "month", "all"] }
      }
    }
  }
};

// Spaced repetition calculation endpoints
export const SR_TOOLS = {
  "calculate_next_review": {
    name: "calculate_next_review",
    description: "Calculate optimal review schedule using SM-2+ algorithm", 
    inputSchema: {
      type: "object",
      properties: {
        quality: { type: "number", minimum: 0, maximum: 5 },
        repetitions: { type: "number", minimum: 0 },
        ease_factor: { type: "number", minimum: 1.3 },
        interval: { type: "number", minimum: 0 },
        difficulty: { type: "number", minimum: 1, maximum: 10 }
      },
      required: ["quality", "repetitions", "ease_factor", "interval"]
    }
  },

  "calculate_priority_score": {
    name: "calculate_priority_score",
    description: "Calculate review priority based on multiple factors",
    inputSchema: {
      type: "object", 
      properties: {
        next_review_date: { type: "string", format: "date-time" },
        ease_factor: { type: "number", minimum: 1.3 },
        repetitions: { type: "number", minimum: 0 },
        difficulty: { type: "number", minimum: 1, maximum: 10 }
      },
      required: ["next_review_date", "ease_factor", "repetitions", "difficulty"]
    }
  }
};
```


## Advanced Prompt Engineering

### Core Learning Prompts

The system uses scientifically-informed prompts optimized for different learning phases:

```typescript
export class PromptManager {
  getTutoringPrompt(phase: LearningPhase, context: LearningContext): string {
    const basePrompt = `You are an expert tutor implementing evidence-based learning techniques. Your approach is based on:

LEARNING PRINCIPLES:
- Spaced repetition with expanding intervals
- Cognitive load theory and scaffolding  
- Active retrieval practice with multiple formats
- Interleaving for long-term retention
- Two-attempt policy for retrieval checks

TEACHING STYLE:
- Break complex topics into small, digestible chunks
- Provide scaffolding that reduces gradually
- Use concrete examples before abstract concepts
- Implement contrastive examples for clarity
- Give clear, supportive feedback on errors
- Be concise but thorough

CHUNK PROCESSING RULES:
- Never overload working memory (max 7±2 elements)
- Ensure prerequisite knowledge is solid
- Use near-transfer drills for error correction
- Confirm understanding before proceeding
- End with retrieval practice, not explanation`;

    switch (phase) {
      case LearningPhase.SCAFFOLDING:
        return `${basePrompt}

CURRENT PHASE: PROBLEM SCAFFOLDING
Your task is to analyze this complex problem and create an optimal learning scaffold:

Problem: ${context.problem}

Create a scaffolding plan with:
1. HIGH-LEVEL OVERVIEW: Conceptual framework and key components
2. CHUNK BREAKDOWN: 5-9 digestible chunks in logical order  
3. PREREQUISITE MAPPING: What must be mastered before each chunk
4. DIFFICULTY ASSESSMENT: Rate overall difficulty (1-10)
5. ESTIMATED TIMELINE: Realistic learning progression

Focus on reducing cognitive load while maintaining conceptual integrity.`;

      case LearningPhase.LEARNING:
        return `${basePrompt}

CURRENT PHASE: ACTIVE LEARNING
You are teaching chunk ${context.chunkNumber} of ${context.totalChunks}: "${context.chunkTitle}"

Current chunk focus: ${context.chunkContent}
Prerequisites verified: ${context.prerequisites}

TEACHING APPROACH:
1. Present the core concept using simple, concrete examples
2. Build understanding gradually with scaffolded explanations  
3. Use analogies and visual descriptions where helpful
4. Check for understanding before moving forward
5. End with a retrieval check using format: ${context.drillFormat}

Remember: Small steps, concrete examples, active engagement.`;

      case LearningPhase.RETRIEVAL:
        return `${basePrompt}

CURRENT PHASE: RETRIEVAL PRACTICE  
Generate a ${context.drillFormat} retrieval check for: "${context.chunkTitle}"

DRILL REQUIREMENTS:
- Test core understanding, not memorization
- Appropriate difficulty for mastery level ${context.masteryLevel}/5
- Enable two attempts before revealing answer
- Provide immediate, constructive feedback
- Include near-transfer application if needed

Make it challenging but fair, focused on genuine comprehension.`;

      case LearningPhase.REVIEW:
        return `${basePrompt}

CURRENT PHASE: SPACED REVIEW
This is a scheduled review session. Key context:
- Last reviewed: ${context.lastReviewed}  
- Current mastery: ${context.masteryLevel}/5
- Previous attempts: ${context.previousAttempts}
- Focus areas: ${context.weakAreas}

REVIEW APPROACH:
1. Quick recall check without re-teaching
2. If successful: brief reinforcement + harder application
3. If failed: targeted re-explanation + practice drill
4. Include interleaving with related concepts
5. End with confidence assessment

Optimize for long-term retention, not just immediate recall.`;
    }
  }

  getScaffoldingPrompt(problem: string): string {
    return `Analyze this learning challenge and create an optimal scaffolding structure:

PROBLEM: ${problem}

Using cognitive load theory principles, create:

1. COMPLEXITY ANALYSIS:
   - Intrinsic complexity factors
   - Prerequisite knowledge requirements  
   - Working memory demands

2. CHUNKING STRATEGY:
   - Break into 5-9 manageable chunks
   - Ensure logical progression
   - Identify chunk dependencies
   - Estimate cognitive load per chunk

3. SCAFFOLDING DESIGN:
   - Support structures needed
   - Gradual complexity increase
   - Connection points between chunks
   - Assessment checkpoints

4. LEARNING PATHWAY:
   - Optimal sequence for mastery
   - Decision points and branching
   - Recovery strategies for difficulties
   - Interleaving opportunities

Focus on creating scaffolding that can be gradually removed as competence develops.`;
  }
}
```


## Implementation Timeline and Milestones

### Phase 1: Core Infrastructure (Weeks 1-2)

- [x] MCP server skeleton with TypeScript
- [x] Notion database schema creation
- [x] Basic tool handlers implementation
- [x] SM-2 algorithm implementation
- [ ] Configuration and deployment scripts


### Phase 2: Learning Engine (Weeks 3-4)

- [x] Scaffolding prompt engineering
- [x] Chunk generation and management
- [x] Retrieval check system with multiple formats
- [x] Basic workflow orchestration
- [ ] Error handling and logging


### Phase 3: Advanced Features (Weeks 5-6)

- [x] Priority calculation algorithms
- [x] Advanced spaced repetition scheduling
- [x] Performance analytics and tracking
- [x] Session state management
- [x] "What to learn today" intelligent recommendations (guided + explicit)


### Phase 4: Integration and Testing (Weeks 7-8)

- [ ] Claude Desktop integration testing
- [x] End-to-end workflow validation (added tests for recommendation and conversation)
- [x] Documentation and user guides (what-to-learn-today tool docs)
- [ ] Performance optimization
- [ ] Deployment automation


### Prompt exposure workaround

Some clients currently don’t surface MCP prompts in UI even when the server implements `prompts/list` and `prompts/get`. As a reliable workaround, this server also exposes prompt-generating tools that return the same text:

- `scaffolding_prompt({ problem })`
- `learning_prompt({ chunkNumber?, totalChunks?, chunkTitle?, chunkContent?, prerequisites?, drillFormat? })`
- `retrieval_prompt({ chunkTitle?, drillFormat?, masteryLevel? })`
- `review_prompt({ lastReviewed?, masteryLevel?, previousAttempts?, weakAreas? })`
- `workflow_guidance_prompt()`

Use these when prompts don’t appear. This keeps flows functional across clients while we track prompt support.



## Success Metrics and Analytics

The system tracks comprehensive learning analytics to optimize performance:

### Learning Effectiveness Metrics

- **Retention Rate**: Percentage of material retained after spaced intervals
- **Mastery Progression**: Time to achieve mastery levels per difficulty
- **Cognitive Load Efficiency**: Learning speed vs. chunk complexity
- **Review Accuracy**: Success rate on first retrieval attempt


### System Performance Metrics

- **Scheduling Accuracy**: Optimal review timing hit rate
- **Priority Algorithm Effectiveness**: Learning rate optimization
- **Phase Transition Management**: New content introduction balance
- **User Engagement**: Session completion rates and consistency


### Adaptive Optimization

The system continuously learns and adapts:

- **Personal Difficulty Adjustment**: Item-specific difficulty calibration
- **Optimal Scheduling**: Individual learning pattern recognition
- **Chunk Size Optimization**: Personal cognitive load calibration
- **Format Preference Learning**: Most effective drill types per user


## Security and Privacy Considerations

### Data Protection

- Local MCP server processing for sensitive calculations
- Configurable data retention policies


### Access Control

- MCP server runs with user-level privileges only
- No cross-user data access or sharing capabilities
- Audit logs for all database operations


## Conclusion

This implementation plan delivers a sophisticated, scientifically-grounded learning system that leverages the best of modern AI capabilities while maintaining user control and privacy. The system's foundation in peer-reviewed learning science research, combined with advanced spaced repetition algorithms and intelligent scaffolding, creates a powerful tool for deep, systematic learning.

The system specifically excels at the user's requirement to "scaffold very hard problems into small easily digestible chunks" through its implementation of cognitive load theory, sophisticated scaffolding algorithms, and research-proven chunking strategies. The spaced repetition implementation using enhanced SM-2 algorithms with priority scheduling ensures optimal long-term retention while avoiding the phase transition problems identified in scheduling research.
<span style="display:none">[^10][^100][^101][^102][^103][^104][^105][^106][^107][^108][^109][^11][^110][^111][^112][^113][^114][^115][^116][^117][^118][^119][^12][^120][^121][^122][^123][^124][^125][^126][^127][^128][^129][^13][^130][^131][^132][^133][^134][^135][^136][^137][^138][^139][^14][^140][^141][^142][^143][^144][^145][^146][^147][^148][^149][^15][^150][^151][^152][^153][^154][^155][^16][^17][^18][^19][^20][^21][^22][^23][^24][^25][^26][^27][^28][^29][^30][^31][^32][^33][^34][^35][^36][^37][^38][^39][^40][^41][^42][^43][^44][^45][^46][^47][^48][^49][^50][^51][^52][^53][^54][^55][^56][^57][^58][^59][^60][^61][^62][^63][^64][^65][^66][^67][^68][^69][^70][^71][^72][^73][^74][^75][^76][^77][^78][^79][^80][^81][^82][^83][^84][^85][^86][^87][^88][^89][^9][^90][^91][^92][^93][^94][^95][^96][^97][^98][^99]</span>

<div style="text-align: center">⁂</div>

[^1]: https://ieeexplore.ieee.org/document/10649261/

[^2]: https://www.mdpi.com/2076-3417/14/13/5591

[^3]: https://probiologists.com/Article/evidence-based-educational-algorithm-anki-for-optimization-of-medical-education

[^4]: https://www.atlantis-press.com/article/126006011.pdf

[^5]: https://my.chartered.college/early-career-hub/cognitive-load-theory-and-its-application-in-the-classroom/

[^6]: https://pmc.ncbi.nlm.nih.gov/articles/PMC10658001/

[^7]: https://pmc.ncbi.nlm.nih.gov/articles/PMC12108632/

[^8]: https://www.kdd.org/kdd2016/papers/files/rpp0744-reddyAT3.pdf

[^9]: https://www.journalijar.com/article/47441/using-social-science-research-to-form-pedagogical-practices:-evidence-based-teaching-strategies/

[^10]: https://ojs.mahadewa.ac.id/index.php/ijed/article/view/3854

[^11]: https://journal.tofedu.or.id/index.php/journal/article/view/331

[^12]: https://journals.healio.com/doi/10.3928/01484834-20231112-05

[^13]: https://bmcmededuc.biomedcentral.com/articles/10.1186/s12909-024-05259-8

[^14]: https://www.mdpi.com/2227-7102/14/8/866

[^15]: https://jurnal.uns.ac.id/paedagogia/article/view/95239

[^16]: https://www.aclweb.org/anthology/D17-1255.pdf

[^17]: https://journals.sagepub.com/doi/10.1177/17470218221113933

[^18]: https://www.cureus.com/articles/81442-evidence-of-the-spacing-effect-and-influences-on-perceptions-of-learning-and-science-curricula.pdf

[^19]: https://pmc.ncbi.nlm.nih.gov/articles/PMC8759977/

[^20]: https://www.pnas.org/doi/pdf/10.1073/pnas.2413511121

[^21]: https://www.pnas.org/content/pnas/116/10/3988.full.pdf

[^22]: https://pmc.ncbi.nlm.nih.gov/articles/PMC3297428/

[^23]: https://pmc.ncbi.nlm.nih.gov/articles/PMC5476736/

[^24]: https://dx.plos.org/10.1371/journal.pone.0090656

[^25]: https://pubs.asha.org/doi/10.1044/2024_JSLHR-23-00528

[^26]: https://www.niallmcnulty.com/2024/10/spaced-repetition/

[^27]: https://en.wikipedia.org/wiki/Spaced_repetition

[^28]: https://study-skills.lerntipp.at/blocked-practice-vs-interleaving-practice/

[^29]: https://www.iatrox.com/blog/spaced-repetition-medical-education-iatrox-adaptive-srs-uk

[^30]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11852728/

[^31]: https://www.voovostudy.com/study-blog/the-art-of-learning-the-power-of-spaced-repetition

[^32]: https://www.structural-learning.com/post/cognitive-load-theory-a-teachers-guide

[^33]: https://carlhendrick.substack.com/p/new-study-confirms-a-core-truth-about

[^34]: https://www.growthengineering.co.uk/spaced-repetition/

[^35]: https://elearningindustry.com/reducing-cognitive-load-through-scaffolding

[^36]: https://www.performanceup.com.au/blog/blocked-vs-interleaved

[^37]: https://justinmath.com/cognitive-science-of-learning-spaced-repetition/

[^38]: https://education.nsw.gov.au/content/dam/main-education/about-us/educational-data/cese/2017-cognitive-load-theory-practice-guide.pdf

[^39]: https://www.innerdrive.co.uk/blog/blocking-or-interleaving/

[^40]: https://pmc.ncbi.nlm.nih.gov/articles/PMC5126970/

[^41]: https://www.edt.org/insights-from-our-work/using-cognitive-load-theory-as-a-touchstone-for-curriculum-reform-recommendations-for-policymakers/

[^42]: https://www.ecorfan.org/taiwan/research_journals/Tecnologias_Computacionales/vol5num15/Journal_of_Computational_Technologies_V5_N15_2.pdf

[^43]: https://ieeexplore.ieee.org/document/9928370/

[^44]: https://link.springer.com/10.1007/978-981-13-1358-5_10

[^45]: https://www.tandfonline.com/doi/full/10.1080/09602011.2022.2143822

[^46]: https://www.semanticscholar.org/paper/3452c453767726ddb7fa7f4f120579b4b85eca7d

[^47]: https://ejournals.umn.ac.id/index.php/SI/article/view/846

[^48]: http://www.emerald.com/itse/article/11/3/201-222/184478

[^49]: https://publications.ascilite.org/index.php/APUB/article/view/1923

[^50]: https://link.aps.org/doi/10.1103/PhysRevLett.131.040602

[^51]: https://www.semanticscholar.org/paper/2530c8c961e3511af77a5d5f1aa738906fb75122

[^52]: https://arxiv.org/pdf/1712.01856.pdf

[^53]: https://arxiv.org/pdf/1602.07032.pdf

[^54]: https://arxiv.org/pdf/2409.16182.pdf

[^55]: https://arxiv.org/html/2404.16112v1

[^56]: https://pmc.ncbi.nlm.nih.gov/articles/PMC6410796/

[^57]: https://arxiv.org/html/2411.01030v5

[^58]: http://arxiv.org/pdf/2502.01473.pdf

[^59]: https://arxiv.org/pdf/2306.11197.pdf

[^60]: https://github.com/thyagoluciano/sm2

[^61]: https://supermemo.guru/wiki/The_best_spaced_repetition_algorithm_(2025)

[^62]: https://pmc.ncbi.nlm.nih.gov/articles/PMC12357012/

[^63]: https://www.reddit.com/r/Anki/comments/17u01ge/spaced_repetition_algorithm_a_threeday_journey/

[^64]: https://supermemo.guru/wiki/Universal_metric_for_cross-comparison_of_spaced_repetition_algorithms

[^65]: https://traverse.link/spaced-repetition/spaced-repetition-algorithm

[^66]: https://faqs.ankiweb.net/what-spaced-repetition-algorithm

[^67]: https://www.masterhowtolearn.com/2018-10-30-is-sm-17-in-supermemo-better-than-sm-2-in-anki/

[^68]: https://pmc.ncbi.nlm.nih.gov/articles/PMC10403443/

[^69]: https://www.scribd.com/document/910639166/SM-2-Spaced-Repetition-Algorithm-Developer-s-Guide

[^70]: https://super-memory.com/help/smalg.htm

[^71]: https://scholarly.so/blog/anki-pros-and-cons-of-using-spaced-repetition-software

[^72]: https://www.youtube.com/watch?v=v2asudkSFek

[^73]: https://help.supermemo.org/wiki/SuperMemo_Algorithm

[^74]: https://www.probiologists.com/article/evidence-based-educational-algorithm-anki-for-optimization-of-medical-education

[^75]: https://stackoverflow.com/questions/49047159/spaced-repetition-algorithm-from-supermemo-sm-2

[^76]: https://www.supermemo.com/wp-content/uploads/SuperMemo_AI.pdf

[^77]: https://www.growexx.com/blog/anki-algorithm-explained-how-spaced-repetition-works/

[^78]: https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm

[^79]: https://www.reddit.com/r/Anki/comments/17v4dkn/any_research_comparing_actual_reviews_of_sm_type/

[^80]: https://ijsrm.net/index.php/ijsrm/article/view/5934

[^81]: https://ijsrem.com/download/exploring-serverless-security-identifying-security-risks-and-implementing-best-practices/

[^82]: https://www.sae.org/content/2024-01-3075

[^83]: https://www.ijsrp.org/research-paper-0624.php?rp=P15013416

[^84]: http://ieeexplore.ieee.org/document/7578852/

[^85]: https://journalajrcos.com/index.php/AJRCOS/article/view/382

[^86]: https://jurnal.itscience.org/index.php/brilliance/article/view/5971

[^87]: https://www.semanticscholar.org/paper/19b167042a0a6a06949763a673b561b77f7016f9

[^88]: https://ijrah.com/index.php/ijrah/article/view/582

[^89]: https://www.semanticscholar.org/paper/c90da270643d5ccc1501b3bca490ba1aa64661c2

[^90]: https://arxiv.org/pdf/2504.08623.pdf

[^91]: https://res.mdpi.com/d_attachment/applsci/applsci-10-02478/article_deploy/applsci-10-02478-v2.pdf

[^92]: https://onlinelibrary.wiley.com/doi/10.1155/2019/3951495

[^93]: https://www.mdpi.com/2071-1050/12/18/7661/pdf

[^94]: https://superfri.org/index.php/superfri/article/download/310/350

[^95]: https://arxiv.org/pdf/2503.23278.pdf

[^96]: https://www.hindawi.com/journals/wcmc/2022/3174716/

[^97]: http://jitecs.ub.ac.id/index.php/jitecs/article/view/20

[^98]: http://science-gate.com/IJAAS/Articles/2020/2020-7-10/1021833ijaas202010015.pdf

[^99]: https://arxiv.org/pdf/1302.0210.pdf

[^100]: https://github.blog/ai-and-ml/generative-ai/how-to-build-secure-and-scalable-remote-mcp-servers/

[^101]: https://generect.com/blog/claude-mcp/

[^102]: https://github.com/pbohannon/notion-api-mcp

[^103]: https://mcpcat.io/blog/mcp-server-best-practices/

[^104]: https://www.stainless.com/mcp/how-to-use-claude-mcp

[^105]: https://docs.cloudbase.net/en/ai/mcp/develop/server-templates/cloudrun-mcp-notion

[^106]: https://snyk.io/articles/5-best-practices-for-building-mcp-servers/

[^107]: https://mcpify.ai/claude-mcp

[^108]: https://apidog.com/blog/notion-mcp-server/

[^109]: https://snyk.io/articles/a-beginners-guide-to-visually-understanding-mcp-architecture/

[^110]: https://modelcontextprotocol.io/quickstart/server

[^111]: https://www.notion.com/help/notion-mcp

[^112]: https://modelcontextprotocol.io/docs/concepts/architecture

[^113]: https://blog.promptlayer.com/how-to-build-mcp-server/

[^114]: https://www.notion.com/blog/notions-hosted-mcp-server-an-inside-look

[^115]: https://www.docker.com/blog/mcp-server-best-practices/

[^116]: https://docs.anthropic.com/en/docs/claude-code/mcp

[^117]: https://n8n.io/workflows/5655-notion-api-mcp-server/

[^118]: https://treblle.com/blog/mcp-servers-guide

[^119]: https://www.claudelog.com/faqs/how-to-setup-claude-code-mcp-servers/

[^120]: https://dl.acm.org/doi/10.1145/3329859.3329875

[^121]: https://jutif.if.unsoed.ac.id/index.php/jurnal/article/view/1313

[^122]: https://www.semanticscholar.org/paper/9fb74f9ab3ec5a47621e78c12d356142219654e4

[^123]: https://eastpublication.com/index.php/ejhs/article/view/156

[^124]: https://ojs.library.queensu.ca/index.php/PCEEA/article/view/19594

[^125]: https://www.semanticscholar.org/paper/e9023488e459daf1fc37eec3ba8a85ee74e157fb

[^126]: http://ieeexplore.ieee.org/document/1357492/

[^127]: https://ijetms.in/Vol-9-issue-3/Vol-9-Issue-3-9.pdf

[^128]: https://ijsrem.com/download/intelligent-database-migration-using-db-genie-a-machine-learning-driven-approach/

[^129]: http://thesai.org/Publications/ViewPaper?Volume=5\&Issue=11\&Code=ijacsa\&SerialNo=23

[^130]: https://pmc.ncbi.nlm.nih.gov/articles/PMC10712633/

[^131]: http://arxiv.org/pdf/1308.0514.pdf

[^132]: https://ace.ewapublishing.org/media/0ddf951ec4e34dd1bb158c354a1f2446.marked.pdf

[^133]: https://www.mdpi.com/2227-7102/13/9/947/pdf?version=1694866693

[^134]: http://www.scirp.org/journal/PaperDownload.aspx?paperID=102090

[^135]: https://www.mdpi.com/2227-7102/12/4/271/pdf?version=1649751122

[^136]: https://online-journals.org/index.php/i-jes/article/download/19071/8421

[^137]: https://www.cureus.com/articles/139707-schema-a-quantified-learning-solution-to-augment-assess-and-analyze-learning-in-medicine

[^138]: https://arxiv.org/pdf/2204.06670.pdf

[^139]: http://journal.astanait.edu.kz/index.php/ojs/article/view/243

[^140]: https://www.youtube.com/watch?v=mAJOpO73d8Y

[^141]: https://research.monash.edu/files/286050347/285809957_oa.pdf

[^142]: https://www.reddit.com/r/Notion/comments/1fzxlmn/what_does_notions_database_schema_look_like_and/

[^143]: https://www.boundlesslearning.com/documents/unleashing-learning-analytics-through-instructional-design.pdf

[^144]: https://thomasjfrank.com/notion-databases-the-ultimate-beginners-guide/

[^145]: https://www.surf.nl/files/2019-04/learning-analytics-in-education-design-a-guide-en.pdf

[^146]: https://www.notion.com/templates/collections/top-10-paid-learning-modules-templates-in-notion

[^147]: https://maestrolearning.com/blogs/how-to-use-spaced-repetition/

[^148]: https://www.tandfonline.com/doi/full/10.1080/0960085X.2020.1816144

[^149]: https://www.notion.com/help/intro-to-databases

[^150]: https://apolo.unab.edu.co/en/projects/design-patterns-for-the-incorporation-of-learning-analytics-in-mu

[^151]: https://www.notion.com/templates/learning-topics-database

[^152]: https://notes.andymatuschak.org/Spaced_repetition_memory_system

[^153]: https://www.solaresearch.org/wp-content/uploads/2017/05/chapter13.pdf

[^154]: https://www.notion.com/templates/category/learning

[^155]: https://www.supermemo.com/en/blog/the-true-history-of-spaced-repetition

