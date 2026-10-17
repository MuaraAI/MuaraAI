# UBSI 2026 Semester 1 Membership Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menerapkan intake mahasiswa UBSI angkatan 2026 semester 1, lifecycle exit minimal 30 hari, dan blokir re-apply permanen tanpa mengganggu Founder/Maintainer historis.

**Architecture:** Tambahkan status lifecycle terpisah pada `public.members`, konfigurasi intake terpusat di `public.community_settings`, guard Server Action pada submit/approval/exit/API key, serta trigger/RLS untuk mencegah manipulasi direct client. Existing Founder/Maintainer ditandai grandfathered secara data, bukan dipaksa memenuhi validasi intake baru.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Supabase PostgreSQL/RLS, Supabase SSR, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-17-ubsi-2026-membership-lifecycle-design.md`

## Global Constraints

- Intake baru hanya untuk UBSI angkatan `2026`, semester `1`.
- Founder/Maintainer lama tetap grandfathered.
- Member baru harus aktif minimal `30 hari` sejak approval sebelum dapat request exit.
- Member `exited` tidak boleh re-apply, akses portal, membuat API key, atau mengaktifkan kembali lifecycle melalui client.
- Row `public.members` tidak boleh dihapus saat exit.
- `registration_status` tetap untuk proses aplikasi; `membership_status` baru untuk lifecycle membership.
- Semua secret tetap berasal dari environment; tidak boleh menambahkan fallback secret/policy ke client.
- Semua perubahan wajib diuji dengan `npm test` dan `npm run build`.
- Zero remote push.

## Review Focus

1. **Grandfathered founder:** Existing Founder/Maintainer tanpa `membership_started_at` harus tetap dapat login dan tidak boleh ditolak oleh intake guard.
2. **Exit before 30 days:** Request harus ditolak dengan tanggal earliest exit yang deterministik; database tidak boleh berubah.
3. **Exit replay:** Request exit kedua harus idempotently ditolak; status `exited` dan `reapply_blocked` tidak boleh dibalik oleh member biasa.
4. **Approval replay:** Approval ulang tidak boleh mereset `membership_started_at` atau memperpanjang eligibility secara diam-diam.
5. **API-key revocation:** Exit harus menonaktifkan key pada schema `ai` dan `ubsi_api`, serta key baru harus ditolak setelah lifecycle exited.

---

## File Map

### Create
- `supabase/migrations/20261017_membership_lifecycle.sql` — DDL, backfill, intake setting, indexes, trigger/RLS lifecycle guard.
- `src/app/actions/membership.ts` — Server Action `requestMembershipExit` dan shared membership guard helpers.
- `src/app/(portal)/membership-exit/page.tsx` — Exit status/request UI.
- `src/components/portal/membership-exit-client.tsx` — Client form, eligibility countdown/status, reason input.
- `tests/membership-lifecycle.test.ts` — Pure lifecycle/date/eligibility tests.
- `tests/membership-actions.test.ts` — Server Action behavior with mocked Supabase.

### Modify
- `src/types/database.ts` — Add lifecycle types and Member fields.
- `src/app/actions/pow.ts` — Intake policy load, exited/reapply guard, policy version persistence.
- `src/app/actions/admin.ts` — Approval timestamp/lifecycle fields; preserve existing approval behavior.
- `src/app/actions/vault.ts` — Reject key generation for exited/banned/reapply-blocked members.
- `src/app/(portal)/layout.tsx` — Portal guard for exited/banned and exit-status redirect.
- `src/app/(portal)/dashboard/page.tsx` — Show membership start date, earliest exit date, exit status/action.
- `src/app/(portal)/dashboard/vault/vault-client.tsx` — Render disabled/blocked state if server returns lifecycle denial.
- `src/app/(portal)/admin/members/page.tsx` — Pass lifecycle fields to admin client.
- `src/app/(portal)/admin/members/admin-members-client.tsx` — Display lifecycle status and dates; no destructive reset.
- `src/app/(public)/onboarding/page.tsx` — Route exited/reapply-blocked users to status message rather than fresh form.
- `src/components/auth/pow-modal.tsx` — Show immutable `UBSI Angkatan 2026 — Semester 1` intake label and blocked state.
- `src/lib/validation.ts` — Add policy-aware pure intake validation signature.
- `tests/onboarding-and-notify.test.ts` — Add new intake and grandfathered validation cases.
- `tests/admin-actions.test.ts` — Approval timestamp/replay tests.
- `tests/vault-keys.test.ts` — Lifecycle denial test seam if vault action is covered here.

---

## Task 1: Add lifecycle types and pure policy helpers (TDD)

**Files:**
- Modify: `src/types/database.ts`
- Create: `src/lib/membership.ts`
- Create: `tests/membership-lifecycle.test.ts`
- Modify: `tests/onboarding-and-notify.test.ts`

**Interfaces:**
- Consumes: existing `Member`, `PoWInput`.
- Produces:
  - `type MembershipStatus = "active" | "exited" | "banned"`
  - `interface MembershipIntakePolicy { policy_version: string; effective_at: string; allowed_university: string; allowed_cohort: number; allowed_semester: number; minimum_active_days_before_exit: number; block_reapply_after_exit: boolean }`
  - `canSubmitIntake(member, policy, now): { allowed: boolean; reason?: string }`
  - `getEarliestExitDate(startedAt, minimumDays): Date | null`
  - `canRequestExit(member, now, policy): { allowed: boolean; earliestExitAt?: string; reason?: string }`

- [ ] **Step 1: Write failing tests for lifecycle rules**

```typescript
// tests/membership-lifecycle.test.ts
import { describe, expect, it } from "vitest";
import { canRequestExit, canSubmitIntake, getEarliestExitDate } from "../src/lib/membership";

const policy = {
  policy_version: "ubsi-2026-s1",
  effective_at: "2026-10-17T00:00:00.000Z",
  allowed_university: "Universitas Bina Sarana Informatika",
  allowed_cohort: 2026,
  allowed_semester: 1,
  minimum_active_days_before_exit: 30,
  block_reapply_after_exit: true,
};

it("grandfathers an existing Founder without membership_started_at", () => {
  const result = canSubmitIntake({
    registration_status: "approved",
    membership_status: "active",
    hierarchy: "maintainer",
    reapply_blocked: false,
    created_at: "2026-10-01T00:00:00.000Z",
  }, policy, new Date("2026-10-17T00:00:00.000Z"));
  expect(result.allowed).toBe(true);
});

it("blocks exited members from reapplying", () => {
  const result = canSubmitIntake({
    registration_status: "approved",
    membership_status: "exited",
    hierarchy: "member",
    reapply_blocked: true,
    created_at: "2026-10-01T00:00:00.000Z",
  }, policy, new Date("2026-10-17T00:00:00.000Z"));
  expect(result.allowed).toBe(false);
});

it("allows exit only after thirty complete days", () => {
  expect(getEarliestExitDate("2026-10-01T12:00:00.000Z", 30)?.toISOString())
    .toBe("2026-10-31T12:00:00.000Z");
  expect(canRequestExit({
    registration_status: "approved",
    membership_status: "active",
    hierarchy: "member",
    reapply_blocked: false,
    membership_started_at: "2026-10-01T12:00:00.000Z",
  }, new Date("2026-10-30T12:00:00.000Z"), policy).allowed).toBe(false);
  expect(canRequestExit({
    registration_status: "approved",
    membership_status: "active",
    hierarchy: "member",
    reapply_blocked: false,
    membership_started_at: "2026-10-01T12:00:00.000Z",
  }, new Date("2026-10-31T12:00:00.000Z"), policy).allowed).toBe(true);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npx vitest run tests/membership-lifecycle.test.ts`
Expected: FAIL because `src/lib/membership.ts` and lifecycle fields do not exist.

- [ ] **Step 3: Implement minimal types and helpers**

Add lifecycle fields to `Member`:

```typescript
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
```

Implement helpers with UTC timestamps and no local-time assumptions. Grandfather only existing approved `maintainer` records created before policy effective time; new members must satisfy the policy through server-loaded configuration.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npx vitest run tests/membership-lifecycle.test.ts tests/onboarding-and-notify.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types/database.ts src/lib/membership.ts tests/membership-lifecycle.test.ts tests/onboarding-and-notify.test.ts
git commit -m "feat(membership): add UBSI intake and thirty-day lifecycle policy helpers"
```

---

## Task 2: Apply Supabase migration, intake setting, and lifecycle database guard

**Files:**
- Create: `supabase/migrations/20261017_membership_lifecycle.sql`
- Test/verify: Supabase MCP `execute_sql` read-back queries

**Interfaces:**
- Consumes: Existing `public.members`, `public.community_settings`, `trg_protect_member_privileged_columns`.
- Produces: Lifecycle columns, `membership_intake` setting, indexes, allowed status constraint, and one-way non-maintainer lifecycle trigger.

- [ ] **Step 1: Write migration SQL with grandfather-safe backfill**

```sql
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
```

- [ ] **Step 2: Apply migration through Supabase MCP**

Run the migration with `mcp__supabase_muaraai__apply_migration` using project `awlwvcmrknkdxnwolcoy`. Do not use destructive `DROP TABLE` or delete member rows.

- [ ] **Step 3: Read back schema, setting, index, and trigger**

Run read-only SQL:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'members'
  AND column_name IN ('membership_status','membership_started_at','exited_at','exit_reason','reapply_blocked','intake_policy_version');

SELECT key, value FROM public.community_settings WHERE key = 'membership_intake';

SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'members'
  AND indexname IN ('idx_members_membership_status','idx_members_reapply_blocked');

SELECT trigger_name FROM information_schema.triggers
WHERE event_object_schema = 'public' AND event_object_table = 'members'
  AND trigger_name = 'trg_protect_member_lifecycle_columns';
```

Expected: all six columns, one intake policy row, both indexes, and lifecycle trigger exist.

- [ ] **Step 4: Verify grandfather row is unchanged**

```sql
SELECT github_username, registration_status, hierarchy, is_active,
       membership_status, membership_started_at, reapply_blocked
FROM public.members
WHERE github_username = 'Curzyori';
```

Expected: existing Founder remains `approved`, active, and is not required to have 2026/S1 intake data.

- [ ] **Step 5: Commit migration locally**

```bash
git add supabase/migrations/20261017_membership_lifecycle.sql
git commit -m "feat(db): add membership lifecycle and UBSI intake policy schema"
```

---

## Task 3: Make PoW submission policy-aware and anti-reapply

**Files:**
- Modify: `src/app/actions/pow.ts`
- Modify: `src/lib/validation.ts`
- Modify: `src/components/auth/pow-modal.tsx`
- Test: `tests/membership-actions.test.ts`, `tests/onboarding-and-notify.test.ts`

**Interfaces:**
- Consumes: `MembershipIntakePolicy`, `canSubmitIntake()`, existing `submitProofOfWork()`.
- Produces: `submitProofOfWork()` that loads policy server-side, rejects exited/reapply-blocked users, preserves grandfathered members, and stores `intake_policy_version`.

- [ ] **Step 1: Add failing Server Action tests**

```typescript
// tests/membership-actions.test.ts
import { describe, expect, it, vi } from "vitest";

it("rejects a member who already exited instead of upserting pending", async () => {
  // Mock getUser() and members query returning:
  // registration_status: approved, membership_status: exited, reapply_blocked: true
  // Assert result.success === false and error mentions re-apply.
});

it("preserves an existing grandfathered Founder", async () => {
  // Mock an existing approved maintainer created before policy effective_at.
  // Assert action returns the existing-active guard, never writes pending.
});

it("persists policy version for a new pending applicant", async () => {
  // Mock membership_intake setting and empty members row.
  // Assert upsert payload includes intake_policy_version: "ubsi-2026-s1".
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npx vitest run tests/membership-actions.test.ts`
Expected: FAIL because lifecycle fields/policy query are not implemented.

- [ ] **Step 3: Implement server-side policy loading and guards**

In `submitProofOfWork()`:

```typescript
const { data: setting, error: settingError } = await supabase
  .from("community_settings")
  .select("value")
  .eq("key", "membership_intake")
  .single();

if (settingError || !setting?.value) {
  return { success: false, error: "Konfigurasi pendaftaran sedang tidak tersedia." };
}

const policy = setting.value as MembershipIntakePolicy;
const { data: existing } = await supabase
  .from("members")
  .select("registration_status, hierarchy, membership_status, reapply_blocked, created_at")
  .eq("id", user.id)
  .maybeSingle();

if (existing?.reapply_blocked || existing?.membership_status === "exited") {
  return { success: false, error: "Akun ini sudah pernah keluar dan tidak dapat mendaftar ulang." };
}

if (existing?.registration_status === "approved") {
  return { success: false, error: "Akun Anda sudah berstatus anggota resmi aktif." };
}
```

The upsert payload must include:

```typescript
registration_status: "pending",
membership_status: "active",
is_active: true,
membership_started_at: null,
intake_policy_version: policy.policy_version,
```

Do not accept `angkatan` or `semester` from the form payload. The policy setting is the source of truth. Add the immutable form label `UBSI Angkatan 2026 — Semester 1`.

- [ ] **Step 4: Add blocked-state UI**

If the server returns the reapply-blocked error, show a dedicated message and do not reset/reopen the submission flow. The UI must not claim the user can apply again.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `npx vitest run tests/membership-actions.test.ts tests/onboarding-and-notify.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/actions/pow.ts src/lib/validation.ts src/components/auth/pow-modal.tsx tests/membership-actions.test.ts tests/onboarding-and-notify.test.ts
git commit -m "feat(onboarding): enforce UBSI 2026 intake policy and block re-apply"
```

---

## Task 4: Make approval lifecycle-safe

**Files:**
- Modify: `src/app/actions/admin.ts:28-93`
- Modify: `src/app/(portal)/admin/review/review-queue-client.tsx`
- Test: `tests/admin-actions.test.ts`, `tests/membership-actions.test.ts`

**Interfaces:**
- Consumes: existing `approveApplicant(memberId)` and maintainer assertion.
- Produces: first approval sets `membership_started_at`; repeated approval cannot reset it; exited/reapply-blocked targets cannot be approved.

- [ ] **Step 1: Write failing approval tests**

```typescript
it("sets membership_started_at only on first approval", async () => {
  // Existing pending row -> assert update includes approved, active, membership_started_at.
});

it("does not reset membership_started_at on repeated approval", async () => {
  // Existing approved row with started timestamp -> assert no reset/rejection response.
});

it("rejects approval of an exited applicant", async () => {
  // Existing row membership_status exited/reapply_blocked true -> success false.
});
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npx vitest run tests/admin-actions.test.ts tests/membership-actions.test.ts`
Expected: FAIL because approval currently only updates `registration_status` and `reviewed_at`.

- [ ] **Step 3: Implement lifecycle-safe approval**

Fetch lifecycle fields with the applicant:

```typescript
.select("id, github_username, email, full_name, registration_status, membership_status, reapply_blocked, membership_started_at")
```

Reject targets where `reapply_blocked` is true or `membership_status = 'exited'`. Require `registration_status = 'pending'`. Update:

```typescript
registration_status: "approved",
membership_status: "active",
is_active: true,
membership_started_at: member.membership_started_at ?? new Date().toISOString(),
reviewed_at: new Date().toISOString(),
```

Do not reset `membership_started_at` on an existing active record.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npx vitest run tests/admin-actions.test.ts tests/membership-actions.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/actions/admin.ts src/app/\(portal\)/admin/review/review-queue-client.tsx tests/admin-actions.test.ts tests/membership-actions.test.ts
git commit -m "fix(admin): make applicant approval preserve membership lifecycle state"
```

---

## Task 5: Add request-exit Server Action and disable all user API keys

**Files:**
- Create: `src/app/actions/membership.ts`
- Modify: `src/app/actions/vault.ts`
- Create: `tests/membership-exit.test.ts`
- Test: `tests/vault-keys.test.ts`

**Interfaces:**
- Produces:
  - `requestMembershipExit(reason?: string): Promise<{ success: boolean; error?: string; earliestExitAt?: string }>`
  - `getMembershipExitStatus()` for dashboard rendering.
- Consumes: `MembershipIntakePolicy`, `canRequestExit()`, Supabase server client.

- [ ] **Step 1: Write failing exit tests**

```typescript
it("rejects exit before the thirty-day threshold", async () => {
  // started_at = 2026-10-01, now = 2026-10-30
  // expect success false and earliestExitAt = 2026-10-31.
});

it("exits after thirty complete days and disables both project key tables", async () => {
  // started_at = 2026-10-01, now = 2026-10-31
  // assert members update sets exited/inactive/reapply_blocked/exited_at
  // assert ai.api_keys and ubsi_api.api_keys update is_active=false.
});

it("rejects a repeated exit request", async () => {
  // membership_status = exited -> success false.
});
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npx vitest run tests/membership-exit.test.ts`
Expected: FAIL because the action does not exist.

- [ ] **Step 3: Implement `requestMembershipExit()`**

Required behavior:

1. `getUser()`; return Unauthorized when absent.
2. Load member and `membership_intake` setting.
3. Reject missing member, non-approved, non-active, exited, banned, or reapply-blocked.
4. Treat grandfathered Founder/Maintainer with null `membership_started_at` as exempt from the new self-exit flow and return a maintainer-flow message.
5. Calculate UTC earliest exit date using `membership_started_at + 30 days`.
6. Reject before threshold and return `earliestExitAt`.
7. Update member lifecycle fields only after all checks pass.
8. Deactivate keys with user ownership filters in both tables.
9. Notify maintainers after successful exit.
10. Return generic errors to client; log database details server-side.

- [ ] **Step 4: Add API key lifecycle guard**

At the beginning of `saveApiKey()` after loading member:

```typescript
if (
  member.membership_status !== "active" ||
  member.reapply_blocked === true
) {
  return { success: false, error: "Akun membership ini tidak dapat membuat API key." };
}
```

The member select must include `membership_status` and `reapply_blocked`.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `npx vitest run tests/membership-exit.test.ts tests/vault-keys.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/actions/membership.ts src/app/actions/vault.ts tests/membership-exit.test.ts tests/vault-keys.test.ts
git commit -m "feat(membership): add thirty-day exit action and revoke project keys"
```

---

## Task 6: Add portal access guard and member exit UI

**Files:**
- Modify: `src/app/(portal)/layout.tsx`
- Modify: `src/app/(portal)/dashboard/page.tsx`
- Create: `src/app/(portal)/membership-exit/page.tsx`
- Create: `src/components/portal/membership-exit-client.tsx`
- Test: `tests/membership-portal.test.tsx`

**Interfaces:**
- Consumes: `requestMembershipExit()`, `getMembershipExitStatus()`, `Member` lifecycle fields.
- Produces: exited/banned status page and active-member exit card.

- [ ] **Step 1: Write failing portal tests**

```tsx
it("shows exited status instead of the normal onboarding form", () => {
  // Render MembershipExitClient with membership_status exited.
  // expect status message and no submit button.
});

it("disables exit before earliest date", () => {
  // Render active member with earliestExitAt in the future.
  // expect disabled Ajukan Keluar button and date text.
});
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npx vitest run tests/membership-portal.test.tsx`
Expected: FAIL because the exit page/component does not exist.

- [ ] **Step 3: Update portal guard**

Change guard to:

```typescript
if (!member || member.registration_status !== "approved" || !member.is_active) {
  if (member?.membership_status === "exited" || member?.reapply_blocked) {
    redirect("/membership-exit");
  }
  redirect("/onboarding");
}

if (member.membership_status === "banned") {
  redirect("/membership-exit?status=banned");
}
```

Existing grandfathered Founder/Maintainer records must remain accessible without `membership_started_at`.

- [ ] **Step 4: Implement exit status page and dashboard card**

`MembershipExitClient` states:

```text
active + before threshold:
  “Anda dapat mengajukan keluar mulai <date>”
  button disabled

active + threshold reached:
  reason textarea
  “Ajukan Keluar” button enabled

exited:
  “Riwayat Member — Sudah Keluar”
  exited_at
  no re-apply CTA

banned:
  “Akses membership dihentikan oleh maintainer”
  no re-apply CTA
```

Add the dashboard card only for post-policy member records with a non-null `membership_started_at`. Do not expose an exit card that blocks grandfathered existing leaders.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `npx vitest run tests/membership-portal.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(portal\)/layout.tsx src/app/\(portal\)/dashboard/page.tsx src/app/\(portal\)/membership-exit/page.tsx src/components/portal/membership-exit-client.tsx tests/membership-portal.test.tsx
git commit -m "feat(portal): add membership exit status page and active member exit flow"
```

---

## Task 7: Add admin lifecycle visibility and complete rollout verification

**Files:**
- Modify: `src/app/(portal)/admin/members/page.tsx`
- Modify: `src/app/(portal)/admin/members/admin-members-client.tsx`
- Modify: `src/types/database.ts`
- Create: `tests/membership-admin.test.tsx`

**Interfaces:**
- Consumes: `Member` lifecycle fields and existing `toggleMemberActive()`.
- Produces: admin table columns for lifecycle status, start date, exit date, reapply block, and intake policy version.

- [ ] **Step 1: Write failing admin visibility tests**

```tsx
it("renders lifecycle status and reapply block for exited member", () => {
  // Render admin table with membership_status exited and reapply_blocked true.
  // expect “Exited”, “Tidak dapat daftar ulang”, and exited date.
});
```

- [ ] **Step 2: Run focused test and verify RED**

Run: `npx vitest run tests/membership-admin.test.tsx`
Expected: FAIL because lifecycle columns are not rendered.

- [ ] **Step 3: Add lifecycle columns without destructive reset**

Show:

- `membership_status`
- `membership_started_at`
- `exited_at`
- `reapply_blocked`
- `intake_policy_version`

Keep existing blacklist toggle separate from lifecycle exit. Do not add a UI action that clears `reapply_blocked` for normal maintainers.

- [ ] **Step 4: Run focused test and verify GREEN**

Run: `npx vitest run tests/membership-admin.test.tsx`
Expected: PASS.

- [ ] **Step 5: Run full verification**

Run:

```bash
npm test
npm run build
```

Expected:

- All existing and new tests pass.
- Next.js build succeeds.
- No TypeScript errors.

- [ ] **Step 6: Refresh Graphify and inspect status**

Run:

```bash
graphify update . || graphify extract . --code-only
git status --short
git log --oneline -12
```

Expected: graph refreshed; only intentional generated/ignored files; no secrets; no remote push.

- [ ] **Step 7: Commit final verification**

```bash
git add src tests
git commit -m "test(membership): verify UBSI intake and lifecycle rollout"
```

---

## Rollout Checklist

- [ ] Review `docs/superpowers/specs/2026-10-17-ubsi-2026-membership-lifecycle-design.md` and this plan.
- [ ] Apply Supabase migration through `mcp__supabase_muaraai__apply_migration`.
- [ ] Verify Founder/Maintainer grandfather row remains unchanged.
- [ ] Verify `membership_intake` setting is present and valid.
- [ ] Test new applicant pending flow.
- [ ] Test first approval timestamp.
- [ ] Test exit before/after 30 days.
- [ ] Test exited re-apply rejection.
- [ ] Test API key revocation on exit.
- [ ] Test portal redirect for exited/banned.
- [ ] Run `npm test` and `npm run build`.
- [ ] No remote push until explicitly approved.
