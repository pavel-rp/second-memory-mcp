/**
 * Content similarity utilities for detecting significant content changes
 * Uses Levenshtein distance for accurate change detection beyond simple length comparison
 */

/**
 * Calculate Levenshtein distance between two strings
 * The Levenshtein distance is the minimum number of single-character edits
 * (insertions, deletions, or substitutions) required to change one string into another
 * 
 * @param str1 First string
 * @param str2 Second string
 * @returns The Levenshtein distance (minimum number of edits required)
 */
export function calculateLevenshteinDistance(str1: string, str2: string): number {
	const len1 = str1.length;
	const len2 = str2.length;

	// Create a 2D array for dynamic programming
	const dp: number[][] = Array(len1 + 1)
		.fill(null)
		.map(() => Array(len2 + 1).fill(0));

	// Initialize base cases
	for (let i = 0; i <= len1; i++) {
		dp[i][0] = i;
	}
	for (let j = 0; j <= len2; j++) {
		dp[0][j] = j;
	}

	// Fill the DP table
	for (let i = 1; i <= len1; i++) {
		for (let j = 1; j <= len2; j++) {
			if (str1[i - 1] === str2[j - 1]) {
				dp[i][j] = dp[i - 1][j - 1];
			} else {
				dp[i][j] = Math.min(
					dp[i - 1][j] + 1, // deletion
					dp[i][j - 1] + 1, // insertion
					dp[i - 1][j - 1] + 1 // substitution
				);
			}
		}
	}

	return dp[len1][len2];
}

/**
 * Calculate similarity ratio between two strings using Levenshtein distance
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

	const distance = calculateLevenshteinDistance(str1, str2);
	const maxLength = Math.max(str1.length, str2.length);
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
