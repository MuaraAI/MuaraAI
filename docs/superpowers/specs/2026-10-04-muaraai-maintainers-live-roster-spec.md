# Specification: Muara AI Web — Live GitHub Maintainers Roster & Anti-Slop Card Simplification

- **Document ID:** `SPEC-2026-10-04-MAINTAINERS-ROSTER`
- **Date:** 2026-10-04
- **Status:** Draft / Ready for Approval
- **Author:** Yuken Velino (Founder, @Curzyori) & Core Team
- **Target Repository:** `MuaraAI/MuaraAI` (`muaraai.com`)
- **Component:** `src/components/landing/syndicate-roster.tsx`

---

## 1. Executive Summary & Problem Statement

### 1.1 Masalah Saat Ini (Artificial Copy & Fluff)
Pada implementasi sebelumnya di beranda `#syndicate`, kartu maintainer masih memuat teks buatan yang terlalu panjang dan bernada *marketing AI-slop*, seperti:
- *"Arsitek backend engine UBSI API. Mengembangkan scraper multi-tenant, caching Redis terdistribusi, dan automasi data akademik."*
- *"Inisiator Muara AI. Fokus pada arsitektur AI gateway mandiri, reverse-engineering API kampus, dan otomasi developer agent."*
- Serta label track yang redundant seperti *"AI Gateway & Systems Architecture"*, *"FastAPI & Distributed Scrapling"*, *"Visual Identity & UI Direction"*.

Teks-teks tersebut:
1. Melanggar prinsip *Anti-Slop*: memuat klaim naratif panjang alih-alih data faktual.
2. Membuat ukuran tinggi kartu terlalu besar dan tidak proporsional.
3. Kurang dinamis karena tidak langsung merefleksikan profil asli GitHub pengurus.

### 1.2 Tujuan Spesifikasi
1. **Hapus Seluruh Bio/Keterangan Panjang**: Membuang semua paragraf naratif promosi diri dan label track arsitektur yang berlebihan dari kartu maintainer.
2. **Data Asli dari Database & GitHub**: Mengambil username dari database/GitHub Org kita (`Curzyori`, `Seeyaa77`, `MyKineID`), serta mengambil foto avatar langsung dari GitHub (`https://github.com/${username}.png` atau GitHub API).
3. **Struktur Kartu Bersih & Faktual**:
   - Foto avatar asli langsung dari GitHub (resolusi tajam, selalu up-to-date).
   - Nama Asli & `@username` GitHub.
   - Badge Title & Role resmi: `Founder` / `Co-Founder`, `Maintainer`, `Builder` / `Creative`.
   - Tombol tautan langsung ke profil GitHub pengurus.
4. **Desain Kompak & Proporsional**: Selaras dengan tema **Fluid Currents Light v2** (`rounded-[18px]`, `border-stroke`, `shadow-diffusion`).

---

## 2. Struktur Data & Kontrak Antarmuka (Data Schema)

### 2.1 Konfigurasi Maintainer Inti (Single Source of Truth)

Daftar maintainer didefinisikan secara faktual berdasarkan keanggotaan tim GitHub Org `@MuaraAI/maintainers` dan database Supabase `public.members`:

| GitHub Username | Nama Lengkap | Title Utama | Role Badges | Divisi |
|---|---|---|---|---|
| **`Curzyori`** | Yuken Velino | Founder | `Founder`, `Maintainer`, `Builder` | Builder |
| **`Seeyaa77`** | Seeyaa (Muhammad Raffli Aldiansyah) | Co-Founder | `Co-Founder`, `Maintainer`, `Creative` | Creative |
| **`MyKineID`** | Raffli (Verzio) | Co-Founder | `Co-Founder`, `Maintainer`, `Builder` | Builder |

### 2.2 Atribut yang Dihapus Total (Blacklist Attributes)
- ❌ **Dihapus:** Atribut `bio` (paragraf panjang naratif).
- ❌ **Dihapus:** Atribut `track` teks arsitektur panjang (*"AI Gateway & Systems Architecture"*, dsb).
- ❌ **Dihapus:** Hardcoded image URL statis yang tidak sinkron dengan foto profil GitHub pengguna.

### 2.3 Atribut yang Dipertahankan & Ditampilkan (Whitelist Attributes)
- ✅ `githubUsername`: Handle resmi GitHub (misal: `Curzyori`).
- ✅ `fullName`: Nama asli pengurus.
- ✅ `avatarUrl`: `https://github.com/${username}.png` (Native dynamic GitHub avatar URL, zero-rate-limit, otomatis mengikuti foto profil terbaru di GitHub).
- ✅ `title`: Gelar inisiator (`Founder` atau `Co-Founder`).
- ✅ `roles`: Label tim peran (`Maintainer`, `Builder`, atau `Creative`).
- ✅ `githubUrl`: Tautan langsung ke `https://github.com/${username}`.

---

## 3. Desain Komponen & Tata Letak Visual (UI Architecture)

### 3.1 Kartu Maintainer (Minimalist Fluid Card)
Kartu maintainer dirancang ramping, simetris, dan bernuansa teknikal modern:

```text
┌─────────────────────────────────────────────────────────────┐
│  [Avatar 52px]  Yuken Velino                                │
│   (Live GH)     @Curzyori                                   │
│                                                             │
│  [Founder]  [Maintainer]  [Builder]                         │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  [Icon GitHub] Profil GitHub                           [->] │
└─────────────────────────────────────────────────────────────┘
```

1. **Header Kartu**:
   - Foto Avatar bulat 52x52px dengan border halus `border-2 border-muara-ocean/30` dan status dot online.
   - Nama Lengkap (`font-display font-bold text-lg text-foreground`).
   - GitHub handle (`text-xs font-mono text-secondary`).
2. **Badges Bar**:
   - Badge Title:
     - Founder: `bg-amber-50 text-amber-900 border border-amber-300 font-bold`.
     - Co-Founder: `bg-sky-50 text-sky-900 border border-sky-300 font-bold`.
   - Badge Maintainer: `bg-slate-100 border border-stroke text-slate-700 font-medium`.
   - Badge Divisi:
     - Builder: `bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-bold`.
     - Creative: `bg-purple-50 text-purple-700 border border-purple-200 uppercase font-bold`.
3. **Footer Kartu**:
   - Divider halus `border-t border-stroke`.
   - Tautan langsung *"Lihat Profil GitHub"* dengan ikon vector external link.

### 3.2 Spasi & Responsivitas
- Grid 3 kolom seimbang pada desktop (`md:grid-cols-3 gap-6`), 1 kolom pada mobile.
- Menghilangkan ruang kosong vertikal berlebih yang sebelumnya disebabkan oleh panjang bio yang tidak seragam.
- Ketinggian ketiga kartu menjadi sama persis (*equal height*) secara alami.

---

## 4. Rencana Implementasi

1. **Refactor `src/components/landing/syndicate-roster.tsx`**:
   - Hapus interface `CoreMaintainerConfig` yang memuat `bio` dan `track`.
   - Buat interface baru `MaintainerProfile`:
     ```typescript
     export interface MaintainerProfile {
       githubUsername: string;
       fullName: string;
       title: "Founder" | "Co-Founder";
       roles: string[];
       division: "builder" | "creative";
     }
     ```
   - Avatar otomatis di-generate via `https://github.com/${m.githubUsername}.png`.
   - Sinkronisasi data dari database `public.members` jika record akun tersedia (misal update nama lengkap atau roles).
   - Bersihkan seluruh rendering JSX elemen paragraf `bio` dan teks `track`.
2. **Penyesuaian Test Suite**:
   - Update `tests/syndicate-and-treasury.test.tsx` dan `tests/landing-core.test.tsx` untuk memastikan kartu bebas dari teks bio lama dan merender badge role dengan tepat.

---

## 5. Kriteria Penerimaan (Acceptance Criteria)

- [ ] Tidak ada lagi teks naratif panjang atau bio buatan di kartu maintainer beranda.
- [ ] Tidak ada lagi teks track buatan seperti *"AI Gateway & Systems Architecture"*.
- [ ] Avatar ketiga maintainer memuat foto asli live dari GitHub (`https://github.com/${username}.png`).
- [ ] Ketiga kartu maintainer menampilkan username, nama, badge title (`Founder` / `Co-Founder`), badge `Maintainer`, dan badge divisi (`Builder` / `Creative`).
- [ ] Tombol kartu mengarahkan langsung ke profil GitHub masing-masing pengurus.
- [ ] Seluruh unit test Vitest lulus (100% offline passing) dan build Next.js 15 sukses.
