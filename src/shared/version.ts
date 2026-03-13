import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json') as { version: string };

export const SERVER_NAME = 'second-memory-learning';

export function getVersion(): string {
  return pkg.version;
}

export function getBuildTime(): string | null {
  return process.env.BUILD_TIME || null;
}

export function getServerInfo(): { name: string; version: string; buildTime: string | null } {
  return {
    name: SERVER_NAME,
    version: getVersion(),
    buildTime: getBuildTime(),
  };
}
