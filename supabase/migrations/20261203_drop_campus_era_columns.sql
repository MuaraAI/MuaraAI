-- The community is open to everyone now, not a campus: only the institution (members.campus) and the status
-- (members.affiliation) are kept. These columns are left over from the campus era, nothing in the code reads them,
-- and nim in particular is personal data we have no reason to keep. Checked beforehand: no function, view, policy or
-- index depends on them except the unique constraint members_nim_key, which goes with its column.
-- toolchain_narrative was an older copy of members.bio.
-- Apply ONLY after the code that stopped selecting these columns (the registration form used toolchain_narrative) is deployed.
BEGIN;

ALTER TABLE public.members
  DROP COLUMN IF EXISTS nim,
  DROP COLUMN IF EXISTS prodi,
  DROP COLUMN IF EXISTS kelas,
  DROP COLUMN IF EXISTS semester,
  DROP COLUMN IF EXISTS angkatan,
  DROP COLUMN IF EXISTS generation,
  DROP COLUMN IF EXISTS city,
  DROP COLUMN IF EXISTS toolchain_narrative;

COMMIT;
