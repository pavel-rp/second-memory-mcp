import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all dependencies BEFORE importing main.ts
const mockInitializeDatabase = vi.fn().mockResolvedValue(undefined);
const mockCreateAppContext = vi.fn().mockReturnValue({ fake: true, contextTokenTtlMs: 7_200_000 });
const mockResolveTransportConfig = vi.fn();
const mockResolveAuthConfig = vi.fn().mockReturnValue(null);
const mockCreateMcpServer = vi.fn();
const mockStartHttpTransport = vi.fn().mockResolvedValue({ close: vi.fn() });
const mockConnect = vi.fn().mockResolvedValue(undefined);

vi.mock('dotenv/config', () => ({}));

vi.mock('../../../src/infrastructure/db/migrate.js', () => ({
  initializeDatabase: mockInitializeDatabase,
}));

vi.mock('../../../src/composition-root.js', () => ({
  createAppContext: mockCreateAppContext,
}));

vi.mock('../../../src/config/resolve-transport-config.js', () => ({
  resolveTransportConfig: mockResolveTransportConfig,
}));

vi.mock('../../../src/config/resolve-auth-config.js', () => ({
  resolveAuthConfig: mockResolveAuthConfig,
}));

vi.mock('../../../src/transport/create-server.js', () => ({
  createMcpServer: mockCreateMcpServer,
}));

vi.mock('../../../src/transport/http.js', () => ({
  startHttpTransport: mockStartHttpTransport,
}));

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: vi.fn(),
}));

vi.mock('../../../src/shared/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('transport/main bootstrap', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockInitializeDatabase.mockResolvedValue(undefined);
    mockStartHttpTransport.mockResolvedValue({ close: vi.fn() });
  });

  it('bootstraps stdio transport by default', async () => {
    mockResolveTransportConfig.mockReturnValue({
      mode: 'stdio',
      httpPort: 3000,
      httpHost: '0.0.0.0',
    });
    const mockServer = { connect: mockConnect };
    mockCreateMcpServer.mockReturnValue(mockServer);

    const { ready } = await import('../../../src/transport/main.js');
    await ready;

    expect(mockInitializeDatabase).toHaveBeenCalled();
    expect(mockCreateAppContext).toHaveBeenCalled();
    expect(mockResolveTransportConfig).toHaveBeenCalled();
    expect(mockCreateMcpServer).toHaveBeenCalled();
    expect(mockConnect).toHaveBeenCalled();
    expect(mockStartHttpTransport).not.toHaveBeenCalled();
  });

  it('bootstraps http transport when configured', async () => {
    mockResolveTransportConfig.mockReturnValue({
      mode: 'http',
      httpPort: 8080,
      httpHost: '127.0.0.1',
    });
    // Invoke the factory callback so coverage records the inner arrow function
    mockStartHttpTransport.mockImplementation(
      async (_config: unknown, factory: () => unknown, _authConfig: unknown) => {
        factory();
        return { close: vi.fn() };
      }
    );

    const { ready } = await import('../../../src/transport/main.js');
    await ready;

    expect(mockInitializeDatabase).toHaveBeenCalled();
    expect(mockStartHttpTransport).toHaveBeenCalledWith(
      { mode: 'http', httpPort: 8080, httpHost: '127.0.0.1' },
      expect.any(Function),
      null,
      undefined,
      7_200_000
    );
    expect(mockCreateMcpServer).toHaveBeenCalled();
  });

  it('logs and exits on bootstrap failure', async () => {
    mockInitializeDatabase.mockRejectedValue(new Error('DB init failed'));
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const { logger } = await import('../../../src/shared/logger.js');

    const { ready } = await import('../../../src/transport/main.js');
    await ready;

    expect(logger.error).toHaveBeenCalledWith('Failed to start MCP server:', expect.any(Error));
    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });
});
