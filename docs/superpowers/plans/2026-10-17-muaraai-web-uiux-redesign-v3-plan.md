# MuaraAI Web UI/UX Redesign v3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign MuaraAI's public site, member workspace, maintainer operations, onboarding, public directory, motion system, and mascot integration around the approved Fluid Currents Light v3 direction.

**Architecture:** Preserve existing Next.js App Router, Supabase data contracts, Server Actions, auth, membership rules, and local font/icon system. Introduce three deliberately different UI shells: Estuary Editorial for public pages, Muara Workspace for members, and Muara Operations for maintainers. Build shared semantic tokens, motion, focus, and data-state primitives first, then migrate each surface in dependency order.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 3, `motion/react` from the existing `motion` package, Vitest, Testing Library, local fonts, inline SVG icon component, Supabase SSR.

**Spec:** `docs/superpowers/specs/2026-10-17-muaraai-web-uiux-redesign-v3-design.md`

## Global Constraints

- Preserve Supabase schemas, auth behavior, Server Actions, membership lifecycle rules, and API contracts.
- Do not add an animation dependency; reuse the installed `motion` package and `motion/react`.
- Keep Fluid Currents Light colors: `#072033`, `#0369A1`, `#075985`, `#F7FAFC`, `#FFFFFF`, `#F0F7FB`, `#D9E5ED`.
- Use local self-hosted Space Grotesk, Inter, and JetBrains Mono only.
- Keep inline SVG icons through `src/components/ui/icon.tsx`; no emoji UI icons.
- Minimum responsive width is 360px; interactive targets are at least 44px.
- Every interactive element needs a visible `:focus-visible` state.
- Every data view needs informative loading, empty, and error states.
- Respect `prefers-reduced-motion`; static JPEG remains the mascot fallback.
- Do not use fabricated metrics, uptime, latency, testimonials, security claims, or activity events.
- Public navigation must point only to real routes or existing sections.
- No code, asset, or secret is pushed to GitHub; commits remain local.

## Review Focus

- Public copy still presents technical claims or fake terminal UI instead of explaining the UBSI student community; test the rendered hero and navigation text.
- Public anchor links and authenticated links can point to missing sections or login-protected routes without context; test every navbar/footer CTA target.
- Member shell can regress into a desktop sidebar squeezed onto mobile; test 360px, tablet, and desktop navigation separately.
- Motion can hide content, fail in jsdom, or ignore reduced motion; test static render, `matchMedia` absence, and reduced-motion mode.
- Admin light-theme surfaces can retain dark-theme text classes or lose focus contrast; test representative forms, tables, dialogs, and keyboard focus.

---

## File Map

### Shared foundation

- Modify: `src/app/globals.css` for semantic motion, focus, selection, and reduced-motion styles.
- Modify: `tailwind.config.ts` for semantic motion and focus tokens without expanding the palette.
- Modify: `src/components/ui/fade-in.tsx` for reduced-motion-safe, purpose-specific entrance behavior.
- Modify: `src/components/ui/flowing-background.tsx` to remove multi-blob ambient motion from app surfaces.
- Modify: `src/components/ui/wave-divider.tsx` to support selective usage without becoming a default section separator.
- Retain: `src/components/ui/icon.tsx` as the local icon source.
- Create: `src/components/ui/data-state.tsx` for shared loading, empty, and error states if existing page patterns cannot be reused without duplication.
- Create: `tests/ui-motion-accessibility.test.tsx` for shared reduced-motion and focus contracts.

### Public site

- Modify: `src/app/(public)/page.tsx` to use the new public narrative and remove unsupported metrics as primary content.
- Modify: `src/components/landing/navbar.tsx` for concise public navigation and mobile menu behavior.
- Modify: `src/components/landing/hero.tsx` to remove the fake terminal as primary visual and lead with student-community purpose.
- Modify or remove from composition: `src/components/landing/metrics-bar.tsx`.
- Modify: `src/components/landing/vision-mission.tsx` for the Learn, Build, Contribute current map.
- Modify: `src/components/landing/projects-grid.tsx` for factual project proof.
- Modify: `src/components/landing/accolades-grid.tsx` to remain secondary and data-driven.
- Modify: `src/components/landing/manifesto.tsx` to become a concise principles block or remove it from the primary narrative.
- Modify: `src/components/landing/syndicate-roster.tsx` for factual member proof and selective motion.
- Modify: `src/components/landing/benefits-grid.tsx` to use varied editorial composition rather than repeated cards.
- Modify: `src/components/landing/treasury-preview.tsx` to clarify authenticated access or keep only a factual public summary.
- Modify: `src/components/landing/join-flow.tsx` for the actual GitHub, UBSI, Proof of Work, and review flow.
- Modify: `src/components/landing/footer.tsx` for real secondary destinations only.
- Modify: `tests/landing-core.test.tsx`, `tests/hero-v2.test.tsx`, `tests/navbar-v2.test.tsx`, and `tests/syndicate-and-treasury.test.tsx` to pin the new narrative and remove unsupported marketing claims.

### Member workspace and onboarding

- Modify: `src/app/(portal)/layout.tsx` into the member shell with active states and deliberate mobile navigation.
- Modify: `src/app/(portal)/dashboard/page.tsx` around membership status and next action instead of raw profile fields.
- Modify: `src/app/(portal)/dashboard/learn/page.tsx` and `src/app/(portal)/dashboard/learn/learn-feed-client.tsx` for learning states and selected Mura usage.
- Modify: `src/app/(portal)/dashboard/vault/page.tsx` and `src/app/(portal)/dashboard/vault/vault-client.tsx` for access-focused hierarchy and action feedback.
- Modify: `src/app/(portal)/dashboard/treasury/page.tsx` for account-focused dues presentation.
- Modify: `src/app/(public)/onboarding/page.tsx` and `src/components/auth/pow-modal.tsx` for guided application steps.
- Modify: `src/components/members/members-directory.tsx` for factual public directory hierarchy and mobile filters.
- Modify or create focused tests near the existing membership, dashboard, and onboarding tests.

### Maintainer operations

- Modify: `src/app/(portal)/admin/layout.tsx` into an explicit maintainer shell.
- Modify: `src/app/(portal)/admin/review/page.tsx` and `src/app/(portal)/admin/review/review-queue-client.tsx` for decision-first review queues.
- Modify: `src/app/(portal)/admin/members/page.tsx` and `src/app/(portal)/admin/members/admin-members-client.tsx` for lifecycle-focused member operations.
- Modify: `src/app/(portal)/admin/treasury/page.tsx` for clear recording workflow.
- Modify: `src/app/(portal)/admin/learn/page.tsx` and `src/app/(portal)/admin/learn/admin-learn-client.tsx` for material publishing workflow.
- Modify: `src/app/(portal)/admin/mail/page.tsx` and `src/app/(portal)/admin/mail/admin-mail-client.tsx` for inbox/outbox clarity.
- Modify: `src/app/(portal)/admin/achievements/page.tsx` and `src/app/(portal)/admin/achievements/admin-achievements-client.tsx` for focused forms and readable states.
- Modify or create `tests/admin-ui.test.tsx` for navigation, forms, and state contracts.

### Mascot integration

- Copy: seven approved JPEGs from `/home/curzy/workspace/MuaraAI/maskot/POSE/MuaraAI/pose/` into `public/mascot/mura/` using stable kebab-case names.
- Create: `src/components/mascot/mura-animated.tsx` based on the reviewed bundle implementation.
- Create: `src/components/mascot/mura-animated.test.tsx` based on the reviewed bundle tests.
- Modify: `src/app/not-found.tsx` by merging the `not-found` pose into the existing Indonesian page, never overwriting the existing route copy wholesale.
- Modify: selected onboarding, learn empty, project, vault, maintenance, and 404 surfaces only after their shells are stable.

---

### Task 1: Establish shared semantic UI and motion foundations

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `src/components/ui/fade-in.tsx`
- Modify: `src/components/ui/flowing-background.tsx`
- Modify: `src/components/ui/wave-divider.tsx`
- Create: `src/components/ui/data-state.tsx` only if no existing shared state component can cover the required states
- Test: `tests/ui-motion-accessibility.test.tsx`

**Interfaces:**
- Produces semantic classes/tokens for focus, motion, reduced motion, and data states.
- Preserves the existing `FadeIn` public props: `children`, `delay`, `direction`, and `className`.
- Produces `DataState` props: `kind: "loading" | "empty" | "error"`, `title: string`, `description: string`, and optional `action: ReactNode`.

- [ ] Step 1: Add failing tests for reduced-motion-safe rendering, visible focus token presence, and informative data-state variants.
- [ ] Step 2: Run `npx vitest run tests/ui-motion-accessibility.test.tsx` and confirm the new contracts fail.
- [ ] Step 3: Add semantic CSS/Tailwind tokens and update motion components to disable movement when reduced motion is active.
- [ ] Step 4: Reduce `FlowingBackground` to one optional ambient layer and make `WaveDivider` opt-in without changing its existing call signature.
- [ ] Step 5: Implement `DataState` only if existing patterns cannot be composed without duplication; keep it presentational and action-agnostic.
- [ ] Step 6: Run `npx vitest run tests/ui-motion-accessibility.test.tsx` and `npm run build`.
- [ ] Step 7: Commit:

```bash
git add src/app/globals.css tailwind.config.ts src/components/ui tests/ui-motion-accessibility.test.tsx
git commit -m "refactor(ui): establish accessible motion and state foundations"
```

### Task 2: Build the three navigation shells

**Files:**
- Modify: `src/components/landing/navbar.tsx`
- Modify: `src/app/(portal)/layout.tsx`
- Modify: `src/app/(portal)/admin/layout.tsx`
- Test: `tests/navbar-v2.test.tsx`
- Test: create `tests/navigation-shells.test.tsx`

**Interfaces:**
- Public nav exposes real destinations: Project, Anggota, Cara Gabung, and Masuk.
- Member nav exposes Beranda, Belajar, Project, Akses, and Akun routes using existing route destinations or explicit section links.
- Maintainer nav exposes Overview, Review, Anggota, Kas, Materi, Pesan, and Prestasi using the existing admin routes.

- [ ] Step 1: Write failing tests for public links, active member/admin states, mobile menu keyboard behavior, and absence of dead destinations.
- [ ] Step 2: Run the focused tests and confirm the new shell assertions fail.
- [ ] Step 3: Refactor public navbar labels and destinations without adding routes that do not exist.
- [ ] Step 4: Replace the portal sidebar's mixed member/admin structure with a member shell and explicit maintainer entry point.
- [ ] Step 5: Add active route styling and mobile layouts with 44px targets and visible focus states.
- [ ] Step 6: Keep authorization guards in place and run `npm test -- tests/navigation-shells.test.tsx tests/navbar-v2.test.tsx` plus `npm run build`.
- [ ] Step 7: Commit:

```bash
git add src/components/landing/navbar.tsx src/app/\(portal\)/layout.tsx src/app/\(portal\)/admin/layout.tsx tests
 git commit -m "feat(ui): add distinct public member and maintainer shells"
```

### Task 3: Redesign the public landing narrative

**Files:**
- Modify: `src/app/(public)/page.tsx`
- Modify: `src/components/landing/hero.tsx`
- Modify: `src/components/landing/metrics-bar.tsx`
- Modify: `src/components/landing/vision-mission.tsx`
- Modify: `src/components/landing/projects-grid.tsx`
- Modify: `src/components/landing/accolades-grid.tsx`
- Modify: `src/components/landing/manifesto.tsx`
- Modify: `src/components/landing/syndicate-roster.tsx`
- Modify: `src/components/landing/benefits-grid.tsx`
- Modify: `src/components/landing/treasury-preview.tsx`
- Modify: `src/components/landing/join-flow.tsx`
- Modify: `src/components/landing/footer.tsx`
- Test: `tests/landing-core.test.tsx`
- Test: `tests/hero-v2.test.tsx`
- Test: `tests/syndicate-and-treasury.test.tsx`

**Interfaces:**
- `LandingPage` continues receiving live members, achievements, and treasury aggregates from Supabase.
- Components remain presentational and keep their existing server/client boundary unless interaction requires a client component.
- No new public data source is introduced.

- [ ] Step 1: Add failing assertions that hero copy identifies MuaraAI as a UBSI student community, primary CTA is GitHub registration, and unsupported uptime/latency/security metrics are absent.
- [ ] Step 2: Run focused landing tests and confirm failure against current terminal/metrics copy.
- [ ] Step 3: Replace the fake terminal hero with a real community-oriented visual composition using existing data and the selected current motif.
- [ ] Step 4: Convert the metrics area into factual benefit/proof content or remove it if no real data source exists.
- [ ] Step 5: Recompose sections so they do not all use identical card grids; retain live projects, achievements, roster, and treasury data only where the content earns a place.
- [ ] Step 6: Remove or demote Manifesto, Accolades, and Treasury from primary navigation while preserving real public content where useful.
- [ ] Step 7: Verify every link in the public page resolves to an existing route or section and update tests.
- [ ] Step 8: Run `npm test -- tests/landing-core.test.tsx tests/hero-v2.test.tsx tests/syndicate-and-treasury.test.tsx` and `npm run build`.
- [ ] Step 9: Commit:

```bash
git add src/app/\(public\)/page.tsx src/components/landing tests
 git commit -m "feat(landing): redesign public narrative around UBSI students"
```

### Task 4: Redesign the member dashboard and member pages

**Files:**
- Modify: `src/app/(portal)/dashboard/page.tsx`
- Modify: `src/app/(portal)/dashboard/learn/page.tsx`
- Modify: `src/app/(portal)/dashboard/learn/learn-feed-client.tsx`
- Modify: `src/app/(portal)/dashboard/vault/page.tsx`
- Modify: `src/app/(portal)/dashboard/vault/vault-client.tsx`
- Modify: `src/app/(portal)/dashboard/treasury/page.tsx`
- Test: create `tests/member-workspace-ui.test.tsx`
- Test: update existing `tests/dashboard-and-learn.test.ts` and membership portal tests when assertions change

**Interfaces:**
- Existing Server Actions and Supabase queries remain unchanged.
- Dashboard output must expose membership status, next action, and available workspace areas.
- Vault keeps existing key generation/revoke behavior and only changes presentation and feedback.

- [ ] Step 1: Add failing tests for next-action hierarchy, absence of raw profile dump as the first dashboard block, real learning empty/loading/error states, and vault action feedback.
- [ ] Step 2: Run focused tests and confirm the dashboard contract fails.
- [ ] Step 3: Recompose dashboard into greeting, membership state, one next-action panel, current/progress line, and real recent content.
- [ ] Step 4: Move detailed profile, campus, PoW, dues, and membership lifecycle data into deliberate account/project sections without changing data access rules.
- [ ] Step 5: Update Learn, Vault, and Treasury layouts to match the member shell, including informative states and stable mobile layouts.
- [ ] Step 6: Add visible focus, keyboard, and success/error feedback to copy, create, revoke, read, and payment interactions.
- [ ] Step 7: Run focused member tests and `npm run build`.
- [ ] Step 8: Commit:

```bash
git add src/app/\(portal\)/dashboard tests
 git commit -m "feat(workspace): redesign member dashboard around next actions"
```

### Task 5: Convert onboarding into a guided application flow

**Files:**
- Modify: `src/app/(public)/onboarding/page.tsx`
- Modify: `src/components/auth/pow-modal.tsx`
- Test: `tests/onboarding-and-notify.test.ts`
- Test: create `tests/onboarding-flow-ui.test.tsx`

**Interfaces:**
- Existing `submitProofOfWork` Server Action input contract remains unchanged.
- The client stepper owns only presentation and draft form state; it submits the existing complete payload once at review.
- Required UBSI 2026 intake fields remain required and normalized.

- [ ] Step 1: Add failing tests for four visible steps, progress indicator, field grouping, back/next behavior, review summary, and preservation of draft values.
- [ ] Step 2: Run focused onboarding tests and confirm the current single-form UI fails the new structure.
- [ ] Step 3: Split fields into identity, Proof of Work, optional public profile, and review steps without changing validation rules.
- [ ] Step 4: Add inline field errors, keyboard-safe controls, recoverable submission errors, and no-loss navigation between steps.
- [ ] Step 5: Add the approved welcome Mura pose only after the component from Task 7 is available; keep the form usable if the image fails.
- [ ] Step 6: Run onboarding tests and `npm run build`.
- [ ] Step 7: Commit:

```bash
git add src/app/\(public\)/onboarding src/components/auth tests
 git commit -m "feat(onboarding): guide UBSI applicants through proof of work review"
```

### Task 6: Redesign public member directory and factual proof surfaces

**Files:**
- Modify: `src/app/(public)/members/page.tsx`
- Modify: `src/components/members/members-directory.tsx`
- Modify: `src/components/landing/syndicate-roster.tsx` if roster composition needs alignment
- Test: existing member directory tests, or create `tests/member-directory-ui.test.tsx`

**Interfaces:**
- Continue using live Supabase member data and live GitHub avatar URLs.
- Preserve public PII restrictions; do not add email, phone, NIM, or private lifecycle fields to public output.
- Search and filter state remains client-local.

- [ ] Step 1: Add failing tests for factual metadata, empty search state, mobile filter behavior, live avatar source, and no marketing bio/track claims.
- [ ] Step 2: Run focused tests and confirm current directory assertions fail where hierarchy changes are needed.
- [ ] Step 3: Recompose directory results around identity, title, division, campus/class where public, and GitHub link.
- [ ] Step 4: Replace dense filter tabs with a mobile-safe filter control while preserving search and role/division filtering.
- [ ] Step 5: Add informative empty, loading, and error states without fabricated member records.
- [ ] Step 6: Run focused tests and `npm run build`.
- [ ] Step 7: Commit:

```bash
git add src/app/\(public\)/members src/components/members src/components/landing/syndicate-roster.tsx tests
 git commit -m "refactor(members): simplify factual public directory experience"
```

### Task 7: Redesign maintainer operations shell and workflows

**Files:**
- Modify: `src/app/(portal)/admin/layout.tsx`
- Modify: `src/app/(portal)/admin/review/page.tsx`
- Modify: `src/app/(portal)/admin/review/review-queue-client.tsx`
- Modify: `src/app/(portal)/admin/members/page.tsx`
- Modify: `src/app/(portal)/admin/members/admin-members-client.tsx`
- Modify: `src/app/(portal)/admin/treasury/page.tsx`
- Modify: `src/app/(portal)/admin/learn/page.tsx`
- Modify: `src/app/(portal)/admin/learn/admin-learn-client.tsx`
- Modify: `src/app/(portal)/admin/mail/page.tsx`
- Modify: `src/app/(portal)/admin/mail/admin-mail-client.tsx`
- Modify: `src/app/(portal)/admin/achievements/page.tsx`
- Modify: `src/app/(portal)/admin/achievements/admin-achievements-client.tsx`
- Test: create `tests/admin-ui.test.tsx`
- Test: preserve `tests/membership-admin.test.tsx` and existing admin action tests

**Interfaces:**
- Existing admin Server Actions and maintainer guard remain unchanged.
- Admin navigation uses existing route paths.
- Lifecycle fields remain visible and exited/reapply-blocked states remain locked.

- [ ] Step 1: Add failing tests for separate maintainer navigation, active route state, decision-first review queue, lifecycle status visibility, and light-theme form contrast.
- [ ] Step 2: Run focused admin tests and confirm the current mixed shell fails the new structure.
- [ ] Step 3: Implement a separate operations shell with Overview, Review, Anggota, Kas, Materi, Pesan, and Prestasi navigation.
- [ ] Step 4: Recompose review and member screens around pending decisions, lifecycle status, and safe destructive actions.
- [ ] Step 5: Rework treasury, learning, mail, and achievements screens around their real operator decisions; keep tables only where scanning is the task.
- [ ] Step 6: Add informative loading, empty, and error states plus focus and keyboard behavior for forms, dialogs, filters, and tables.
- [ ] Step 7: Run admin tests, existing membership tests, and `npm run build`.
- [ ] Step 8: Commit:

```bash
git add src/app/\(portal\)/admin tests
 git commit -m "feat(admin): create focused maintainer operations workspace"
```

### Task 8: Integrate approved Mura mascot animations

**Files:**
- Copy: `/home/curzy/workspace/MuaraAI/maskot/POSE/MuaraAI/pose/*.jpeg` to `public/mascot/mura/`
- Create: `src/components/mascot/mura-animated.tsx`
- Test: `src/components/mascot/mura-animated.test.tsx`
- Modify: `src/app/not-found.tsx`
- Modify: selected onboarding, Learn, project, Vault, and error surfaces after shell tasks are complete
- Test: `tests/not-found.test.tsx` or the repository's existing not-found test convention

**Interfaces:**
- `MuraPose` is exactly: `"welcome" | "learning" | "building" | "access" | "empty" | "maintenance" | "not-found"`.
- `MURA_POSE_ASSETS: Record<MuraPose, string>` maps every pose to one `/mascot/mura/*.jpeg` path.
- `MuraAnimatedProps` accepts `pose`, `alt`, optional `decorative`, `className`, `priority`, `interactive`, and `sizes`.
- Component uses `motion/react`, `next/image`, transform/opacity only, and a safe reduced-motion subscription.

- [ ] Step 1: Copy and verify all seven approved JPEGs; do not alter source pixels.
- [ ] Step 2: Add failing component tests for asset mapping, alt text, reduced-motion behavior, absent `matchMedia`, decorative mode, and no dead interactive element.
- [ ] Step 3: Run `npx vitest run src/components/mascot/mura-animated.test.tsx` and confirm the component contract fails before implementation.
- [ ] Step 4: Implement the reviewed `MuraAnimated` component with the existing `motion` package and stable image dimensions.
- [ ] Step 5: Merge the `not-found` pose into the existing Indonesian `src/app/not-found.tsx`; preserve `404`, `Halaman Tidak Ditemukan`, `Kembali ke Beranda`, and existing tokens.
- [ ] Step 6: Integrate Mura selectively into onboarding, one Learn empty state, one project state, one Vault state, one recoverable error state, and 404.
- [ ] Step 7: Run mascot tests, `npm test`, and `npm run build`.
- [ ] Step 8: Commit:

```bash
git add public/mascot src/components/mascot src/app/not-found.tsx tests
 git commit -m "feat(mascot): add accessible code-driven Mura animations"
```

### Task 9: Run responsive, accessibility, and visual delivery verification

**Files:**
- Modify only files required by verified failures.
- Test: all existing tests plus focused UI tests from Tasks 1-8.
- Evidence: screenshots or browser verification artifacts stored outside source unless the project already has a visual test convention.

**Interfaces:**
- No new product interface. This task validates the completed UI against the spec.

- [ ] Step 1: Run `npm test` and record the complete result.
- [ ] Step 2: Run `npm run build` and record route/build output.
- [ ] Step 3: Run the app in a production-like local server and inspect public, member, admin, onboarding, directory, error, and 404 routes.
- [ ] Step 4: Verify 360px, tablet, and desktop widths for overflow, navigation reflow, tap targets, tables, dialogs, and mascot dimensions.
- [ ] Step 5: Verify keyboard navigation, visible focus, Escape dialog close, form errors, empty states, loading states, and error states.
- [ ] Step 6: Verify `prefers-reduced-motion: reduce` disables movement while preserving layout and content.
- [ ] Step 7: Run the antislop Delivery Gate and record PASS/FAIL evidence for navigation, fabricated claims, contrast, motion purpose, responsive behavior, and interactive elements.
- [ ] Step 8: Run `git diff --check`, `git status`, and `graphify update .`.
- [ ] Step 9: Commit only verified fixes:

```bash
git add <verified-files>
git commit -m "chore(ui): verify MuaraAI redesign across states and breakpoints"
```

---

## Plan Self-Review

### Spec coverage

- Public narrative and removal of unsupported metrics: Task 3.
- Three distinct navigation shells: Task 2 and Task 7.
- Member workspace hierarchy: Task 4.
- Guided onboarding: Task 5.
- Public member directory: Task 6.
- Mascot static assets and code animation: Task 8.
- Motion purposes and reduced motion: Task 1 and Task 8.
- Accessibility, responsive floor, data states, and focus: Tasks 1, 2, 4, 5, 7, and 9.
- Verification and antislop gate: Task 9.
- Business logic preservation: global constraints and every task's interface section.

### Dependency order

1. Task 1 establishes shared tokens and state primitives.
2. Task 2 establishes navigation shells used by Tasks 3-7.
3. Task 3 can run after Tasks 1-2 and establishes public narrative.
4. Tasks 4-7 can run after Tasks 1-2; Task 5 depends on Task 8 only for optional Mura placement, so the form can be built before mascot integration.
5. Task 8 integrates mascot after shells and selected surfaces are stable.
6. Task 9 verifies the complete branch.

### Placeholder scan

No `TBD`, vague TODO, unowned implementation step, or undefined neighboring interface remains in this plan. Existing bundle code is treated as a reviewed reference, not as a verified change to the repository.

### Deferred scope

- No dark mode.
- No new backend or Supabase schema.
- No image-to-video generation.
- No redesign of unrelated business logic.
- No new animation library.
- No public metrics without a real source.
