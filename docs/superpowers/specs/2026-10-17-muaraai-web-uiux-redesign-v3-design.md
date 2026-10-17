# Specification: MuaraAI Web UI/UX Redesign v3

- Document ID: SPEC-2026-10-17-MUARAAI-UIUX-V3
- Date: 2026-10-17
- Status: Draft for approval
- Target repository: `MuaraAI/MuaraAI` (`muaraai.com`)
- Scope: Public website, member workspace, maintainer operations, onboarding, public member directory, shared motion and accessibility system
- Source direction: `DESIGNV2.md`, `/home/curzy/workspace/MuaraAI/maskot/REAL/DESIGNV2.md`, existing implementation audit, and current MuaraAI product scope

## 1. Problem Statement

The current implementation has a coherent Fluid Currents color palette, but the experience still reads as a technical landing-page template with a dashboard attached. The same visual recipe is repeated across public and authenticated surfaces: white cards, thin borders, soft shadows, badges, section dividers, and generic fade-in motion. The result is decorative rather than intentional.

The current public hero also leads with a fake terminal, API metrics, latency, encryption status, and engineering claims. Those details do not answer the first questions of a UBSI student: what MuaraAI is, who can join, what members do, and what they receive. The member portal and maintainer area similarly expose database fields and long navigation lists before presenting the next useful action.

This redesign keeps the existing business logic and data contracts. It changes the visual hierarchy, information architecture, responsive shells, interaction motion, copy hierarchy, and mascot usage.

## 2. Product Understanding

MuaraAI is a community workspace for UBSI students. The public experience should explain the community and its proof of work. The member workspace should help students learn, build, access shared resources, maintain membership, and understand their next action. The maintainer workspace should support review, member operations, treasury, learning materials, messages, and achievements.

Primary audiences:

1. Prospective UBSI student applicants.
2. Approved MuaraAI members.
3. MuaraAI maintainers and operators.
4. External partners who need a factual contact path, not a marketing funnel.

Success criteria:

- A visitor understands MuaraAI's purpose and eligibility within one screen.
- A member can identify their current status and next action without scanning a long profile.
- A maintainer can reach review and operational tasks quickly.
- Public navigation contains only destinations that exist.
- Motion improves orientation and feedback instead of decorating every section.
- The UI remains usable at 360px, keyboard-only, reduced-motion, and empty/error states.
- No fabricated metrics, testimonials, uptime claims, latency claims, or security marketing claims appear in public UI.

## 3. Design Read and Dials

Reading this as: a student community workspace and public editorial site for UBSI students, with an estuary-inspired visual language and deliberate, interaction-led motion.

Public site:

- ENERGY: 3
- RHYTHM: 3
- MOTION: 2

Member workspace:

- ENERGY: 2
- RHYTHM: 2
- MOTION: 2

Maintainer operations:

- ENERGY: 1
- RHYTHM: 2
- MOTION: 1

The public site can be expressive. The member workspace should be calm and useful. The maintainer area should prioritize scan speed and operational clarity.

## 4. Visual Direction

### 4.1 Identity

Retain MuaraAI's Fluid Currents Light identity:

- Deep riverbed ink: `#072033`.
- River current blue: `#0369A1`.
- Rapid current hover: `#075985`.
- Estuary mist: `#F7FAFC`.
- Crystal surface: `#FFFFFF`.
- Fresh estuary surface: `#F0F7FB`.
- Still-water stroke: `#D9E5ED`.
- Local self-hosted Space Grotesk, Inter, and JetBrains Mono.

The visual metaphor is the point where student work meets a wider technical community. The river/current motif must express flow, connection, and progress. It must not become a collection of waves, blobs, gradients, and decorative dividers.

### 4.2 Composition Rules

- Use one identity motif per screen: a current line, a flowing route, or a controlled mascot moment.
- Reduce repeated white cards. Use flat sections, editorial columns, lists, timelines, and real data surfaces where they communicate better.
- Use cards only to group related information or isolate an actionable state.
- Vary section composition according to content. Do not repeat centered heading plus identical card grid.
- Keep one focal point per screen.
- Keep accent blue for actions, links, selected states, and current indicators. Do not spread it across every icon and border.
- Remove decorative status dots unless they represent a real state.
- Remove decorative pulse loops. A live status may use a static dot plus text; motion is reserved for actual state changes.
- Keep radius variation: inputs and buttons `10px`, content grouping `18px`, major callouts `28px`, status pills only when they communicate status.
- Keep shadows for elevation only. Most surfaces should sit on the page, not float.

### 4.3 Public Site Direction: Estuary Editorial

The public site is not an API documentation page. It is a focused editorial introduction to a student community.

Landing narrative:

1. Hero: what MuaraAI is, who it is for, and the primary join action.
2. Current map: Learn, Build, Contribute as the actual community flow.
3. Member benefits: learning space, project collaboration, verified profile, shared access where applicable.
4. Proof of work: real projects and real member records only.
5. Member directory: live database/GitHub data, factual metadata only.
6. Membership path: GitHub login, UBSI data, Proof of Work review, approval.
7. Contact and legal: real partner contact, terms, privacy, code of conduct.

Remove or demote from primary narrative:

- Fake terminal hero.
- Engineering metrics bar used as marketing.
- `v2-alpha` status badge.
- Uptime, latency, contrast, font-CDN, and encryption claims in public hero.
- `Manifesto` as a primary navigation item. If retained, make it a short principles section inside the story.
- `Accolades` as a primary navigation item. Use `Prestasi` only when real records exist.
- `Treasury` as a public navigation item. Keep the public section factual and link authenticated detail with an explicit login label.
- Wave dividers between every major block.
- Multiple ambient blobs moving simultaneously.

Recommended public navigation:

- Project
- Anggota
- Cara Gabung
- `Masuk`

Optional secondary footer destinations:

- Tentang
- Partner
- Terms
- Privacy
- Code of Conduct
- GitHub Organization

Recommended CTA copy:

- Primary: `Daftar dengan GitHub`
- Secondary: `Lihat anggota`
- Project action: `Buka project`
- Authenticated action: `Buka workspace`

Avoid generic CTA labels such as `Explore`, `Discover`, and `Learn More` when a specific action can be named.

### 4.4 Member Workspace Direction: Muara Workspace

The member workspace should answer:

1. What is my membership status?
2. What needs my attention next?
3. What can I use or learn now?

Member navigation:

- Beranda: status, next actions, recent learning, project snapshot.
- Belajar: materials, read state, categories, empty/loading/error states.
- Project: Proof of Work, portfolio, project links, contribution context.
- Akses: AI and UBSI API keys, revoke/create actions, clear security copy.
- Akun: profile, campus identity, dues, membership lifecycle, exit policy.

Do not expose all profile database fields on the homepage. Move detailed identity and metadata into `Akun` or `Project`.

Dashboard composition:

- Greeting and membership state.
- One primary next-action panel.
- A compact progress/current line connecting status to available workspace areas.
- Recent learning or project activity only when real data exists.
- No invented activity feed or fabricated statistics.
- Membership lifecycle card includes active date and earliest exit date when available.

### 4.5 Maintainer Direction: Muara Operations

Maintainers need a separate operational shell, not a long admin section appended to the member sidebar.

Maintainer navigation:

- Overview
- Review pendaftar
- Anggota
- Kas
- Materi
- Pesan
- Prestasi

Operational rules:

- Review queues lead with pending decisions and clear actions.
- Tables use columns based on the decision being made, not generic table defaults.
- Empty states explain why the queue is empty and what happens next.
- Status colors always have text labels.
- Admin density may be higher than member density, but it must retain the same typography, focus, and spacing tokens.
- Destructive actions require explicit confirmation and explain consequences.

### 4.6 Onboarding Direction: Guided Application

Replace the long single-form feeling with a guided application flow:

1. UBSI identity: name, NIM, campus, program, class code.
2. Proof of Work: project/work link, role, and concise explanation.
3. Public profile: website and social links, optional.
4. Review: summary, intake policy, consent, submit.

Each step should have:

- Visible progress.
- One clear goal.
- Inline field errors.
- Back and next controls with keyboard support.
- A recoverable error state.
- No loss of entered data when moving between steps.

## 5. Motion System

Motion is a functional layer, not a decoration layer.

### 5.1 Motion Purposes

- Page transition: a short current-line or surface transition establishes continuity between routes.
- State transition: pending, approved, exited, success, and error states change with clear but restrained movement.
- Progressive disclosure: secondary metadata and admin details reveal on user action.
- Action feedback: copy key, revoke key, submit form, payment state, and material read state provide immediate feedback.
- Ambient identity: at most one slow, low-contrast current movement per screen; never three simultaneous infinite blobs.

### 5.2 Motion Constraints

- Use the existing hydro easing `cubic-bezier(0.16, 1, 0.3, 1)` for purposeful movement.
- Avoid applying the same fade-up animation to every section.
- Avoid infinite pulse, bounce, or float without a real state or attention purpose.
- Add `prefers-reduced-motion` handling globally and in client motion components.
- Animate transform and opacity only where possible.
- Keep feedback under 300ms for direct actions. Use longer durations only for ambient or page-level movement.
- Do not delay access to content behind decorative animation.

## 6. Mascot System

Mascot source anchor:

- `/home/curzy/workspace/MuaraAI/maskot/REAL/mura-real.png`

Existing pose references:

- `/home/curzy/workspace/MuaraAI/maskot/POSE/new-tran/velnime-empty-search.png`
- `/home/curzy/workspace/MuaraAI/maskot/POSE/new-tran/mura_stream_broken.png`
- `/home/curzy/workspace/MuaraAI/maskot/POSE/new-tran/mura_maintenance.png`
- `/home/curzy/workspace/MuaraAI/maskot/POSE/new-tran/mura_offline.png`
- `/home/curzy/workspace/MuaraAI/maskot/POSE/new-tran/mura_welcome.png`
- `/home/curzy/workspace/MuaraAI/maskot/POSE/new-tran/mura_empty_library.png`

Mascot rules:

- Use Mura as a supporting identity asset in onboarding, empty states, help, and error states.
- Do not place Mura on every screen or behind primary copy.
- Preserve the established blue/teal pointed hair, turquoise forelock, amber eye, pale skin, navy collar, light garment, bold contour, cel shading, and sticker-like silhouette.
- Pose assets must be isolated, high resolution, and consistent in scale, rendering, and transparent background treatment.
- Generate static pose assets first. Animate only after the static anchor and pose set are approved.
- Prompts are documented separately in `2026-10-17-muaraai-mascot-prompt-pack.md`. No asset generation is part of this specification.

## 7. Accessibility and Responsive Requirements

- Minimum responsive floor: 360px.
- No horizontal overflow caused by tables, code blocks, images, or fixed-width children.
- Interactive targets: at least 44px by 44px.
- Every interactive element has a visible `:focus-visible` state.
- Do not use `outline-none` without a replacement focus indicator.
- Dialogs trap focus, close with Escape, and return focus to the trigger.
- Text and status information cannot rely on color alone.
- Every data view has informative loading, empty, and error states.
- Admin tables reflow or become intentional scroll regions with accessible headers and mobile context.
- Public, member, and admin shells have deliberate mobile layouts, not merely compressed desktop layouts.
- Verify all motion with `prefers-reduced-motion` enabled.
- Verify foreground/background pairs against WCAG AA. Target AAA for core text.

## 8. Existing Files and Planned Changes

Shared foundation:

- `DESIGNV2.md`: retain brand primitives, update composition, motion, and surface rules.
- `src/app/globals.css`: add semantic motion, focus, selection, and reduced-motion tokens.
- `tailwind.config.ts`: expose semantic layout and motion tokens without expanding palette unnecessarily.
- `src/components/ui/fade-in.tsx`: replace generic-only entrance usage with purpose-specific motion primitives and reduced-motion handling.
- `src/components/ui/flowing-background.tsx`: reduce to one optional ambient current layer or remove from app surfaces.
- `src/components/ui/wave-divider.tsx`: use selectively, not between every section.
- `src/components/ui/icon.tsx`: retain existing local SVG icon system.

Public:

- `src/app/(public)/page.tsx`
- `src/components/landing/navbar.tsx`
- `src/components/landing/hero.tsx`
- `src/components/landing/metrics-bar.tsx`
- `src/components/landing/vision-mission.tsx`
- `src/components/landing/projects-grid.tsx`
- `src/components/landing/accolades-grid.tsx`
- `src/components/landing/manifesto.tsx`
- `src/components/landing/syndicate-roster.tsx`
- `src/components/landing/benefits-grid.tsx`
- `src/components/landing/treasury-preview.tsx`
- `src/components/landing/join-flow.tsx`
- `src/components/landing/footer.tsx`

Member and onboarding:

- `src/app/(portal)/layout.tsx`
- `src/app/(portal)/dashboard/page.tsx`
- `src/app/(portal)/dashboard/learn/page.tsx`
- `src/app/(portal)/dashboard/vault/page.tsx`
- `src/app/(portal)/dashboard/treasury/page.tsx`
- `src/app/(public)/onboarding/page.tsx`
- `src/components/auth/pow-modal.tsx`
- `src/components/members/members-directory.tsx`

Maintainer operations:

- `src/app/(portal)/admin/layout.tsx`
- `src/app/(portal)/admin/review/*`
- `src/app/(portal)/admin/members/*`
- `src/app/(portal)/admin/treasury/*`
- `src/app/(portal)/admin/learn/*`
- `src/app/(portal)/admin/mail/*`
- `src/app/(portal)/admin/achievements/*`

Business logic, Supabase contracts, auth, and membership rules remain unchanged unless a UI requirement exposes a real bug.

## 9. Implementation Sequence

1. Approve this design and the mascot prompt pack.
2. Update the design direction and semantic tokens.
3. Build public, member, and maintainer navigation shells with active states and mobile layouts.
4. Add shared focus, motion, reduced-motion, dialog, and data-state primitives.
5. Redesign the landing narrative and remove unsupported public metrics.
6. Redesign the member dashboard around status and next action.
7. Convert onboarding into the guided application flow.
8. Redesign the member directory and public profile surfaces.
9. Redesign maintainer operations screens.
10. Add mascot assets only after external generation and visual approval. Integrate them into selected states.
11. Run tests, build, responsive checks, keyboard checks, reduced-motion checks, and screenshot review.
12. Run the antislop Delivery Gate and record evidence.

## 10. Acceptance Criteria

- Public navigation contains only real destinations.
- Landing hero communicates UBSI student community purpose before technical implementation details.
- No unsupported uptime, latency, test, security, or engineering metrics appear as public marketing claims.
- Public page does not use a fake terminal as its primary product visual.
- Member and maintainer shells are visually and structurally distinct.
- Member dashboard prioritizes status and next action over raw profile metadata.
- Onboarding is divided into guided steps with progress and recoverable errors.
- Motion has documented purpose and reduced-motion behavior.
- Mascot is used selectively and consistently from approved static assets.
- 360px, keyboard, focus, empty, loading, error, and reduced-motion checks pass.
- Existing functional tests and production build remain green.
- No remote font or emoji icon is introduced.
- No code is pushed to GitHub; all commits remain local.
