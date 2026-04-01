CREATE TABLE context_tokens (
  id TEXT PRIMARY KEY,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL
);

CREATE INDEX idx_context_tokens_expires_at ON context_tokens (expires_at);
