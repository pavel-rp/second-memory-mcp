/* eslint-disable no-console */
/**
 * Minimal logger wrapper used to centralize console output.
 * Keeping console usage isolated allows the rest of the codebase
 * to remain free of direct console statements.
 * 
 * For MCP servers, we redirect all output to stderr to avoid interfering
 * with JSON-RPC communication over stdout.
 */

/**
 * Check if a stream is not a TTY (terminal)
 */
function isNotTTY(stream: NodeJS.ReadStream | NodeJS.WriteStream): boolean {
  return stream.isTTY === false || stream.isTTY === undefined;
}

/**
 * Detect if we're running as an MCP server (stdio mode)
 * MCP servers run with stdin/stdout connected to Claude Desktop
 * When spawned by Claude Desktop, both stdin and stdout are pipes (not TTY)
 */
function isMcpMode(): boolean {
  return isNotTTY(process.stdin) && isNotTTY(process.stdout);
}

/**
 * Log a message with the appropriate method based on MCP mode
 */
function logMessage(level: string, messages: unknown[], fallbackMethod: (...args: unknown[]) => void): void {
  if (isMcpMode()) {
    console.error(`[${level}]`, ...messages);
  } else {
    fallbackMethod(...messages);
  }
}

export const logger = {
        info: (...messages: unknown[]): void => {
                logMessage('INFO', messages, console.info);
        },
        warn: (...messages: unknown[]): void => {
                logMessage('WARN', messages, console.warn);
        },
        error: (...messages: unknown[]): void => {
                logMessage('ERROR', messages, console.error);
        },
        debug: (...messages: unknown[]): void => {
                if (process.env.DEBUG) {
                        logMessage('DEBUG', messages, console.debug);
                }
        },
};
