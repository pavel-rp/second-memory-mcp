import { describe, it, expect, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';
import { randomUUID } from 'crypto';

describe('MCP Server stdout validation', () => {
  const tempDbFiles: string[] = [];

  afterEach(async () => {
    // Clean up all temporary database files
    for (const tempDbPath of tempDbFiles) {
      try {
        const fs = await import('fs');
        if (fs.existsSync(tempDbPath)) {
          fs.unlinkSync(tempDbPath);
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    tempDbFiles.length = 0; // Clear the array
  });
  it('should not output any non-JSON content to stdout', async () => {
    // Use a temporary database for testing
    const tempDbPath = `test-mcp-${randomUUID()}.db`;
    tempDbFiles.push(tempDbPath);

    // Spawn the MCP server with test database
    const server = spawn('node', ['dist/src/server/main.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        SM_DB_PATH: tempDbPath,
      },
    });

    let stderrData = '';
    let hasNonJsonOutput = false;
    const jsonLines: string[] = [];

    // Collect stdout data
    server.stdout.on('data', data => {
      const chunk = data.toString();

      // Split by lines and check each line
      const lines = chunk.split('\n').filter((line: string) => line.trim());
      for (const line of lines) {
        // Skip empty lines
        if (!line.trim()) continue;

        try {
          // Try to parse as JSON
          JSON.parse(line);
          jsonLines.push(line);
        } catch {
          // If it's not valid JSON, it's a problem
          hasNonJsonOutput = true;
          console.error(`Non-JSON output detected: "${line}"`);
        }
      }
    });

    // Collect stderr data (should contain logs)
    server.stderr.on('data', data => {
      stderrData += data.toString();
    });

    // Send a simple JSON-RPC initialize request
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0',
        },
      },
    };

    // Wait for server to be ready (stderr output indicates startup), then send request
    await new Promise<void>((resolve, reject) => {
      const timeout = global.setTimeout(() => resolve(), 3000);
      const onStderr = () => {
        global.clearTimeout(timeout);
        server.stderr.off('data', onStderr);
        resolve();
      };
      server.stderr.on('data', onStderr);
      server.on('error', reject);
    });
    server.stdin.write(JSON.stringify(request) + '\n');

    // Wait for JSON-RPC response on stdout
    await new Promise<void>(resolve => {
      const timeout = global.setTimeout(() => resolve(), 3000);
      const onData = () => {
        if (jsonLines.some(line => line.includes('"result"'))) {
          global.clearTimeout(timeout);
          server.stdout.off('data', onData);
          resolve();
        }
      };
      server.stdout.on('data', onData);
    });

    // Clean up
    server.kill();

    // Verify results
    expect(hasNonJsonOutput).toBe(false);
    expect(jsonLines.length).toBeGreaterThan(0);

    // Verify we got a proper JSON-RPC response
    const response = jsonLines.find(line => line.includes('"result"'));
    expect(response).toBeDefined();

    const parsedResponse = JSON.parse(response!);
    expect(parsedResponse.jsonrpc).toBe('2.0');
    expect(parsedResponse.result).toBeDefined();
    expect(parsedResponse.result.serverInfo.name).toBe('second-memory-learning');
  }, 10000); // 10 second timeout

  it('should not leak non-MCP output to stdout during startup', async () => {
    // Use a temporary database for testing
    const tempDbPath = `test-mcp-${randomUUID()}.db`;
    tempDbFiles.push(tempDbPath);

    const server = spawn('node', ['dist/src/server/main.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        SM_DB_PATH: tempDbPath,
      },
    });

    let stdoutData = '';

    server.stdout.on('data', data => {
      stdoutData += data.toString();
    });

    // Wait for server startup — stdout must stay clean (no logs, no banners)
    await setTimeout(2000);
    server.kill();

    // Before any JSON-RPC request, stdout must be empty
    expect(stdoutData).toBe('');
  }, 10000);
});
