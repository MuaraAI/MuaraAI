# Specification: Muara AI Web — Fluid Currents Light v2 Modernization

- **Document ID:** `SPEC-2026-10-04-DESIGN-V2`
- **Date:** 2026-10-04
- **Status:** Draft / Ready for Approval
- **Author:** Yuken Velino (Founder, @Curzyori) & Core Team
- **Source Artifacts:**
  - `DESIGNV2.md` (`/home/curzy/workspace/MuaraAI/MuaraAI/DESIGNV2.md`)
  - Design Prototype (`/home/curzy/workspace/MuaraAI/tes/design-md/index.html` & `style.css`)
- **Target Repository:** `MuaraAI/MuaraAI` (`muaraai.com`)

---

## 1. Executive Summary & Design Vision

Muara AI memperbarui bahasa visual portal web resminya ke spesifikasi **Fluid Currents Light v2** (sesuai filosofi `DESIGNV2.md` dan prototipe di `/home/curzy/workspace/MuaraAI/tes/design-md`). 

### Filosofi Desain
"Muara" adalah titik temu dinamis antara aliran Sungai Kapuas Pontianak dan keterbukaan Samudra global. Desain v2 mempertajam metafora hidrodinamika ini:
1. **Light-First Estuary Canvas:** Kanvas kabut air jernih terang (`#F7FAFC`), dipadukan dengan panel putih kristal (`#FFFFFF`) dan kontainer sekunder rona air muara (`#F0F7FB`).
2. **Deep Riverbed Contrast:** Teks utama memakai warna tinta palung sungai (`#072033`, rasio kontras 15.5:1 terhadap putih) untuk keterbacaan tajam tanpa silau.
3. **River Current Blue (Accent):** Biru arus utama (`#0369A1`, kontras 5.6:1) dan rona arus deras hover (`#075985`) sebagai penggerak interaksi.
4. **Fluid Wave Dividers:** Pemisah antar seksi bergelombang asimetris tipis (1.5px stroke `#D9E5ED`, tanpa fill berat) mencerminkan pasang-surut muara.
5. **Diffusion & Lift Elevation:** Menghilangkan drop-shadow hitam pekat; menggantinya dengan pembiasan bayangan air difus (`rgba(7, 32, 51, 0.05)`).
6. **Hydro-Motion Easing:** Transisi fluida `cubic-bezier(0.16, 1, 0.3, 1)` untuk reaksi entrance dan hover yang alami seperti aliran arus sungai.
7. **Pembersihan Total Sisa Dark-Mode di Portal:** Menghilangkan semua kelas warna teks sisa dark-mode (`text-white`, `text-slate-300`, `bg-amber-950/20`) pada seluruh halaman `(portal)` dan `admin/*`, memastikan standar aksesibilitas WCAG AA terpenuhi 100%.

---

## 2. Design Tokens Normatif (Google DESIGN.md Spec)

### 2.1 Palet Warna (Color System)

| Token Name | Hex Code | Deskripsi & Peran | Rasio Kontras |
|---|---|---|---|
| `primary` / `foreground` | `#072033` | Deep Riverbed Ink (Teks judul H1–H4, nama brand, button primary) | **15.5:1** (WCAG AAA) |
| `secondary` | `#3B5A70` | Muted Ocean Slate (Subheading, paragraf pendukung, metadata) | **6.6:1** (WCAG AA) |
| `accent` | `#0369A1` | River Current Blue (Tombol aksi, link aktif, garis fokus) | **5.6:1** (WCAG AA) |
| `accent-hover` | `#075985` | Rapid Current Blue (Keadaan cursor hover pada tombol accent) | **6.8:1** (WCAG AA) |
| `surface` | `#FFFFFF` | Crystal White (Kartu data, container formulir, panel dialog) | **—** |
| `surface-alt` | `#F0F7FB` | Fresh Estuary Water Tint (Background section selang-seling, input focus) | **—** |
| `background` | `#F7FAFC` | Estuary Mist Canvas (Kanvas utama seluruh halaman) | **—** |
| `stroke` / `border` | `#D9E5ED` | Still Water Stroke (Garis tepi kartu, pembatas section, wave divider) | **—** |
| `success` | `#0D9488` | Laguna Teal (Status aktif, lunas, 100% test pass) | **4.8:1** (WCAG AA) |
| `warning` | `#D97706` | Lighthouse Amber (Status pending review, menunggak kas) | **4.6:1** (WCAG AA) |
| `danger` | `#E11D48` | Coral Reef Red (Status suspended, rejected, error) | **4.7:1** (WCAG AA) |

### 2.2 Tipografi Self-Hosted (Zero CDN)

| Peran | Family | Weights Digunakan | Tracking / Kerning |
|---|---|---|---|
| **Headlines (H1–H4)** | `Space Grotesk` | 600, 700 | H1 (`-0.03em`), H2 (`-0.02em`), H3 (`-0.01em`) |
| **Body & Form Controls** | `Inter` | 400, 500, 600, 700 | Normal (`letter-spacing: 0`) |
| **Code & Tabular Numbers** | `JetBrains Mono` | 400, 500 | Tabular figures, `line-height: 1.7` |
| **Icons & Indicators** | `Inline SVG` (Material Symbols Rounded) | 400 (regular) | Vector inline melalui `Icon` component |

### 2.3 Radius & Kelengkungan (Smooth Hydro Radii)
- `radius-sm`: `6px` (`rounded-[6px]`) $\rightarrow$ Badge kecil, chip status, pill metadata.
- `radius-md`: `10px` (`rounded-[10px]`) $\rightarrow$ Tombol (`btn`), input form, search bar.
- `radius-lg`: `18px` (`rounded-[18px]`) $\rightarrow$ Kartu konten, spotlight card, modal preview.
- `radius-xl`: `28px` (`rounded-[28px]`) $\rightarrow$ Dialog pendaftaran, hero callout box.
- `radius-full`: `9999px` (`rounded-full`) $\rightarrow$ Floating navbar bar, status dot, avatar.

### 2.4 Elevasi & Bayangan (Diffusion Shadows)
- **Normal State (Diffusion):**
  `box-shadow: 0 12px 32px -8px rgba(7, 32, 51, 0.05), 0 2px 6px -1px rgba(7, 32, 51, 0.03);`
- **Interactive State (Surface Lift):**
  `box-shadow: 0 20px 40px -10px rgba(7, 32, 51, 0.08), 0 4px 12px -2px rgba(7, 32, 51, 0.04); transform: translateY(-2px);`

---

## 3. Rencana Komponen & Arsitektur Perubahan

### 3.1 Fondasi Global (`globals.css` & `tailwind.config.ts`)
1. **`tailwind.config.ts`**:
   - Memperbarui palet: `background: "#F7FAFC"`, `foreground: "#072033"`, `secondary: "#3B5A70"`.
   - Menambahkan semantic colors `surface.alt: "#F0F7FB"`, `border.stroke: "#D9E5ED"`.
   - Menambahkan token radius (`6px`, `10px`, `18px`, `28px`).
   - Menambahkan box-shadow `diffusion` dan `lift`.
2. **`src/app/globals.css`**:
   - Memuat font `JetBrains Mono` lokal dari `/fonts/` (copy dari prototype).
   - Menetapkan variabel CSS `:root` selaras dengan `DESIGNV2.md`.
   - Mengatur body background `#F7FAFC` dan warna teks dasar `#072033`.

### 3.2 Komponen UI Baru & Upgrade
1. **`src/components/ui/wave-divider.tsx` (Baru)**:
   - Komponen pemisah bergelombang asimetris berbasis SVG (stroke `#D9E5ED`, strokeWidth 1.5, fill none).
   - Diletakkan di antara Hero $\rightarrow$ Metrics $\rightarrow$ Projects $\rightarrow$ Manifesto $\rightarrow$ Maintainers.
2. **`src/components/landing/navbar.tsx` (Floating Pill Upgrade)**:
   - Mengadopsi struktur prototipe: `sticky top-4`, `max-w-6xl mx-auto`, `bg-white/88 backdrop-blur-md`, `border border-stroke`, `rounded-full`, padding ramping, dengan brand icon ombak air (`waves`).
3. **`src/components/landing/hero.tsx`**:
   - Tampilan dua kolom dinamis:
     - Kiri: Badge status `Fluid Currents Light v2`, headline tegas Space Grotesk, tombol CTA primer `#072033` dan sekunder `#0369A1`, serta chip uptime/kontras.
     - Kanan: **Terminal Card Interaktif** dengan tab switcher (`cURL`, `TypeScript`, `JSON Response`) dan tombol copy instan (mengikuti prototipe `/tes/design-md/index.html`).
4. **`src/components/ui/spotlight-card.tsx` & `fade-in.tsx`**:
   - Mengadopsi kurva hidrodinamis `cubic-bezier(0.16, 1, 0.3, 1)` dan shadow diffusion halus.

### 3.3 Penyelarasan Halaman Portal & Admin (`src/app/(portal)/*`)
- Mengganti seluruh teks putih sisa dark-mode (`text-white`) dengan `text-foreground` (`#072033`).
- Mengganti teks abu-abu pudar (`text-slate-400`, `text-slate-300`) dengan `text-secondary` (`#3B5A70`) atau `text-slate-500`.
- Memperbaiki kontras banner peringatan, kartu saldo kas, kartu materi learn, dan tabel audit anggota agar nyaman dibaca di atas panel putih.

---

## 4. Matriks Komponen & Pemetaan File

| Komponen / File | Perubahan Desain v2 | Status Target |
|---|---|---|
| `tailwind.config.ts` | Integrasi palet `#072033`, `#3B5A70`, `#F7FAFC`, `#D9E5ED`, radii, shadows | 🔨 Refactor |
| `src/app/globals.css` | Import font JetBrains Mono lokal, CSS variables, body default styling | 🔨 Refactor |
| `src/components/ui/wave-divider.tsx` | Komponen baru SVG asymmetric wave stroke pemisah seksi | ⬜ Baru |
| `src/components/landing/navbar.tsx` | Floating pill navbar, backdrop-blur, rounded-full, brand icon waves | 🔨 Refactor |
| `src/components/landing/hero.tsx` | Hero Fluid Currents v2 + Tabbed Terminal Interactive Preview | 🔨 Refactor |
| `src/components/landing/metrics-bar.tsx` | Estuary background `#F0F7FB`, Deep Riverbed Ink typography | 🔨 Refactor |
| `src/components/landing/manifesto.tsx` | Anti-slop table dengan rona laguna/coral dan border stroke lembut | 🔨 Refactor |
| `src/components/landing/syndicate-roster.tsx` | 3 Maintainer cards dengan radius 18px dan diffusion shadow | 🔨 Refactor |
| `src/components/landing/projects-grid.tsx` | Card dengan shadow lift on hover, radius 18px, border `#D9E5ED` | 🔨 Refactor |
| `src/app/(portal)/dashboard/page.tsx` | Pembersihan `text-white`, standarisasi teks `#072033` | 🔨 Clean-up |
| `src/app/(portal)/dashboard/treasury/page.tsx` | Pembersihan `text-white`, standarisasi kontras iuran kas | 🔨 Clean-up |
| `src/app/(portal)/dashboard/learn/page.tsx` | Pembersihan `text-white`, standarisasi kartu materi | 🔨 Clean-up |
| `src/app/(portal)/admin/*` (6 Halaman) | Pembersihan total kontras teks pada admin views | 🔨 Clean-up |

---

## 5. Rencana Verifikasi & Uji Kualitas

1. **Uji Kontras Otomatis (WCAG AA/AAA)**:
   - Teks utama (`#072033` pada `#FFFFFF`) wajib $\ge$ 15.5:1.
   - Teks sekunder (`#3B5A70` pada `#FFFFFF`) wajib $\ge$ 6.6:1.
   - Teks tombol aksen (`#FFFFFF` pada `#0369A1`) wajib $\ge$ 5.6:1.
2. **Uji Bebas Regresi Fungsional**:
   - Menjalankan seluruh test suite Vitest (`npm test`): Semua 32 unit test wajib tetap lulus (100%).
3. **Uji Kompilasi Produksi**:
   - Menjalankan `npm run build`: 22 rute dan middleware wajib terkompilasi bersih tanpa peringatan styling.
4. **Uji Responsivitas 360px**:
   - Memastikan floating navbar, terminal card hero, dan tabel direktori tidak menimbulkan horizontal scrollbar pada lebar 360px.
5. **Git Hygiene**:
   - Commit lokal terstruktur dengan Conventional Commits (`feat(design): ...`, `refactor(ui): ...`).
   - Zero push ke remote.
