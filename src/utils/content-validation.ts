import { VALIDATION_CONSTANTS } from '../constants/validation.js';

/**
 * Educational content detection patterns
 */
const EDUCATIONAL_PATTERNS = [
  /\b(learn|understand|explain|example|concept|definition|practice|exercise|tutorial|guide)\b/gi,
  /\b(step|steps|process|method|approach|technique|strategy)\b/gi,
  /\b(because|therefore|however|furthermore|moreover|additionally)\b/gi,
  /\?|\.|:|;/, // Question marks, periods, colons, semicolons indicate structured content
] as const;

/**
 * Content validation utilities for chunk and topic content
 * Ensures content meets size, format, and security requirements
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

/**
 * Validates content format and checks for potential security issues
 */
export function validateContentFormat(content: string): ContentValidationResult {
  if (!content || typeof content !== 'string') {
    return {
      success: false,
      error: 'Content must be a non-empty string',
    };
  }

  const warnings: string[] = [];

  // Check for potential script injection
  const scriptPattern = /<script[^>]*>[\s\S]*?<\/script>/gi;
  if (scriptPattern.test(content)) {
    return {
      success: false,
      error: 'Content cannot contain script tags',
    };
  }

  // Check for potential HTML injection (basic check)
  const htmlPattern = /<[^>]+>/g;
  if (htmlPattern.test(content)) {
    warnings.push('Content contains HTML tags - ensure they are safe and intentional');
  }

  // Check for potential URL injection
  const urlPattern = /(javascript|data|vbscript):/gi;
  if (urlPattern.test(content)) {
    return {
      success: false,
      error: 'Content cannot contain potentially unsafe URL schemes',
    };
  }

  // Check for excessive whitespace
  const excessiveWhitespacePattern = /\s{5,}/g;
  if (excessiveWhitespacePattern.test(content)) {
    warnings.push('Content contains excessive whitespace - consider cleaning up formatting');
  }

  return {
    success: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Sanitizes content by removing or escaping potentially harmful elements
 */
export function sanitizeContent(
  content: string,
  options: { preserveBasicMarkdown?: boolean; preserveNewlines?: boolean } = {}
): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let sanitized = content;

  // Remove script tags completely
  sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove dangerous URL schemes
  sanitized = sanitized.replace(/(javascript|data|vbscript):/gi, 'unsafe:');

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s{5,}/g, '    '); // Replace with max 4 spaces

  // Normalize line endings
  if (options.preserveNewlines) {
    sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  } else {
    // Convert multiple newlines to single newlines
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
  }

  // If preserving basic markdown, keep common markdown characters
  if (!options.preserveBasicMarkdown) {
    // Remove potentially problematic characters that could be used for injection
    sanitized = sanitized.replace(/[<>"']/g, char => {
      switch (char) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        case "'":
          return '&#x27;';
        default:
          return char;
      }
    });
  }

  return sanitized.trim();
}

/**
 * Comprehensive content validation that combines size, format, and security checks
 */
export function validateContent(
  content: string,
  type: ContentType,
  options: { sanitize?: boolean; preserveBasicMarkdown?: boolean } = {}
): ContentValidationResult {
  // First validate size
  const sizeValidation = validateContentSize(content, type);
  if (!sizeValidation.success) {
    return sizeValidation;
  }

  // Then validate format and security
  const formatValidation = validateContentFormat(sizeValidation.sanitizedContent || '');
  if (!formatValidation.success) {
    return formatValidation;
  }

  // Optionally sanitize content
  let finalContent = sizeValidation.sanitizedContent || '';
  if (options.sanitize) {
    finalContent = sanitizeContent(finalContent, {
      preserveBasicMarkdown: options.preserveBasicMarkdown,
      preserveNewlines: true,
    });
  }

  return {
    success: true,
    warnings: formatValidation.warnings,
    sanitizedContent: finalContent,
  };
}

/**
 * Validates an array of content items (useful for batch operations)
 */
export function validateContentBatch(
  contentItems: Array<{ content: string; type: ContentType; id?: string }>,
  options: { sanitize?: boolean; preserveBasicMarkdown?: boolean } = {}
): Array<ContentValidationResult & { id?: string }> {
  return contentItems.map(item => ({
    ...validateContent(item.content, item.type, options),
    id: item.id,
  }));
}

/**
 * Utility function to check if content is likely educational/learning content
 */
export function isEducationalContent(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }

  return EDUCATIONAL_PATTERNS.some(pattern => pattern.test(content));
}

/**
 * Estimates reading time for content (useful for learning time estimation)
 */
export function estimateReadingTime(content: string, wordsPerMinute: number = 200): number {
  if (!content || typeof content !== 'string') {
    return 0;
  }

  // Count words (simple word counting)
  const words = content
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);
  const readingTimeMinutes = words.length / wordsPerMinute;

  // Round up to nearest minute, minimum 1 minute
  return Math.max(1, Math.ceil(readingTimeMinutes));
}
