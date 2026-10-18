-- Open MuaraAI intake to students from campuses across Indonesia.
ALTER TABLE public.members
  ALTER COLUMN campus SET DEFAULT 'Kampus lain di Indonesia';

UPDATE public.community_settings
SET value = jsonb_set(
  jsonb_set(value, '{policy_version}', '"national-2026-s1"'::jsonb),
  '{allowed_university}',
  '"Mahasiswa dari kampus di seluruh Indonesia"'::jsonb
),
updated_at = now()
WHERE key = 'membership_intake';

UPDATE public.members
SET intake_policy_version = 'national-2026-s1'
WHERE intake_policy_version = 'ubsi-2026-s1';
