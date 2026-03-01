// Quarantine tracking: https://github.com/nicobailey/second-memory/issues/0
// Reason: Example quarantined test demonstrating the quarantine convention.
// Remove this file once real quarantine tests exist.

import { describe, it, expect } from 'vitest';

describe('quarantine example', () => {
  it('demonstrates the .quarantine.test.ts naming convention', () => {
    expect(true).toBe(true);
  });
});
