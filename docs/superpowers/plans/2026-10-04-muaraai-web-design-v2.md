# Muara AI Web: Fluid Currents Light v2 Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengimplementasikan pembaruan desain antarmuka portal `muaraai.com` ke spesifikasi **Fluid Currents Light v2** (berdasarkan `DESIGNV2.md` dan prototipe di `/home/curzy/workspace/MuaraAI/tes/design-md`), termasuk kanvas estuari terang `#F7FAFC`, tinta palung sungai `#072033`, navbar melayang `rounded-full`, pemisah gelombang asimetris `WaveDivider`, terminal interaktif hero, dan pembersihan total sisa kelas warna dark-mode di portal.

**Architecture:** Memanfaatkan Tailwind CSS dan CSS variables untuk design tokens murni, Next.js 15 Server & Client Components boundaries, native SVG icons melalui `src/components/ui/icon.tsx`, self-hosted local fonts (`Space Grotesk`, `Inter`, `JetBrains Mono`), kurva hidrodinamis `cubic-bezier(0.16, 1, 0.3, 1)`, dan bayangan difusi air halus.

**Tech Stack:** Next.js 15.5 App Router, React 19, Tailwind CSS 3.4, Motion 14, Vitest 2.1, Supabase SSR.

**Spec:** `docs/superpowers/specs/2026-10-04-muaraai-web-design-v2.md`

## Global Constraints

- **Kanvas Utama (Light-First):** `#F7FAFC` (Estuary Mist Canvas), `#FFFFFF` (Surface), `#F0F7FB` (Surface Alt). Dilarang menggunakan kanvas hitam atau dark-mode default.
- **Tinta Teks Utama:** `#072033` (Deep Riverbed Ink, rasio kontras 15.5:1 terhadap putih).
- **Teks Sekunder:** `#3B5A70` (Muted Ocean Slate, rasio kontras 6.6:1 terhadap putih).
- **Aksen Arus Interaktif:** `#0369A1` (River Current Blue) dan hover `#075985`.
- **Garis Pembatas:** `#D9E5ED` (Still Water Stroke).
- **Zero Remote Font CDN:** Seluruh font (`Space Grotesk`, `Inter`, `JetBrains Mono`) wajib di-load lokal dari `/fonts/*.woff2`.
- **Zero Emoji di UI:** Seluruh ikon navigasi dan status menggunakan inline SVG vector melalui `src/components/ui/icon.tsx`.
- **Zero Remote Push:** Seluruh commit dikerjakan secara lokal.

## Review Focus

1. **Kontras Teks Portal (Anti-Invisible Text):** Seluruh card di `(portal)` dan `admin/*` harus bebas dari `text-white` di atas latar putih, memenuhi rasio kontras minimum WCAG AA 4.5:1.
2. **Floor Responsif 360px:** Floating pill navbar dan tabbed terminal hero tidak boleh menimbulkan horizontal overflow/scroll pada lebar layar 360px.
3. **Interaktivitas Terminal Hero:** Switcher tab cURL, TypeScript, dan JSON Response serta tombol Copy harus berfungsi reaktif tanpa me-refresh halaman.
4. **Koneksi Direktori Anggota:** Tautan "Anggota" di navbar floating dan banner syndicate wajib mengarah ke `/members`.
5. **Regresi Fungsional Server Actions:** Seluruh 32 pengujian eksisting (autentikasi, PoW, validasi UBSI, kas Pakasir, vault key crypto) wajib tetap lulus 100%.

---

### Task 1: Design Tokens, Tailwind Config & Local Font Assets Setup

**Files:**
- Create: `public/fonts/jetbrains-mono-v24-latin_latin-ext-regular.woff2` (copy dari `tes/design-md/fonts/`)
- Create: `public/fonts/jetbrains-mono-v24-latin_latin-ext-500.woff2` (copy dari `tes/design-md/fonts/`)
- Modify: `tailwind.config.ts:9-48`
- Modify: `src/app/globals.css:1-72`
- Test: `tests/design-tokens-v2.test.ts`

**Interfaces:**
- Consumes: `DESIGNV2.md` token values
- Produces: CSS utility classes (`bg-background`, `text-foreground`, `text-secondary`, `bg-surface-alt`, `border-stroke`, `shadow-diffusion`, `shadow-lift`, `rounded-sm/md/lg/xl/full`, `font-mono`)

- [ ] **Step 1: Write the failing test**

```typescript
// tests/design-tokens-v2.test.ts
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Fluid Currents v2 Design Tokens", () => {
  it("defines correct palette and radii in tailwind.config.ts", () => {
    const configPath = path.resolve(__dirname, "../tailwind.config.ts");
    const content = fs.readFileSync(configPath, "utf-8");

    expect(content).toContain("#072033"); // Primary Deep Riverbed Ink
    expect(content).toContain("#3B5A70"); // Secondary Muted Ocean
    expect(content).toContain("#F7FAFC"); // Estuary Mist Background
    expect(content).toContain("#D9E5ED"); // Still water stroke
    expect(content).toContain("#F0F7FB"); // Surface alt
    expect(content).toContain("diffusion"); // Diffusion shadow
  });

  it("loads local JetBrains Mono woff2 font in globals.css", () => {
    const cssPath = path.resolve(__dirname, "../src/app/globals.css");
    const content = fs.readFileSync(cssPath, "utf-8");

    expect(content).toContain("JetBrains Mono");
    expect(content).toContain("jetbrains-mono-v24-latin_latin-ext-regular.woff2");
    expect(content).toContain("#F7FAFC");
    expect(content).toContain("#072033");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/design-tokens-v2.test.ts`
Expected: FAIL with missing token `#072033` or `JetBrains Mono`

- [ ] **Step 3: Copy font files and implement Tailwind & CSS tokens**

Copy fonts:
```bash
cp /home/curzy/workspace/MuaraAI/tes/design-md/fonts/jetbrains-mono-v24-latin_latin-ext-regular.woff2 public/fonts/
cp /home/curzy/workspace/MuaraAI/tes/design-md/fonts/jetbrains-mono-v24-latin_latin-ext-500.woff2 public/fonts/
```

Update `tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7FAFC",
        foreground: "#072033",
        secondary: "#3B5A70",
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F0F7FB",
          hover: "#F7FAFC",
          active: "#EDF2F7",
        },
        stroke: "#D9E5ED",
        border: {
          DEFAULT: "#D9E5ED",
          ocean: "#D9E5ED",
          subtle: "#F0F7FB",
          active: "#CBD5E1",
        },
        muara: {
          ocean: "#0369A1",
          "ocean-dark": "#075985",
          "ocean-light": "#0284C7",
          cyan: "#0369A1",
          sky: "#F0F7FB",
          mist: "#F7FAFC",
          ink: "#072033",
          slate: "#3B5A70",
        },
        status: {
          success: "#0D9488",
          warning: "#D97706",
          danger: "#E11D48",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "18px",
        xl: "28px",
        full: "9999px",
      },
      boxShadow: {
        diffusion: "0 12px 32px -8px rgba(7, 32, 51, 0.05), 0 2px 6px -1px rgba(7, 32, 51, 0.03)",
        lift: "0 20px 40px -10px rgba(7, 32, 51, 0.08), 0 4px 12px -2px rgba(7, 32, 51, 0.04)",
        ocean: "0 12px 32px -8px rgba(7, 32, 51, 0.05), 0 2px 6px -1px rgba(7, 32, 51, 0.03)",
        "ocean-lg": "0 20px 40px -10px rgba(7, 32, 51, 0.08), 0 4px 12px -2px rgba(7, 32, 51, 0.04)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
```

Update `src/app/globals.css`:
Include JetBrains Mono `@font-face` definitions, `:root` CSS variables, and base `body { background-color: #F7FAFC; color: #072033; }`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/design-tokens-v2.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add public/fonts/ tailwind.config.ts src/app/globals.css tests/design-tokens-v2.test.ts
git commit -m "feat(design): implement Fluid Currents v2 design tokens and local JetBrains Mono font"
```

---

### Task 2: Hydro-Wave Divider Component & Motion Easing Upgrade

**Files:**
- Create: `src/components/ui/wave-divider.tsx`
- Modify: `src/components/ui/spotlight-card.tsx:1-45`
- Modify: `src/components/ui/fade-in.tsx:35-46`
- Test: `tests/ui-components-v2.test.tsx`

**Interfaces:**
- Produces: `<WaveDivider className? inverted? />`
- Produces: `<SpotlightCard />` with `shadow-diffusion` and hydro lift

- [ ] **Step 1: Write the failing test**

```tsx
// tests/ui-components-v2.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import WaveDivider from "../src/components/ui/wave-divider";

describe("WaveDivider Component", () => {
  it("renders asymmetric SVG wave stroke with correct viewbox", () => {
    const { container } = render(<WaveDivider />);
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 1200 120");

    const path = container.querySelector("path");
    expect(path?.getAttribute("stroke")).toBe("#D9E5ED");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/ui-components-v2.test.tsx`
Expected: FAIL with "Cannot find module '../src/components/ui/wave-divider'"

- [ ] **Step 3: Implement WaveDivider and update motion components**

Create `src/components/ui/wave-divider.tsx`:
```tsx
import React from "react";

export default function WaveDivider({
  className = "",
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <div
      className={`w-full overflow-hidden leading-none pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className={`w-full h-8 sm:h-12 md:h-16 ${inverted ? "rotate-180" : ""}`}
      >
        <path
          d="M0,0 C150,90 400,100 600,40 C800,-20 1050,80 1200,30 L1200,120 L0,120 Z"
          fill="none"
          stroke="#D9E5ED"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
```

Update `src/components/ui/fade-in.tsx`:
Use hydro-motion cubic-bezier `ease: [0.16, 1, 0.3, 1]`.

Update `src/components/ui/spotlight-card.tsx`:
Use `border-stroke shadow-diffusion hover:shadow-lift transition-all duration-300 rounded-[18px]`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/ui-components-v2.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/wave-divider.tsx src/components/ui/spotlight-card.tsx src/components/ui/fade-in.tsx tests/ui-components-v2.test.tsx
git commit -m "feat(ui): add asymmetric hydro-wave divider and hydro-motion easing curve"
```

---

### Task 3: Floating Pill Navbar Modernization

**Files:**
- Modify: `src/components/landing/navbar.tsx:1-160`
- Test: `tests/navbar-v2.test.tsx`

**Interfaces:**
- Consumes: `user` prop (session status)
- Produces: Floating glass navbar with pill geometry, brand wave icon, and quick navigation

- [ ] **Step 1: Write the failing test**

```tsx
// tests/navbar-v2.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Navbar from "../src/components/landing/navbar";

describe("Navbar v2 Floating Pill", () => {
  it("renders floating pill navbar with brand and members link", () => {
    render(<Navbar user={null} />);
    expect(screen.getByText("Muara AI")).toBeDefined();
    expect(screen.getByText("Anggota")).toBeDefined();
    expect(screen.getByText("Maintainers")).toBeDefined();
    expect(screen.getByText("v2-alpha")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/navbar-v2.test.tsx`
Expected: FAIL because "v2-alpha" badge is not yet in Navbar

- [ ] **Step 3: Update `src/components/landing/navbar.tsx`**

Implement floating pill navbar with:
- Outer wrapper: `sticky top-3 sm:top-4 z-50 px-4 sm:px-6 lg:px-8 w-full max-w-6xl mx-auto`
- Nav container: `flex items-center justify-between rounded-full border border-stroke bg-white/90 backdrop-blur-md px-4 sm:px-6 py-2.5 shadow-diffusion`
- Brand: Icon `waves` with `w-8 h-8 rounded-[8px] bg-surface-alt border border-stroke text-muara-ocean`
- Nav links: `Projects`, `Accolades`, `Manifesto`, `Anggota` (`/members`), `Maintainers` (`/#syndicate`), `Treasury` (`/#treasury`)
- Status chip: `v2-alpha` chip with emerald pulsing dot
- Action button: `btn-primary` (`bg-foreground text-white rounded-full px-4 py-1.5 text-xs font-bold`)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/navbar-v2.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/navbar.tsx tests/navbar-v2.test.tsx
git commit -m "feat(nav): modernize navbar into floating pill design with fluid wave brand icon"
```

---

### Task 4: Interactive Terminal Hero Section Upgrade

**Files:**
- Modify: `src/components/landing/hero.tsx:1-110`
- Test: `tests/hero-v2.test.tsx`

**Interfaces:**
- Produces: Hero section with Fluid Currents v2 typography, chip status badges, and interactive multi-tab code terminal

- [ ] **Step 1: Write the failing test**

```tsx
// tests/hero-v2.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import Hero from "../src/components/landing/hero";

describe("Hero v2 Interactive Terminal", () => {
  it("renders status chips and switches terminal code snippets between curl, typescript, and response", () => {
    render(<Hero />);
    expect(screen.getByText(/15.5:1 Text Contrast/i)).toBeDefined();
    expect(screen.getByText(/Zero Font CDN/i)).toBeDefined();

    // Tab buttons
    const curlTab = screen.getByRole("button", { name: /^curl$/i });
    const tsTab = screen.getByRole("button", { name: /typescript/i });
    const resTab = screen.getByRole("button", { name: /json response/i });

    expect(curlTab).toBeDefined();
    expect(tsTab).toBeDefined();
    expect(resTab).toBeDefined();

    // Click TypeScript tab
    fireEvent.click(tsTab);
    expect(screen.getByText(/import { MuaraClient }/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/hero-v2.test.tsx`
Expected: FAIL because interactive terminal tabs are not yet rendered

- [ ] **Step 3: Update `src/components/landing/hero.tsx`**

Implement interactive terminal:
- Left Column:
  - Top Badge: `<span className="badge-current inline-flex items-center gap-1.5 rounded-full bg-surface-alt text-muara-ocean border border-stroke px-3 py-1 text-xs font-mono font-semibold">`
  - Headline: `Space Grotesk` clamp `4xl sm:5xl lg:6xl`, text `#072033`
  - Subtitle: `text-secondary` (`#3B5A70`)
  - CTAs: Primary button (`bg-[#072033] hover:bg-[#3B5A70] text-white rounded-[10px]`), Outline button (`border-stroke text-[#072033] hover:bg-surface-alt rounded-[10px]`)
  - Status Pills: `API 99.9% Uptime`, `15.5:1 Text Contrast`, `Zero Font CDN`
- Right Column:
  - Terminal container: `rounded-[18px] border border-stroke bg-white shadow-lift overflow-hidden font-mono text-xs`
  - Terminal header: Tabs for `curl`, `TypeScript`, and `JSON Response` with active indicator + `Copy` button that copies snippet to clipboard and shows "Copied!" for 2 seconds.
  - Terminal code body: Syntax highlighted cURL, TypeScript, and JSON response.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/hero-v2.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/hero.tsx tests/hero-v2.test.tsx
git commit -m "feat(hero): upgrade hero with Fluid Currents v2 layout and interactive terminal card"
```

---

### Task 5: Landing Page Sections Modernization (Wave Dividers & Card Elevation)

**Files:**
- Modify: `src/components/landing/metrics-bar.tsx`
- Modify: `src/components/landing/projects-grid.tsx`
- Modify: `src/components/landing/manifesto.tsx`
- Modify: `src/components/landing/syndicate-roster.tsx`
- Modify: `src/components/landing/footer.tsx`
- Modify: `src/app/(public)/page.tsx`
- Test: `tests/landing-core.test.tsx`

**Interfaces:**
- Consumes: `<WaveDivider />`, `shadow-diffusion`, `border-stroke`
- Produces: Modernized landing page with continuous fluid river-current aesthetics

- [ ] **Step 1: Check existing landing tests**

Run: `npx vitest run tests/landing-core.test.tsx`
Expected: PASS (baseline check)

- [ ] **Step 2: Update landing components to v2 specifications**

1. `src/components/landing/metrics-bar.tsx`:
   - Latar seksi: `bg-surface-alt` (`#F0F7FB`), angka metrik Space Grotesk `#072033`, subteks `#3B5A70`.
2. `src/components/landing/projects-grid.tsx`:
   - Kartu proyek memakai `rounded-[18px] border-stroke bg-white shadow-diffusion hover:shadow-lift`.
3. `src/components/landing/manifesto.tsx`:
   - Tabel anti-slop: border stroke `#D9E5ED`, header laguna `#F0F7FB` dan `#E0F2FE`.
4. `src/components/landing/syndicate-roster.tsx`:
   - 3 Maintainer cards: `rounded-[18px] border-stroke bg-white shadow-diffusion hover:shadow-lift p-7`.
   - Banner direktori anggota bawah: `rounded-[20px] border-stroke bg-surface-alt`.
5. `src/components/landing/footer.tsx`:
   - Border atas `#D9E5ED`, latar `#FFFFFF`, teks `#3B5A70`, brand icon `waves`.
6. `src/app/(public)/page.tsx`:
   - Sisipkan `<WaveDivider />` antar seksi untuk menghadirkan ritme gelombang air.

- [ ] **Step 3: Run landing tests to verify clean integration**

Run: `npx vitest run tests/landing-core.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/ src/app/\(public\)/page.tsx tests/landing-core.test.tsx
git commit -m "feat(landing): integrate wave dividers, estuary tints, and diffusion shadows across landing sections"
```

---

### Task 6: Portal & Admin Area Full Contrast Sanitization (WCAG AA)

**Files:**
- Modify: `src/app/(portal)/dashboard/page.tsx`
- Modify: `src/app/(portal)/dashboard/treasury/page.tsx`
- Modify: `src/app/(portal)/dashboard/learn/page.tsx`
- Modify: `src/app/(portal)/dashboard/learn/learn-feed-client.tsx`
- Modify: `src/app/(portal)/admin/review/page.tsx`
- Modify: `src/app/(portal)/admin/treasury/page.tsx`
- Modify: `src/app/(portal)/admin/members/page.tsx`
- Modify: `src/app/(portal)/admin/mail/page.tsx`
- Modify: `src/app/(portal)/admin/achievements/page.tsx`
- Modify: `src/app/(portal)/admin/learn/page.tsx`
- Test: `tests/portal-contrast.test.ts`

**Interfaces:**
- Produces: 100% WCAG AA compliant light portal views with `#072033` and `#3B5A70`

- [ ] **Step 1: Write the automated contrast & class scanner test**

```typescript
// tests/portal-contrast.test.ts
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Portal Contrast Sanitization", () => {
  const portalFiles = [
    "src/app/(portal)/dashboard/page.tsx",
    "src/app/(portal)/dashboard/treasury/page.tsx",
    "src/app/(portal)/dashboard/learn/learn-feed-client.tsx",
    "src/app/(portal)/admin/treasury/page.tsx",
    "src/app/(portal)/admin/members/page.tsx",
  ];

  it("ensures portal files do not render text-white on light card backgrounds", () => {
    portalFiles.forEach((file) => {
      const fullPath = path.resolve(__dirname, "..", file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        // Must not contain text-white directly on heading or body inside white cards
        const matches = content.match(/className="[^"]*text-white[^"]*"/g) || [];
        // Filter out false positives (buttons with dark backgrounds are allowed text-white)
        const invalidMatches = matches.filter(
          (m) => !m.includes("bg-muara-ocean") && !m.includes("bg-primary") && !m.includes("bg-emerald-")
        );
        expect(invalidMatches.length).toBe(0);
      }
    });
  });
});
```

- [ ] **Step 2: Run test to verify it detects remaining legacy dark-mode classes**

Run: `npx vitest run tests/portal-contrast.test.ts`
Expected: FAIL (because `dashboard/page.tsx` and `dashboard/treasury/page.tsx` still have `text-white` on titles)

- [ ] **Step 3: Sanitize all portal and admin components**

Replace all:
- `text-white` on titles/labels $\rightarrow$ `text-foreground` (`#072033`)
- `text-slate-400` / `text-slate-300` $\rightarrow$ `text-secondary` (`#3B5A70`) / `text-slate-500`
- `border-border` $\rightarrow$ `border-stroke` (`#D9E5ED`)
- `bg-surface` $\rightarrow$ `bg-white shadow-diffusion`
- Warning banners: `bg-amber-50 border-amber-200 text-amber-900`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/portal-contrast.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/\(portal\)/ tests/portal-contrast.test.ts
git commit -m "fix(portal): purge legacy dark-mode classes and enforce WCAG AA contrast across portal views"
```

---

### Task 7: Full System Verification, Build & Visual Quality Gate

**Files:**
- Test: All suites in `tests/`
- Build: Next.js production build (`npm run build`)

- [ ] **Step 1: Run complete Vitest suite**

Run: `npm test`
Expected: All 36+ tests pass with zero failures.

- [ ] **Step 2: Run production Next.js build**

Run: `npm run build`
Expected: 22 routes compiled cleanly, zero webpack or TypeScript errors.

- [ ] **Step 3: Verification of 360px viewport floor**

Verify CSS and markup do not have fixed `min-w-[400px]` or unconstrained horizontal tables without scroll wrappers.

- [ ] **Step 4: Update Graphify Codebase Graph**

Run: `graphify update . || graphify extract . --code-only`
Expected: Knowledge graph synchronized with new components and styles.

- [ ] **Step 5: Final Local Commit**

```bash
git status
git commit --allow-empty -m "chore(release): complete Fluid Currents Light v2 design system implementation"
```
