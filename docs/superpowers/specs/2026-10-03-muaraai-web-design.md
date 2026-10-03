# Design Specification: Muara AI Web Portal (`muaraai.com`)

- **Document ID**: `SPEC-2026-10-03-MUARAAI-WEB`
- **Date**: 2026-10-03
- **Author**: Core Engineering Team (Curzyori, Seeyaa77, MyKineID)
- **Status**: DRAFT (Reviewing with Founder)
- **Repository**: `MuaraAI/MuaraAI` (Public on GitHub, deployed on Vercel)
- **Domain**: `muaraai.com`

---

## 1. Executive Summary & Intent

Muara AI is an independent, proof-of-work engineering and creative syndicate founded by UBSI Pontianak students. The website `muaraai.com` serves as the official community portal:
1. **Public Showcase & Manifesto**: Exhibits flagship open-source software, agentic workflows, and editorial generative media with zero marketing fluff or uncurated AI slop.
2. **Member Onboarding & Meritocracy**: Transparent GitHub-based registration where prospective members submit concrete Proof of Work (PoW) before gaining access.
3. **Automated Community Treasury**: Frictionless dues payment (Rp 3,000/week) via dynamic Pakasir QRIS, paired with a public open-book summary and strict anti-free-rider policies.
4. **Maintainer Operations**: Streamlined review queue with automated GitHub Org invitations and multi-channel alerts (Resend Email, Discord, Telegram).

---

## 2. System Architecture & Tech Stack

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS 15 (APP ROUTER)                         │
│                    Tailwind CSS • Deep Water Theme                     │
│                                                                        │
│  ├── /                      Landing Page (Public Showcase & Summary)   │
│  ├── /dashboard             Member Area (Profile, Dues QRIS, Vault)    │
│  ├── /admin                 Maintainer Control Plane (Queue & Expense) │
│  └── /api/webhooks/pakasir  Pakasir Webhook Handler (Idempotent)       │
└──────────────┬──────────────────────────┬──────────────────────────────┘
               │                          │
               ▼                          ▼
┌───────────────────────────────┐ ┌──────────────────────────────────────┐
│       SUPABASE (Cloud)        │ │         NOTIFICATION BUS             │
│   Host: db.awlwvcmrknk...     │ │                                      │
│                               │ │  ├── Resend: maintainer email alert  │
│  ├── Auth: GitHub OAuth SSO   │ │  ├── Discord: Channel Webhook        │
│  ├── public.members           │ │  └── Telegram: Bot sendMessage API   │
│  ├── public.treasury_...      │ └──────────────────────────────────────┘
│  └── Storage: avatars & proofs│
└───────────────────────────────┘
```

### Technology Selections:
- **Framework**: Next.js 15 (App Router, Server Components default, React 19).
- **Styling**: Tailwind CSS with "Deep Water" design tokens (Dark-first `#070B14`, cyan accents `#06B6D4`, muted borders).
- **Typography & Icons**: Local self-hosted Inter & Space Grotesk (`/public/fonts/`); Google Material Symbols (zero remote font CDNs, zero emojis in UI).
- **Database & Auth**: Supabase PostgreSQL (`awlwvcmrknkdxnwolcoy`) + Supabase Auth (**Strictly 100% GitHub OAuth Only** — email/password & magic link disabled; identity, username & avatar tied to GitHub).
- **Email Architecture**: Direct Resend SDK via Next.js Server Actions (separate from Supabase Auth) for maintainer broadcast (`/admin/mail`) and operational transactional emails from `admin@muaraai.com`.
- **Payment Gateway**: Pakasir Dynamic QRIS API + Webhook endpoint with HMAC/signature verification.
- **Maintainer Alerts**: Resend SDK + Discord webhook + Telegram Bot HTTP API (`Promise.allSettled`).

---

## 3. Database Schema & State Machine

### 3.1 `public.members`
Stores community member profiles, credentials, role hierarchies, and dues validity.

- **Dues & Arrears Accumulation Model (Tagihan Bertingkat)**:
  * Biaya dasar: Rp 3.000 / minggu.
  * 1 bulan terdiri dari 4 siklus minggu.
  * Tagihan menumpuk secara akumulatif jika belum dibayar:
    - Nunggak 1 minggu: Rp 3.000
    - Nunggak 2 minggu: Rp 6.000
    - Nunggak 3 minggu: Rp 9.000
    - Nunggak 4 minggu: Rp 12.000 (1 bulan penuh)
  * Jika lewat dari 30 hari (> 4 minggu menunggak): member otomatis di-blacklist / dinonaktifkan (`is_active = false`), akses API dan branch revoked sampai tagihan lunas.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` (PK) | - | References `auth.users(id)` ON DELETE CASCADE |
| `email` | `text` | - | Primary contact email |
| `full_name` | `text` | - | Full real name |
| `avatar_url` | `text` | - | GitHub / uploaded avatar URL |
| `phone_wa` | `text` | - | WhatsApp number for emergency notices |
| `bio` | `text` | - | Engineering / creative bio |
| `nim` | `text` (UNIQUE) | - | Student ID (if UBSI student) |
| `prodi` | `text` | `'Informatika'` | Degree program |
| `kelas` | `text` | - | Class identifier (e.g. 15.1C.30) |
| `semester` | `integer` | `1` | Current academic semester |
| `angkatan` | `integer` | `2026` | College batch year |
| `hierarchy` | `text` | `'member'` | Top level: `'maintainer'`, `'head'`, `'lead'`, `'member'` |
| `sub_hierarchy`| `text` | - | Sub-team: `'head-builder'`, `'head-creative'`, `'member-builder'`, `'member-creative'`, `'founder'`, `'co-founder'` |
| `role_title` | `text` | `'Member'` | Primary headline title (e.g. `'Founder'`) |
| `titles` | `text[]` | `ARRAY[]::text[]` | All active badge titles displayed on profile card |
| `roles` | `text[]` | `ARRAY[]::text[]` | All active permission slugs |
| `division` | `text` | `'builder'` | Core division: `'builder'` or `'creative'` |
| `track` | `text` | - | Specific specialty (web, agent, cloud, video, visual, copy) |
| `generation` | `integer` | `1` | Community founding batch |
| `github_username`| `text` (UNIQUE)| - | GitHub handle (case-insensitive) |
| `github_url` | `text` | - | Public GitHub URL |
| `portfolio_url`| `text` | - | Primary Proof-of-Work link |
| `registration_status`| `text` | `'pending'` | `'pending'`, `'approved'`, `'rejected'` |
| `is_active` | `boolean` | `true` | Active status. Set to `false` if dues are overdue >30 days |
| `dues_valid_until` | `date` | - | Active validity date for paid community dues |
| `total_commits` | `integer` | `0` | Aggregated commits across MuaraAI repositories |
| `reviewed_by`| `uuid` | - | References `auth.users(id)` |
| `reviewed_at`| `timestamptz` | - | Timestamp when approved/rejected |
| `created_at` | `timestamptz` | `now()` | Registration timestamp |
| `updated_at` | `timestamptz` | `now()` | Last modification timestamp |

### 3.2 `public.treasury_transactions`
Ledger of community cash flows (QRIS dues collected and operational expenses).

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` (PK) | `gen_random_uuid()` | Unique transaction ID |
| `type` | `text` | - | `'income'` (dues) or `'expense'` (server/domain/event) |
| `amount` | `integer` | - | Nominal in Indonesian Rupiah (IDR > 0) |
| `category` | `text` | `'dues'` | `'dues'`, `'server'`, `'domain'`, `'competition'`, `'other'` |
| `description`| `text` | - | Detailed memo (e.g. "Perpanjangan VPS Tencent Oktober 2026") |
| `member_id` | `uuid` | - | References `public.members(id)` (nullable for general expenses) |
| `status` | `text` | `'paid'` | `'pending'`, `'paid'`, `'failed'` |
| `payment_ref`| `text` | - | External payment reference (Pakasir order ID) |
| `created_at` | `timestamptz` | `now()` | Creation timestamp |

### 3.3 `public.learning_materials`
Knowledge repository for internal syndicate engineering guides, decks, and research.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` (PK) | `gen_random_uuid()` | Unique material ID |
| `title` | `text` | - | Headline title of the material |
| `description`| `text` | - | Brief summary / context |
| `cover_url` | `text` | - | Optional banner / image thumbnail |
| `resource_url`| `text`| - | Resource link (PDF, GDrive, Notion, Repo) |
| `division` | `text` | `'all'` | Target audience: `'all'`, `'builder'`, `'creative'` |
| `created_by` | `uuid` | - | References `public.members(id)` |
| `created_at` | `timestamptz` | `now()` | Server creation timestamp |
| `updated_at` | `timestamptz` | `now()` | Last modification timestamp |

### 3.4 `public.learning_material_reads`
Audit log tracking which members have accessed and opened each learning material.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` (PK) | `gen_random_uuid()` | Unique read record ID |
| `material_id`| `uuid` | - | References `public.learning_materials(id)` |
| `member_id` | `uuid` | - | References `public.members(id)` |
| `opened_at` | `timestamptz` | `now()` | Server click/read timestamp |

*(Constraint: `UNIQUE (material_id, member_id)` ensures idempotent tracking per member)*

### 3.5 `public.sent_emails`
Outbox log for maintainer broadcasts sent through the Resend API.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` (PK) | `gen_random_uuid()` | Unique email log ID |
| `recipient_type` | `text` | `'custom'` | Target: `'all'`, `'builder'`, `'creative'`, `'custom'` |
| `recipient_email`| `text` | - | Destination address |
| `subject` | `text` | - | Email subject header |
| `body` | `text` | - | Markdown / HTML body content |
| `sent_by` | `uuid` | - | Maintainer who dispatched the email |
| `created_at` | `timestamptz` | `now()` | Dispatch timestamp |

### 3.6 `public.achievements`
Official repository of credentials, hackathon wins, and professional certificates (distinct from software projects).

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` (PK) | `gen_random_uuid()` | Unique achievement ID |
| `title` | `text` | - | Award title (e.g. "Juara 1 Hackathon 2026") |
| `issuer` | `text` | - | Issuing institution/organizer |
| `issue_date` | `date` | - | Date issued |
| `image_url` | `text` | - | High-res certificate image preview URL |
| `credential_url`| `text` | - | Optional verification/credential URL |
| `recipient_names`| `text[]`| `ARRAY[]::text[]` | Name(s) of members who earned it |
| `recipient_ids`| `uuid[]` | `ARRAY[]::uuid[]` | References `public.members(id)` |
| `created_at` | `timestamptz` | `now()` | Timestamp added |

---

## 4. Page Specifications & User Journeys

### 4.1 Landing Page (`/`)
Built with Server Components for optimal SEO and instant load speeds:
1. **Header / Sticky Navbar**:
   - Monogram `M` brand mark.
   - Quick navigation: `#projects`, `#accolades`, `#manifesto`, `#syndicate`, `#treasury`.
   - Dynamic CTA button:
     - Unauthenticated: *"Login with GitHub"*.
     - Authenticated: *"Dashboard →"*.
2. **Hero Section**:
   - Eyebrow badge: `AI ENGINEERING & CREATIVE SYNDICATE • PONTIANAK`.
   - Headline: *"Where local craft flows global."*
   - Subhead: Concrete statement defining Muara AI as an independent studio and research laboratory, rejecting passive theory.
   - Interactive Terminal / Live Code Component: Real-time cycling code snippet demonstrating agentic scraping, AES-256 vault generation, and pipeline tests.
   - Dual CTA: *"Explore Projects"* (smooth scroll) & *"Submit Proof-of-Work"*.
3. **Live Metrics Bar**:
   - `126+` Automated Tests Passing (Offline & CI).
   - `6` University Services Aggregated.
   - `0%` AI-Slop (Zero uncurated generation allowed).
   - `100%` Open-Source & Independent.
4. **Visi & Misi**:
   - **Visi**: Menjadi muara ekosistem praktisi dan pengembang AI rekayasa terkemuka dari Kalimantan Barat yang menghasilkan karya berstandar global.
   - **Misi**: Menegakkan disiplin software engineering ketat (anti-slop, TDD), memproduksi minimal satu rilis produk atau submission lomba per semester, dan menyediakan shared infrastructure bagi anggota.
5. **The Hall of Projects (Karya & Produk)**:
   - Dua proyek flagship resmi Muara AI yang aktif beroperasi:
     * **UBSI API** (`MuaraAI/UBSI-API`): Unofficial REST API Aggregator untuk 6 layanan digital kampus UBSI (SIAKAD StudentV2, MyBest LMS, Elibrary, EJournal, Repository, News Portal). Dibangun dengan Python 3.12+, FastAPI, Redis Cache, dan 126 pengujian otomatis lulus. Live di `https://ubsi-api.muaraai.com`.
     * **Muara AI Gateway (`ai.muaraai.com`)** (`MuaraAI/ai-web`): Member portal dan dashboard self-service untuk Muara V1 Flash AI Gateway. Dilengkapi autentikasi SSO Login with MuaraAI, model selector, dan manajemen kuota/token. Frontend Next.js 15 dengan backend Cloudflare Worker. Live di `https://ai.muaraai.com`.
6. **The Accolades / Hall of Fame (Sertifikat & Prestasi)**:
   - Distinct from software projects: Exhibits verifiable certificates, hackathon rankings, and competition accolades.
   - Interactive certificate card grid (fetched live from `public.achievements`).
   - Card features: High-resolution certificate preview with lightbox modal zoom, award title, issuing institution, recipients list, date, and external verification link.
7. **The Craft Standard (Anti-Slop Manifesto)**:
   - Comparison matrix contrasting naive raw prompting vs. Muara AI agentic harnesses, test-driven pipelines, and verifiable outputs.
8. **Member Hierarchy & The Syndicate (Roster with Top Commits)**:
   - Structural explanation of the 4-layer meritocracy:
     - **Founder**: Yuken Velino (@Curzyori) - Architecture, strategy, and ecosystem direction.
     - **Co-Founders**: M Raffli Aldiansyah (@Seeyaa77) & Verzio (@MyKineID) - Core infrastructure & scraper engineering.
     - **Division Heads**: Head of Builder & Head of Creative.
     - **Project Leads**: Technical lead per active repository/initiative.
     - **Members**: Builder (Code/Cloud/Agents) & Creative (Visual/Video/Copy).
   - Live query from `public.members` where `registration_status = 'approved'`.
   - Client-side category tab filter:
     - `All`: Shows all verified members.
     - `Top Commits`: Leaderboard sorted descending by `total_commits` with `Top Committer` spotlight badge.
     - `Core Team`: Filter by `hierarchy = 'maintainer'`.
     - `Builder`: Filter by `division = 'builder'`.
     - `Creative`: Filter by `division = 'creative'`.
   - Card displays: GitHub avatar, real name, primary `role_title`, badge list (`titles`), commit metric pill (e.g. `142 Commits`), track, and GitHub/Portfolio links.
9. **Member Benefits (Keuntungan Bergabung)**:
   - Grid kartu benefit resmi:
     1. **GitHub Org Membership**: Akses kolaborasi di `github.com/MuaraAI` dengan branch permissions.
     2. **Muara Learn Knowledge Base**: Akses materi riset internal, prompt harnesses, dan rekaman arsitektur.
     3. **Shared Compute & Resources**: Subsidi kuota compute/API untuk riset bersama.
     4. **Kompetisi & Delegasi**: Biaya registrasi lomba/hackathon nasional didukung kas komunitas.
     5. **Verified Portfolio Showcase**: Profil karya dipajang di domain resmi `muaraai.com`.
10. **Open Treasury Preview (Two Clean Metrics)**:
    - Metric 1: **Total Kas Saat Ini** (Net balance: `SUM(income) - SUM(expense)`).
    - Metric 2: **Total Pengeluaran Kas** (`SUM(expense)`).
    - Subtitle: Transparent open-book note; dues management and payment forms are located within the Member Dashboard.
11. **Join Flow Section**:
    - 3-step timeline:
      1. Authenticate with GitHub.
      2. Submit verifiable repository or portfolio Proof of Work.
      3. Receive automatic invitation to `github.com/MuaraAI` organization.
12. **Footer & Compliance Links**:
    - MIT License disclosure, GitHub Org link, server health status indicator.
    - Legal routes: `/terms` (Terms of Service), `/privacy` (Privacy Policy), `/code-of-conduct` (Code of Conduct).

---

### 4.2 Member Dashboard (`/dashboard`)
*Access condition: Authenticated user with `registration_status = 'approved'`.*
1. **Overview & Profile**:
   - View active badge titles, cluster assignment, and submit semester PoW updates.
2. **Treasury & Dues Tab (`/dashboard/treasury`)**:
   - Shows individual dues status: `dues_valid_until` date and remaining active days.
   - **Pay Dues Module**:
     - Fee: **Rp 3,000 / week** (selectable: 1 week = Rp 3k, 2 weeks = Rp 6k, 4 weeks = Rp 12k).
     - Generates dynamic QRIS via Pakasir API.
     - Auto-polls or listens to Supabase Realtime for instant payment confirmation.
   - **Ledger History**: Public transparent table showing past incoming and outgoing transactions.
3. **Muara Learn (`/dashboard/learn`)**:
   - Feed of engineering and creative materials shared by maintainers.
   - Card displays: Title, description, optional cover image, division tag (`all`, `builder`, `creative`), and publication date.
   - **Click & Read Tracking**: When a member clicks the resource link (PDF / Google Drive / Notion / Repo), the client sends an audit event inserting a row into `public.learning_material_reads` with the exact server timestamp (`now()`), marking it as read.

*(Note on Project API Keys: Vault & API Key generation are intentionally decoupled from `muaraai.com` and hosted directly inside each project's sub-domain, e.g. `ubsi-api.muaraai.com` and `ai.muaraai.com`, utilizing shared SSO sessions across `*.muaraai.com`)*

---

### 4.3 Maintainer Control Plane (`/admin`)
*Access condition: User has `hierarchy = 'maintainer'` or `'maintainer' = ANY(roles)`.*
1. **Review Queue (`/admin/review`)**:
   - Inspect pending applicant submissions: Full name, NIM, portfolio link, toolchain narrative.
   - **Approve Action**: Updates status to `approved`, sends congratulatory email via Resend, and invokes GitHub API (`PUT /orgs/MuaraAI/memberships/{username}`) to invite user to the organization.
   - **Reject Action**: Updates status to `rejected` with recorded reason.
2. **Treasury Management (`/admin/treasury`)**:
   - Form to log operational expenses (amount, category, description, invoice URL).
3. **Membership Auditing (`/admin/members`)**:
   - Filter members whose `dues_valid_until < CURRENT_DATE - INTERVAL '30 days'`.
   - Toggle blacklist / deactivate (`is_active = false`) for chronic non-payers.
4. **Learning Materials Management (`/admin/learn`)**:
   - Form to publish new materials: Title, description, optional cover photo URL, resource link (PDF/GDrive), and target division.
   - **Read Audit Inspector**: Shows who has clicked/read the material with their avatar, name, and exact server timestamp.
5. **Mail Center (`/admin/mail`)**:
   - Maintainer email dispatch console powered by the Resend API (from `admin@muaraai.com`).
   - Recipient selection: "All Members", "Builder Division", "Creative Division", or custom individual email.
   - Subject header and Markdown message composer.
   - Sent email history log recorded into `public.sent_emails`.
6. **Achievements Manager (`/admin/achievements`)**:
   - Form to upload and manage community competition wins and certificates.
   - Fields: Title, issuer, issue date, certificate image URL, verification URL, recipient member(s).

---

### 4.4 Webhook Handler (`/api/webhooks/pakasir`)
1. Receives POST callback from Pakasir upon successful QRIS scan.
2. Validates request signature/token.
3. Inserts row into `public.treasury_transactions` (`type: 'income'`, `category: 'dues'`).
4. Extends `dues_valid_until` on `public.members`:
   - If current `dues_valid_until >= CURRENT_DATE`, add N days.
   - If expired, set to `CURRENT_DATE + N days`.
   - Ensures `is_active = true`.
5. Dispatches notifications to maintainers via Resend, Discord, and Telegram.

---

## 5. Security & Privacy Architecture

1. **Zero Secrets in Repository**:
   - No database URLs, service role keys, or webhook secrets committed to git.
   - Handled via Vercel Environment Variables and local `.env.local` (git-ignored).
2. **Row-Level Security (RLS)**:
   - `public.members`: Public read for approved members; users can only edit their own bio/links; maintainers can update status and roles.
   - `public.treasury_transactions`: Public read for `status = 'paid'`; INSERT/UPDATE restricted to maintainers and service role (webhook handler).
3. **Anti-Free-Rider Enforcement**:
   - Members with dues overdue by >30 days automatically lose API access and push rights until settled.

---

## 6. Verification & Quality Gates

1. **Unit & Integration Tests**:
   - Dues calculation & date rollover logic.
   - Pakasir webhook signature validation and idempotency.
   - Supabase RLS policy test cases.
2. **Accessibility & Anti-Slop Audit**:
   - WCAG AA contrast ratio compliance on Deep Water color palette.
   - Zero emojis in UI components.
   - Performance budget: LCP < 1.5s, zero remote font calls.
