import { fileURLToPath } from 'node:url';
import pino from 'pino';
import { getVersion } from './version.js';

function isNotTTY(stream: NodeJS.ReadStream | NodeJS.WriteStream): boolean {
  return stream.isTTY === false || stream.isTTY === undefined;
}

export function isMcpMode(): boolean {
  return isNotTTY(process.stdin) && isNotTTY(process.stdout);
}

const PINO_LEVELS = new Set(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']);

function resolveLevel(): string {
  const env = process.env.LOG_LEVEL;
  if (env && PINO_LEVELS.has(env)) return env;
  if (process.env.DEBUG) return 'debug';
  return 'info';
}

export const pinoLogger = pino(
  {
    level: resolveLevel(),
    base: { service: 'second-memory-mcp', version: getVersion() },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  isMcpMode() ? pino.destination(2) : undefined
);

/**
 * Variadic adapter: maps `logger.info(msg, ...args)` call-site patterns
 * to pino's `logger.info(mergingObject, msg)` convention.
 *
 * - Trailing Error → serialized as `err` merging object
 * - Trailing plain object → merged into the log entry
 * - Multiple string args → joined with spaces
 */
function adapt(method: pino.LogFn): (...messages: unknown[]) => void {
  return (...messages: unknown[]): void => {
    if (messages.length === 0) {
      method('');
      return;
    }

    const last = messages[messages.length - 1];
    const init = messages.slice(0, -1);

    if (last instanceof Error) {
      const msg = init.map(String).join(' ');
      method({ err: last }, msg || last.message);
    } else if (typeof last === 'object' && last !== null && !Array.isArray(last)) {
      const msg = init.map(String).join(' ');
      method(last as Record<string, unknown>, msg);
    } else {
      method(messages.map(String).join(' '));
    }
  };
}

export const logger = {
  info: adapt(pinoLogger.info.bind(pinoLogger)),
  warn: adapt(pinoLogger.warn.bind(pinoLogger)),
  error: adapt(pinoLogger.error.bind(pinoLogger)),
  debug: adapt(pinoLogger.debug.bind(pinoLogger)),
  child: pinoLogger.child.bind(pinoLogger),
};

/**
 * Create a pino logger instance wired to the pg-audit-transport.
 * Used by the HTTP transport to pipe audit middleware entries to Postgres.
 */
export function createAuditPinoLogger(connectionString: string): pino.Logger {
  const transportPath = fileURLToPath(
    new URL('../transport/pg-audit-transport.js', import.meta.url)
  );
  const transport = pino.transport({
    target: transportPath,
    options: { connectionString },
  });
  return pino(
    {
      level: 'info',
      base: { service: 'second-memory-mcp', version: getVersion() },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    transport
  );
}
