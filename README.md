# MuaraAI

> Where local craft flows global.

MuaraAI adalah komunitas mahasiswa UBSI dari seluruh Indonesia yang lahir di UBSI Pontianak. Komunitas ini terbuka untuk mahasiswa angkatan 2026 dan seterusnya, dengan ruang untuk belajar, membangun project, menunjukkan Proof of Work, dan berkontribusi bersama.

Website utama: https://muaraai.com/
AI Playground: https://ai.muaraai.com/

![MuaraAI logo](public/brand/muara-logo.png)

## Produk dan project

### Muara Arus 1

Muara Arus 1 adalah AI lokal akademik dan coding buatan MuaraAI.

- Model ID: `muara-arus-1`
- Ukuran: 1.5B parameter
- Runtime: ditujukan berjalan 100% offline
- Fokus saat ini: FTI UBSI, program SI, SIA, dan IF
- Playground: https://ai.muaraai.com/
- GitHub: https://github.com/MuaraAI/muara-arus-1
- Hugging Face: https://huggingface.co/MuaraAI/muara-arus-1
- Ollama: https://ollama.com/MuaraAI/muara-arus-1

Model ini dikembangkan untuk membantu mahasiswa memahami materi akademik yang tersedia dan mengerjakan tugas dengan konteks sumber yang jelas. Cakupan pengetahuan dapat berkembang setelah dataset dan evaluasinya diperluas.

### UBSI API

UBSI API adalah REST API unofficial yang menyatukan enam layanan digital UBSI ke dalam antarmuka JSON. Mahasiswa menggunakan akun mereka sendiri untuk mengakses layanan yang tersedia.

Layanan yang tercakup:

- StudentV2 / SIAKAD
- MyBest LMS
- Elibrary
- EJournal
- Repository
- News Portal

- Website: https://ubsi-api.muaraai.com
- Repository: https://github.com/MuaraAI/UBSI-API

UBSI API dikembangkan secara independen dan tidak berafiliasi, disponsori, atau dikelola oleh UBSI.

## Komunitas

MuaraAI dimulai dari mahasiswa UBSI Pontianak dan berkembang menuju komunitas nasional. Pontianak adalah founding hub dan pusat utama pertemuan offline. Jakarta menjadi regional hub, sementara kampus UBSI lain terhubung sebagai node komunitas.

Ketentuan intake saat ini:

- Mahasiswa UBSI dari kampus di seluruh Indonesia.
- Angkatan 2026 dan seterusnya.
- Proses pendaftaran menggunakan GitHub OAuth dan Proof of Work.
- Detail verifikasi, membership, iuran, dan akses tersedia setelah login.

Tim inti:

- Yuken Velino | NIM 15260767 — `@Curzyori` — Founder, Maintainer, Builder
- Muhammad Raffli Aldiansyah | NIM 15260161 — `@Seeyaa77` — Co-Founder, Maintainer, Builder
- Verzio Yamanansyah | NIM 15260225 — `@MyKineID` — Co-Founder, Maintainer, Builder

## Struktur aplikasi

```text
muaraai.com/
├── /                       # Landing page dan showcase komunitas
├── /members                # Direktori publik anggota
├── /onboarding             # Pendaftaran Proof of Work UBSI
├── /terms                 # Ketentuan layanan
├── /privacy               # Kebijakan privasi
├── /code-of-conduct       # Norma dan etika komunitas
├── /dashboard              # Workspace member: status dan next action
├── /dashboard/learn       # Muara Learn
├── /dashboard/treasury    # Iuran dan kas komunitas
├── /dashboard/vault       # Akses API internal member
└── /admin                 # Workspace maintainer
    ├── /review            # Review pendaftar
    ├── /members           # Audit membership dan lifecycle
    ├── /treasury         # Pencatatan kas
    ├── /learn            # Pengelolaan materi
    ├── /mail             # Inbox dan email komunitas
    └── /achievements     # Prestasi komunitas
```

## Teknologi

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- `motion/react` untuk motion UI yang fungsional
- Supabase PostgreSQL dan Supabase Auth
- GitHub OAuth
- Pakasir QRIS
- Resend
- Vitest dan React Testing Library
- Font lokal Inter, Space Grotesk, dan JetBrains Mono
- Inline SVG icon system, tanpa emoji sebagai ikon UI

## Desain dan motion

Visual MuaraAI memakai Fluid Currents Light:

- Kanvas terang estuary.
- Deep riverbed ink `#072033`.
- River current blue `#0369A1`.
- Logo resmi dari `public/brand/muara-logo.png`.
- Mura sebagai mascot pendukung pada onboarding, empty state, error, dan halaman 404.
- Peta nasional di hero menggunakan SVG Indonesia, rute yang tergambar bertahap, dan Pontianak sebagai founding hub.
- Motion mengikuti prinsip Laku: scroll reveal, active state, route drawing, dan progressive disclosure.
- Semua motion memiliki fallback `prefers-reduced-motion`.

## Menjalankan lokal

Prasyarat:

- Node.js 20.x atau 22.x LTS
- Akun GitHub aktif untuk OAuth lokal

```bash
git clone https://github.com/MuaraAI/MuaraAI.git
cd MuaraAI
npm install
cp .env.example .env.local
npm run dev
```

Buka http://localhost:3000.

Jangan memasukkan secret asli ke README, source code, test, atau commit. Isi `.env.local` hanya di mesin lokal.

## Verifikasi

```bash
npm test
npm run build
```

Build terakhir memverifikasi 23 route dan test suite lokal mencakup UI, membership lifecycle, auth boundaries, public content, mascot, dan responsive-oriented contracts.

## Official links

- Website: https://muaraai.com/
- AI Playground: https://ai.muaraai.com/
- GitHub: https://github.com/MuaraAI
- X: https://x.com/MuaraAI
- Instagram: https://www.instagram.com/muara.ai/
- Threads: https://www.threads.com/@muara.ai
- Hugging Face: https://huggingface.co/MuaraAI
- Ollama: https://ollama.com/MuaraAI
- Email: mailto:admin@muaraai.com

## Lisensi

Lihat [LICENSE](LICENSE) untuk ketentuan lisensi repository.

Hak cipta © 2026 MuaraAI Core Team.
