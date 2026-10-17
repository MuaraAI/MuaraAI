# Specification: Muara AI — UBSI 2026 Semester 1 Membership Lifecycle

- **Document ID:** `SPEC-2026-10-17-UBSI-2026-MEMBERSHIP-LIFECYCLE`
- **Date:** 2026-10-17
- **Status:** Draft — Ready for Review
- **Target Repository:** `MuaraAI/MuaraAI` (`muaraai.com`)
- **Supabase Project:** `awlwvcmrknkdxnwolcoy` (`muaraai`)
- **Related Flow:** GitHub OAuth → `/onboarding` → Proof of Work review → member portal

---

## 1. Goal

Membatasi intake anggota baru Muara AI hanya untuk mahasiswa UBSI angkatan 2026 semester 1, tanpa merusak data dan akses Founder/Maintainer lama. Sistem juga perlu memiliki lifecycle keanggotaan yang jelas: member baru yang sudah aktif minimal 30 hari boleh mengajukan keluar, dan member yang sudah keluar tidak boleh mendaftar ulang.

Aturan ini berlaku mulai `membership_policy_effective_at`. Member atau pengurus yang sudah tercatat sebelum tanggal tersebut diperlakukan sebagai data historis dan tidak dipaksa memenuhi aturan intake baru.

---

## 2. Keputusan yang Dikunci

### 2.1 Eligibility Pendaftar Baru

Pendaftar baru wajib memenuhi semua syarat berikut:

- Universitas: Universitas Bina Sarana Informatika (UBSI).
- Angkatan: `2026`.
- Semester saat intake: `1`.
- NIM: 8 digit angka dan belum pernah digunakan.
- Kampus UBSI: harus berasal dari daftar kampus resmi yang disediakan form.
- Program studi: harus dipilih dari daftar Prodi UBSI.
- Kode kelas: wajib diisi sesuai format akademik UBSI.
- Proof of Work: tetap wajib dikirim dan ditinjau manual.
- Akun GitHub: satu akun hanya boleh memiliki satu riwayat membership.

Angkatan dan semester bukan input bebas yang dapat dimanipulasi client. Server harus menetapkan dan memvalidasi nilai intake dari konfigurasi kebijakan yang tersimpan di Supabase.

### 2.2 Grandfathering Founder/Maintainer Lama

Founder/Maintainer yang sudah tercatat sebelum kebijakan aktif tetap valid, walaupun:

- Angkatan bukan 2026.
- Semester bukan 1.
- Data akademiknya belum lengkap.
- Belum memiliki `membership_started_at`.

Mereka tidak boleh didowngrade, dipaksa mengirim ulang Proof of Work, atau ditolak oleh validasi intake baru hanya karena data historisnya tidak memenuhi syarat baru.

### 2.3 Aturan Keluar

Aturan keluar berlaku untuk member baru yang diterima setelah kebijakan aktif:

- Member tidak boleh mengajukan keluar sebelum genap 30 hari sejak `membership_started_at`.
- Pengajuan keluar dapat dilakukan oleh member melalui portal setelah 30 hari.
- Pengajuan yang berhasil mengubah lifecycle menjadi `exited`.
- Member `exited` kehilangan akses portal member dan API key baru.
- Riwayat membership tetap disimpan untuk mencegah pendaftaran ulang.

Tidak ada penghapusan permanen baris member saat keluar.

### 2.4 Larangan Re-Apply

Member yang sudah `exited` atau `reapply_blocked = true` tidak boleh:

- Mengirim Proof of Work baru.
- Mengubah statusnya kembali menjadi `pending` melalui client Supabase.
- Membuat API key baru.
- Mengakses dashboard member.

Pengecekan dilakukan di Server Action dan diperkuat oleh RLS/trigger database. Validasi client hanya untuk pengalaman pengguna, bukan kontrol keamanan.

---

## 3. Model Status

`registration_status` tetap merepresentasikan proses pendaftaran:

```text
pending → approved
pending → rejected
```

Lifecycle keanggotaan dipisahkan ke kolom baru agar tidak mencampur proses aplikasi dengan status keluar:

```text
membership_status:
- active
- exited
- banned
```

State normal untuk member baru:

```text
new applicant:
  no members row

submitted:
  registration_status = pending
  membership_status = active
  is_active = true

approved:
  registration_status = approved
  membership_status = active
  is_active = true
  membership_started_at = approval timestamp

exited:
  registration_status = approved
  membership_status = exited
  is_active = false
  reapply_blocked = true
  exited_at = exit timestamp
```

`banned` tetap tersedia untuk keputusan administratif terpisah. Blacklist akibat tunggakan kas tidak boleh otomatis dianggap sebagai `exited`; tunggakan tetap menggunakan `is_active` dan `dues_valid_until` sesuai aturan kas yang sudah ada.

---

## 4. Database Contract

### 4.1 Perubahan `public.members`

Tambahkan kolom berikut:

| Column | Type | Default | Purpose |
|---|---|---|---|
| `membership_status` | `text` | `'active'` | Lifecycle keanggotaan: `active`, `exited`, `banned` |
| `membership_started_at` | `timestamptz` | `NULL` | Waktu member disetujui/aktif |
| `exited_at` | `timestamptz` | `NULL` | Waktu pengajuan keluar disetujui |
| `exit_reason` | `text` | `NULL` | Alasan keluar opsional |
| `reapply_blocked` | `boolean` | `false` | Permanent anti-reapply flag |
| `intake_policy_version` | `text` | `NULL` | Versi kebijakan yang dikenakan saat pendaftaran |

Aturan constraint:

```sql
membership_status IN ('active', 'exited', 'banned')
```

Jangan mengubah atau menghapus constraint existing:

- `members_github_username_key`
- `members_nim_key`
- `members_id_fkey`
- `trg_protect_member_privileged_columns`

### 4.2 Konfigurasi Intake

Gunakan `public.community_settings` untuk konfigurasi intake, bukan nilai yang tersebar di komponen UI:

```json
{
  "key": "membership_intake",
  "value": {
    "policy_version": "ubsi-2026-s1",
    "effective_at": "<operator-set-timestamp>",
    "allowed_university": "Universitas Bina Sarana Informatika",
    "allowed_cohort": 2026,
    "allowed_semester": 1,
    "minimum_active_days_before_exit": 30,
    "block_reapply_after_exit": true
  }
}
```

Server Action harus fail-closed jika konfigurasi intake tidak tersedia atau tidak valid. Jangan menggunakan fallback policy tersembunyi di client.

### 4.3 Index

Tambahkan index yang mendukung query lifecycle:

```sql
CREATE INDEX IF NOT EXISTS idx_members_membership_status
  ON public.members (membership_status);

CREATE INDEX IF NOT EXISTS idx_members_reapply_blocked
  ON public.members (reapply_blocked)
  WHERE reapply_blocked = true;
```

---

## 5. Application Flows

### 5.1 Submit Proof of Work

`submitProofOfWork()` harus menjalankan urutan berikut:

1. Validasi user dengan `supabase.auth.getUser()`.
2. Baca konfigurasi `membership_intake` dari `community_settings`.
3. Validasi NIM, kampus, Prodi, kelas, dan data PoW.
4. Cari row existing berdasarkan `id = user.id`.
5. Jika row existing memiliki `reapply_blocked = true` atau `membership_status = 'exited'`, tolak dengan pesan bahwa akun tidak dapat mendaftar ulang.
6. Jika row existing `approved` dan `membership_status = 'active'`, tolak agar data member aktif tidak di-downgrade.
7. Jika user baru atau row belum pernah aktif, simpan:
   - `registration_status = 'pending'`
   - `membership_status = 'active'`
   - `is_active = true`
   - `intake_policy_version = membership_intake.policy_version`
   - `membership_started_at = NULL`
8. Kirim notifikasi maintainer.

Server tidak boleh menerima `angkatan`/`semester` dari payload client sebagai sumber kebenaran. Nilai tersebut ditetapkan dari intake policy.

### 5.2 Approval Applicant

`approveApplicant()` harus:

1. Memastikan actor adalah maintainer.
2. Memastikan target masih `registration_status = 'pending'`.
3. Mengubah `registration_status = 'approved'`.
4. Mengubah `membership_status = 'active'` dan `is_active = true`.
5. Mengisi `membership_started_at = now()` hanya saat approval pertama.
6. Mengisi `reviewed_by` dan `reviewed_at`.
7. Mengirim undangan GitHub dan email welcome seperti flow existing.

Approval ulang tidak boleh mereset `membership_started_at` jika member sudah pernah aktif.

### 5.3 Request Exit

Tambahkan Server Action `requestMembershipExit(reason?: string)`:

1. Validasi user dengan `getUser()`.
2. Ambil row member milik user.
3. Tolak jika tidak ada row.
4. Tolak jika bukan `registration_status = 'approved'`.
5. Tolak jika `membership_status != 'active'`.
6. Tolak jika actor adalah grandfathered Founder/Maintainer yang belum masuk kebijakan lifecycle baru, kecuali request keluar diproses melalui maintainer flow khusus.
7. Hitung `membership_started_at + 30 hari`.
8. Tolak jika waktu sekarang belum melewati batas minimum.
9. Jika valid, update atomik:
   - `membership_status = 'exited'`
   - `is_active = false`
   - `reapply_blocked = true`
   - `exited_at = now()`
   - `exit_reason = sanitized reason`
10. Nonaktifkan seluruh API key milik user di skema `ai` dan `ubsi_api`.
11. Kirim notifikasi kepada maintainer.

Pesan sebelum 30 hari harus menyebut tanggal earliest exit yang diperbolehkan.

### 5.4 Portal Access Guard

`src/app/(portal)/layout.tsx` harus menolak akses jika:

```text
member tidak ada
OR registration_status != approved
OR is_active != true
OR membership_status IN ('exited', 'banned')
```

Member `exited` diarahkan ke halaman informasi status, bukan kembali ke onboarding agar tidak terlihat seperti pendaftar baru.

### 5.5 API Key Guard

`saveApiKey()` harus menolak pembuatan key jika:

```text
registration_status != approved
OR is_active != true
OR membership_status != active
OR reapply_blocked = true
```

Guard ini wajib tetap ada walaupun portal sudah memblokir akses, karena Server Action adalah trust boundary.

---

## 6. UI Requirements

### 6.1 Onboarding

Untuk pendaftar baru, form menampilkan informasi non-editable:

```text
Intake: UBSI Angkatan 2026 — Semester 1
```

Form tetap meminta NIM, kampus, Prodi, kelas, WhatsApp, Proof of Work, dan URL profil sesuai flow existing.

Jika akun pernah exited:

```text
Akun ini memiliki riwayat keluar dari Muara AI dan tidak dapat mendaftar ulang.
```

Jangan menampilkan form submit untuk akun tersebut.

### 6.2 Dashboard Member

Untuk member aktif baru, tambahkan kartu status:

- `Aktif sejak: <membership_started_at>`
- `Boleh mengajukan keluar mulai: <membership_started_at + 30 hari>`
- Tombol `Ajukan Keluar` disabled sebelum tanggal tersebut.

Setelah exited:

- Tampilkan status `Riwayat Member — Sudah Keluar`.
- Tampilkan tanggal keluar.
- Jangan render tombol login ulang atau submit PoW.

### 6.3 Admin Members

Admin dapat melihat:

- `membership_status`
- `membership_started_at`
- `exited_at`
- `reapply_blocked`
- `intake_policy_version`

Admin boleh memproses status administratif, tetapi tidak boleh menghapus riwayat exit untuk membuat akun dapat re-apply secara diam-diam.

---

## 7. RLS & Security Rules

1. User biasa tidak boleh mengubah sendiri:
   - `membership_status`
   - `membership_started_at`
   - `exited_at`
   - `reapply_blocked`
   - `intake_policy_version`
   - `registration_status`
   - `hierarchy`
   - `roles`
2. Founder/Maintainer lama tetap dilindungi oleh status grandfathering dan tidak boleh terdampak migration backfill.
3. Request exit hanya boleh melalui Server Action dengan `getUser()`; tidak ada public insert/update langsung untuk lifecycle.
4. Trigger database harus memperlakukan `reapply_blocked = true` sebagai one-way transition untuk actor non-maintainer.
5. API key milik exited member wajib nonaktif agar akses backend berhenti pada saat exit.
6. Jangan menghapus row member saat exit; row tersebut adalah anti-reapply record.

---

## 8. Testing Decisions

### Unit Tests

- `validatePoWSubmission()` menerima intake 2026/S1 dan menolak nilai selainnya.
- Existing approved Founder/Maintainer tidak terkena downgrade.
- Existing exited member ditolak ketika submit ulang.
- Request exit sebelum 30 hari ditolak dan mengembalikan earliest exit date.
- Request exit setelah 30 hari mengubah state menjadi exited.
- Request exit kedua ditolak idempotently.

### Integration Tests

- Approval pertama mengisi `membership_started_at`.
- Approval ulang tidak menggeser `membership_started_at`.
- Exit menonaktifkan API key AI dan UBSI.
- Portal guard menolak exited/banned.
- RLS menolak direct update lifecycle dari user biasa.
- Grandfathered Founder/Maintainer dapat tetap login walaupun data intake historis tidak lengkap.

### Regression

```bash
npm test
npm run build
```

Semua test existing wajib tetap lulus sebelum rollout.

---

## 9. Migration & Rollout Order

1. Tambahkan `membership_status`, `membership_started_at`, `exited_at`, `exit_reason`, `reapply_blocked`, dan `intake_policy_version`.
2. Backfill existing members:
   - Member approved lama → `membership_status = active`.
   - Founder/Maintainer lama → grandfathered, tidak mengisi ulang data intake.
3. Insert `community_settings.membership_intake` dengan `policy_version = ubsi-2026-s1` dan effective timestamp yang diset operator.
4. Tambahkan RLS/trigger lifecycle.
5. Tambahkan Server Action request exit dan guards.
6. Update onboarding UI.
7. Update dashboard/admin UI.
8. Jalankan integration tests dan full build.
9. Audit data member dan API key sebelum deployment.

Tidak ada data member yang dihapus dalam migration ini.
