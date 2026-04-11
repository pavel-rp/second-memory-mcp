import 'dotenv/config';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { initializeDatabase } from '../infrastructure/db/migrate.js';
import { createAppContext } from '../composition-root.js';
import { resolveTransportConfig } from '../config/resolve-transport-config.js';
import { resolveAuthConfig } from '../config/resolve-auth-config.js';
import { createMcpServer } from './create-server.js';
import { startHttpTransport } from './http.js';
import { logger } from '../shared/logger.js';
import { getVersion, getBuildTime, SERVER_NAME } from '../shared/version.js';

process.on('uncaughtException', (err: Error) => {
  logger.fatal('Uncaught exception — shutting down', err);
  process.exit(1);
});

// Log but do not exit — unhandled rejections are not necessarily fatal
// for a long-running MCP server. Node ≥ 15 would exit by default;
// this handler overrides that to keep the process alive.
process.on('unhandledRejection', (reason: unknown) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  logger.fatal('Unhandled promise rejection', err);
});

async function bootstrap(): Promise<void> {
  await initializeDatabase();

  const buildTime = getBuildTime();
  const versionTag = buildTime
    ? `${SERVER_NAME} v${getVersion()} (built ${buildTime})`
    : `${SERVER_NAME} v${getVersion()}`;
  logger.info(versionTag);

  const ctx = createAppContext();
  const transportConfig = resolveTransportConfig();
  const authConfig = resolveAuthConfig(transportConfig.mode);

  if (transportConfig.mode === 'http') {
    await startHttpTransport(
      transportConfig,
      () => createMcpServer(ctx),
      authConfig,
      ctx.contextTokens
    );
  } else {
    const server = createMcpServer(ctx);
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
}

export const ready = bootstrap().catch(error => {
  logger.error('Failed to start MCP server:', error);
  process.exit(1);
});
