import { describe, it, expect } from "vitest";
import { registerServerResources } from "../../src/server/resources.js";

class StubServer {
	public resources: string[] = [];
	registerResource(name: string, _template: unknown, _meta: unknown, _handler: unknown) {
		this.resources.push(name);
	}
}

describe("registerServerResources", () => {
	it("registers notion_schemas resource", () => {
		const stub = new StubServer() as any;
		registerServerResources(stub);
		expect(stub.resources).toContain("notion_schemas");
	});
});


