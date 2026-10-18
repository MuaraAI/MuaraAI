# MuaraAI National Community Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition MuaraAI as a national UBSI student community born in Pontianak, refresh public product copy and maintainer data, and add a data-grounded Indonesia campus map with Laku-inspired functional motion.

**Architecture:** Preserve existing auth, Supabase queries, membership lifecycle, Server Actions, and private vault behavior. Add a small public content source for official links, product facts, maintainer identity, and campus-map nodes. Keep the map presentational and static-data-driven, with SVG route drawing and reduced-motion fallback. Public pages remain editorial; internal workspace behavior remains unchanged except for copy and selected presentation cleanup.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, existing `motion/react`, inline SVG icon system, local fonts, existing Supabase SSR data flow, native SVG map paths, Vitest and Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-18-muaraai-national-community-expansion-design.md`

## Global Constraints

- MuaraAI is open to UBSI students across Indonesia from cohort 2026 onward.
- MuaraAI was founded by students from UBSI Pontianak; Pontianak remains the primary founding and offline gathering hub.
- Muara Arus 1 current public scope is FTI, SI, SIA, and IF only.
- Use exact official URLs from the spec; do not add Telegram.
- Remove `Zero Slop • 100% Independent` from public UI.
- Do not market `Vault`, `AES-256-GCM`, Tencent, latency, uptime, or unsupported engineering metrics publicly.
- Preserve private vault implementation, encryption, auth, RLS, membership lifecycle, and API contracts.
- Use the supplied logo `/home/curzy/workspace/MuaraAI/assets/logo.png`; do not invent a replacement.
- Use verified campus nodes only; never fabricate member counts, chapters, or event schedules.
- Adapt Laku motion patterns, not Laku branding or copy.
- Respect 360px responsive floor, visible focus, keyboard use, and `prefers-reduced-motion`.
- No remote fonts, emoji UI icons, new animation dependency, image generation, or remote push.

## Review Focus

- Public copy can accidentally overclaim Muara Arus 1 dataset scope; test exact FTI/SI/SIA/IF wording and absence of broader faculty claims.
- Official URLs can drift or point to wrong organizations; test every rendered external link against the spec constants.
- Maintainer identity can regress to old aliases or wrong division; test exact names, NIMs, order, and Builder roles.
- Campus map can imply active chapters or fabricated events; test accessible text, node labels, and founding-hub semantics rather than counts.
- Motion can ignore reduced motion or become an endless decorative loop; test static fallback and route drawing disable behavior.

---

## File Map

### Content and source of truth

- Create: `src/lib/community-content.ts` for official URLs, product facts, maintainer identity, and verified campus nodes.
- Modify: `src/lib/constants.ts` only if existing campus constants need a shared verified source; avoid duplicate lists.
- Test: `tests/community-content.test.ts`.

### Public landing and footer

- Modify: `src/components/landing/footer.tsx` for logo, official links, contact, and removal of unsupported footer claims.
- Modify: `src/components/landing/projects-grid.tsx` for Muara Arus 1 and UBSI API product cards.
- Modify: `src/components/landing/syndicate-roster.tsx` for corrected names, NIMs, order, and Builder roles.
- Modify: `src/components/landing/manifesto.tsx` to remove public vault/security marketing and present community principles.
- Modify: `src/components/landing/treasury-preview.tsx` to remove vendor infrastructure details.
- Modify: `src/app/(public)/page.tsx` to insert the national community map section in the narrative order.
- Modify: `src/app/(public)/members/page.tsx` only if header/community copy needs national scope alignment.
- Test: `tests/national-community-copy.test.tsx`, existing landing/roster tests.

### Map and motion

- Create: `src/components/landing/national-campus-map.tsx` for the accessible SVG map and route animation.
- Create: `src/components/landing/national-campus-map.css` only if Tailwind cannot express SVG route drawing without duplication.
- Create: `src/components/landing/campus-map-data.ts` only if data is too presentation-specific for `community-content.ts`.
- Test: `tests/national-campus-map.test.tsx`.

### Logo asset

- Copy: `/home/curzy/workspace/MuaraAI/assets/logo.png` to the repository's public asset convention, likely `public/brand/muara-logo.png` after inspecting existing public assets.
- Test: asset path is referenced by footer/navbar without a missing-file route.

### Clean-up and verification

- Modify: public content tests that still assert removed `Zero Slop`, v2 metrics, Vault, or vendor copy.
- Modify: `README.md` only if the public project description is explicitly part of the product-facing contract.
- Test: full existing suite and build.

---

### Task 1: Create canonical national community content source

**Files:**
- Create: `src/lib/community-content.ts`
- Test: `tests/community-content.test.ts`

**Interfaces:**

- Produces `officialLinks`, `muaraArusOne`, `ubsiApi`, `coreMaintainers`, and `campusNodes` constants for public components.
- `coreMaintainers` order is Yuken, Muhammad Raffli, Verzio.
- `campusNodes` entries include `id`, `label`, `city`, `region`, `role: "founding-hub" | "regional-hub" | "network-node"`, `verified: boolean`, and `offlineGathering: boolean`.

- [ ] Step 1: Write failing tests for official URLs, exact Muara Arus 1 facts, UBSI API URLs, corrected maintainer records, cohort policy, and no Telegram URL.
- [ ] Step 2: Run `npx vitest run tests/community-content.test.ts`; expect failure because the source file does not exist.
- [ ] Step 3: Add the minimal typed constants with the exact values in the spec.
- [ ] Step 4: Run the focused test and full TypeScript build.
- [ ] Step 5: Commit:

```bash
git add src/lib/community-content.ts tests/community-content.test.ts
git commit -m "feat(content): add national community source of truth"
```

### Task 2: Correct public product showcase and remove stale claims

**Files:**
- Modify: `src/components/landing/projects-grid.tsx`
- Modify: `src/components/landing/manifesto.tsx`
- Modify: `src/components/landing/treasury-preview.tsx`
- Modify: `src/components/landing/footer.tsx`
- Modify: `tests/landing-redesign.test.tsx`
- Modify: `tests/landing-core.test.tsx`

**Interfaces:**

- Product cards consume `community-content.ts` facts.
- Muara Arus 1 links include playground, GitHub, Hugging Face, and Ollama.
- UBSI API links include live URL and GitHub repository.

- [ ] Step 1: Add failing tests for Muara Arus 1 exact copy/links, UBSI API unofficial copy, removal of `Zero Slop`, removal of Vault/AES/Tencent public copy, and official footer links.
- [ ] Step 2: Run focused tests and verify RED against stale product/footer content.
- [ ] Step 3: Replace project cards with a factual Muara Arus 1 product showcase and README-grounded UBSI API showcase.
- [ ] Step 4: Replace manifesto security comparison with concise community principles; remove vault implementation details.
- [ ] Step 5: Remove vendor infrastructure wording from treasury preview and footer.
- [ ] Step 6: Add official logo and social links to footer while preserving real legal/contact routes.
- [ ] Step 7: Run focused tests and `npm run build`.
- [ ] Step 8: Commit:

```bash
git add src/components/landing src/components/landing tests
 git commit -m "feat(landing): present Muara Arus 1 and national community facts"
```

### Task 3: Correct maintainer roster and founder identity

**Files:**
- Modify: `src/components/landing/syndicate-roster.tsx`
- Modify: `tests/syndicate-and-treasury.test.tsx`
- Modify: `tests/landing-core.test.tsx`

**Interfaces:**

- Roster consumes `coreMaintainers` from `community-content.ts`.
- Display format includes `Name | NIM`, GitHub handle, title, Maintainer role, and Builder division.
- Existing live Supabase merge remains supported for approved public fields.

- [ ] Step 1: Add failing tests for exact corrected names, NIM display, order, `Muhammad Raffli Aldiansyah` Builder role, and `Verzio Yamanansyah` display.
- [ ] Step 2: Run focused roster tests and verify RED against old aliases/Creative role.
- [ ] Step 3: Replace hardcoded stale maintainer config with canonical source and render `Name | NIM` without duplicate title badges.
- [ ] Step 4: Preserve live GitHub avatar/profile links and public PII scope exactly as approved by the spec.
- [ ] Step 5: Run focused tests and build.
- [ ] Step 6: Commit:

```bash
git add src/components/landing/syndicate-roster.tsx tests
 git commit -m "fix(roster): correct MuaraAI founder and maintainer identities"
```

### Task 4: Integrate logo asset and update brand shell

**Files:**
- Copy: `/home/curzy/workspace/MuaraAI/assets/logo.png` to `public/brand/muara-logo.png`
- Modify: `src/components/landing/navbar.tsx`
- Modify: `src/components/landing/footer.tsx`
- Test: `tests/navbar-v2.test.tsx`, `tests/landing-redesign.test.tsx`

**Interfaces:**

- Logo asset path is `/brand/muara-logo.png`.
- Existing text brand remains available as accessible fallback/label.
- No new logo generation or SVG redraw.

- [ ] Step 1: Verify source logo dimensions and format without modifying it.
- [ ] Step 2: Add failing asset-reference test.
- [ ] Step 3: Copy the approved logo and integrate it into public navbar/footer with stable dimensions and alt text.
- [ ] Step 4: Run focused tests and build.
- [ ] Step 5: Commit:

```bash
git add public/brand src/components/landing tests
 git commit -m "feat(brand): add approved MuaraAI logo to public shell"
```

### Task 5: Build national Indonesia campus map

**Files:**
- Create: `src/components/landing/national-campus-map.tsx`
- Create: `src/components/landing/national-campus-map.css` only if needed for SVG route animation
- Modify: `src/app/(public)/page.tsx`
- Test: `tests/national-campus-map.test.tsx`

**Interfaces:**

- Component consumes `campusNodes` from `community-content.ts`.
- Props: optional `className` and `reducedMotion?: boolean` only if testability requires it; otherwise use the existing safe media-query pattern.
- Accessible figure label explains national UBSI network, Pontianak founding hub, and Jakarta regional hub.

- [ ] Step 1: Add failing tests for Pontianak founding hub, Jakarta regional hub, other verified campus nodes, accessible labels, and route presence.
- [ ] Step 2: Run focused map test and verify RED because the component does not exist.
- [ ] Step 3: Add a simplified SVG Indonesia silhouette or reuse a verified existing map path; do not fabricate campus coordinates.
- [ ] Step 4: Add curved routes toward Pontianak, node hierarchy, labels, and offline-gathering indicator only for Pontianak.
- [ ] Step 5: Add one-entry route drawing with staggered CSS/SVG animation and a static full-map fallback under reduced motion.
- [ ] Step 6: Add the map between the public current map and product showcase in `page.tsx`.
- [ ] Step 7: Run focused tests, full tests, and build.
- [ ] Step 8: Commit:

```bash
git add src/components/landing/national-campus-map.tsx src/components/landing/national-campus-map.css src/app/\(public\)/page.tsx tests/national-campus-map.test.tsx
 git commit -m "feat(landing): add national UBSI community campus map"
```

### Task 6: Adapt Laku-inspired motion system to MuaraAI

**Files:**
- Modify: `src/components/landing/navbar.tsx` for scroll/active-section behavior only if current shell can support it without route regressions.
- Create: `src/components/landing/reveal-observer.tsx` only if existing `FadeIn` cannot support dynamic section reveal safely.
- Modify: `src/components/landing/national-campus-map.tsx` for route drawing and reduced motion.
- Modify: `src/app/(public)/layout.tsx` only if a single observer mount is required.
- Test: `tests/national-motion.test.tsx`.

**Interfaces:**

- Motion uses existing `motion/react`, native CSS, and IntersectionObserver.
- No new animation dependency.
- Motion must be functional: active nav, reveal, route drawing, mobile sheet, and hub emphasis.

- [ ] Step 1: Add failing tests for reduced-motion map, no permanent loop, active section semantics, and mobile menu Escape/scroll-lock if the shell is extended.
- [ ] Step 2: Run focused motion tests and verify RED.
- [ ] Step 3: Implement only the Laku patterns that serve MuaraAI information architecture: active section state, controlled reveal, route drawing, and mobile sheet behavior.
- [ ] Step 4: Ensure all motion disappears or becomes static when `prefers-reduced-motion` is active.
- [ ] Step 5: Run focused tests and full build.
- [ ] Step 6: Commit:

```bash
git add src/components/landing src/app/\(public\) tests
 git commit -m "feat(motion): adapt functional Laku-inspired motion to MuaraAI"
```

### Task 7: Complete national copy, footer, and content audit

**Files:**
- Modify: `src/components/landing/footer.tsx`
- Modify: `src/components/landing/treasury-preview.tsx`
- Modify: `src/components/landing/projects-grid.tsx`
- Modify: `src/components/landing/syndicate-roster.tsx`
- Modify: `src/components/landing/manifesto.tsx`
- Test: `tests/national-content-audit.test.ts`

**Interfaces:**

- No new data behavior.
- Test scans rendered copy/source contracts for removed strings and required official URLs.

- [ ] Step 1: Add failing content-audit test for forbidden strings: `Zero Slop`, `100% Independent`, `AES-256-GCM Vault`, `Tencent`, and stale maintainer aliases.
- [ ] Step 2: Add required URL assertions for official website, AI Playground, social, GitHub, Hugging Face, Ollama, and email.
- [ ] Step 3: Remove remaining forbidden copy from public components and update legal/partner text only where the public narrative is affected.
- [ ] Step 4: Run content-audit test and full suite.
- [ ] Step 5: Commit:

```bash
git add src/components/landing tests/national-content-audit.test.ts
 git commit -m "chore(content): complete national MuaraAI public copy audit"
```

### Task 8: Responsive and accessibility verification

**Files:**
- Modify only verified-failure files.
- Test: all existing UI tests plus `tests/national-campus-map.test.tsx` and `tests/national-motion.test.tsx`.
- Evidence: screenshot/browser artifacts if available.

- [ ] Step 1: Run `npm test` and record output.
- [ ] Step 2: Run `npm run build` and record output.
- [ ] Step 3: Verify public home, map, footer, product cards, roster, and mobile menu at 360px, tablet, and desktop.
- [ ] Step 4: Verify keyboard focus, external link labels, map accessible description, and reduced-motion fallback.
- [ ] Step 5: Check no horizontal overflow and no fabricated campus activity claim.
- [ ] Step 6: Run `git diff --check` and `graphify update .`.
- [ ] Step 7: Commit only verified fixes:

```bash
git add <verified-files>
git commit -m "chore(ui): verify national community expansion across breakpoints"
```

---

## Self-Review

### Coverage

- Official URLs and content source: Task 1 and Task 7.
- Product showcase and forbidden public claims: Task 2 and Task 7.
- Correct maintainer identity: Task 3.
- Approved logo: Task 4.
- Indonesia campus map and Pontianak/Jakarta hierarchy: Task 5.
- Laku-inspired functional motion: Task 6.
- Responsive, accessibility, and content verification: Task 8.

### Explicit non-goals

- No database chapter system.
- No real-time geolocation.
- No event scheduling.
- No new AI training.
- No public credential storage.
- No Telegram.
- No image generation.
- No backend API changes.
