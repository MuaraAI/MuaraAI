type MemberHierarchy = "maintainer" | "head" | "lead" | "member";
type MemberDivision = "builder" | "creative" | "cybersecurity";
export type RegistrationStatus = "pending" | "approved" | "rejected";
export type MembershipStatus = "active" | "exited" | "banned";
export type Affiliation = "mahasiswa" | "pelajar" | "umum" | "lainnya";

export interface MembershipIntakePolicy {
  policy_version: string;
  effective_at: string;
  minimum_active_days_before_exit: number;
  block_reapply_after_exit: boolean;
}

export interface Member {
  id: string;
  email: string | null;
  full_name: string;
  avatar_url: string | null;
  phone_wa: string | null;
  bio: string | null;
  nim: string | null;
  campus: string;
  prodi: string | null;
  kelas: string | null;
  semester: number | null;
  angkatan: number | null;
  hierarchy: MemberHierarchy;
  sub_hierarchy: string | null;
  /** Every division the person belongs to; division stays their primary one (it decides their contribution target). */
  divisions: MemberDivision[];
  /** Divisions they lead (Head of X). */
  head_of: MemberDivision[];
  /** Positions they hold, across divisions. */
  tracks: string[];
  role_title: string | null;
  roles: string[];
  titles: string[];
  division: MemberDivision;
  track: string | null;
  generation: number | null;
  github_username: string;
  github_url: string | null;
  website_url: string | null;
  instagram_url: string | null;
  threads_url: string | null;
  x_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  registration_status: RegistrationStatus;
  rejection_reason?: string | null;
  membership_status: MembershipStatus;
  membership_started_at: string | null;
  exited_at: string | null;
  exit_reason: string | null;
  reapply_blocked: boolean;
  intake_policy_version: string | null;
  is_active: boolean;
  affiliation: Affiliation;
  join_reason: string | null;
  secondary_division: MemberDivision | null;
  secondary_track: string | null;
  telegram_username: string | null;
  contribution_standing?: "good" | "warned";
  tier?: number;
  streak?: number;
  total_commits: number;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningMaterial {
  id: string;
  title: string;
  description: string;
  cover_url: string | null;
  resource_url: string;
  division: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  image_url: string;
  credential_url: string | null;
  recipient_names: string[];
  recipient_ids: string[];
  created_at: string;
}

