# Specification: MuaraAI National Community Expansion and Product Showcase

- Document ID: `SPEC-2026-10-18-MUARAAI-NATIONAL-COMMUNITY`
- Date: 2026-10-18
- Status: Draft for approval
- Target repository: `MuaraAI/MuaraAI` (`muaraai.com`)
- Scope: Public landing page, community positioning, product showcase, maintainer roster, national campus map, footer/social links, and motion language
- Reference design: `DESIGNV2.md`, `/home/curzy/workspace/MuaraAI/maskot/REAL/DESIGNV2.md`
- Motion reference: `/home/curzy/workspace/MuaraAI/HACKTHON/PROJECT-1/laku`
- Logo asset: `/home/curzy/workspace/MuaraAI/assets/logo.png`

## 1. Executive Summary

MuaraAI is expanding from a community associated with UBSI Pontianak into a national UBSI student community. The community is born from students in UBSI Pontianak, but students from UBSI campuses across Indonesia may join. Eligibility begins at cohort 2026 and continues for future cohorts such as 2027 and 2028. Cohorts below 2026 are outside the current intake policy.

The public website must communicate this expansion without losing the founding identity of Pontianak. Pontianak remains the founding hub and the primary offline gathering center. Jakarta is a secondary regional hub. Other UBSI campuses are represented as connected community nodes.

The public product narrative must also distinguish the community from its projects:

1. MuaraAI Community: national UBSI student community.
2. Muara Arus 1: local academic and coding AI model by MuaraAI.
3. UBSI API: unofficial REST API project for six UBSI digital services.
4. MuaraAI portal: membership, learning, project, account, dues, and access workspace.

## 2. Product Positioning

### 2.1 Community

MuaraAI is a community for students from UBSI campuses throughout Indonesia, starting from the 2026 cohort and continuing with future cohorts. It is a place to learn, build projects, share Proof of Work, meet peers, and connect local student work to a wider technical community.

Core positioning:

> Born in UBSI Pontianak. Open to UBSI students across Indonesia. Built to move local work toward global impact.

The phrase `Where local craft flows global` may remain as a brand line, but the public explanation must explicitly say that MuaraAI is a national UBSI student community.

### 2.2 Muara Arus 1

Muara Arus 1 is a local academic and coding AI model made by MuaraAI.

Canonical facts:

- Model name: `Muara Arus 1`
- Model ID: `muara-arus-1`
- Parameter count: `1.5B`
- Runtime goal: 100% offline
- Playground: `https://ai.muaraai.com/`
- GitHub: `https://github.com/MuaraAI/muara-arus-1`
- Hugging Face: `https://huggingface.co/MuaraAI/muara-arus-1`
- Ollama: `https://ollama.com/MuaraAI/muara-arus-1`
- Current academic scope: UBSI Faculty of Engineering and Informatics (FTI), programs Sistem Informasi (SI), Sistem Informasi Akuntansi (SIA), and Informatika (IF)
- Use cases: academic study, understanding UBSI modules and slides, and completing coursework with source-grounded material
- Founder: Yuken Velino (`@Curzyori`)

The public website must not claim broader faculty or program coverage than the current verified dataset supports. Future expansion to other faculties or programs must be shown as future scope, not current capability.

Recommended public copy:

> Muara Arus 1 adalah AI lokal akademik dan coding 1.5B parameter buatan MuaraAI. Model ini dirancang berjalan offline untuk membantu mahasiswa FTI UBSI dari prodi SI, SIA, dan IF belajar dari materi akademik yang tersedia.

Do not claim that the model knows every UBSI faculty, all journals, or all academic data unless the repository and dataset prove that scope.

### 2.3 UBSI API

UBSI API is an unofficial, independently developed REST API project for six UBSI digital services. It is separate from Muara Arus 1 and separate from the member access/key experience.

Verified README facts:

- Unofficial REST API for StudentV2, MyBest LMS, Elibrary, EJournal, Repository, and News Portal.
- Self-login via student NIM plus SIAKAD and MyBest credentials.
- Live service: `https://ubsi-api.muaraai.com`
- Repository: `https://github.com/MuaraAI/UBSI-API`
- Current README reports 142 passing tests in the badge and describes the six-service aggregation.
- Project is unofficial, independent, and not affiliated with, sponsored by, or managed by UBSI.

Public copy must not describe UBSI API as a vault product. The project card should explain the student-facing use case and the unofficial status clearly.

Recommended public copy:

> UBSI API menyatukan enam layanan digital UBSI ke satu antarmuka JSON. Mahasiswa login dengan akun mereka sendiri untuk mengakses data akademik dan layanan yang tersedia secara lebih terstruktur. Proyek ini bersifat unofficial dan independen.

### 2.4 Portal and Access

The member portal may retain internal API key and credential handling because it is a real product function. However, public landing pages must not lead with `Vault`, `AES-256-GCM`, encryption implementation details, or vendor infrastructure.

Rules:

- Remove `Vault` from public product marketing copy.
- Remove `AES-256-GCM Vault Active` from public hero/project showcase.
- Keep security implementation details in authenticated dashboard documentation where users need them.
- Do not claim military-grade security.
- Keep existing security implementation and tests unchanged unless a UI integration exposes a real bug.

## 3. Audience and Eligibility

### 3.1 Current Intake

- Eligible campuses: all verified UBSI campuses in Indonesia.
- Eligible cohorts: 2026 and later.
- Cohorts before 2026: not eligible for current intake.
- Current academic product focus: FTI, SI, SIA, and IF for Muara Arus 1.
- Community origin: UBSI Pontianak.
- Community scope: national UBSI student community.

The public UI must avoid saying `UBSI Pontianak only` or implying that all campus data is already active. Pontianak is the founding hub, not the only eligible campus.

### 3.2 Community Rhythm

The national community model has two connection modes:

- Online: all UBSI campuses connect through the MuaraAI workspace, learning space, projects, and community channels.
- Offline: Pontianak is the primary gathering hub for local meetups and cross-campus gatherings. Regional meetups may be added later when there is verified local activity.

## 4. Maintainer Roster

The home page shows three core maintainers in this order:

| Name | GitHub | NIM | Title | Roles | Division |
|---|---|---:|---|---|---|
| Yuken Velino | `@Curzyori` | `15260767` | Founder | Maintainer, Builder | Builder |
| Muhammad Raffli Aldiansyah | `@Seeyaa77` | `15260161` | Co-Founder | Maintainer, Builder | Builder |
| Verzio Yamanansyah | `@MyKineID` | `15260225` | Co-Founder | Maintainer, Builder | Builder |

Rules:

- Display the name in the format `Name | NIM`.
- Display the GitHub handle separately.
- Use live GitHub avatars from the existing pattern.
- Do not show fabricated bios or long marketing descriptions.
- Do not label Muhammad Raffli Aldiansyah as Creative.
- Do not use `Raffli (Verzio)` as a display name.
- Do not place a second duplicate Founder/Co-Founder title in the same card.
- Keep all three cards factual and equal in hierarchy.

## 5. Logo and Brand Assets

Use `/home/curzy/workspace/MuaraAI/assets/logo.png` as the primary MuaraAI logo asset after verifying its dimensions, alpha/background behavior, and suitability on the light canvas.

Integration targets:

- Public navbar brand mark.
- Public footer brand mark.
- Product showcase where a logo improves recognition.
- Open Graph or metadata asset only if the current asset is suitable for that use.

Do not invent a second logo or redraw the supplied logo without approval.

## 6. National Campus Map

### 6.1 Purpose

The map communicates community reach and founding geography. It is not a live attendance dashboard and must not imply active members in a campus without verified data.

### 6.2 Visual Model

Use an SVG-based Indonesia map inspired by the Laku `SupplyMap` implementation, but with MuaraAI identity and data semantics:

- Indonesia silhouette or simplified island group.
- Pontianak as the primary founding hub.
- Jakarta as a secondary regional hub.
- Other verified UBSI campuses as connected nodes.
- Curved SVG routes flowing toward Pontianak as the founding center.
- Pontianak uses the strongest highlight and an offline-meetup indicator.
- Jakarta uses a distinct secondary highlight below Pontianak in hierarchy.
- Other campuses use quieter node colors.
- Labels must remain readable at mobile width.
- The map needs an accessible text alternative listing the hubs and scope.

### 6.3 Motion

Adapt these Laku motion patterns:

- SVG route paths draw once on entry using `stroke-dasharray` and `stroke-dashoffset`.
- Route drawing is staggered by node index.
- A small pulse/ring marks the Pontianak hub once or at a restrained interval.
- No endless parcel animation is required for the first MuaraAI version.
- `prefers-reduced-motion` renders the still map with all routes visible and no pulse.
- Use `IntersectionObserver` or existing motion primitives for reveal; do not use a permanent animated background.

### 6.4 Data Integrity

- Campus list must come from the existing verified UBSI campus constants or a new explicit data file reviewed against official UBSI campus information.
- Do not fabricate member counts per campus.
- If a campus has no verified community member, label it as a network node, not an active chapter.
- Pontianak offline meetup label must say `Founding hub` or `Pusat pertemuan komunitas`, not claim recurring events unless an event exists.

## 7. Motion Language Reference from Laku

Laku is a motion reference, not a visual clone.

Patterns to adapt:

1. Scroll-aware floating capsule navbar.
2. Active section indicator via IntersectionObserver.
3. Hover/focus navigation pill that moves between links.
4. Mobile sheet with scrim, Escape close, and scroll lock.
5. One reveal observer for content blocks and dynamically added nodes.
6. SVG route drawing for the Indonesia community map.
7. Accordion/progressive disclosure using CSS grid row transitions.
8. Early reduced-motion flag before first paint where practical.
9. Functional motion only: reveal, orientation, active state, map connection, and state change.

Patterns not to copy:

- Laku branding, copy, colors, logo, or marketplace content.
- Laku's exact CSS naming and layout.
- Decorative motion loops without community meaning.
- Unverified campus activity or logistics claims.

MuaraAI motion dials for this expansion:

- Public landing: ENERGY 3, RHYTHM 3, MOTION 3.
- Community map: ENERGY 2, RHYTHM 2, MOTION 3.
- Member workspace: ENERGY 2, RHYTHM 2, MOTION 2.
- Maintainer operations: ENERGY 1, RHYTHM 2, MOTION 1.

## 8. Footer and Official Links

Remove the footer line:

```text
MIT License • Zero Slop • 100% Independent
```

Replace it with factual branding and official destinations:

- MuaraAI homepage: `https://muaraai.com/`
- AI Playground: `https://ai.muaraai.com/`
- GitHub organization: `https://github.com/MuaraAI`
- X: `https://x.com/MuaraAI`
- Instagram: `https://www.instagram.com/muara.ai/`
- Threads: `https://www.threads.com/@muara.ai`
- Hugging Face organization: `https://huggingface.co/MuaraAI`
- Ollama organization: `https://ollama.com/MuaraAI`
- Contact: `mailto:admin@muaraai.com`

Only include links that are real and accessible. Do not add Telegram.

## 9. Public Copy Cleanup

Remove or rewrite these current public patterns:

- `Zero Slop • 100% Independent`.
- `Vault` in public project/hero copy.
- `AES-256-GCM Vault Active`.
- `sewa VPS Tencent` and vendor infrastructure references.
- `The Hall of Projects` as generic English template copy.
- `Core Syndicate • Maintainers` as the primary community framing.
- `sindikat` when the intended meaning is national student community.
- Unsupported claims such as `100% Open Source`, uptime, latency, and engineering test metrics in public marketing.

Use direct Bahasa Indonesia for the main narrative. Technical product names and official URLs may remain in their canonical form.

## 10. Proposed Public Landing Narrative

1. Hero: national UBSI student community, born in Pontianak, cohort 2026+.
2. Current map: Learn, Build, Contribute.
3. National campus map: all UBSI campuses connected to the Pontianak founding hub.
4. Muara Arus 1: local academic and coding AI, 1.5B, offline, current FTI/SI/SIA/IF scope.
5. UBSI API: unofficial six-service REST API, independent and student-login based.
6. Community benefits: learning, project, Proof of Work, peer connection, offline meetups.
7. Core maintainers: corrected names, NIMs, roles, and live GitHub identities.
8. Join flow: GitHub login, UBSI identity, Proof of Work, review.
9. Official links and contact.

## 11. Data and Security Boundaries

- Public member query must not expose private phone, email, NIM, credentials, or lifecycle fields outside explicitly approved public display. The home maintainer roster is an explicit exception for the three approved NIMs listed in this spec.
- Muara Arus 1 model links are public product links; no secrets are embedded.
- UBSI API credentials remain user-owned and are not presented as a public vault feature.
- Do not modify encryption, credential storage, RLS, auth, or membership lifecycle in this redesign unless a separate security task is approved.
- Do not claim official UBSI affiliation.

## 12. Acceptance Criteria

- Official website, playground, social, GitHub, Hugging Face, Ollama, and contact links are present and correct.
- Footer no longer contains `Zero Slop • 100% Independent`.
- Public copy no longer markets Vault, AES-256-GCM, or Tencent infrastructure.
- Muara Arus 1 is presented with exact current facts and limited FTI/SI/SIA/IF scope.
- UBSI API copy reflects the current README and clearly says unofficial/independent.
- Core maintainer names, NIMs, roles, divisions, and order are correct.
- MuaraAI is described as national UBSI community, born in Pontianak, open to cohort 2026+.
- Logo asset is integrated without inventing a replacement logo.
- Indonesia campus map emphasizes Pontianak, then Jakarta, then other verified UBSI nodes.
- Map routes, reveal, and hub motion disable cleanly under reduced motion.
- Offline gathering language is factual and does not fabricate event schedules.
- Laku motion patterns are adapted as behavior, not copied as branding.
- Tests, build, responsive checks, and content audit pass.

## 13. Out of Scope

- New Supabase schema or campus chapter database.
- Real-time geolocation or live member heatmap.
- Event scheduling or RSVP system.
- Image generation or new mascot generation.
- New AI model training or corpus ingestion.
- Public exposure of private API credentials.
- Telegram integration.
