import type { RequestHandler, Request, Response } from 'express';
import type { ContextTokenRepository } from '../ports/context-token-repository.js';
import { logger } from '../shared/logger.js';

export const EXCLUDED_TOOLS = new Set([
  'init_agent_context',
  'get_server_info',
  'get_server_workflow',
]);

interface ToolsCallBody {
  jsonrpc?: string;
  method?: string;
  id?: string | number | null;
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
  };
}

function makeAuthError(
  id: string | number | null | undefined,
  message: string,
  opts?: { retryable?: boolean }
): object {
  const error: Record<string, unknown> = { type: 'auth', message };
  if (opts?.retryable != null) error.retryable = opts.retryable;
  return {
    jsonrpc: '2.0',
    id: id ?? null,
    result: {
      content: [{ type: 'text', text: JSON.stringify({ success: false, error, message }) }],
      isError: true,
    },
  };
}

function formatTtlDuration(ttlMs: number): string {
  const hours = ttlMs / (60 * 60 * 1000);
  if (hours >= 1) {
    const rounded = Math.round(hours * 10) / 10;
    return `${rounded} hour${rounded !== 1 ? 's' : ''}`;
  }
  const minutes = Math.round(ttlMs / (60 * 1000));
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

export function createContextTokenMiddleware(
  repo: ContextTokenRepository,
  ttlMs?: number
): RequestHandler {
  return async (req: Request, res: Response, next) => {
    try {
      const body = req.body as ToolsCallBody | undefined;

      if (body?.method !== 'tools/call') {
        next();
        return;
      }

      const toolName = body.params?.name;
      if (!toolName || EXCLUDED_TOOLS.has(toolName)) {
        next();
        return;
      }

      const rawToken = body.params?.arguments?.context_token;
      if (!rawToken) {
        res.json(
          makeAuthError(
            body.id,
            'Missing context_token. Call init_agent_context first to obtain a token.',
            { retryable: true }
          )
        );
        return;
      }

      const { valid, expired } = await repo.validateWithStatus(String(rawToken));
      if (!valid) {
        const message = expired
          ? `Context token expired${ttlMs ? ` (valid for ${formatTtlDuration(ttlMs)})` : ''}. Call init_agent_context to refresh. This ensures you have the latest domain rules and current learner state.`
          : 'Invalid context_token. Call init_agent_context first to obtain a token.';
        res.json(makeAuthError(body.id, message, { retryable: true }));
        return;
      }

      next();
    } catch (err) {
      logger.error('Context token middleware unexpected error:', err);
      next();
    }
  };
}
