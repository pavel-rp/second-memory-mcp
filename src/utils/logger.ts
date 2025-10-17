/* eslint-disable no-console */
/**
 * Minimal logger wrapper used to centralize console output.
 * Keeping console usage isolated allows the rest of the codebase
 * to remain free of direct console statements.
 * 
 * For MCP servers, we redirect all output to stderr to avoid interfering
 * with JSON-RPC communication over stdout.
 */
// Detect if we're running as an MCP server (stdio mode)
// MCP servers run with stdin/stdout connected to Claude Desktop
// When spawned by Claude Desktop, both stdin and stdout are pipes (not TTY)
// Also check for undefined values (which indicate non-TTY in some environments)
const isMcpMode = (process.stdin.isTTY === false || process.stdin.isTTY === undefined) && 
                  (process.stdout.isTTY === false || process.stdout.isTTY === undefined);


export const logger = {
        info: (...messages: unknown[]): void => {
                if (isMcpMode) {
                        console.error('[INFO]', ...messages);
                } else {
                        console.info(...messages);
                }
        },
        warn: (...messages: unknown[]): void => {
                if (isMcpMode) {
                        console.error('[WARN]', ...messages);
                } else {
                        console.warn(...messages);
                }
        },
        error: (...messages: unknown[]): void => {
                if (isMcpMode) {
                        console.error('[ERROR]', ...messages);
                } else {
                        console.error(...messages);
                }
        },
        debug: (...messages: unknown[]): void => {
                if (process.env.DEBUG) {
                        if (isMcpMode) {
                                console.error('[DEBUG]', ...messages);
                        } else {
                                console.debug(...messages);
                        }
                }
        },
};
