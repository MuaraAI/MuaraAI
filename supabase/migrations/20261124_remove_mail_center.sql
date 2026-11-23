-- Project 0 cleanup: the Mail Center (public contact inbox + maintainer broadcast/reply) is retired.
-- Apply ONLY after the code that stops writing to these tables is deployed.
-- Pre-checked 2026-11-24: inbox_messages = 0 rows, sent_emails = 0 rows; no triggers, FKs, views or
-- functions depend on them. Their 3 RLS policies are dropped together with the tables.
BEGIN;

DROP TABLE IF EXISTS public.inbox_messages;
DROP TABLE IF EXISTS public.sent_emails;

COMMIT;
