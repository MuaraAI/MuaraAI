-- The toolchain description (members.bio) was readable by anyone with the public anon key although
-- no page shows it. Make it private like the other application fields.
-- Apply ONLY after the code that stops selecting bio with the user client is deployed.
BEGIN;
REVOKE SELECT (bio) ON public.members FROM anon, authenticated;
COMMIT;
