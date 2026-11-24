-- Project 3: public tier and streak recognition columns on members.
-- Additive and safe to apply BEFORE the matching code is deployed. The columns are written only by the
-- contribution engine (service role); ordinary signed-in users can neither update nor insert them.

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS tier smallint NOT NULL DEFAULT 0;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS streak integer NOT NULL DEFAULT 0;

ALTER TABLE public.members DROP CONSTRAINT IF EXISTS members_tier_check;
ALTER TABLE public.members ADD CONSTRAINT members_tier_check CHECK (tier BETWEEN 0 AND 4);
ALTER TABLE public.members DROP CONSTRAINT IF EXISTS members_streak_check;
ALTER TABLE public.members ADD CONSTRAINT members_streak_check CHECK (streak >= 0);

-- Recognition is public (the /members leaderboard); the raw numbers behind it are not.
GRANT SELECT (tier, streak) ON public.members TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.harden_member_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_maintainer() THEN
    RETURN NEW;
  END IF;

  NEW.hierarchy := 'member';
  NEW.roles := '{}';
  NEW.titles := '{}';
  NEW.role_title := 'Member';
  NEW.registration_status := 'pending';
  NEW.reviewed_by := NULL;
  NEW.reviewed_at := NULL;
  NEW.rejection_reason := NULL;
  NEW.membership_status := 'active';
  NEW.membership_started_at := NULL;
  NEW.exited_at := NULL;
  NEW.exit_reason := NULL;
  NEW.reapply_blocked := false;
  NEW.total_commits := 0;
  NEW.tier := 0;
  NEW.streak := 0;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.harden_member_insert() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.protect_member_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF COALESCE(auth.role(), '') IN ('anon', 'authenticated') AND NOT public.is_maintainer() THEN
    IF (OLD.hierarchy IS DISTINCT FROM NEW.hierarchy OR
        OLD.roles IS DISTINCT FROM NEW.roles OR
        OLD.registration_status IS DISTINCT FROM NEW.registration_status OR
        OLD.is_active IS DISTINCT FROM NEW.is_active OR
        OLD.titles IS DISTINCT FROM NEW.titles OR
        OLD.role_title IS DISTINCT FROM NEW.role_title OR
        OLD.total_commits IS DISTINCT FROM NEW.total_commits OR
        OLD.contribution_standing IS DISTINCT FROM NEW.contribution_standing OR
        OLD.tier IS DISTINCT FROM NEW.tier OR
        OLD.streak IS DISTINCT FROM NEW.streak) THEN
      RAISE EXCEPTION 'Forbidden: Only maintainers can update privileged member fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
