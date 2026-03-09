import 'dotenv/config';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { initializeDatabase } from '../infrastructure/db/migrate.js';
import { createAppContext } from '../composition-root.js';
import { resolveTransportConfig } from '../config/resolve-transport-config.js';
import { resolveAuthConfig } from '../config/resolve-auth-config.js';
import { createMcpServer } from './create-server.js';
import { startHttpTransport } from './http.js';
import { logger } from '../shared/logger.js';

async function bootstrap(): Promise<void> {
  await initializeDatabase();

  const ctx = createAppContext();
  const transportConfig = resolveTransportConfig();
  const authConfig = resolveAuthConfig(transportConfig.mode);

  if (transportConfig.mode === 'http') {
    await startHttpTransport(transportConfig, () => createMcpServer(ctx), authConfig);
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
