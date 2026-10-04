# Specification: Muara AI Ecosystem — Centralized Vault & Subdomain Topology

- **Document ID:** `SPEC-2026-10-04-ECOSYSTEM-VAULT`
- **Date:** 2026-10-04
- **Status:** Approved
- **Author:** Yuken Velino (Founder, @Curzyori) & Core Team
- **Target Repositories:**
  - `MuaraAI/MuaraAI` (`muaraai.com` — Central Portal & Vault)
  - `MuaraAI/ai-web` (`ai.muaraai.com` — AI Gateway Landing & Docs)
  - `MuaraAI/UBSI-API` (`ubsi-api.muaraai.com` — UBSI API Landing & Docs)

---

## 1. Executive Summary & Architectural Intent

To maintain maximum security, eliminate credential fragmentation, and avoid redundant login systems across subdomains, the Muara AI ecosystem establishes a **Single Source of Truth** for membership, authentication, and API key management:

1. **Centralized Portal (`muaraai.com`)**:
   - Sole platform for 100% GitHub OAuth authentication, Proof of Work (PoW) screening, community dues (Pakasir QRIS), and maintainer operations.
   - Hosts the **Centralized Vault (`/dashboard/vault`)**, allowing approved members to generate, view-once, and revoke API keys for all community projects from a single screen.
2. **Decoupled Product Frontends (`ai.muaraai.com` & `ubsi-api.muaraai.com`)**:
   - Zero local authentication, zero login forms, and zero client-side Supabase dependencies.
   - Function strictly as high-speed static landing pages and technical documentation hubs.
   - All call-to-action (CTA) buttons link visitors to `muaraai.com` for key generation and member onboarding.
3. **Decoupled Backend Verification**:
   - The product backends (`api.muaraai.com/v1/ai/*` via Cloudflare Worker and `api.muaraai.com/v1/ubsi-api/*` via FastAPI on VPS Tencent) independently authenticate incoming request headers against the centralized Supabase database using SHA-256 key hashes and Redis caching.

---

## 2. Multi-Repository Ecosystem Topology

```text
                                 ┌────────────────────────────────────────────────────────┐
                                 │                   PORTAL UTAMA                         │
                                 │                   muaraai.com                          │
                                 │             (Repo: MuaraAI/MuaraAI)                    │
                                 │  - Auth: 100% GitHub OAuth SSO                         │
                                 │  - Member Dashboard:                                   │
                                 │    ├── /dashboard/vault  <-- PUSAT BIKIN API KEY       │
                                 │    │     ├── muara_ai_...   (AI Gateway)               │
                                 │    │     └── muara_ubsi_... (UBSI API)                 │
                                 │    ├── /dashboard/treasury (Kas QRIS Pakasir)          │
                                 │    └── /dashboard/learn    (Materi Riset)              │
                                 │  - Admin Control Plane (/admin/*)                      │
                                 └───────────────────────────┬────────────────────────────┘
                                                             │ (Satu Supabase Cloud)
                                                             │ Host: awlwvcmrknk...
                                ┌────────────────────────────┴────────────────────────────┐
                                ▼                                                         ▼
┌───────────────────────────────────────────────────────┐ ┌───────────────────────────────────────────────────────┐
│               AI GATEWAY FRONTEND                     │ │               UBSI API FRONTEND                       │
│                 ai.muaraai.com                        │ │              ubsi-api.muaraai.com                     │
│             (Repo: MuaraAI/ai-web)                    │ │          (Repo: MuaraAI/UBSI-API/landing-page)        │
│  - MURNI Landing Page & Dokumentasi                   │ │  - MURNI Landing Page & Dokumentasi                   │
│  - Zero Login, Zero Supabase di frontend              │ │  - Zero Login, Zero Supabase di frontend              │
│  - Info model: low, medium, high & rate limit         │ │  - Showcase 6 modul layanan, quickstart cURL          │
│  - CTA: "Buat Kunci API di muaraai.com"               │ │  - CTA: "Dapatkan API Key di muaraai.com"             │
└───────────────────────────────┬───────────────────────┘ └───────────────────────────────┬───────────────────────┘
                                │                                                         │
                                ▼                                                         ▼
┌───────────────────────────────────────────────────────┐ ┌───────────────────────────────────────────────────────┐
│               AI GATEWAY BACKEND                      │ │               UBSI API BACKEND                        │
│                api.muaraai.com/v1/ai/*                │ │             api.muaraai.com/v1/ubsi-api/*             │
│            (Cloudflare Worker: ai-backend)            │ │      (FastAPI + Redis di VPS Tencent Port 8300)       │
│  - Header: Authorization: Bearer ***         │ │  - Header: X-API-Key: ***                  │
│  - Hashing sha256 -> Cek DB schema ai.api_keys        │ │  - Hashing sha256 -> Cek Redis / DB schema ubsi_api   │
│  - Enforce kuota -> Proxy ke model upstream           │ │  - Dekripsi NIM & password AES-256 -> Scrape kampus   │
└───────────────────────────────────────────────────────┘ └───────────────────────────────────────────────────────┘
```

---

## 3. Centralized Vault Architecture (`/dashboard/vault`)

### 3.1 Key Specifications
Each community project uses a distinct, non-overlapping key prefix and schema:

| Project | Key Prefix | Format | Storage Target | Verification Backend |
|---|---|---|---|---|
| **Muara AI Gateway** | `muara_ai_` | `muara_ai_<64 lowercase hex>` (73 chars) | `ai.api_keys` (via `public.ai_api_keys`) | Cloudflare Worker (`/v1/ai/*`) |
| **UBSI API** | `muara_ubsi_` | `muara_ubsi_<64 lowercase hex>` (75 chars) | `ubsi_api.api_keys` (via `public.api_keys`) | FastAPI VPS Tencent (`/v1/ubsi-api/*`) |

### 3.2 In-Browser WebCrypto Cryptography
Key generation strictly follows zero-trust client-side generation:
1. **Entropy Generation**: Browser generates 32 bytes (64 hex characters) of cryptographically secure random values via `globalThis.crypto.getRandomValues(new Uint8Array(32))`.
2. **Key Hashing**: Browser computes lowercase SHA-256 hash using `globalThis.crypto.subtle.digest("SHA-256", encoded)`.
3. **Prefix Extraction**: First 14-16 characters are sliced as `key_prefix` for user identification (e.g. `muara_ai_4a7b...`).
4. **Server Persistence**: The client calls Server Action `saveApiKey()`. Only `key_hash`, `key_prefix`, and user label are stored in Supabase. Plaintext keys never touch server databases or log streams.
5. **View-Once Delivery**: The modal renders the plaintext key immediately with a one-click copy button and a security notice. Once dismissed, the key can never be retrieved again.

### 3.3 Security Invoker Views in Supabase
To ensure clean PostgREST and SSR client queries without bypassing database constraints:
- `public.ai_api_keys` is configured with `security_invoker = true`, delegating permission checks to `ai.api_keys` RLS (`auth.uid() = user_id`).
- `public.api_keys` is configured with `security_invoker = true`, delegating permission checks to `ubsi_api.api_keys` RLS (`(SELECT auth.uid()) = user_id`).
- Active state enforcement: When a member generates a new key for a project, existing keys for that member in that project are automatically marked `is_active = false`.

---

## 4. Backend Authentication & Verification Contracts

### 4.1 Muara AI Gateway Contract
- **Endpoint**: `https://api.muaraai.com/v1/ai/chat/completions` (and `/v1/ai/models`).
- **Header**: `Authorization: Bearer muara_ai_<hex>`
- **Handler**: Cloudflare Worker (`worker/src/index.ts`).
- **Process**:
  1. Hashes token with SHA-256.
  2. Queries `ai.api_keys` where `key_hash = ? AND is_active = true`.
  3. Joins `public.members` to verify member is `approved` and `is_active = true`.
  4. Enforces rate limits against `ai.rate_limits` and `ai.usage_counters`.
  5. Proxies request to upstream model router.

### 4.2 UBSI API Contract
- **Endpoint**: `https://api.muaraai.com/v1/ubsi-api/*` (or `http://127.0.0.1:8300/*`).
- **Header**: `X-API-Key: muara_ubsi_<hex>`
- **Handler**: FastAPI on VPS Tencent (`app/vault.py` & `app/main.py`).
- **Process**:
  1. Hashes key with SHA-256.
  2. Checks Redis cache `ubsi:vault:{key_hash}` (TTL 10m).
  3. On cache miss: Queries Supabase REST API `GET /rest/v1/api_keys?key_hash=eq.{hash}&is_active=eq.true`.
  4. Decrypts bound campus credentials (`encrypted_studentv2_pass`, `encrypted_elearning_pass`) using `VAULT_ENCRYPTION_KEY` (AES-256-GCM).
  5. Stores decrypted tuple in Redis (TTL 10m) and executes automated scraping against campus systems.

---

## 5. Implementation Summary & Verification Checklist

- [x] **`muaraai.com` Vault Interface**: Route `/dashboard/vault` active with tabs for AI Gateway and UBSI API.
- [x] **View-Once Modal**: Built with zero emoji, high-contrast Light Ocean styling, and instant clipboard copy.
- [x] **Database Views**: `public.ai_api_keys` and `public.api_keys` verified with `security_invoker = true`.
- [x] **Automated Tests**: Unit tests in `tests/vault-keys.test.ts` passing 100% offline (key formatting, length, SHA-256 hashing, prefix extraction).
- [x] **Product Frontends Synchronized**: `ai-web` PR #11 merged (local login/dashboard removed); `UBSI-API` landing page verified.
- [x] **Git Hygiene**: Committed locally, zero push to remote.
