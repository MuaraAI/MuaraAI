---
version: alpha
name: Muara AI Fluid Currents Light v2
description: Ocean currents and river-mouth fluid dynamics. Light-mode canvas, deep riverbed ink, luminous estuary cyan, and hydro-motion easing.

colors:
  primary: "#072033"
  secondary: "#3B5A70"
  accent: "#0369A1"
  accent-hover: "#075985"
  surface: "#FFFFFF"
  surface-alt: "#F0F7FB"
  background: "#F7FAFC"
  stroke: "#D9E5ED"
  success: "#0F766E"
  warning: "#9A3412"
  danger: "#BE123C"

typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 3.5rem
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
  code:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.7

rounded:
  sm: 6px
  md: 10px
  lg: 18px
  xl: 28px
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
  badge-current:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.accent}"
    rounded: "{rounded.full}"
    padding: 6px
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
  divider-current:
    backgroundColor: "{colors.stroke}"
    height: 1px
---

## Overview

Muara AI mengadopsi spesifikasi desain **Fluid Currents Light (v2 - Option A)**.
Filosofi "Muara" adalah titik temu dinamis antara aliran Sungai Kapuas Pontianak dan keterbukaan Samudra global.
V2 mempertajam tema air dengan menambahkan **karakter arus hidrodinamis (fluid dynamics)**, transisi gelombang halus, serta kanvas terang yang bersih tanpa silau.

Prinsip Inti:
1. **Light-First Estuary Canvas:** Kanvas air jernih terang (`#F7FAFC`) berpadu dengan panel putih kristal (`#FFFFFF`) dan permukaan sekunder bernuansa air tawar muara (`#F0F7FB`).
2. **Current-Line & Hydro-Motion:** Menghadirkan ritme aliran air melalui garis arus pandu (1px subtle vector stroke) dan kurva transisi fluida `cubic-bezier(0.16, 1, 0.3, 1)`.
3. **Deep Riverbed Contrast:** Teks utama memakai warna tinta dasar sungai (`#072033`, rasio kontras 15.5:1 terhadap putih) untuk kenyamanan baca jangka panjang.
4. **Anti-Slop Hardening:** Zero dark-mode default, zero artificial neon glow, zero emoji sebagai ikon UI, dan font self-hosted tanpa CDN eksternal.

## Colors

- **Primary (`#072033`):** Tinta palung sungai muara (Deep Riverbed Ink). Digunakan untuk H1-H3, nama brand, dan elemen prioritas tertinggi. Kontras 15.5:1 terhadap putih.
- **Secondary (`#3B5A70`):** Abu-biru samudra teduh untuk body pendukung, sub-heading, dan label metadata. Kontras 6.6:1 terhadap putih.
- **Accent (`#0369A1`):** Biru arus utama (River Current Blue). Digunakan untuk tombol interaktif, link aktif, dan garis fokus interaksi. Kontras 5.6:1 terhadap putih.
- **Accent Hover (`#075985`):** Rona arus deras saat cursor hover (6.8:1 terhadap putih).
- **Background (`#F7FAFC`):** Kanvas kabut air muara terang yang sejuk di mata.
- **Surface (`#FFFFFF`):** Kartu data utama dan dialog dengan tepian halus.
- **Surface Alt (`#F0F7FB`):** Wadah sekunder dengan rona air jernih untuk membedakan kelompok data.
- **Stroke (`#D9E5ED`):** Garis tepi air tenang untuk memisahkan section tanpa kontras kasar.
- **Status (Success/Warning/Danger):** Menggunakan palet ekosistem bahari yang teruji kontras: Teal laguna (`#0D9488`), Amber mercusuar (`#D97706`), dan Coral koral (`#E11D48`).

## Typography

Kombinasi tipografi self-hosted yang tersimpan di direktori lokal:
- **Headlines (Space Grotesk):** Bobot 700 dengan letter-spacing rapat (`-0.03em`) menghadirkan kesan modern, teknikal, dan tegas.
- **Body & Controls (Inter):** Keterbacaan optimal dan netral untuk teks paragraf, deskripsi fitur, serta form input.
- **Code & Metrics (JetBrains Mono):** Presisi tabular untuk kunci API, cuplikan kode cURL/TypeScript, dan angka performa.

## Layout

- **Fluid Wave Dividers:** Pemisah antar seksi menggunakan kurva SVG bergelombang asimetris tipis (stroke 1.5px, tanpa fill berat) yang mencerminkan pasang-surut muara.
- **Current Flow Alignment:** Layout dua kolom zig-zag dengan alur visual diagonal (dari kiri atas mengalir ke kanan bawah).
- **Responsive Floor 360px:** Memastikan seluruh hierarki komponen tetap proporsional dan bebas horizontal-overflow dari ponsel 360px hingga layar monitor 4K.
- **Breathing Space:** Spasi antar blok konsisten dengan modular scale 8px, padding seksi lega (`xxl: 80px`).

## Elevation & Depth

- **Diffusion Shadow (Bayangan Air Difus):** Menghindari drop-shadow hitam pekat; memakai pembiasan cahaya air:
  `box-shadow: 0 12px 32px -8px rgba(7, 32, 51, 0.05), 0 2px 6px -1px rgba(7, 32, 51, 0.03);`
- **Subtle Surface Lift:** Pada interaksi hover, kartu terangkat halus 2px dengan intensitas difusi sedikit melebar tanpa pergeseran warna yang menyolok.

## Shapes

- **Smooth Hydro Radii:** Radius melengkung alami: 6px untuk input/badge kecil, 10px untuk tombol, 18px untuk kartu konten, 28px untuk modal/hero callout, dan 9999px (full) untuk pill status.
- Tidak menggunakan sudut tajam 0px yang kaku atau radius bulat berlebihan yang memakan ruang konten.

## Components

- **Navbar:** Header mengambang dengan latar semi-transparan air muara (`rgba(255, 255, 255, 0.88)` + `backdrop-blur-md`) bertepi bawah `#D9E5ED`.
- **Button Primary:** Tombol berbasis warna tinta dasar muara (`#072033`) dengan teks putih untuk aksi utama yang tegas.
- **Button Accent:** Tombol arus biru (`#0369A1`) untuk aksi eksplorasi sekunder.
- **Fluid Cards:** Kontainer latar putih (`#FFFFFF`) dengan border halus `#D9E5ED` dan bayangan difusi air.
- **Current Badge:** Pill mungil dengan background `#F0F7FB` dan teks `#0369A1` untuk status atau kategori.

## Do's and Don'ts

### Do's
- Gunakan kanvas terang segar (`#F7FAFC`) dan aksen biru arus (`#0369A1`).
- Gunakan kurva transisi `cubic-bezier(0.16, 1, 0.3, 1)` untuk animasi entrance dan hover.
- Pertahankan rasio kontras teks minimal 4.5:1 terhadap background.
- Gunakan Material Symbols Rounded berpadu warna arus untuk penunjuk navigasi.

### Don'ts
- **DILARANG menggunakan Dark Mode atau kanvas hitam pekat.**
- **DILARANG menggunakan neon glow, bayangan ungu/pink klise AI.**
- **DILARANG menggunakan emoji sebagai ikon UI.**
- **DILARANG menggunakan font pihak ketiga via CDN publik.**
