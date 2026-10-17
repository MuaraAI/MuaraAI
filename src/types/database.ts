export type MemberHierarchy = "maintainer" | "head" | "lead" | "member";
export type MemberDivision = "builder" | "creative";
export type RegistrationStatus = "pending" | "approved" | "rejected";
export type MembershipStatus = "active" | "exited" | "banned";

export interface MembershipIntakePolicy {
  policy_version: string;
  effective_at: string;
  allowed_university: string;
  allowed_cohort: number;
  allowed_semester: number;
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
  membership_status: MembershipStatus;
  membership_started_at: string | null;
  exited_at: string | null;
  exit_reason: string | null;
  reapply_blocked: boolean;
  intake_policy_version: string | null;
  is_active: boolean;
  dues_valid_until: string | null;
  total_commits: number;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type TransactionType = "income" | "expense";
export type TransactionStatus = "pending" | "paid" | "failed";

export interface TreasuryTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  member_id: string | null;
  status: TransactionStatus;
  payment_ref: string | null;
  created_at: string;
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

export interface LearningMaterialRead {
  id: string;
  material_id: string;
  member_id: string;
  opened_at: string;
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

export interface SentEmail {
  id: string;
  recipient_type: string;
  recipient_email: string;
  subject: string;
  body: string;
  sent_by: string | null;
  created_at: string;
}

export type InboxMessageStatus = "unread" | "read" | "replied";

export interface InboxMessage {
  id: string;
  sender_name: string;
  sender_email: string;
  organization: string | null;
  subject: string;
  message: string;
  status: InboxMessageStatus;
  reply_body: string | null;
  replied_at: string | null;
  replied_by: string | null;
  created_at: string;
}

export interface DuesConfig {
  weekly_fee: number;
  monthly_fee: number;
  arrears_blacklist_days: number;
}

export interface CommunitySetting {
  key: string;
  value: DuesConfig | Record<string, unknown>;
  description: string | null;
  updated_at: string;
}
