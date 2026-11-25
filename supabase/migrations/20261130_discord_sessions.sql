-- Project 4: weekly Discord sessions and web check-in attendance.
-- Additive and safe to apply BEFORE the matching code is deployed. Both tables are written only by the
-- service role (server actions); signed-in members can read sessions (without the check-in code) and
-- their own attendance.

CREATE TABLE IF NOT EXISTS public.discord_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('diskusi', 'sharing', 'modul', 'aturan_github', 'random', 'lainnya')),
  materi text NOT NULL DEFAULT '',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  discord_url text NOT NULL,
  checkin_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS public.session_attendance (
  session_id uuid NOT NULL REFERENCES public.discord_sessions(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, member_id)
);

CREATE INDEX IF NOT EXISTS discord_sessions_starts_at_idx ON public.discord_sessions (starts_at);

ALTER TABLE public.discord_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_attendance ENABLE ROW LEVEL SECURITY;

-- No write grants or policies: the service role bypasses RLS. checkin_code is deliberately NOT granted,
-- so no signed-in member can read it; maintainers and the check-in action read it with the service role.
REVOKE ALL ON public.discord_sessions, public.session_attendance FROM anon, authenticated;
GRANT SELECT (id, title, type, materi, starts_at, ends_at, discord_url, created_at) ON public.discord_sessions TO authenticated;
GRANT SELECT ON public.session_attendance TO authenticated;

DROP POLICY IF EXISTS "Signed-in users can read sessions" ON public.discord_sessions;
CREATE POLICY "Signed-in users can read sessions"
  ON public.discord_sessions
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Members read own attendance, maintainers read all" ON public.session_attendance;
CREATE POLICY "Members read own attendance, maintainers read all"
  ON public.session_attendance
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (member_id = (SELECT auth.uid()) OR (SELECT public.is_maintainer()));
