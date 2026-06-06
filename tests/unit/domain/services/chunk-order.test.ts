import { describe, it, expect } from 'vitest';
import {
  validateChunkOrder,
  type ChunkOrderInput,
} from '../../../../src/domain/services/chunk-order.js';

const chunks: ChunkOrderInput[] = [
  { id: 'a', prerequisites: [] },
  { id: 'b', prerequisites: ['a'] },
  { id: 'c', prerequisites: ['b'] },
];

describe('validateChunkOrder', () => {
  it('accepts a complete, prerequisite-respecting order', () => {
    const result = validateChunkOrder(['a', 'b', 'c'], chunks);
    expect(result.valid).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('accepts any order when there are no prerequisites', () => {
    const noPrereqs: ChunkOrderInput[] = [
      { id: 'x', prerequisites: [] },
      { id: 'y', prerequisites: [] },
    ];
    const result = validateChunkOrder(['y', 'x'], noPrereqs);
    expect(result.valid).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('rejects a duplicate id with a set_mismatch finding', () => {
    const result = validateChunkOrder(['a', 'a', 'b'], chunks);
    expect(result.valid).toBe(false);
    const f = result.findings.find(x => x.chunkId === 'a' && x.rule === 'order.set_mismatch');
    expect(f).toBeDefined();
    expect(f?.severity).toBe('blocking');
    expect(f?.category).toBe('order');
  });

  it('rejects an id that is not part of the topic', () => {
    const result = validateChunkOrder(['a', 'b', 'c', 'z'], chunks);
    expect(result.valid).toBe(false);
    expect(result.findings.some(f => f.chunkId === 'z' && f.rule === 'order.set_mismatch')).toBe(
      true
    );
  });

  it('rejects a missing chunk', () => {
    const result = validateChunkOrder(['a', 'b'], chunks);
    expect(result.valid).toBe(false);
    expect(result.findings.some(f => f.chunkId === 'c' && f.rule === 'order.set_mismatch')).toBe(
      true
    );
  });

  it('returns only set-mismatch findings when the set is malformed (no positional checks)', () => {
    const result = validateChunkOrder(['a', 'b'], chunks);
    expect(result.findings.every(f => f.rule === 'order.set_mismatch')).toBe(true);
  });

  it('rejects a chunk ordered before its prerequisite', () => {
    // c (prereq b) placed before b
    const result = validateChunkOrder(['a', 'c', 'b'], chunks);
    expect(result.valid).toBe(false);
    const f = result.findings.find(x => x.rule === 'order.prerequisite_violation');
    expect(f).toBeDefined();
    expect(f?.chunkId).toBe('c');
    expect(f?.detail).toContain('b');
  });

  it('rejects a chunk placed at the same position semantics as its prerequisite (self-reference)', () => {
    const selfRef: ChunkOrderInput[] = [{ id: 's', prerequisites: ['s'] }];
    const result = validateChunkOrder(['s'], selfRef);
    expect(result.valid).toBe(false);
    expect(result.findings.some(f => f.rule === 'order.prerequisite_violation')).toBe(true);
  });

  it('ignores prerequisites that are not part of the topic set', () => {
    const external: ChunkOrderInput[] = [
      { id: 'a', prerequisites: ['external-x'] },
      { id: 'b', prerequisites: ['a'] },
    ];
    const result = validateChunkOrder(['a', 'b'], external);
    expect(result.valid).toBe(true);
  });
});
