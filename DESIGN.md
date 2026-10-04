---
version: alpha
name: Muara AI Flowing Ocean Light
description: Light-first design system with flowing oceanic currents, fresh water-mist canvas, marine ink typography, and luminous tropical cyan accents. Local craft flows global.

colors:
  primary: "#0B253A"
  secondary: "#476175"
  accent: "#0369A1"
  accent-hover: "#075985"
  surface: "#FFFFFF"
  surface-alt: "#F0F7FA"
  background: "#F8FAFC"
  success: "#0F766E"
  warning: "#9A3412"
  danger: "#BE123C"

typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 3.25rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  h2:
    fontFamily: Space Grotesk
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  h3:
    fontFamily: Space Grotesk
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.5
  mono-label:
    fontFamily: Space Grotesk
    fontSize: 0.75rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.05em"

rounded:
  sm: 6px
  md: 10px
  lg: 18px
  xl: 24px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 80px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.secondary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 12px
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 12px
  button-accent-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 12px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-alt:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: 24px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: 12px
  chip-status-success:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.success}"
    rounded: "{rounded.full}"
    padding: 4px
  chip-status-warning:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.warning}"
    rounded: "{rounded.full}"
    padding: 4px
  chip-status-danger:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.danger}"
    rounded: "{rounded.full}"
    padding: 4px
---

## Overview

Muara AI mengadopsi identitas visual **Flowing Ocean Light (Light-First & Ocean Theme)**.
Filosofi "Muara" adalah muara sungai Kapuas yang mengalir jernih menuju laut lepas global.
Tema ini secara tegas **MENGHAPUS DARK MODE KLISYEN (AI-Slop Black & Neon Glow)** dan menggantikannya dengan kanvas air laut yang segar, terang, bersih, berwibawa, serta nyaman dibaca sepanjang hari.

Prinsip Utama:
1. **Light Mode Eksklusif:** Menggunakan latar kanvas air laut segar (`#F8FAFC`) dengan aksen aliran arus laut cerulean (`#0369A1`) dan bayangan difusi lembut.
2. **Marine Ink Contrast (WCAG AA/AAA):** Judul dan teks utama menggunakan warna tinta laut dalam (`#0B253A`) yang memberikan keterbacaan super tajam (14.5:1) tanpa kekakuan hitam pekat (`#000000`).
3. **Fluid Currents & Asymmetry:** Aliran layout bernapas dengan ruang putih luas, menghindari kartu bertumpuk kaku atau gradien murahan.
4. **Anti-Slop Hardening:** Zero emoji di elemen UI, zero font CDN pihak ketiga (self-hosted Google Fonts), zero neon glow kabur.

## Colors

- **Primary (`#0B253A`):** Tinta laut dalam (Deep Marine Ink) untuk headline H1-H3, nama brand, dan elemen prioritas tertinggi. Memberikan kontras 14.5:1 terhadap kanvas.
- **Secondary (`#476175`):** Slate samudra untuk teks deskripsi pendukung, metadata, dan garis divider halus.
- **Accent (`#0369A1`):** Biru arus laut (Ocean Current) sebagai aksen tindakan utama, status aktif, dan indikator navigasi (5.5:1 kontras terhadap putih, memenuhi WCAG AA).
- **Accent Hover (`#075985`):** Arus samudra dalam saat interaksi hover (6.8:1 kontras terhadap putih).
- **Background (`#F8FAFC`):** Kanvas kabut air laut bersih yang menyejukkan mata.
- **Surface (`#FFFFFF`):** Kartu dan panel putih murni bertepi tipis air laut (`#D1E2EC`).
- **Surface Alt (`#F0F7FA`):** Bidang sekunder dengan rona air laut lembut untuk membedakan kontainer data.
- **Status (Success/Warning/Danger):** Menggunakan rona bahari alami yang lolos uji kontras WCAG AA: Emerald karang (`#0F766E`), Amber mercusuar (`#9A3412`), dan Coral crimson (`#BE123C`).

## Typography

Kombinasi dua jenis huruf sans-serif geometris dan fungsional self-hosted:
- **Headlines (Space Grotesk):** Karakter tegas dan futuristik untuk H1, H2, dan H3 dengan letter-spacing rapat (`-0.03em`) agar terasa padat dan terarah.
- **Body & Interface (Inter):** Keterbacaan optimal untuk teks panjang, form, dan label tabel.
- **Kode & Data (Space Grotesk / Monospace):** Presisi teknis untuk metrik numerik dan log transaksi kas.

## Layout

- **Grid Asimetris & Fluid Flow:** Mengutamakan CSS Grid dengan pembagian kolom dinamis (2-kolom zig-zag, kartu berbobot visual berbeda) dibanding grid 3-kolom generatif template biasa.
- **Responsive Floor 360px:** Struktur layout dijamin mengalir tanpa pergeseran horizontal (`scrollWidth <= clientWidth`) mulai dari ponsel layar ramping hingga layar desktop lebar.
- **Breathing Space:** Spasi antar seksi bernapas lega (`padding 80px`), menghilangkan kesan sempit dan berjejal.

## Elevation & Depth

- Menggantikan bayangan gelap kaku dengan **Ocean Diffusion Shadow**:
  `box-shadow: 0 10px 30px -10px rgba(11, 37, 58, 0.06), 0 2px 6px -1px rgba(11, 37, 58, 0.04);`
- Garis tepi (border) menggunakan warna surut air laut transparan (`#D1E2EC`), menjaga batas visual tetap rapi tanpa merusak kelembutan kanvas.

## Shapes

- **Radius Terukur:** Sudut membulat modern (`rounded-xl` / 18px untuk kontainer besar, `rounded-md` / 10px untuk tombol, `rounded-full` untuk badge status).
- Menghindari radius hiperbolis yang kekanak-kanakan, mempertahankan kesan studio teknologi profesional.

## Components

- **Navbar:** Header mengambang dengan latar semi-transparan air laut murni (`rgba(255, 255, 255, 0.85)` + `backdrop-blur-md`) dan border bawah tipis.
- **Button Primary:** Tombol kontras tinggi dengan warna Deep Marine Ink (`#0B253A`) berteks putih murni, memberikan otoritas klik tegas.
- **Button Accent:** Tombol arus laut (`#0369A1`) untuk aksi sekunder penting (seperti submit karya).
- **Cards & Bento Cells:** Kartu putih murni (`#FFFFFF`) dengan border halus `#D1E2EC` yang bertransformasi lembut saat disentuh kursor.
- **Terminal Mockup:** Mockup terminal terang bergaya terminal modern minimalis dengan latar `#F0F7FA` dan teks sintaks bahari.

## Do's and Don'ts

### Do's
- Gunakan kanvas putih/terang dengan aksen biru arus laut yang mengalir.
- Pertahankan kontras teks minimal 4.5:1 untuk teks normal dan 3.0:1 untuk teks besar (WCAG AA).
- Gunakan Material Symbols Rounded berpadu warna laut untuk menandakan aksi.
- Berikan ruang bernapas yang cukup antar elemen.

### Don'ts
- **DILARANG menggunakan Dark Mode / latar belakang hitam / abu-abu gelap.**
- **DILARANG menggunakan teks neon glow, bayangan ungu/pink klise AI.**
- **DILARANG menggunakan emoji sebagai ikon UI.**
- **DILARANG menggunakan font CDN eksternal.**
