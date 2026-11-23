-- Project 0 cleanup: dues/treasury (Pakasir) is retired; donations go to Sociabuzz.
-- Apply ONLY after the code that stops reading these objects is deployed.
-- Pre-checked 2026-11-23: treasury_transactions = 0 rows, members.dues_valid_until all NULL,
-- members.node_type = 'online_national' (default) on all rows and unreferenced in code.
BEGIN;

-- trg_protect_member_privileged_columns (BEFORE UPDATE on members) reads OLD/NEW.dues_valid_until.
-- Recreate the function without that clause BEFORE dropping the column, otherwise every
-- UPDATE on members would fail. Everything else is identical to the live definition.
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
      OLD.is_active IS DISTINCT FROM NEW.is_active) THEN
    IF NOT public.is_maintainer() THEN
      RAISE EXCEPTION 'Forbidden: Only maintainers can update privileged member fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TABLE IF EXISTS public.treasury_transactions;

ALTER TABLE public.members
  DROP COLUMN IF EXISTS dues_valid_until,
  DROP COLUMN IF EXISTS node_type;

DELETE FROM public.community_settings WHERE key = 'dues_config';

COMMIT;
