-- Project 1: stop leaking member contact data through the public REST API.
-- Before: policy "Public profiles are viewable by everyone" USING (true) let anyone holding the
-- public anon key read email, phone_wa, nim, ... of every member.
-- After: only approved+active members are publicly visible, only through an allow-list of columns;
-- everything else is read server-side with the service role (src/lib/supabase/admin.ts).
-- Apply ONLY after the code that stops reading private columns with the user client is deployed,
-- and after 20261125_open_intake_positions.sql (the column list below includes its new columns).
BEGIN;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.members;
DROP POLICY IF EXISTS "Approved profiles, own row and maintainers can be read" ON public.members;

CREATE POLICY "Approved profiles, own row and maintainers can be read"
  ON public.members
  FOR SELECT
  TO public
  USING (
    (registration_status = 'approved' AND membership_status = 'active' AND is_active)
    OR id = (SELECT auth.uid())
    OR (SELECT public.is_maintainer())
  );

REVOKE SELECT ON public.members FROM anon, authenticated;

GRANT SELECT (
  id,
  full_name,
  avatar_url,
  bio,
  hierarchy,
  sub_hierarchy,
  roles,
  titles,
  role_title,
  division,
  track,
  secondary_division,
  secondary_track,
  github_username,
  github_url,
  website_url,
  instagram_url,
  threads_url,
  x_url,
  linkedin_url,
  portfolio_url,
  registration_status,
  is_active,
  membership_status,
  membership_started_at,
  exited_at,
  reapply_blocked,
  intake_policy_version,
  reviewed_at,
  created_at,
  updated_at,
  total_commits,
  campus,
  affiliation
) ON public.members TO anon, authenticated;

COMMIT;
