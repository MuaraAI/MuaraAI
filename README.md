# Muara AI (`muaraai.com`)

> **Where local craft flows global.**

Portal web resmi, direktori keanggotaan berbasis *proof-of-work*, dan kontrol otomasi kas komunitas Muara AI — sindikat riset dan rekayasa kecerdasan buatan mahasiswa Universitas Bina Sarana Informatika (UBSI) Kampus Kota Pontianak.

---

## 1. Apa itu Muara AI

Muara AI adalah studio dan komunitas praktisi rekayasa AI independen yang menolak keras budaya *FOMO*, plagiarisme joki tugas, dan keluaran AI mentah tanpa kurasi (*anti-slop*).

Portal `muaraai.com` mengintegrasikan:
1. **The Hall of Projects**: Etalase proyek perangkat lunak produksi nyata (`UBSI API` & `Muara AI Gateway`).
2. **The Accolades**: Arsip verifikasi sertifikat penghargaan, kejuaraan hackathon, dan kompetisi nasional.
3. **The Syndicate**: Direktori anggota terverifikasi live dari database Supabase dengan filter kategori dan leaderboard *Top Commits*.
4. **Sistem Kas QRIS Otomatis (Pakasir Gateway)**: Pembayaran iuran kas digital mandiri (Rp 3.000 / minggu atau Rp 12.000 / bulan) dengan transparansi saldo terbuka tanpa unggah struk manual.
5. **Muara Learn**: Pusat pengetahuan riset internal dengan audit pencatatan pembaca (*read-tracking*) berbasis waktu server.
6. **Maintainer Control Plane**: Panel khusus pengurus inti untuk mereview berkas pendaftar, mengundang otomatis ke GitHub Organization via API, mencatat pengeluaran kas, serta mengirim broadcast email via Resend API.

---

## 2. Arsitektur & Teknologi

```text
muaraai.com/
├── (public)             # Halaman publik (Deep Water Dark Theme)
│   ├── /                # Landing page (Hero, Projects, Accolades, Syndicate, Treasury)
│   ├── /terms           # Ketentuan layanan meritokrasi
│   ├── /privacy         # Kebijakan privasi identitas GitHub
│   └── /code-of-conduct # Aturan anti-slop, anti-joki, dan etika rekayasa
│
├── (portal)             # Area terproteksi anggota & pengurus
│   ├── /dashboard       # Profil anggota & status keanggotaan
│   ├── /dashboard/treasury # Bayar kas via QRIS Pakasir & riwayat mutasi
│   ├── /dashboard/learn # Feed materi riset Muara Learn
│   │
│   └── /admin           # Hak akses terkunci khusus Maintainer
│       ├── /review      # Antrean PoW -> 1-klik Approve & invite GitHub Org
│       ├── /treasury    # Pencatatan biaya operasional (VPS, domain, lomba)
│       ├── /learn       # Terbitkan materi baru & audit siapa saja pembacanya
│       ├── /mail        # Console kirim broadcast via Resend API & outbox log
│       ├── /achievements# Tambah sertifikat & prestasi baru
│       └── /members     # Audit tunggakan kas & kontrol blacklist (>30 hari)
│
└── api/
    ├── auth/callback    # Pertukaran sesi GitHub OAuth SSO (.muaraai.com)
    └── webhooks/pakasir # Webhook pembayaran QRIS (verifikasi fail-closed server-to-server)
```

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS (Deep Water: `#070B14`, `#0B132B`, `#06B6D4`)
- **Font & Ikon**: Self-hosted lokal Inter & Space Grotesk (`public/fonts/`); Google Material Symbols Rounded (Zero emoji di UI, zero remote CDN)
- **Database & Auth**: Supabase PostgreSQL (`awlwvcmrknkdxnwolcoy`) + Supabase Auth (100% GitHub OAuth)
- **Payment Gateway**: Pakasir Dynamic QRIS API
- **Email & Alerts**: Resend SDK + Webhook Discord & Telegram Bot
- **Pengujian**: Vitest + React Testing Library (100% Offline Passing)

---

## 3. Instalasi & Menjalankan Lokal

### Prasyarat
- Node.js 20.x atau 22.x LTS
- Akun GitHub aktif

### Langkah Setup
1. Clone repositori:
   ```bash
   git clone https://github.com/MuaraAI/MuaraAI.git
   cd MuaraAI
   ```

2. Pasang dependensi:
   ```bash
   npm install
   ```

3. Salin file environment:
   ```bash
   cp .env.example .env.local
   ```
   Lengkapi variabel environment sesuai konfigurasi Supabase, Pakasir, dan Resend.

4. Jalankan development server:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 4. Pengujian Otomatis & Standar Kualitas

Proyek ini mewajibkan pengujian otomatis dan typecheck bebas galat sebelum kode dapat digabungkan:

```bash
# Menjalankan seluruh test suite offline
npm test

# Pemeriksaan tipe TypeScript
npx tsc --noEmit

# Kompilasi build produksi Next.js
npm run build
```

---

## 5. Lisensi

Dirilis di bawah lisensi resmi [MIT License](LICENSE).
Hak Cipta © 2026 Core Team Muara AI (Yuken Velino, M Raffli Aldiansyah, Verzio).
