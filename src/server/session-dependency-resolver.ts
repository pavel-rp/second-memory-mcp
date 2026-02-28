import { logger } from '../shared/logger.js';
import { dependencyResolver } from '../domain/algorithms/dependency-resolver.js';
import { getChunk } from '../services/chunks.js';
import { mapChunkRowToLearningItem } from '../services/chunk-queries.js';

/**
 * Helper function to resolve dependencies and include prerequisites for session chunks
 * @param chunkIds Array of chunk IDs to resolve dependencies for
 * @returns Resolved topological order including original chunk IDs and any existing prerequisites
 */
export async function resolveSessionChunkDependencies(chunkIds: string[]): Promise<{
  resolvedChunkIds: string[];
  addedPrerequisites: string[];
  message: string;
}> {
  if (!chunkIds || chunkIds.length === 0) {
    return {
      resolvedChunkIds: [],
      addedPrerequisites: [],
      message: '',
    };
  }

  const inputChunkSet = new Set(chunkIds);
  const chunkMap = new Map<string, ReturnType<typeof mapChunkRowToLearningItem>>();
  const missingPrerequisites: string[] = [];
  const missingRequestedChunks: string[] = [];
  const queue: string[] = [...chunkIds];
  const visited = new Set<string>();

  try {
    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId || visited.has(currentId)) {
        continue;
      }
      visited.add(currentId);

      let item = chunkMap.get(currentId);
      if (!item) {
        const chunkRow = await getChunk(currentId);
        if (!chunkRow) {
          if (inputChunkSet.has(currentId)) {
            missingRequestedChunks.push(currentId);
          } else {
            missingPrerequisites.push(currentId);
          }
          logger.warn(
            `Skipping chunk ${currentId} while resolving session dependencies - not found in database`
          );
          continue;
        }
        item = mapChunkRowToLearningItem(chunkRow);
        chunkMap.set(currentId, item);
      }

      const prerequisites = item.prerequisites || [];
      for (const prereqId of prerequisites) {
        if (!visited.has(prereqId)) {
          queue.push(prereqId);
        }
      }
    }

    if (missingRequestedChunks.length > 0) {
      logger.warn(
        `Cannot resolve dependencies for missing requested chunks: ${missingRequestedChunks.join(', ')}`
      );
      return {
        resolvedChunkIds: chunkIds,
        addedPrerequisites: [],
        message: '',
      };
    }

    const relevantItems = Array.from(chunkMap.entries())
      .filter(([id]) => visited.has(id))
      .map(([, item]) => item);

    if (relevantItems.length === 0) {
      return {
        resolvedChunkIds: chunkIds,
        addedPrerequisites: [],
        message: '',
      };
    }

    // Resolve dependencies for selected chunks
    const resolution = await dependencyResolver.resolveDependencies(relevantItems, chunkIds);

    if (!resolution.isValid) {
      logger.warn('Dependency resolution failed for session chunks:', resolution.errors.join(', '));
      return {
        resolvedChunkIds: chunkIds,
        addedPrerequisites: [],
        message: '',
      };
    }

    const existingResolvedChain = resolution.resolvedChain.filter(id => chunkMap.has(id));
    const chunkIdSet = new Set(chunkIds);
    const addedPrerequisites = existingResolvedChain.filter(id => !chunkIdSet.has(id));

    const messageParts: string[] = [];
    if (addedPrerequisites.length > 0) {
      messageParts.push(
        `Automatically included ${addedPrerequisites.length} prerequisite${addedPrerequisites.length > 1 ? 's' : ''} to ensure proper learning progression.`
      );
    }

    if (missingPrerequisites.length > 0) {
      messageParts.push(
        `Skipped ${missingPrerequisites.length} missing prerequisite${missingPrerequisites.length > 1 ? 's' : ''}: ${missingPrerequisites.join(', ')}.`
      );
      logger.warn(
        `Skipped missing prerequisite chunks during session dependency resolution: ${missingPrerequisites.join(', ')}`
      );
    }

    const message = messageParts.length > 0 ? ` ${messageParts.join(' ')}` : '';

    return {
      resolvedChunkIds: existingResolvedChain,
      addedPrerequisites,
      message,
    };
  } catch (error) {
    logger.error('Error resolving session chunk dependencies:', error);
    return {
      resolvedChunkIds: chunkIds,
      addedPrerequisites: [],
      message: '',
    };
  }
}
