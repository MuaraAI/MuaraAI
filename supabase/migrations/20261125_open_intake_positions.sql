-- Project 1: open global intake, official positions, secondary division, contact fields.
-- Additive and safe to apply BEFORE the matching code is deployed.
BEGIN;

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS affiliation text NOT NULL DEFAULT 'mahasiswa',
  ADD COLUMN IF NOT EXISTS join_reason text,
  ADD COLUMN IF NOT EXISTS secondary_division text,
  ADD COLUMN IF NOT EXISTS secondary_track text,
  ADD COLUMN IF NOT EXISTS telegram_username text;

ALTER TABLE public.members
  DROP CONSTRAINT IF EXISTS members_affiliation_check;
ALTER TABLE public.members
  ADD CONSTRAINT members_affiliation_check
  CHECK (affiliation IN ('mahasiswa', 'pelajar', 'umum', 'lainnya'));

ALTER TABLE public.members
  DROP CONSTRAINT IF EXISTS members_secondary_division_check;
ALTER TABLE public.members
  ADD CONSTRAINT members_secondary_division_check
  CHECK (secondary_division IS NULL OR secondary_division IN ('builder', 'creative'));

INSERT INTO public.community_settings (key, value, description)
VALUES (
  'positions',
  '{"builder":["App","Web","Frontend","Backend","Automation","Game","Modding"],"creative":["Social Media","Image","Video","Copywriting","Humanizer","Idea"]}'::jsonb,
  'Official positions per division (editable by maintainers)'
)
ON CONFLICT (key) DO NOTHING;

UPDATE public.community_settings
SET value = (value - 'allowed_university' - 'allowed_cohort' - 'allowed_semester')
            || '{"policy_version":"global-open-v1"}'::jsonb,
    updated_at = now()
WHERE key = 'membership_intake';

COMMIT;
