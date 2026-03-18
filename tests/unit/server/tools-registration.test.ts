import { describe, it, expect } from 'vitest';
import { registerServerTools } from '../../../src/server/tools.js';
import { createMockAppContext } from '../../helpers/mock-app-context.js';
import { StubServer } from '../../helpers/stub-server.js';

describe('registerServerTools', () => {
  it('registers calculators and prompt tools', () => {
    const stub = new StubServer() as any;
    registerServerTools(stub, createMockAppContext());
    expect(stub.tools).toContain('calculate_next_review');
    expect(stub.tools).toContain('calculate_priority_score');
    expect(stub.tools).toContain('calculate_next_review_advanced');
    expect(stub.tools).toContain('rank_candidates');
    // Analytics tools
    expect(stub.tools).toContain('analytics_daily');
    expect(stub.tools).toContain('analytics_window');
    // Search tools
    expect(stub.tools).toContain('search_learning_content');
    // Session management tools
    expect(stub.tools).toContain('session_status');
    // Chunk tools
    expect(stub.tools).toContain('create_learning_item');
    expect(stub.tools).toContain('delete_chunk');
    // Write tools
    expect(stub.tools).toContain('record_review_result');
    // Learning recommendation tools
    expect(stub.tools).toContain('what_to_learn_today');
    // Server info tools
    expect(stub.tools).toContain('get_server_info');
    // Server workflow tools
    expect(stub.tools).toContain('get_server_workflow');
  });
});
