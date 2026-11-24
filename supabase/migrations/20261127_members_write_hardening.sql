-- Project 1: close a privilege-escalation hole on public.members.
-- Before: the INSERT policy only checked auth.uid() = id and there was NO insert trigger, so any
-- signed-in user could POST /rest/v1/members with hierarchy 'maintainer' / registration_status
-- 'approved' for their own id. The app then treated them as a maintainer.
-- After: for ordinary signed-in users the privileged/lifecycle columns are forced to safe values on
-- INSERT, and titles/role_title are protected on UPDATE like the other privileged columns.
-- Service-role/SQL access (auth.uid() IS NULL) and maintainers keep full control.
-- Safe to apply BEFORE the matching code is deployed (the current app already writes these values).
BEGIN;

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
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.harden_member_insert() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_harden_member_insert ON public.members;
CREATE TRIGGER trg_harden_member_insert
  BEFORE INSERT ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.harden_member_insert();

CREATE OR REPLACE FUNCTION public.protect_member_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF (OLD.hierarchy IS DISTINCT FROM NEW.hierarchy OR
      OLD.roles IS DISTINCT FROM NEW.roles OR
      OLD.registration_status IS DISTINCT FROM NEW.registration_status OR
      OLD.is_active IS DISTINCT FROM NEW.is_active OR
      OLD.titles IS DISTINCT FROM NEW.titles OR
      OLD.role_title IS DISTINCT FROM NEW.role_title) THEN
    IF NOT public.is_maintainer() THEN
      RAISE EXCEPTION 'Forbidden: Only maintainers can update privileged member fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

COMMIT;
