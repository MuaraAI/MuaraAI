/**
 * Columns of public.members that the anon and authenticated roles cannot SELECT
 * (see supabase/migrations/20261126_members_privacy.sql). Read them only through the
 * privileged client (src/lib/supabase/admin.ts) after authorizing the caller in code.
 */
export const PRIVATE_MEMBER_COLUMNS = [
  "email",
  "phone_wa",
  "telegram_username",
  "nim",
  "prodi",
  "kelas",
  "join_reason",
  "rejection_reason",
  "exit_reason",
  "reviewed_by",
  "semester",
  "angkatan",
  "generation",
  "city",
  "discord_username",
  "toolchain_narrative",
  "contribution_standing",
] as const;

type PrivateMemberColumn = (typeof PRIVATE_MEMBER_COLUMNS)[number];
