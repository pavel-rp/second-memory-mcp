CREATE SCHEMA IF NOT EXISTS infrastructure;

CREATE TABLE infrastructure.mcp_request_log (
  id BIGSERIAL PRIMARY KEY,
  -- Event time from the application (pino isoTime); may differ from created_at due to batching delay
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  method TEXT,
  rpc_id TEXT,
  params JSONB,
  response_status INTEGER,
  response_body TEXT,
  duration_ms INTEGER,
  -- DB insertion time; differs from timestamp when entries are batched
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mcp_request_log_timestamp ON infrastructure.mcp_request_log (timestamp DESC);
CREATE INDEX idx_mcp_request_log_method ON infrastructure.mcp_request_log (method);
