/**
 * Content similarity utilities for detecting significant content changes
 * Uses Levenshtein distance for accurate change detection beyond simple length comparison
 */

/**
 * Maximum string length for Levenshtein distance calculation.
 * Strings longer than this will fall back to length-based comparison for performance.
 */
const MAX_LEVENSHTEIN_LENGTH = 10000;

/**
 * Calculate Levenshtein distance between two strings
 * The Levenshtein distance is the minimum number of single-character edits
 * (insertions, deletions, or substitutions) required to change one string into another
 * 
 * This implementation uses O(min(m,n)) space instead of O(m*n) by keeping only two rows.
 * 
 * @param str1 First string
 * @param str2 Second string
 * @returns The Levenshtein distance (minimum number of edits required)
 */
export function calculateLevenshteinDistance(str1: string, str2: string): number {
	let len1 = str1.length;
	let len2 = str2.length;

	// Ensure str1 is the shorter string to minimize space usage
	if (len1 > len2) {
		[str1, str2] = [str2, str1];
		[len1, len2] = [len2, len1];
	}

	// Use only two rows instead of full matrix: O(min(m,n)) space
	let prevRow: number[] = Array(len1 + 1).fill(0);
	let currRow: number[] = Array(len1 + 1).fill(0);

	// Initialize first row
	for (let i = 0; i <= len1; i++) {
		prevRow[i] = i;
	}

	// Fill rows iteratively
	for (let j = 1; j <= len2; j++) {
		currRow[0] = j;

		for (let i = 1; i <= len1; i++) {
			if (str1[i - 1] === str2[j - 1]) {
				currRow[i] = prevRow[i - 1];
			} else {
				currRow[i] = Math.min(
					prevRow[i] + 1,      // deletion
					currRow[i - 1] + 1,  // insertion
					prevRow[i - 1] + 1   // substitution
				);
			}
		}

		// Swap rows for next iteration
		[prevRow, currRow] = [currRow, prevRow];
	}

	return prevRow[len1];
}

/**
 * Calculate similarity ratio between two strings using Levenshtein distance
 * 
 * For strings longer than MAX_LEVENSHTEIN_LENGTH, falls back to a length-based heuristic
 * to avoid excessive memory usage and computation time.
 * 
 * @param str1 First string
 * @param str2 Second string
 * @returns Similarity ratio between 0 and 1, where 1 means identical strings
 */
export function calculateSimilarityRatio(str1: string, str2: string): number {
	if (str1 === str2) {
		return 1.0;
	}

	if (str1.length === 0 && str2.length === 0) {
		return 1.0;
	}

	if (str1.length === 0 || str2.length === 0) {
		return 0.0;
	}

	const maxLength = Math.max(str1.length, str2.length);

	// For very large strings, use a hybrid approach:
	// Compare length + sample content to avoid performance issues
	if (maxLength > MAX_LEVENSHTEIN_LENGTH) {
		const lengthDiff = Math.abs(str1.length - str2.length);
		const lengthSimilarity = 1 - lengthDiff / maxLength;
		
		// Sample beginning, middle, and end to detect content changes
		const sampleSize = 100;
		const midPoint = Math.floor(Math.min(str1.length, str2.length) / 2);
		
		const sample1 = str1.slice(0, sampleSize) + 
			str1.slice(midPoint, midPoint + sampleSize) + 
			str1.slice(-sampleSize);
		const sample2 = str2.slice(0, sampleSize) + 
			str2.slice(midPoint, midPoint + sampleSize) + 
			str2.slice(-sampleSize);
		
		// Calculate similarity on samples using Levenshtein
		const sampleDistance = calculateLevenshteinDistance(sample1, sample2);
		const sampleMaxLength = Math.max(sample1.length, sample2.length);
		const contentSimilarity = 1 - sampleDistance / sampleMaxLength;
		
		// Combine both similarities (weighted average)
		const similarity = (lengthSimilarity * 0.3 + contentSimilarity * 0.7);
		return Math.max(0, Math.min(1, similarity));
	}

	const distance = calculateLevenshteinDistance(str1, str2);
	const similarity = 1 - distance / maxLength;

	return Math.max(0, Math.min(1, similarity));
}

/**
 * Check if content has changed significantly based on similarity threshold
 * 
 * @param currentContent Current content
 * @param newContent New content
 * @param threshold Similarity threshold (0-1). Content is considered significantly changed if similarity falls below this value. Default is 0.5 (50% similar)
 * @returns True if content has changed significantly (similarity below threshold)
 */
export function hasSignificantContentChange(
	currentContent: string,
	newContent: string,
	threshold = 0.5
): boolean {
	const similarity = calculateSimilarityRatio(currentContent, newContent);
	return similarity < threshold;
}
