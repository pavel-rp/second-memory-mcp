import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getVersion, getBuildTime, getServerInfo } from '../../../src/shared/version.js';

describe('version utility', () => {
  let originalBuildTime: string | undefined;

  beforeEach(() => {
    originalBuildTime = process.env.BUILD_TIME;
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

    it('returns the value when BUILD_TIME is set', () => {
      process.env.BUILD_TIME = '2026-03-12T14:30:00Z';
      expect(getBuildTime()).toBe('2026-03-12T14:30:00Z');
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
