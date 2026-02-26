#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

/**
 * Clean up temporary test files that may be left over from test runs
 */
function cleanupTestFiles() {
  const patterns = [
    'tmp-test-*.db',
    'tmp-test-*.db-shm',
    'tmp-test-*.db-wal',
    'tmp-data-*.json',
    'test-mcp-*.db',
    'test-mcp-*.db-shm',
    'test-mcp-*.db-wal',
  ];

  let cleanedCount = 0;

  try {
    const files = fs.readdirSync(projectRoot);

    for (const file of files) {
      // Check if file matches any of our temporary file patterns
      const isTestFile = patterns.some(pattern => {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(file);
      });

      if (isTestFile) {
        const filePath = path.join(projectRoot, file);
        try {
          fs.unlinkSync(filePath);
          cleanedCount++;
          console.log(`Removed: ${file}`);
        } catch (error) {
          console.warn(`Failed to remove ${file}: ${error.message}`);
        }
      }
    }

    if (cleanedCount === 0) {
      console.log('No temporary test files found to clean up.');
    } else {
      console.log(`Cleaned up ${cleanedCount} temporary test file(s).`);
    }
  } catch (error) {
    console.error('Error during cleanup:', error.message);
    throw error;
  }
}

export { cleanupTestFiles };

// Run cleanup when script is executed directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  cleanupTestFiles();
}