import { describe, it, expect } from 'vitest';
import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';
import { randomUUID } from 'crypto';

describe('MCP Server stdout validation', () => {
  it('should not output any non-JSON content to stdout', async () => {
    // Use a temporary database for testing
    const tempDbPath = `test-mcp-${randomUUID()}.db`;
    
    // Spawn the MCP server with test database
    const server = spawn('node', ['dist/src/server/main.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        SM_DB_PATH: tempDbPath
      }
    });

    let stdoutData = '';
    let stderrData = '';
    let hasNonJsonOutput = false;
    let jsonLines: string[] = [];

    // Collect stdout data
    server.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdoutData += chunk;
      
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
    server.stderr.on('data', (data) => {
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
          version: '1.0.0'
        }
      }
    };

    // Wait a bit for server startup, then send request
    await setTimeout(500);
    server.stdin.write(JSON.stringify(request) + '\n');

    // Wait for response
    await setTimeout(1000);

    // Clean up
    server.kill();

    // Clean up temp database
    try {
      const fs = await import('fs');
      if (fs.existsSync(tempDbPath)) {
        fs.unlinkSync(tempDbPath);
      }
    } catch (error) {
      // Ignore cleanup errors
    }

    // Verify results
    expect(hasNonJsonOutput).toBe(false);
    expect(jsonLines.length).toBeGreaterThan(0);
    expect(stderrData.length).toBeGreaterThan(0); // Should have logs on stderr

    // Verify we got a proper JSON-RPC response
    const response = jsonLines.find(line => line.includes('"result"'));
    expect(response).toBeDefined();
    
    const parsedResponse = JSON.parse(response!);
    expect(parsedResponse.jsonrpc).toBe('2.0');
    expect(parsedResponse.result).toBeDefined();
    expect(parsedResponse.result.serverInfo.name).toBe('second-memory-learning');
  }, 10000); // 10 second timeout

  it('should output logs to stderr when in MCP mode', async () => {
    // Use a temporary database for testing
    const tempDbPath = `test-mcp-${randomUUID()}.db`;
    
    const server = spawn('node', ['dist/src/server/main.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        SM_DB_PATH: tempDbPath
      }
    });

    let stderrData = '';

    server.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    // Wait for server startup
    await setTimeout(1000);
    server.kill();

    // Clean up temp database
    try {
      const fs = await import('fs');
      if (fs.existsSync(tempDbPath)) {
        fs.unlinkSync(tempDbPath);
      }
    } catch (error) {
      // Ignore cleanup errors
    }

    // Should have log output on stderr
    expect(stderrData).toContain('[INFO]');
    expect(stderrData).toContain('Removed legacy tables');
  }, 5000);
});
