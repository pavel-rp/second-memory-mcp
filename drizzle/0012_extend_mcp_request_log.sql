ALTER TABLE infrastructure.mcp_request_log
  ADD COLUMN correlation_id TEXT,
  ADD COLUMN session_id TEXT;

CREATE INDEX idx_mcp_request_log_correlation_id ON infrastructure.mcp_request_log (correlation_id);
