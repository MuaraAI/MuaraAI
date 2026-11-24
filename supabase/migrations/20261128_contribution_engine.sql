-- Project 2: contribution engine (monthly quota, warnings, kick).
-- Safe to apply BEFORE the matching code is deployed: new tables/columns/settings are additive and the
-- trigger change only relaxes service-role writes and protects two more columns.
BEGIN;

CREATE TABLE IF NOT EXISTS public.org_repos (
  name text PRIMARY KEY,
  creator_login text,
  repo_created_at timestamptz,
  checked_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.monthly_contributions (
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  month date NOT NULL,
  merged_prs integer NOT NULL DEFAULT 0,
  external_prs integer NOT NULL DEFAULT 0,
  commits integer NOT NULL DEFAULT 0,
  new_repos integer NOT NULL DEFAULT 0,
  new_works integer NOT NULL DEFAULT 0,
  synced_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (member_id, month)
);

CREATE TABLE IF NOT EXISTS public.contribution_evaluations (
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  month date NOT NULL,
  met boolean NOT NULL,
  action text NOT NULL CHECK (action IN ('none', 'warn', 'kick', 'recover')),
  enforced boolean NOT NULL DEFAULT false,
  evaluated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (member_id, month)
);

ALTER TABLE public.org_repos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_evaluations ENABLE ROW LEVEL SECURITY;

-- Written only by the service role (which bypasses RLS). Signed-in users may only read.
REVOKE ALL ON public.org_repos, public.monthly_contributions, public.contribution_evaluations FROM anon, authenticated;
GRANT SELECT ON public.org_repos, public.monthly_contributions, public.contribution_evaluations TO authenticated;

DROP POLICY IF EXISTS "Maintainers can read org repos" ON public.org_repos;
CREATE POLICY "Maintainers can read org repos"
  ON public.org_repos
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_maintainer()));

DROP POLICY IF EXISTS "Members read own contributions, maintainers read all" ON public.monthly_contributions;
CREATE POLICY "Members read own contributions, maintainers read all"
  ON public.monthly_contributions
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (member_id = (SELECT auth.uid()) OR (SELECT public.is_maintainer()));

DROP POLICY IF EXISTS "Members read own evaluations, maintainers read all" ON public.contribution_evaluations;
CREATE POLICY "Members read own evaluations, maintainers read all"
  ON public.contribution_evaluations
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (member_id = (SELECT auth.uid()) OR (SELECT public.is_maintainer()));

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS contribution_standing text NOT NULL DEFAULT 'good';
ALTER TABLE public.members
  DROP CONSTRAINT IF EXISTS members_contribution_standing_check;
ALTER TABLE public.members
  ADD CONSTRAINT members_contribution_standing_check
  CHECK (contribution_standing IN ('good', 'warned'));

INSERT INTO public.community_settings (key, value, description)
VALUES (
  'contribution_rules',
  '{"enforcement":"dry_run","org":"MuaraAI","new_work_label":"karya-baru","builder":{"merged_prs":10,"external_prs":5,"commits":50,"new_repos":1},"creative":{"merged_prs":10,"external_prs":5,"new_works":1}}'::jsonb,
  'Monthly contribution quota and enforcement mode (editable by maintainers)'
)
ON CONFLICT (key) DO NOTHING;

-- The live trigger rejected EVERY non-maintainer update of a protected column, including the service
-- role (auth.uid() is NULL there), which would block the contribution engine. Only signed-in
-- non-maintainers are restricted now, and total_commits / contribution_standing are protected too.
CREATE OR REPLACE FUNCTION public.protect_member_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_maintainer() THEN
    IF (OLD.hierarchy IS DISTINCT FROM NEW.hierarchy OR
        OLD.roles IS DISTINCT FROM NEW.roles OR
        OLD.registration_status IS DISTINCT FROM NEW.registration_status OR
        OLD.is_active IS DISTINCT FROM NEW.is_active OR
        OLD.titles IS DISTINCT FROM NEW.titles OR
        OLD.role_title IS DISTINCT FROM NEW.role_title OR
        OLD.total_commits IS DISTINCT FROM NEW.total_commits OR
        OLD.contribution_standing IS DISTINCT FROM NEW.contribution_standing) THEN
      RAISE EXCEPTION 'Forbidden: Only maintainers can update privileged member fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

COMMIT;
