import { spawn } from "node:child_process";

// Robust JSON-RPC over stdio (Content-Length framing)
function send(child, message) {
  const body = Buffer.from(JSON.stringify(message), "utf8");
  const header = Buffer.from(`Content-Length: ${body.length}\r\n\r\n`, "utf8");
  child.stdin.write(Buffer.concat([header, body]));
}

function req(id, method, params = {}) {
  return { jsonrpc: "2.0", id, method, params };
}

async function run() {
  const child = spawn("node", ["dist/server/main.js"], {
    cwd: new URL("../", import.meta.url).pathname,
    stdio: ["pipe", "pipe", "inherit"],
    env: process.env,
    shell: true,
  });

  let buffer = Buffer.alloc(0);
  const responses = new Map();

  child.stdout.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (true) {
      const headerEnd = buffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) break;
      const header = buffer.subarray(0, headerEnd).toString("utf8");
      const match = /Content-Length:\s*(\d+)/i.exec(header);
      if (!match) {
        // Drop invalid header
        buffer = buffer.subarray(headerEnd + 4);
        continue;
      }
      const length = parseInt(match[1], 10);
      const messageStart = headerEnd + 4;
      if (buffer.length < messageStart + length) break; // Wait for full body
      const bodyBuf = buffer.subarray(messageStart, messageStart + length);
      buffer = buffer.subarray(messageStart + length);
      try {
        const msg = JSON.parse(bodyBuf.toString("utf8"));
        if (Object.prototype.hasOwnProperty.call(msg, "id")) {
          responses.set(msg.id, msg);
        }
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    }
  });

  // 1) initialize
  send(child, req(1, "initialize", {
    capabilities: { prompts: {} },
    clientInfo: { name: "test-prompts", version: "0.0.0" },
  }));

  await waitFor(responses, 1, 5000, "initialize timeout");

  // 2) notifications/initialized
  send(child, { jsonrpc: "2.0", method: "notifications/initialized", params: {} });

  // 3) prompts/list
  send(child, req(2, "prompts/list", {}));
  await waitFor(responses, 2, 5000, "prompts/list timeout");
  const prompts = responses.get(2)?.result?.prompts ?? [];
  console.log("Found prompts:", prompts.map(p => p.name).join(", "));

  // 4) prompts/get for each
  let nextId = 10;
  for (const p of prompts) {
    const id = nextId++;
    send(child, req(id, "prompts/get", { name: p.name, arguments: {} }));
    await waitFor(responses, id, 5000, `prompts/get ${p.name} timeout`);
    const prompt = responses.get(id)?.result?.prompt;
    const text = prompt?.messages?.[0]?.content?.[0]?.text ?? "<no text>";
    console.log(`\n[${p.name}]`, text.slice(0, 180).replace(/\n/g, " ") + (text.length > 180 ? "..." : ""));
  }

  // 5) shutdown
  send(child, req(999, "shutdown", {}));
  child.kill();
}

function waitFor(map, id, timeoutMs, label) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const tick = () => {
      if (map.has(id)) return resolve();
      if (Date.now() > deadline) return reject(new Error(label));
      setTimeout(tick, 25);
    };
    tick();
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


