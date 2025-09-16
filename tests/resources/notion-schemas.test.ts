import { describe, it, expect } from "vitest";
import { getSchemas } from "../../src/resources/notion-schemas.js";

describe("notion-schemas resource", () => {
	it("has version and required sections", () => {
		const res = getSchemas();
		expect(res.schema_version).toMatch(/\d+\.\d+\.\d+/);
		expect(res.schemas.learning_topics).toBeTruthy();
		expect(res.schemas.learning_chunks).toBeTruthy();
		expect(res.schemas.review_schedule).toBeTruthy();
		expect(res.schemas.performance_analytics).toBeTruthy();
		expect(res.schemas.session_logs).toBeTruthy();
		expect(typeof res.usage_notes).toBe("string");
	});
});


