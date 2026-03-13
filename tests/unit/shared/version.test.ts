import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return {
    ...actual,
    readFileSync: vi.fn(() => {
      throw new Error('ENOENT: no such file or directory');
    }),
  };
});

import { readFileSync } from 'node:fs';
import { getVersion, getBuildTime, getServerInfo } from '../../../src/shared/version.js';

const mockedReadFileSync = vi.mocked(readFileSync);

describe('version utility', () => {
  let originalBuildTime: string | undefined;

  beforeEach(() => {
    originalBuildTime = process.env.BUILD_TIME;
    mockedReadFileSync.mockClear();
  });

  afterEach(() => {
    if (originalBuildTime === undefined) {
      delete process.env.BUILD_TIME;
    } else {
      process.env.BUILD_TIME = originalBuildTime;
    }
  });

  describe('getVersion', () => {
    it('returns a semver-like version string', () => {
      const version = getVersion();
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('returns a non-empty string', () => {
      expect(getVersion()).toBeTruthy();
    });
  });

  describe('getBuildTime', () => {
    it('returns null when BUILD_TIME is unset', () => {
      delete process.env.BUILD_TIME;
      expect(getBuildTime()).toBeNull();
    });

    it('returns null when BUILD_TIME is empty string', () => {
      process.env.BUILD_TIME = '';
      expect(getBuildTime()).toBeNull();
    });

    it('does not fall back to file when BUILD_TIME is empty string', () => {
      process.env.BUILD_TIME = '';
      getBuildTime();
      expect(mockedReadFileSync).not.toHaveBeenCalled();
    });

    it('returns the value when BUILD_TIME is set', () => {
      process.env.BUILD_TIME = '2026-03-12T14:30:00Z';
      expect(getBuildTime()).toBe('2026-03-12T14:30:00Z');
    });

    it('falls back to build-time.txt when BUILD_TIME is unset and file exists', () => {
      delete process.env.BUILD_TIME;
      mockedReadFileSync.mockReturnValueOnce('  2026-03-13T10:00:00Z  ');
      expect(getBuildTime()).toBe('2026-03-13T10:00:00Z');
    });

    it('returns null when BUILD_TIME is unset and build-time.txt is empty', () => {
      delete process.env.BUILD_TIME;
      mockedReadFileSync.mockReturnValueOnce('   ');
      expect(getBuildTime()).toBeNull();
    });

    it('returns null when BUILD_TIME is unset and build-time.txt does not exist', () => {
      delete process.env.BUILD_TIME;
      expect(getBuildTime()).toBeNull();
      expect(mockedReadFileSync).toHaveBeenCalled();
    });
  });

  describe('getServerInfo', () => {
    it('returns name, version, and buildTime fields', () => {
      const info = getServerInfo();
      expect(info).toHaveProperty('name', 'second-memory-learning');
      expect(info).toHaveProperty('version');
      expect(info.version).toMatch(/^\d+\.\d+\.\d+/);
      expect(info).toHaveProperty('buildTime');
    });

    it('returns buildTime as null when BUILD_TIME is unset', () => {
      delete process.env.BUILD_TIME;
      expect(getServerInfo().buildTime).toBeNull();
    });

    it('returns buildTime when BUILD_TIME is set', () => {
      process.env.BUILD_TIME = '2026-01-01T00:00:00Z';
      expect(getServerInfo().buildTime).toBe('2026-01-01T00:00:00Z');
    });
  });
});
