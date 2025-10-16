import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { listChunksWithContent } from "../../src/services/chunks.js";
import { resetDatabase } from "../../src/db/client.js";
import { ensureSchema } from "../../src/db/migrate.js";
import { getSql } from "../../src/db/operations.js";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function tmpDbPath() {
	return path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}

function generateLargeContent(sizeInKB: number): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ";
	const charsPerKB = 1024;
	const totalChars = sizeInKB * charsPerKB;
	let content = "";
	
	for (let i = 0; i < totalChars; i++) {
		content += chars[Math.floor(Math.random() * chars.length)];
	}
	
	return content;
}

describe("Performance: Content Retrieval", () => {
	let dbFile: string;

	beforeEach(async () => {
		dbFile = tmpDbPath();
		process.env.SM_DB_PATH = dbFile;
		await resetDatabase(); // Reset singleton to pick up new path
		ensureSchema();
	});

	afterEach(async () => {
		await resetDatabase(); // Close database connection
		if (fs.existsSync(dbFile)) {
			fs.unlinkSync(dbFile);
		}
		if (fs.existsSync(`${dbFile}-shm`)) {
			fs.unlinkSync(`${dbFile}-shm`);
		}
		if (fs.existsSync(`${dbFile}-wal`)) {
			fs.unlinkSync(`${dbFile}-wal`);
		}
	});

	it("should handle 10+ items with content efficiently", async () => {
		const now = Date.now();
		const db = getSql();
		const itemCount = 15;
		const uniqueId = `topic-${now}-${Math.random()}`;

		// Create a topic first
		db.exec(`
			INSERT INTO learning_topics (id, title, subject, summary, summary_version, summary_updated_at, created_at, updated_at)
			VALUES ('${uniqueId}', 'Performance Test Topic', 'CS', NULL, NULL, NULL, ${now}, ${now})
		`);

		// Create multiple chunks with content
		for (let i = 1; i <= itemCount; i++) {
			const content = generateLargeContent(1); // 1KB content per item
			db.exec(`
				INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, last_reviewed_at, estimated_duration, chunk_type, prerequisites_json, tags_json, content, content_version, content_updated_at, created_at, updated_at)
				VALUES ('chunk-${now}-${i}', '${uniqueId}', 'Performance Test Chunk ${i}', 'CS', ${i % 10 + 1}, ${now + 86400000}, 2.5, 0, NULL, 20, 'new', '[]', '["performance"]', '${content}', 1, ${now}, ${now}, ${now})
			`);
		}

		const startTime = performance.now();
		const result = await listChunksWithContent({ includeContent: true });
		const endTime = performance.now();
		const responseTime = endTime - startTime;

		expect(result.items).toHaveLength(itemCount);
		expect(result.pagination.total).toBe(itemCount);
		expect(result.pagination.hasMore).toBe(false);

		// Verify all items have content
		for (const item of result.items) {
			expect(item.content).toBeDefined();
			expect(item.contentVersion).toBe(1);
			expect(item.contentUpdatedAt).toBe(now);
		}

		// Performance assertion: should complete within reasonable time
		// For 15 items with 1KB content each, should be well under 1 second
		expect(responseTime).toBeLessThan(1000); // 1 second
		
		console.log(`Retrieved ${itemCount} items with content in ${responseTime.toFixed(2)}ms`);
	});

	it("should handle large content efficiently", async () => {
		const now = Date.now();
		const db = getSql();
		const itemCount = 5;
		const contentSizeKB = 10; // 10KB per item
		const uniqueId = `topic-${now}-${Math.random()}`;

		// Create a topic first
		db.exec(`
			INSERT INTO learning_topics (id, title, subject, summary, summary_version, summary_updated_at, created_at, updated_at)
			VALUES ('${uniqueId}', 'Large Content Test Topic', 'CS', NULL, NULL, NULL, ${now}, ${now})
		`);

		// Create chunks with large content
		for (let i = 1; i <= itemCount; i++) {
			const content = generateLargeContent(contentSizeKB);
			db.exec(`
				INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, last_reviewed_at, estimated_duration, chunk_type, prerequisites_json, tags_json, content, content_version, content_updated_at, created_at, updated_at)
				VALUES ('chunk-${now}-${i}', '${uniqueId}', 'Large Content Chunk ${i}', 'CS', ${i % 10 + 1}, ${now + 86400000}, 2.5, 0, NULL, 20, 'new', '[]', '["large-content"]', '${content}', 1, ${now}, ${now}, ${now})
			`);
		}

		const startTime = performance.now();
		const result = await listChunksWithContent({ includeContent: true });
		const endTime = performance.now();
		const responseTime = endTime - startTime;

		expect(result.items).toHaveLength(itemCount);
		expect(result.pagination.total).toBe(itemCount);

		// Verify content size
		for (const item of result.items) {
			expect(item.content).toBeDefined();
			expect(item.content!.length).toBeGreaterThan(contentSizeKB * 1024 * 0.9); // Allow some variance
		}

		// Performance assertion: should handle large content efficiently
		expect(responseTime).toBeLessThan(2000); // 2 seconds for 50KB total content
		
		console.log(`Retrieved ${itemCount} items with ${contentSizeKB}KB content each in ${responseTime.toFixed(2)}ms`);
	});

	it("should handle pagination efficiently with large datasets", async () => {
		const now = Date.now();
		const db = getSql();
		const totalItems = 50;
		const pageSize = 10;
		const uniqueId = `topic-${now}-${Math.random()}`;

		// Create a topic first
		db.exec(`
			INSERT INTO learning_topics (id, title, subject, summary, summary_version, summary_updated_at, created_at, updated_at)
			VALUES ('${uniqueId}', 'Pagination Test Topic', 'CS', NULL, NULL, NULL, ${now}, ${now})
		`);

		// Create many chunks
		for (let i = 1; i <= totalItems; i++) {
			const content = generateLargeContent(0.5); // 0.5KB content per item
			db.exec(`
				INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, last_reviewed_at, estimated_duration, chunk_type, prerequisites_json, tags_json, content, content_version, content_updated_at, created_at, updated_at)
				VALUES ('chunk-${now}-${i}', '${uniqueId}', 'Pagination Test Chunk ${i}', 'CS', ${i % 10 + 1}, ${now + 86400000}, 2.5, 0, NULL, 20, 'new', '[]', '["pagination"]', '${content}', 1, ${now}, ${now}, ${now})
			`);
		}

		// Test pagination performance
		const startTime = performance.now();
		
		// Test first page
		const page1 = await listChunksWithContent({ 
			includeContent: true, 
			limit: pageSize, 
			offset: 0 
		});
		
		// Test middle page
		const page3 = await listChunksWithContent({ 
			includeContent: true, 
			limit: pageSize, 
			offset: pageSize * 2 
		});
		
		// Test last page
		const lastPage = await listChunksWithContent({ 
			includeContent: true, 
			limit: pageSize, 
			offset: pageSize * 4 
		});
		
		const endTime = performance.now();
		const totalTime = endTime - startTime;

		// Verify pagination results
		expect(page1.items).toHaveLength(pageSize);
		expect(page1.pagination.total).toBe(totalItems);
		expect(page1.pagination.hasMore).toBe(true);
		expect(page1.pagination.offset).toBe(0);

		expect(page3.items).toHaveLength(pageSize);
		expect(page3.pagination.hasMore).toBe(true);
		expect(page3.pagination.offset).toBe(pageSize * 2);

		expect(lastPage.items).toHaveLength(pageSize);
		expect(lastPage.pagination.hasMore).toBe(false);
		expect(lastPage.pagination.offset).toBe(pageSize * 4);

		// Performance assertion: pagination should be efficient
		expect(totalTime).toBeLessThan(1500); // 1.5 seconds for 3 paginated queries
		
		console.log(`Pagination test with ${totalItems} items completed in ${totalTime.toFixed(2)}ms`);
	});

	it("should handle mixed content scenarios efficiently", async () => {
		const now = Date.now();
		const db = getSql();
		const itemCount = 20;
		const uniqueId = `topic-${now}-${Math.random()}`;

		// Create a topic first
		db.exec(`
			INSERT INTO learning_topics (id, title, subject, summary, summary_version, summary_updated_at, created_at, updated_at)
			VALUES ('${uniqueId}', 'Mixed Content Test Topic', 'CS', NULL, NULL, NULL, ${now}, ${now})
		`);

		// Create chunks with mixed content scenarios
		for (let i = 1; i <= itemCount; i++) {
			const hasContent = i % 3 !== 0; // Every 3rd item has no content
			const content = hasContent ? generateLargeContent(2) : null;
			const contentVersion = hasContent ? 1 : null;
			const contentUpdatedAt = hasContent ? now : null;
			
			db.exec(`
				INSERT INTO learning_chunks (id, topic_id, title, subject, difficulty, next_review_at, ease_factor, repetitions, last_reviewed_at, estimated_duration, chunk_type, prerequisites_json, tags_json, content, content_version, content_updated_at, created_at, updated_at)
				VALUES ('chunk-${now}-${i}', '${uniqueId}', 'Mixed Content Chunk ${i}', 'CS', ${i % 10 + 1}, ${now + 86400000}, 2.5, 0, NULL, 20, 'new', '[]', '["mixed"]', ${content ? `'${content}'` : 'NULL'}, ${contentVersion || 'NULL'}, ${contentUpdatedAt || 'NULL'}, ${now}, ${now})
			`);
		}

		const startTime = performance.now();
		const result = await listChunksWithContent({ includeContent: true });
		const endTime = performance.now();
		const responseTime = endTime - startTime;

		expect(result.items).toHaveLength(itemCount);
		expect(result.pagination.total).toBe(itemCount);

		// Verify mixed content handling
		let itemsWithContent = 0;
		let itemsWithoutContent = 0;
		
		for (const item of result.items) {
			if (item.content) {
				itemsWithContent++;
				expect(item.contentVersion).toBeDefined();
				expect(item.contentUpdatedAt).toBeDefined();
			} else {
				itemsWithoutContent++;
				expect(item.contentVersion).toBeUndefined();
				expect(item.contentUpdatedAt).toBeUndefined();
			}
		}

		expect(itemsWithContent).toBeGreaterThan(0);
		expect(itemsWithoutContent).toBeGreaterThan(0);

		// Performance assertion: should handle mixed scenarios efficiently
		expect(responseTime).toBeLessThan(1000); // 1 second
		
		console.log(`Mixed content test with ${itemCount} items (${itemsWithContent} with content, ${itemsWithoutContent} without) completed in ${responseTime.toFixed(2)}ms`);
	});
});
