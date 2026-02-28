/**
 * Port interface for chunk ID lookups.
 * Used by PrerequisiteReferenceValidator to validate prerequisite references.
 */
export interface ChunkIdLookupPort {
  getExistingIdsByIds(ids: string[]): Promise<Set<string>>;
  getAllIds(): Promise<Set<string>>;
}
