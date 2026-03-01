export class StubServer {
  public tools: string[] = [];
  registerTool(name: string, _spec: unknown, _handler: unknown) {
    this.tools.push(name);
  }
}
