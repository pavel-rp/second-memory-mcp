CREATE TABLE infrastructure.operation_event_log (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- pino emission time (when the event occurred)
  correlation_id TEXT,
  tool TEXT,
  level TEXT NOT NULL,
  operation TEXT NOT NULL,
  event TEXT NOT NULL,
  data JSONB,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  -- DB insertion time (diverges from timestamp under load)
);

CREATE INDEX idx_operation_event_correlation ON infrastructure.operation_event_log (correlation_id);
CREATE INDEX idx_operation_event_timestamp ON infrastructure.operation_event_log (timestamp DESC);
