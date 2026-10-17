BEGIN;

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS membership_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS membership_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS exited_at timestamptz,
  ADD COLUMN IF NOT EXISTS exit_reason text,
  ADD COLUMN IF NOT EXISTS reapply_blocked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS intake_policy_version text;

ALTER TABLE public.members
  DROP CONSTRAINT IF EXISTS members_membership_status_check;
ALTER TABLE public.members
  ADD CONSTRAINT members_membership_status_check
  CHECK (membership_status IN ('active', 'exited', 'banned'));

UPDATE public.members
SET membership_status = 'active',
    reapply_blocked = false
WHERE membership_status IS NULL;

CREATE INDEX IF NOT EXISTS idx_members_membership_status
  ON public.members (membership_status);
CREATE INDEX IF NOT EXISTS idx_members_reapply_blocked
  ON public.members (reapply_blocked)
  WHERE reapply_blocked = true;

INSERT INTO public.community_settings (key, value, description)
VALUES (
  'membership_intake',
  '{"policy_version":"ubsi-2026-s1","effective_at":"2026-10-17T00:00:00.000Z","allowed_university":"Universitas Bina Sarana Informatika","allowed_cohort":2026,"allowed_semester":1,"minimum_active_days_before_exit":30,"block_reapply_after_exit":true}'::jsonb,
  'UBSI 2026 semester 1 intake and member exit lifecycle policy'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description, updated_at = now();

CREATE OR REPLACE FUNCTION public.protect_member_lifecycle_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_maintainer() THEN
    IF OLD.membership_status IS DISTINCT FROM NEW.membership_status
      OR OLD.membership_started_at IS DISTINCT FROM NEW.membership_started_at
      OR OLD.exited_at IS DISTINCT FROM NEW.exited_at
      OR OLD.reapply_blocked IS DISTINCT FROM NEW.reapply_blocked
      OR OLD.intake_policy_version IS DISTINCT FROM NEW.intake_policy_version THEN
      RAISE EXCEPTION 'Forbidden: lifecycle fields are server-managed';
    END IF;

    IF OLD.reapply_blocked = true AND NEW.reapply_blocked IS DISTINCT FROM true THEN
      RAISE EXCEPTION 'Forbidden: reapply block is permanent';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_member_lifecycle_columns ON public.members;
CREATE TRIGGER trg_protect_member_lifecycle_columns
BEFORE UPDATE ON public.members
FOR EACH ROW EXECUTE FUNCTION public.protect_member_lifecycle_columns();

COMMIT;
