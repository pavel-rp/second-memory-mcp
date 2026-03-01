export class CaptureServer {
  public tools = new Map<string, { spec: any; handler: Function }>();
  registerTool(name: string, spec: any, handler: Function) {
    this.tools.set(name, { spec, handler });
  }
}

export function parseResult(out: any): any {
  return JSON.parse(out?.content?.[0]?.text);
}

export function parseToolResult(out: any): any {
  const text = out?.content?.[0]?.text;
  try {
    return JSON.parse(text);
  } catch {
    return out;
  }
}
