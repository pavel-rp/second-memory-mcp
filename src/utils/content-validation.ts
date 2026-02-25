import { VALIDATION_CONSTANTS } from '../constants/validation.js';

/**
 * Content validation utilities for chunk and topic content
 * Ensures content meets size requirements
 */

export type ContentValidationResult = {
  success: boolean;
  error?: string;
  warnings?: string[];
  sanitizedContent?: string;
};

export type ContentType = 'chunk' | 'summary';

/**
 * Validates content size based on type
 */
export function validateContentSize(content: string, type: ContentType): ContentValidationResult {
  if (!content || typeof content !== 'string') {
    return {
      success: false,
      error: 'Content must be a non-empty string',
    };
  }

  const trimmedContent = content.trim();
  if (trimmedContent.length < VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH) {
    return {
      success: false,
      error: `Content must be at least ${VALIDATION_CONSTANTS.MIN_CONTENT_LENGTH} character(s) long`,
    };
  }

  const maxSize =
    type === 'chunk'
      ? VALIDATION_CONSTANTS.MAX_CONTENT_SIZE
      : VALIDATION_CONSTANTS.MAX_SUMMARY_SIZE;
  if (trimmedContent.length > maxSize) {
    return {
      success: false,
      error: `${type === 'chunk' ? 'Chunk content' : 'Topic summary'} cannot exceed ${maxSize} characters (current: ${trimmedContent.length})`,
    };
  }

  return {
    success: true,
    sanitizedContent: trimmedContent,
  };
}
