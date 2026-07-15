import { describe, it, expect } from 'vitest';
import { promptPack } from '../../../../src/shared/prompts/prompt-pack.js';
import { SERVER_INSTRUCTIONS, WORKFLOW_SUMMARY } from '../../../../src/shared/instructions.js';

describe('promptPack', () => {
  it('returns workflow guidance with tool names', () => {
    const text = promptPack.getPrompt('workflow_guidance', {});
    expect(text).toContain('calculate_next_review');
    expect(text).toContain('calculate_priority_score');
  });

  it('learning prompt includes chunk metadata', () => {
    const text = promptPack.getPrompt('learning', {
      chunkNumber: 2,
      totalChunks: 5,
      chunkTitle: 'Intro',
      drillFormat: 'open_ended',
    });
    expect(text).toContain('(2/5)');
    expect(text).toContain('Intro');
  });

  it('learning prompt contains question taxonomy', () => {
    const text = promptPack.getPrompt('learning', { chunkTitle: 'Test' });
    expect(text).toContain('## Question Taxonomy');
    expect(text).toContain('Recall');
    expect(text).toContain('Explain/Apply');
    expect(text).toContain('Analyze/Create');
    expect(text).toContain('85–95%');
    expect(text).toContain('70–80%');
    expect(text).toContain('65–75%');
  });

  it('learning prompt contains the rubric-anchored grading payload guidance', () => {
    const text = promptPack.getPrompt('learning', { chunkTitle: 'Test' });
    expect(text).toContain('## Grading Rubric');
    expect(text).toContain('you do NOT supply a raw quality number');
    expect(text).toContain('correct_recurrence');
    expect(text).toContain('justifying_spans');
    expect(text).toContain('a pass is quality >= 3');
  });

  it('learning prompt contains adaptive difficulty selection', () => {
    const text = promptPack.getPrompt('learning', { chunkTitle: 'Test' });
    expect(text).toContain('## Adaptive Difficulty Selection');
    expect(text).toContain('accuracy < 0.40');
    expect(text).toContain('accuracy < 0.80');
    expect(text).toContain('accuracy ≥ 0.80');
    expect(text).toContain('Interleave all levels');
  });

  it('learning prompt contains NEU-306 teaching_approach ceiling', () => {
    const text = promptPack.getPrompt('learning', { chunkTitle: 'Test' });
    expect(text).toContain('teaching_approach');
    expect(text).toContain('reteach');
    expect(text).toContain('scaffold');
    expect(text).toContain('Level 1 (Recall) only');
  });

  it('retrieval and review prompts include key constraints', () => {
    const r = promptPack.getPrompt('retrieval', { chunkTitle: 'X', masteryLevel: 3 });
    expect(r).toContain('two-attempt');
    const v = promptPack.getPrompt('review', {
      lastReviewed: '2025-01-01',
      masteryLevel: 2,
      previousAttempts: 1,
      weakAreas: 'y',
    });
    expect(v).toContain('LAST REVIEWED');
  });

  it('retrieval prompt contains quality rubric and taxonomy reference', () => {
    const text = promptPack.getPrompt('retrieval', { chunkTitle: 'Test', masteryLevel: 3 });
    expect(text).toContain('## Grading Rubric');
    expect(text).toContain('correct_recurrence');
    expect(text).toContain('justifying_spans');
    expect(text).toContain('taxonomy levels');
    expect(text).toContain('Recall');
    expect(text).toContain('Explain/Apply');
    expect(text).toContain('Do not use Analyze/Create on re-queued chunks');
  });

  it('review prompt contains quality rubric and taxonomy-aware plan', () => {
    const text = promptPack.getPrompt('review', {
      lastReviewed: '2025-01-15',
      masteryLevel: 3,
    });
    expect(text).toContain('## Grading Rubric');
    expect(text).toContain('correct_recurrence');
    expect(text).toContain('justifying_spans');
    expect(text).toContain('taxonomy-aware');
    expect(text).toContain('Level 1 question');
    expect(text).toContain('Level 2 (Explain/Apply)');
  });

  it('chunk generation prompt lists required fields', () => {
    const text = promptPack.getPrompt('chunk_generation', {
      topicTitle: 'Graphs',
      topicDescription: 'Basics',
      existingChunkTitles: ['Intro'],
    });
    expect(text).toContain('Produce 2–7 proposed chunks');
    expect(text).toContain('title');
    expect(text).toContain('order');
    expect(text).toContain('content');
    expect(text).toContain('prerequisites');
  });

  it('chunk management prompt mentions operation and resulting chunks', () => {
    const text = promptPack.getPrompt('chunk_management', {
      operation: 'merge',
      managedChunk: { title: 'Intro' },
      intent: 'deduplicate',
    });
    expect(text).toContain('OPERATION: merge');
    expect(text).toContain('TARGET CHUNK: Intro');
    expect(text).toContain('resulting chunk(s)');
  });

  it('chunk management uses defaults when managedChunk is omitted', () => {
    const text = promptPack.getPrompt('chunk_management', { intent: 'cleanup' });
    expect(text).toContain('OPERATION: update');
    expect(text).toContain('TARGET CHUNK: <untitled>');
    expect(text).toContain('INTENT: cleanup');
  });

  it('chunk management includes order, content, and prerequisites when provided', () => {
    const text = promptPack.getPrompt('chunk_management', {
      operation: 'update',
      managedChunk: {
        title: 'Linked Lists',
        order: 3,
        content: 'Singly and doubly linked lists',
        prerequisites: 'Arrays, Pointers',
      },
      intent: 'expand',
    });
    expect(text).toContain('ORDER: 3');
    expect(text).toContain('CONTENT (current): Singly and doubly linked lists');
    expect(text).toContain('PREREQUISITES (current): Arrays, Pointers');
  });

  it('scaffolding uses problem fallback when problem is omitted', () => {
    const text = promptPack.getPrompt('scaffolding', {});
    expect(text).toContain('<problem not provided>');
    expect(text).toContain('## RESEARCH FIRST');
  });

  it('learning uses all fallback defaults when context is empty', () => {
    const text = promptPack.getPrompt('learning', {});
    expect(text).toContain('(1/1)');
    expect(text).toContain('<untitled chunk>');
    expect(text).toContain('<content not provided>');
    expect(text).toContain('open_ended');
  });

  it('retrieval uses fallback defaults when context is empty', () => {
    const text = promptPack.getPrompt('retrieval', {});
    expect(text).toContain('<untitled chunk>');
    expect(text).toContain('TARGET MASTERY: 2/5');
  });

  it('review uses fallback defaults when context is empty', () => {
    const text = promptPack.getPrompt('review', {});
    expect(text).toContain('LAST REVIEWED: <unknown>');
    expect(text).toContain('CURRENT MASTERY: 2/5');
    expect(text).toContain('PREVIOUS ATTEMPTS: 0');
    expect(text).toContain('focus foundational gaps');
  });

  it('chunk generation uses fallback defaults when context is empty', () => {
    const text = promptPack.getPrompt('chunk_generation', {});
    expect(text).toContain('<topic not provided>');
    expect(text).toContain('<description not provided>');
    expect(text).toContain('No existing chunk titles provided.');
  });

  it('chunk generation handles non-array existingChunkTitles', () => {
    const text = promptPack.getPrompt('chunk_generation', {
      topicTitle: 'Test',
      existingChunkTitles: 'not-an-array' as any,
    });
    expect(text).toContain('No existing chunk titles provided.');
  });

  describe('web search enhancements', () => {
    it('scaffolding prompt includes research instructions by default', () => {
      const text = promptPack.getPrompt('scaffolding', { problem: 'React Hooks' });
      expect(text).toContain('## RESEARCH FIRST');
      expect(text).toContain('search the web for current information about React Hooks');
      expect(text).toContain('official documentation');
      expect(text).toContain('Peer-reviewed');
      expect(text).toContain('multiple perspectives');
      expect(text).toContain('You are an expert tutor'); // Original content preserved
    });

    it('scaffolding prompt can disable research when explicitly set', () => {
      const text = promptPack.getPrompt('scaffolding', {
        problem: 'React Hooks',
        researchRequired: false,
      });
      expect(text).not.toContain('## RESEARCH FIRST');
      expect(text).toContain('You are an expert tutor'); // Original content still present
    });

    it('scaffolding prompt uses different search emphasis', () => {
      const currentYear = new Date().getFullYear();
      const currentText = promptPack.getPrompt('scaffolding', {
        problem: 'React Hooks',
        searchEmphasis: 'current',
      });
      expect(currentText).toContain(`recent information (${currentYear - 1}-${currentYear})`);

      const authText = promptPack.getPrompt('scaffolding', {
        problem: 'React Hooks',
        searchEmphasis: 'authoritative',
      });
      expect(authText).toContain('official documentation, recognized experts');
    });

    it('chunk generation prompt includes research instructions by default', () => {
      const text = promptPack.getPrompt('chunk_generation', {
        topicTitle: 'Node.js APIs',
        topicDescription: 'Modern APIs',
      });
      expect(text).toContain('## RESEARCH FIRST');
      expect(text).toContain('search the web for current information about Node.js APIs');
      expect(text).toContain('current examples and best practices');
      expect(text).toContain('You are assisting with chunk generation'); // Original content preserved
    });

    it('chunk generation prompt can disable research when explicitly set', () => {
      const text = promptPack.getPrompt('chunk_generation', {
        topicTitle: 'Node.js APIs',
        researchRequired: false,
      });
      expect(text).not.toContain('## RESEARCH FIRST');
      expect(text).toContain('You are assisting with chunk generation'); // Original content still present
    });

    it('chunk generation prompt uses current search emphasis by default', () => {
      const currentYear = new Date().getFullYear();
      const text = promptPack.getPrompt('chunk_generation', { topicTitle: 'Node.js APIs' });
      expect(text).toContain(`recent information (${currentYear - 1}-${currentYear})`);
    });

    it('workflow guidance includes research step', () => {
      const text = promptPack.getPrompt('workflow_guidance');
      expect(text).toContain('1) Research phase');
      expect(text).toContain('Search web for current information');
      expect(text).toContain('authoritative sources');
      expect(text).toContain('Web search performed by client');
      expect(text).toContain('2) Intake problem'); // Workflow steps renumbered
    });

    it('workflow guidance includes session enforcement for recall/review', () => {
      const text = promptPack.getPrompt('workflow_guidance');
      expect(text).toContain('CRITICAL: Session Requirement for Recall/Review');
      expect(text).toContain('MANDATORY: For ANY recall, review, or retrieval practice');
      expect(text).toContain('Create a session BEFORE teaching');
      expect(text).toContain('historical feedback');
      expect(text).toContain('Review/Recall Flow');
      expect(text).toContain('Session Completion Best Practices');
    });

    it('enhanced prompts preserve all original content', () => {
      // Test that all key elements from original prompts are still present
      const scaffolding = promptPack.getPrompt('scaffolding', { problem: 'Test Problem' });
      expect(scaffolding).toContain('HIGH-LEVEL OVERVIEW');
      expect(scaffolding).toContain('CHUNK BREAKDOWN');
      expect(scaffolding).toContain('PREREQUISITE MAPPING');
      expect(scaffolding).toContain('DIFFICULTY ASSESSMENT');
      expect(scaffolding).toContain('ESTIMATED TIMELINE');

      const chunkGen = promptPack.getPrompt('chunk_generation', { topicTitle: 'Test Topic' });
      expect(chunkGen).toContain('Produce 2–7 proposed chunks');
      expect(chunkGen).toContain('title');
      expect(chunkGen).toContain('order');
      expect(chunkGen).toContain('content');
      expect(chunkGen).toContain('prerequisites');
    });

    it('search query suggestions include topic-specific terms', () => {
      const currentYear = new Date().getFullYear();
      const text = promptPack.getPrompt('scaffolding', { problem: 'GraphQL' });
      expect(text).toContain(`"GraphQL" best practices ${currentYear - 1} ${currentYear}`);
      expect(text).toContain('"GraphQL" tutorial guide comprehensive');
      expect(text).toContain('"GraphQL" official documentation');
      expect(text).toContain('"GraphQL" examples real world applications');
    });

    it('source quality guidance is comprehensive', () => {
      const text = promptPack.getPrompt('scaffolding', { problem: 'Test' });
      expect(text).toContain('Prioritize:');
      expect(text).toContain('Official documentation and authoritative sources');
      expect(text).toContain('Peer-reviewed articles');
      expect(text).toContain('Recognized industry experts');
      expect(text).toContain('When conflicting information is found:');
      expect(text).toContain('Present multiple perspectives');
      expect(text).toContain('Explicitly state limitations');
    });

    it('review prompt includes feedback-informed plan step when feedback exists', () => {
      const text = promptPack.getPrompt('review', {
        lastReviewed: '2025-01-15',
        masteryLevel: 3,
        previousAttempts: 2,
        weakAreas: 'edge cases',
        previousSessionFeedback: [
          {
            sessionMode: 'retrieval',
            completedAt: '2025-01-10T12:00:00.000Z',
            feedback: 'Struggled with recursion examples',
          },
        ],
      });
      expect(text).toContain('PREVIOUS SESSION FEEDBACK');
      expect(text).toContain('Struggled with recursion examples');
      expect(text).toContain('Pay special attention to previously reported pain points');
      expect(text).toContain('LAST REVIEWED: 2025-01-15');
    });

    it('retrieval prompt includes feedback section and scaffolding hint when feedback exists', () => {
      const text = promptPack.getPrompt('retrieval', {
        chunkTitle: 'Binary Trees',
        masteryLevel: 4,
        previousSessionFeedback: [
          {
            sessionMode: 'learning',
            completedAt: '2025-01-08T10:00:00.000Z',
            feedback: 'Confused by tree rotations',
          },
          {
            sessionMode: 'review',
            completedAt: '2025-01-12T14:00:00.000Z',
            feedback: 'Better with traversals now',
          },
        ],
      });
      expect(text).toContain('PREVIOUS SESSION FEEDBACK');
      expect(text).toContain('Confused by tree rotations');
      expect(text).toContain('Better with traversals now');
      expect(text).toContain('Address previously reported difficulties');
      expect(text).toContain('[2025-01-08, learning]');
      expect(text).toContain('[2025-01-12, review]');
    });

    it('review prompt omits feedback plan step when no feedback provided', () => {
      const text = promptPack.getPrompt('review', {
        lastReviewed: '2025-01-15',
        masteryLevel: 3,
      });
      expect(text).not.toContain('PREVIOUS SESSION FEEDBACK');
      expect(text).not.toContain('Pay special attention to previously reported pain points');
    });

    it('prompts without research context work normally', () => {
      // Test that prompts not enhanced with research still work normally
      const learning = promptPack.getPrompt('learning', { chunkTitle: 'Test Chunk' });
      expect(learning).not.toContain('## RESEARCH FIRST');
      expect(learning).toContain('You are teaching with cognitive load awareness');

      const retrieval = promptPack.getPrompt('retrieval', { chunkTitle: 'Test Chunk' });
      expect(retrieval).not.toContain('## RESEARCH FIRST');
      expect(retrieval).toContain('You are generating a retrieval practice drill');

      const review = promptPack.getPrompt('review', { masteryLevel: 3 });
      expect(review).not.toContain('## RESEARCH FIRST');
      expect(review).toContain('You are conducting a spaced review session');
    });

    it('uses additional topic search terms when provided', () => {
      const text = promptPack.getPrompt('scaffolding', {
        problem: 'React Hooks',
        topicSearchTerms: ['useState', 'useEffect', 'custom hooks'],
      });
      expect(text).toContain('"React Hooks" useState');
      expect(text).toContain('"React Hooks" useEffect');
      expect(text).toContain('"React Hooks" custom hooks');
    });

    it('chunk generation excludes research constraint when research disabled', () => {
      const withResearch = promptPack.getPrompt('chunk_generation', { topicTitle: 'Test' });
      expect(withResearch).toContain(
        'Base chunks on current examples and best practices found through research'
      );

      const withoutResearch = promptPack.getPrompt('chunk_generation', {
        topicTitle: 'Test',
        researchRequired: false,
      });
      expect(withoutResearch).not.toContain(
        'Base chunks on current examples and best practices found through research'
      );
    });
  });

  describe('learning_session prompt', () => {
    it('includes session orchestration structure with defaults', () => {
      const text = promptPack.getPrompt('learning_session', {});
      expect(text).toContain('LEARNING SESSION ORCHESTRATION');
      expect(text).toContain('Mode: start');
      expect(text).toContain('## Starting a Session');
      expect(text).toContain('what_to_learn_today({');
      expect(text).toContain('limit: 10');
      expect(text).toContain('## Conducting Reviews');
      expect(text).toContain('## Completing a Session');
    });

    it('interpolates subject into recommendations call', () => {
      const text = promptPack.getPrompt('learning_session', { subject: 'Math' });
      expect(text).toContain('Focus area: Math.');
      expect(text).toContain('subject_filter: "Math"');
    });

    it('includes time note when timeAvailable is provided', () => {
      const text = promptPack.getPrompt('learning_session', { timeAvailable: 30 });
      expect(text).toContain('The learner has 30 minutes available.');
    });

    it('omits subject_filter when no subject is given', () => {
      const text = promptPack.getPrompt('learning_session', {});
      expect(text).not.toContain('subject_filter');
      expect(text).toContain('what_to_learn_today({ limit: 10 })');
    });

    it('uses provided sessionMode', () => {
      const text = promptPack.getPrompt('learning_session', { sessionMode: 'review' });
      expect(text).toContain('Mode: review');
    });
  });

  describe('rolling session flow documentation', () => {
    it('workflow_guidance contains rolling session flow section', () => {
      const text = promptPack.getPrompt('workflow_guidance', {});
      expect(text).toContain('Rolling Session Flow');
      expect(text).toContain('create_session_chunk');
      expect(text).toContain('status: "in_progress"');
      expect(text).toContain('complete_session');
      expect(text).toContain('"blocked" or "error"');
    });

    it('workflow_guidance contains updated recommendations section', () => {
      const text = promptPack.getPrompt('workflow_guidance', {});
      expect(text).toContain('## Getting Recommendations');
      expect(text).toContain('what_to_learn_today({ subject_filter: "Math", limit: 10 })');
      expect(text).toContain('topic-level recommendations ranked by urgency');
      expect(text).toContain('subject_filter, limit');
    });

    it('workflow_guidance retains existing fixed-session references', () => {
      const text = promptPack.getPrompt('workflow_guidance', {});
      expect(text).toContain('Review/Recall Flow');
      expect(text).toContain('chunk_ids');
      expect(text).toContain('get_active_session');
    });

    it('SERVER_INSTRUCTIONS contains ROLLING SESSION FLOW section', () => {
      expect(SERVER_INSTRUCTIONS).toContain('ROLLING SESSION FLOW');
      expect(SERVER_INSTRUCTIONS).toContain('mode: "learning"');
      expect(SERVER_INSTRUCTIONS).toContain('status: "in_progress"');
      expect(SERVER_INSTRUCTIONS).toContain('complete_session');
      expect(SERVER_INSTRUCTIONS).toContain('"blocked" or "error"');
    });

    it('SERVER_INSTRUCTIONS retains TEACHING FLOW section', () => {
      expect(SERVER_INSTRUCTIONS).toContain('TEACHING FLOW');
      expect(SERVER_INSTRUCTIONS).toContain('start_learning');
    });

    it('SERVER_INSTRUCTIONS contains QUESTION QUALITY section with taxonomy and rubric', () => {
      expect(SERVER_INSTRUCTIONS).toContain('QUESTION QUALITY');
      expect(SERVER_INSTRUCTIONS).toContain('three-level taxonomy');
      expect(SERVER_INSTRUCTIONS).toContain('Level 1 (Recall)');
      expect(SERVER_INSTRUCTIONS).toContain('Level 2 (Explain/Apply)');
      expect(SERVER_INSTRUCTIONS).toContain('Level 3 (Analyze/Create)');
      expect(SERVER_INSTRUCTIONS).toContain('You do NOT supply a raw quality score');
      expect(SERVER_INSTRUCTIONS).toContain('rubric-anchored grading payload');
    });
  });

  describe('probe-first scaffolding', () => {
    it('SERVER_INSTRUCTIONS contains PROBE-FIRST SCAFFOLDING section', () => {
      expect(SERVER_INSTRUCTIONS).toContain('PROBE-FIRST SCAFFOLDING');
      expect(SERVER_INSTRUCTIONS).toContain('absence from DB does not mean ignorance');
      expect(SERVER_INSTRUCTIONS).toContain('confirmed gaps');
    });

    it('SERVER_INSTRUCTIONS contains assessment mode trigger conditions', () => {
      expect(SERVER_INSTRUCTIONS).toContain('WHEN TO USE ASSESSMENT MODE');
      expect(SERVER_INSTRUCTIONS).toContain('learner explicitly asks to be evaluated');
      expect(SERVER_INSTRUCTIONS).toContain('Do NOT use assessment mode for routine teaching');
    });

    it('scaffolding prompt includes search and probe steps before chunk design', () => {
      const text = promptPack.getPrompt('scaffolding', { problem: 'Binary Trees' });
      expect(text).toContain('Before designing chunks:');
      expect(text).toContain('SEARCH EXISTING CONTENT');
      expect(text).toContain('search_learning_content');
      expect(text).toContain('PROBE PRIOR KNOWLEDGE');
      expect(text).toContain('probe before assuming a gap');
    });

    it('scaffolding prompt includes mastery-skip and content_status constraints', () => {
      const text = promptPack.getPrompt('scaffolding', { problem: 'Graphs' });
      expect(text).toContain(
        'Do not create chunks for concepts the learner has demonstrated mastery of'
      );
      expect(text).toContain('content_status');
    });

    it('workflow guidance includes proactive probe-first scaffolding flow', () => {
      const text = promptPack.getPrompt('workflow_guidance');
      expect(text).toContain('Probe-First Scaffolding (Proactive Flow)');
      expect(text).toContain('search_learning_content for each prerequisite');
      expect(text).toContain('prerequisite graph grows only where real gaps exist');
    });

    it('workflow guidance includes reactive gap detection flow', () => {
      const text = promptPack.getPrompt('workflow_guidance');
      expect(text).toContain('Reactive Gap Detection');
      expect(text).toContain('probe to confirm the gap');
      expect(text).toContain('note_type: "gap"');
      expect(text).toContain('complete_session with feedback describing the gap');
    });

    it('workflow guidance includes bootstrap workflow section', () => {
      const text = promptPack.getPrompt('workflow_guidance');
      expect(text).toContain('Bootstrap Workflow (New Topics from Scratch)');
      expect(text).toContain("content_status: 'final'");
      expect(text).toContain("content_status: 'draft'");
    });

    it('workflow guidance includes just-in-time content fill section', () => {
      const text = promptPack.getPrompt('workflow_guidance');
      expect(text).toContain('Just-in-Time Content Fill');
      expect(text).toContain('update_chunk_content');
      expect(text).toContain('adapted to the specific learner');
    });

    it('workflow guidance contains per-chunk probing algorithm', () => {
      const text = promptPack.getPrompt('workflow_guidance');
      expect(text).toContain('Per-Chunk Probing Algorithm');
      expect(text).toContain('current taxonomy level');
      expect(text).toContain('escalate one level');
      expect(text).toContain('max 3 attempts per level');
      expect(text).toContain('1 Recall + 1 Explain');
      expect(text).toContain('5–7 total attempts');
    });

    it('learning session prompt includes probe step in creating new topics', () => {
      const text = promptPack.getPrompt('learning_session', {});
      expect(text).toContain('Creating New Topics');
      expect(text).toContain('absence from the DB does not mean the learner lacks knowledge');
      expect(text).toContain('If confirmed gap');
    });
  });

  describe('tier-branched instruction generation (NEU-312)', () => {
    const baseContext = {
      chunkNumber: 2,
      totalChunks: 5,
      chunkTitle: 'Binary Search Trees',
      chunkContent: 'BST operations: insert, search, delete',
      prerequisites: 'Arrays, Basic Trees',
      drillFormat: 'open_ended' as const,
    };

    it('recall tier matches current learning behavior', () => {
      const text = promptPack.getTierInstruction('recall', baseContext);
      expect(text).toContain('cognitive load awareness');
      expect(text).toContain('(2/5)');
      expect(text).toContain('Binary Search Trees');
      expect(text).toContain('## Question Taxonomy');
      expect(text).toContain('## Grading Rubric');
      expect(text).toContain('Recall');
      expect(text).toContain('Explain/Apply');
      expect(text).toContain('Analyze/Create');
    });

    it('cued_recall tier includes graduated-hints language', () => {
      const text = promptPack.getTierInstruction('cued_recall', baseContext);
      expect(text).toContain('cued-recall');
      expect(text).toContain('graduated');
      expect(text).toContain('contextual cue');
      expect(text).toContain('structural hint');
      expect(text).toContain('Stay at Recall and Explain/Apply levels');
      expect(text).toContain('## Grading Rubric');
    });

    it('reteach tier includes compressed re-presentation language', () => {
      const text = promptPack.getTierInstruction('reteach', baseContext);
      expect(text).toContain('reteaching');
      expect(text).toContain('compressed re-presentation');
      expect(text).toContain('recall probe');
      expect(text).toContain('Retrieval check');
      expect(text).toContain('Stay at Recall level only');
      expect(text).toContain('## Grading Rubric');
    });

    it('scaffold tier includes recognition-first language', () => {
      const text = promptPack.getTierInstruction('scaffold', baseContext);
      expect(text).toContain('rebuilding knowledge');
      expect(text).toContain('Recognition questions first');
      expect(text).toContain('Re-teach with concrete examples');
      expect(text).toContain('forgetting as normal');
      expect(text).toContain('Stay at Recall level only');
      expect(text).toContain('## Grading Rubric');
    });

    it('each tier generates distinct instruction text', () => {
      const recall = promptPack.getTierInstruction('recall', baseContext);
      const cuedRecall = promptPack.getTierInstruction('cued_recall', baseContext);
      const reteach = promptPack.getTierInstruction('reteach', baseContext);
      const scaffold = promptPack.getTierInstruction('scaffold', baseContext);

      // All four are distinct
      const texts = [recall, cuedRecall, reteach, scaffold];
      for (let i = 0; i < texts.length; i++) {
        for (let j = i + 1; j < texts.length; j++) {
          expect(texts[i]).not.toBe(texts[j]);
        }
      }
    });

    it('topic orientation instruction includes topic title', () => {
      const text = promptPack.getTopicOrientationInstruction('Graph Algorithms');
      expect(text).toContain('## Topic Orientation');
      expect(text).toContain('Graph Algorithms');
      expect(text).toContain("hasn't engaged with");
      expect(text).toContain('2–3 sentences');
    });

    it('tier instructions include previous feedback when provided', () => {
      const ctxWithFeedback = {
        ...baseContext,
        previousSessionFeedback: [
          {
            sessionMode: 'retrieval',
            completedAt: '2025-01-10T12:00:00.000Z',
            feedback: 'Struggled with deletion edge cases',
          },
        ],
      };

      const cuedRecall = promptPack.getTierInstruction('cued_recall', ctxWithFeedback);
      expect(cuedRecall).toContain('PREVIOUS SESSION FEEDBACK');
      expect(cuedRecall).toContain('Struggled with deletion edge cases');
    });

    it('tier instructions use fallback defaults when context is empty', () => {
      const recall = promptPack.getTierInstruction('recall', {});
      expect(recall).toContain('(1/1)');
      expect(recall).toContain('<untitled chunk>');

      const cuedRecall = promptPack.getTierInstruction('cued_recall', {});
      expect(cuedRecall).toContain('(1/1)');
      expect(cuedRecall).toContain('<untitled chunk>');

      const reteach = promptPack.getTierInstruction('reteach', {});
      expect(reteach).toContain('(1/1)');
      expect(reteach).toContain('<untitled chunk>');

      const scaffold = promptPack.getTierInstruction('scaffold', {});
      expect(scaffold).toContain('(1/1)');
      expect(scaffold).toContain('<untitled chunk>');
    });

    it('all four tier instructions include epistemic consistency directive', () => {
      const tiers = ['recall', 'cued_recall', 'reteach', 'scaffold'] as const;
      for (const tier of tiers) {
        const text = promptPack.getTierInstruction(tier, baseContext);
        expect(text).toContain('## Epistemic Consistency');
        expect(text).toContain('canonical');
        expect(text).toContain('condensed_summary');
      }
    });

    it('all four tier instructions include vocabulary precheck directive', () => {
      const tiers = ['recall', 'cued_recall', 'reteach', 'scaffold'] as const;
      for (const tier of tiers) {
        const text = promptPack.getTierInstruction(tier, baseContext);
        expect(text).toContain('## Vocabulary Precheck');
        expect(text).toContain('prerequisite_context');
      }
    });
  });

  describe('teaching content integrity', () => {
    it('learning prompt contains TEACHING PRIORITY block with mandatory-presentation assertion', () => {
      const text = promptPack.getPrompt('learning', {});
      expect(text).toContain('## TEACHING PRIORITY');
      expect(text).toContain(
        'You MUST present EVERY content item the server provides before asking any question that references it.'
      );
    });

    it("learning prompt contains YOUR CONTEXT ≠ LEARNER'S CONTEXT block with unpresented-content prohibition", () => {
      const text = promptPack.getPrompt('learning', {});
      expect(text).toContain("## YOUR CONTEXT ≠ LEARNER'S CONTEXT");
      expect(text).toContain(
        'Do NOT ask about content you have not explicitly shown to the learner in this conversation.'
      );
    });

    it('TEACHING PRIORITY block appears before Approach section in learning prompt', () => {
      const text = promptPack.getPrompt('learning', {});
      expect(text.indexOf('## TEACHING PRIORITY')).toBeLessThan(text.indexOf('Approach:'));
    });

    it("YOUR CONTEXT ≠ LEARNER'S CONTEXT block appears before Approach section in learning prompt", () => {
      const text = promptPack.getPrompt('learning', {});
      expect(text.indexOf("## YOUR CONTEXT ≠ LEARNER'S CONTEXT")).toBeLessThan(
        text.indexOf('Approach:')
      );
    });

    it('SERVER_INSTRUCTIONS contains TEACHING CONTENT INTEGRITY section with key phrase', () => {
      expect(SERVER_INSTRUCTIONS).toContain('TEACHING CONTENT INTEGRITY');
      expect(SERVER_INSTRUCTIONS).toContain(
        'do not ask about content the learner has not yet seen'
      );
    });

    it('TEACHING CONTENT INTEGRITY appears before QUESTION QUALITY in SERVER_INSTRUCTIONS', () => {
      expect(SERVER_INSTRUCTIONS.indexOf('TEACHING CONTENT INTEGRITY')).toBeLessThan(
        SERVER_INSTRUCTIONS.indexOf('QUESTION QUALITY')
      );
    });
  });

  describe('content creation → teaching chain (NEU-593)', () => {
    it('SERVER_INSTRUCTIONS CONTENT CREATION chains into a learning session', () => {
      expect(SERVER_INSTRUCTIONS).toContain(
        'Immediately begin teaching the new content. Call create_session with mode: "learning"'
      );
      expect(SERVER_INSTRUCTIONS).toContain('chunk_ids from the create_topic_with_chunks response');
    });

    it('WORKFLOW_SUMMARY CONTENT line chains into create_session', () => {
      expect(WORKFLOW_SUMMARY).toContain('create_topic_with_chunks → create_session(learning)');
    });

    it('learning_session prompt "Creating New Topics" includes post-create teaching instruction', () => {
      const text = promptPack.getPrompt('learning_session', {});
      expect(text).toContain('After successful creation, immediately open a learning session');
      expect(text).toContain('do not wait for a second prompt');
    });
  });
});
