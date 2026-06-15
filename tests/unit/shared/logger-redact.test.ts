import { describe, it, expect } from 'vitest';
import pino from 'pino';
import { LOG_REDACT } from '../../../src/shared/logger.js';

/**
 * Build a pino logger using the shared LOG_REDACT config, writing serialized
 * lines into an in-memory sink. Redaction happens at serialization, so it must
 * be observed on the written output rather than at the `.info()` boundary.
 */
function makeCapturingLogger(): { logger: pino.Logger; lines: string[] } {
  const lines: string[] = [];
  const sink = { write: (chunk: string) => lines.push(chunk) };
  const logger = pino({ redact: LOG_REDACT }, sink);
  return { logger, lines };
}

const SENSITIVE_FIELDS = [
  'password',
  'token',
  'apiKey',
  'api_key',
  'authorization',
  'secret',
] as const;

describe('LOG_REDACT', () => {
  it('censors each sensitive field at the top level', () => {
    const { logger, lines } = makeCapturingLogger();

    logger.info(
      {
        password: 'pw-secret',
        token: 'tok-secret',
        apiKey: 'apikey-secret',
        api_key: 'apiunderscore-secret',
        authorization: 'Bearer header-secret',
        secret: 'raw-secret',
      },
      'top-level'
    );

    const entry = JSON.parse(lines.at(-1) as string);
    for (const field of SENSITIVE_FIELDS) {
      expect(entry[field]).toBe('[REDACTED]');
    }
  });

  it('censors the same fields nested one level deep', () => {
    const { logger, lines } = makeCapturingLogger();

    logger.info(
      {
        params: {
          password: 'pw-secret',
          token: 'tok-secret',
          apiKey: 'apikey-secret',
          api_key: 'apiunderscore-secret',
          authorization: 'Bearer header-secret',
          secret: 'raw-secret',
        },
      },
      'nested'
    );

    const entry = JSON.parse(lines.at(-1) as string);
    for (const field of SENSITIVE_FIELDS) {
      expect(entry.params[field]).toBe('[REDACTED]');
    }
  });

  it('never leaks raw secret values into the serialized output', () => {
    const { logger, lines } = makeCapturingLogger();
    const rawValues = [
      'pw-secret',
      'tok-secret',
      'apikey-secret',
      'apiunderscore-secret',
      'Bearer header-secret',
      'raw-secret',
    ];

    logger.info(
      {
        token: 'tok-secret',
        secret: 'raw-secret',
        params: {
          password: 'pw-secret',
          apiKey: 'apikey-secret',
          api_key: 'apiunderscore-secret',
          authorization: 'Bearer header-secret',
        },
      },
      'leak-check'
    );

    const output = lines.join('');
    for (const raw of rawValues) {
      expect(output).not.toContain(raw);
    }
  });

  it('preserves learner response text verbatim', () => {
    const { logger, lines } = makeCapturingLogger();
    const answer = 'the mitochondria is the powerhouse of the cell';

    logger.info({ response: answer, token: 'tok-secret' }, 'response-kept');

    const entry = JSON.parse(lines.at(-1) as string);
    expect(entry.response).toBe(answer);
    expect(entry.token).toBe('[REDACTED]');
  });

  it('lists both a bare and a one-level-wildcard path for every sensitive field, and excludes response', () => {
    for (const field of SENSITIVE_FIELDS) {
      expect(LOG_REDACT.paths).toContain(field);
      expect(LOG_REDACT.paths).toContain(`*.${field}`);
    }
    expect(LOG_REDACT.censor).toBe('[REDACTED]');
    expect(LOG_REDACT.paths).not.toContain('response');
    expect(LOG_REDACT.paths).not.toContain('*.response');
  });
});
