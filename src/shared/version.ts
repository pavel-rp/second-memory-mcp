import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json') as { version: string };

export const SERVER_NAME = 'second-memory-learning';

export function getVersion(): string {
  return pkg.version;
}

export function getBuildTime(): string | null {
  if (process.env.BUILD_TIME) return process.env.BUILD_TIME;
  try {
    return readFileSync('build-time.txt', 'utf-8').trim() || null;
  } catch {
    return null;
  }
}

export function getServerInfo(): { name: string; version: string; buildTime: string | null } {
  return {
    name: SERVER_NAME,
    version: getVersion(),
    buildTime: getBuildTime(),
  };
}
