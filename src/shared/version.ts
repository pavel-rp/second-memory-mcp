import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json') as { version: string };
const buildTimePath = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'build-time.txt');

export const SERVER_NAME = 'second-memory-learning';

export function getVersion(): string {
  return pkg.version;
}

export function getBuildTime(): string | null {
  if (process.env.BUILD_TIME !== undefined) return process.env.BUILD_TIME || null;
  try {
    return readFileSync(buildTimePath, 'utf-8').trim() || null;
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
