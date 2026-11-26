# MuaraAI

> Where local craft flows global.

MuaraAI adalah komunitas terbuka untuk siapa saja yang mau belajar, membangun project, dan berkontribusi sebagai builder atau kreator. Anggota belajar, membangun project, dan berkontribusi lewat pull request di GitHub org [MuaraAI](https://github.com/MuaraAI), dan kontribusi yang sudah di-merge dihitung otomatis. Komunitas ini lahir di UBSI Pontianak dan menerima mahasiswa, pelajar, dan umum dari mana saja.

- Website: https://muaraai.com/ (Indonesia) dan https://muaraai.com/en (English)

![MuaraAI logo](public/brand/muara-logo.png)

## Cara kerja komunitas

**Pendaftaran.** Wajib punya akun GitHub. Alur: isi form onboarding (alasan bergabung minimal 50 karakter), setujui Privacy Policy, Terms of Service, dan Code of Conduct, login GitHub OAuth, lalu kirim Proof of Work. Maintainer me-review, dan anggota yang disetujui otomatis diundang ke GitHub org. Dukungan finansial sukarela lewat https://sociabuzz.com/muaraai.

**Divisi dan posisi.** Pilih satu divisi utama dan posisi resmi, divisi kedua opsional. Daftar posisi bisa diubah admin di `/admin/settings`.

- Builder: App, Web, Frontend, Backend, Automation, Game, Modding
- Creative: Social Media, Image, Video, Copywriting, Humanizer, Idea

**Peran.** Maintainer, Head, Lead, Member.

**Target bulanan.** Hanya pull request yang sudah di-merge dan di-approve oleh orang selain author yang dihitung, per bulan UTC.

| Divisi | Target default |
| --- | --- |
| Builder | 10 PR ter-merge, 5 di antaranya di repo milik orang lain, 50 commit di dalam PR itu, 1 repo baru |
| Creative | 10 PR ter-merge, 5 di antaranya di repo milik orang lain, 1 karya baru (PR berlabel `karya-baru`) |

Angka target, mode penegakan, dan pengali tier disimpan di pengaturan `contribution_rules` dan diedit maintainer di `/admin/settings`. Mode default `dry_run` hanya mencatat evaluasi; `warn_only` mengirim peringatan; `full` juga mengeluarkan anggota yang gagal dua bulan berturut-turut. Cron harian mengevaluasi bulan yang sudah selesai satu kali per anggota, dan data GitHub yang tidak lengkap menunda evaluasi, bukan menganggapnya gagal.

**Tier.** Riak (target tercapai), Arus (×1.5), Pasang (×2), Samudra (×3), dihitung tiap bulan. Hanya pengakuan, tanpa hak istimewa, dan tampil di direktori anggota beserta streak bulan berturut-turut.

**Sesi Discord.** Admin mengatur sesi mingguan di `/admin/sessions` (default Jumat 19:30 sampai 22:00 WIB). Anggota check-in di dashboard dengan kode yang diumumkan hanya di voice Discord. Kehadiran bersifat pribadi dan tidak memengaruhi target, peringatan, atau tier.

## Project

Daftar ini dicek terhadap GitHub org dan situs aslinya pada 26 November 2026. Sumber datanya satu: `communityContent.products` di `src/lib/community-content.ts`, dipakai landing, `/projects`, `/en`, dan footer.

| Project | Isi | Situs | Repo |
| --- | --- | --- | --- |
| Mira | Dashboard SIAKAD dan MyBest UBSI, plus REST API dan MCP server untuk enam layanan kampus. Proyek independen, tidak berafiliasi dengan UBSI. (Dulu bernama UBSI API.) | https://mira.muaraai.com | https://github.com/MuaraAI/Mira |
| FluxCode | Editor kode native yang ditulis dengan Rust, dengan agen AI bawaan, untuk Windows, macOS, dan Linux. | https://fluxcode.muaraai.com | https://github.com/MuaraAI/FluxCode |

Segera hadir: Muara V1 Flash, portal API dan model AI komunitas.

Semua repo publik org, termasuk yang belum jadi produk, terdaftar di https://muaraai.com/projects.

Tim inti: Yuken Velino (`@Curzyori`, Founder), Muhammad Raffli Aldiansyah (`@Seeyaa77`, Co-Founder), Verzio Yamanansyah (`@MyKineID`, Co-Founder).

## Struktur aplikasi

```text
muaraai.com/
├── /                      # Landing (Indonesia)
├── /en, /en/join, /en/onboarding  # Landing, cara daftar, dan form pendaftaran (English)
├── /projects              # Repo publik org dari GitHub
├── /members               # Direktori publik, urut tier lalu streak
├── /onboarding            # Form pendaftaran + legal gate + GitHub OAuth
├── /login                 # Masuk dengan GitHub
├── /terms, /privacy, /code-of-conduct
├── /dashboard             # Workspace member: status, kontribusi bulan ini, sesi Discord
├── /dashboard/learn       # Muara Learn
├── /admin                 # Workspace maintainer
│   ├── /review            # Review pendaftar
│   ├── /members           # Audit membership dan lifecycle
│   ├── /contributions     # Progres kontribusi, tombol sinkron
│   ├── /sessions          # Sesi Discord dan kode check-in
│   ├── /learn             # Pengelolaan materi
│   ├── /achievements      # Prestasi komunitas
│   └── /settings          # Posisi, target kontribusi, mode penegakan, pengali tier
└── /api
    ├── /auth/*            # Login, callback, logout GitHub OAuth
    └── /cron/contributions  # Sinkron dan evaluasi harian (dilindungi CRON_SECRET)
```

Versi Inggris mencakup landing, penjelasan cara daftar, dan form pendaftaran (teks form ada di `src/lib/onboarding-copy.ts`, pesan validasi di `src/lib/validation.ts`). Terms, Privacy Policy, Code of Conduct, serta portal anggota dan admin masih berbahasa Indonesia, dan halaman Inggris menyebut hal itu.

## Teknologi

- Next.js 15 App Router, React 19, TypeScript strict, Tailwind CSS
- Supabase PostgreSQL (RLS, trigger, grant per kolom) dan Supabase Auth (GitHub OAuth)
- GitHub GraphQL dan REST API untuk menghitung kontribusi
- Vercel (hosting) dan Vercel Cron harian (`0 17 * * *` UTC) untuk `/api/cron/contributions`
- Resend untuk email, Discord webhook untuk notifikasi private maintainer
- Vitest dan React Testing Library
- Font lokal Inter, Space Grotesk, dan JetBrains Mono; ikon SVG inline

Logika kontribusi (`src/lib/contributions`) tidak mengimpor Next atau Supabase, jadi bisa dipindah ke worker terpisah tanpa mengubah aturannya.

## Keamanan

- Semua secret hanya dari environment variable server, tanpa fallback di kode. Fail-fast bila `NEXT_PUBLIC_SUPABASE_URL` atau `NEXT_PUBLIC_SUPABASE_ANON_KEY` tidak diset.
- Kolom privat anggota (email, WhatsApp, alasan bergabung, status peringatan, dan sebagainya) tidak di-grant ke role publik; server membacanya lewat client service role setelah otorisasi, dan sebuah test menjaga aturan ini.
- Trigger database mencegah anggota mengubah peran, status, tier, streak, dan kolom istimewa lain, baik lewat UPDATE maupun INSERT.
- Kode check-in sesi tidak bisa dibaca anggota; semua kegagalan check-in memakai satu pesan galat yang sama.
- Cron dilindungi `CRON_SECRET` (perbandingan constant-time). Error dari provider tidak dikirim mentah ke client atau ke notifikasi.
- Security headers aktif: HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- Notifikasi Discord mematikan ambient mention; email outbound di-escape.
- Dokumen planning internal (`docs/prd`, `docs/superpowers`) dan state lokal tidak ikut repository.

## Desain

Gaya terang dan tenang dengan aksen pixel kecil (logo, tombol, bingkai):

- Kanvas terang, deep riverbed ink `#072033`, river current blue `#0369A1`.
- Logo resmi `public/brand/muara-logo.png`, juga dipakai sebagai favicon.
- Motion seminimal mungkin dan menghormati `prefers-reduced-motion`.
- Navbar publik: Project, Anggota, Aturan, GitHub, Masuk, dan satu tombol Daftar.

## Menjalankan lokal

Prasyarat: Node.js 20.x atau 22.x LTS dan akun GitHub untuk OAuth lokal.

```bash
git clone https://github.com/MuaraAI/MuaraAI.git
cd MuaraAI
npm install
cp .env.example .env.local
npm run dev
```

Buka http://localhost:3000. Untuk OAuth lokal, daftarkan Redirect URL `http://localhost:3000/api/auth/callback` di Supabase (Authentication, URL Configuration).

Variabel di `.env.example`:

| Variabel | Fungsi |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Koneksi Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role, hanya di server |
| `RESEND_API_KEY`, `MAINTAINER_EMAIL` | Email |
| `DISCORD_WEBHOOK_URL` | Notifikasi maintainer |
| `GITHUB_ORG_TOKEN` | Undangan org dan membaca PR ter-merge |
| `CRON_SECRET` | Rahasia cron harian (nilai acak panjang) |
| `MUARA_DEV_MOCK` | Opsional, hanya development |

Jangan memasukkan secret asli ke README, source code, test, atau commit. Skema database ada di `supabase/migrations` (terapkan berurutan, migrasi aditif dulu sebelum deploy kode yang memakainya).

## Verifikasi

```bash
npm test
npx tsc --noEmit
npm run build
```

Test mencakup UI, aturan kontribusi dan tier, adapter Supabase, cron, check-in sesi, batas privasi kolom, migrasi, dan navigasi.

## Official links

- Website: https://muaraai.com/
- GitHub: https://github.com/MuaraAI
- X: https://x.com/MuaraAI
- Instagram: https://www.instagram.com/muara.ai/
- Threads: https://www.threads.com/@muara.ai
- Hugging Face: https://huggingface.co/MuaraAI
- Email: mailto:admin@muaraai.com

## Lisensi

Lihat [LICENSE](LICENSE) untuk ketentuan lisensi repository.

Hak cipta © 2026 MuaraAI Core Team.
