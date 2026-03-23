-- Retention cleanup: delete mcp_request_log entries older than 30 days.
-- Run periodically via cron or pg_cron:
--   SELECT cron.schedule('audit-log-cleanup', '0 3 * * *', $$DELETE FROM infrastructure.mcp_request_log WHERE timestamp < NOW() - INTERVAL '30 days'$$);

DELETE FROM infrastructure.mcp_request_log
WHERE timestamp < NOW() - INTERVAL '30 days';
