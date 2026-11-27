-- A person can belong to several divisions, hold several positions and lead several divisions
-- (e.g. maintainer + Head of Builder + member of Builder, Creative and Cybersecurity), and there is a
-- third division, Cybersecurity. Purely additive: the old division/track/secondary_* columns stay and
-- keep working (division is still the person's primary division, which decides their contribution target).
-- Safe to apply BEFORE the code that reads the new columns is deployed.
BEGIN;

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS divisions text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS head_of text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tracks text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.members DROP CONSTRAINT IF EXISTS members_secondary_division_check;
ALTER TABLE public.members ADD CONSTRAINT members_secondary_division_check
  CHECK (secondary_division IS NULL OR secondary_division = ANY (ARRAY['builder', 'creative', 'cybersecurity']));
ALTER TABLE public.members ADD CONSTRAINT members_division_check
  CHECK (division = ANY (ARRAY['builder', 'creative', 'cybersecurity']));
ALTER TABLE public.members ADD CONSTRAINT members_divisions_check
  CHECK (divisions <@ ARRAY['builder', 'creative', 'cybersecurity']::text[]);
ALTER TABLE public.members ADD CONSTRAINT members_head_of_check
  CHECK (head_of <@ ARRAY['builder', 'creative', 'cybersecurity']::text[]);

-- Backfill from what exists: primary then secondary division/track, and head-<division> entries in roles.
UPDATE public.members
SET divisions = ARRAY[division] || CASE WHEN secondary_division IS NOT NULL AND secondary_division <> division THEN ARRAY[secondary_division] ELSE ARRAY[]::text[] END,
    tracks = array_remove(ARRAY[track, secondary_track], NULL),
    head_of = ARRAY(
      SELECT substr(role, 6) FROM unnest(roles) AS role
      WHERE role IN ('head-builder', 'head-creative', 'head-cybersecurity')
    );

-- Anyone can read these (they are shown in the directory); only the sign-up trigger below and maintainers write them.
GRANT SELECT (divisions, head_of, tracks) ON public.members TO anon, authenticated;
GRANT UPDATE (divisions, head_of, tracks) ON public.members TO authenticated;

CREATE OR REPLACE FUNCTION public.sync_member_divisions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Maintainers and the service role write the lists directly.
  IF auth.uid() IS NULL OR public.is_maintainer() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' OR OLD.registration_status <> 'approved' THEN
    -- A sign-up (or a re-application) derives its divisions from the divisions the applicant picked.
    NEW.divisions := ARRAY[NEW.division]
      || CASE WHEN NEW.secondary_division IS NOT NULL AND NEW.secondary_division <> NEW.division THEN ARRAY[NEW.secondary_division] ELSE ARRAY[]::text[] END;
    NEW.tracks := array_remove(ARRAY[NEW.track, NEW.secondary_track], NULL);
  ELSE
    -- An approved member cannot add themselves to a division (that would put them in its GitHub team).
    NEW.divisions := OLD.divisions;
    NEW.tracks := OLD.tracks;
  END IF;

  NEW.head_of := CASE WHEN TG_OP = 'INSERT' THEN ARRAY[]::text[] ELSE OLD.head_of END;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sync_member_divisions() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_sync_member_divisions ON public.members;
CREATE TRIGGER trg_sync_member_divisions
  BEFORE INSERT OR UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.sync_member_divisions();

COMMIT;
