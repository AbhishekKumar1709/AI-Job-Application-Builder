# Changelog

## 2026-08-24 (8)

### Fixed
- Follow-up to the profile redesign: the page still had too much unused
  margin on wide screens (widened to `max-w-4xl` last time, not enough)
  — widened further to `max-w-6xl`, and Basic Info's grid went from
  2 columns to 3 (Headline/Phone/Location each get their own column,
  Summary spans full width below).
- The "headline" part of the original request was actually about
  autocomplete/autofill suggestions on the Headline field, not the
  avatar-circle feature built earlier (which was a separate, correctly-
  understood part of the same request). Added a native HTML `<datalist>`
  of ~38 common job titles wired to the Headline input via the `list`
  attribute — no JS library needed, works with the browser's own
  autocomplete UI, naturally filters as you type.

### Verified
- Playwright: confirmed the datalist has all 38 options and is
  correctly linked to the Headline input, screenshotted the wider
  layout at the same viewport width the user reported the issue at,
  zero console errors. Lint, `tsc --noEmit`, and a full production
  build all clean.

## 2026-08-24 (7)

### Added
- Manual light/dark theme toggle (`ThemeToggle`, in both headers) — the
  site previously only followed the OS `prefers-color-scheme` setting
  with no way to override it. Stored in `localStorage`, applied via a
  `data-theme` attribute set before first paint (inline script in
  `app/layout.tsx`) to avoid a flash of the wrong theme.
- Renamed "Master profile" to "Profile" everywhere it's shown
  (`/profile`'s heading, the dashboard's "Edit profile" button, the
  resumes page's description text).
- Redesigned the profile page: Basic Info now uses a 2-column layout
  (was one narrow centered column with a lot of wasted space on wider
  screens); page widened from `max-w-2xl` to `max-w-4xl`. Experience
  and Education entries now show a colored initial-letter avatar
  circle on the left (color cycles through the same 5 brand hues used
  on the landing page), in a "modern" bordered card with a hover
  effect. Skills' "Add" button restyled as a compact "+" icon button;
  skill pills recolored to use the brand purple tint instead of plain
  bordered pills. All four profile sections (Basic Info, Experience,
  Education, Skills) now share a consistent `bg-surface` card wrapper.
- Dashboard stat tiles (Resumes/Applications/Interviewing/Offers) now
  each show a colored icon (same 4-of-5 brand hues), redesigned as
  cards instead of plain bordered boxes; page widened slightly
  (`max-w-2xl` → `max-w-3xl`) to fit the icons comfortably.

### Fixed
- The inline theme-init script caused a real hydration mismatch
  warning (server-rendered `<html>` has no `data-theme`, the script
  adds one before React hydrates) — fixed with `suppressHydrationWarning`
  on `<html>`, the standard pattern for this exact case. Caught via
  Playwright console-error monitoring, not just visual inspection.

### Verified
- Playwright: signed up a real test account, added a real experience
  entry, education entry, and skill through the actual UI (not
  seeded directly in the database), confirmed all three render with
  the new avatar/card/pill styling, toggled dark mode and back,
  checked both themes render correctly with zero console errors. Two
  stray test accounts left over from earlier ad-hoc testing sessions
  (found while checking for leftovers, not created by this work) were
  also cleaned up. Lint, `tsc --noEmit`, and a full production build
  all clean.

## 2026-08-24 (6)

### Added
- Basic SEO/discoverability setup, so the site can actually be found on
  Google (previously had none — no sitemap, no robots.txt, generic
  metadata): `app/sitemap.ts` (home, `/login`, `/signup`), `app/robots.ts`
  (allows crawling, disallows authenticated routes and `/api/`, points
  at the sitemap), and richer metadata in `app/layout.tsx`
  (`metadataBase`, Open Graph tags, Twitter card, keywords, explicit
  `index, follow`). All free — no paid SEO tools involved.

### Verified
- `curl localhost:1001/sitemap.xml` and `/robots.txt` both render
  correctly; confirmed all the new meta tags (OG, Twitter, keywords,
  robots) appear in the rendered homepage HTML. Lint, `tsc --noEmit`,
  and a full production build all clean — `/sitemap.xml` and
  `/robots.txt` both compile as static routes.

### Known gap
- This alone does not get the site indexed — Google still needs to be
  told to look (Search Console verification + sitemap submission,
  requires the user's Google account) and indexing takes days to
  weeks after that. Not done yet.

## 2026-08-24 (5)

### Fixed
- Got `cvrespire.vercel.app` actually working as a public URL. The
  earlier assumption (that the bare `<name>.vercel.app` domain was
  unavailable because someone else owns it, or because team-scoped
  projects can't get one at all) was wrong on both counts — it just
  needed to be added explicitly via Domains → "Add Existing" in the
  Vercel dashboard rather than relying on it being auto-assigned by
  the project rename. Added it there, connected to Production; it's
  now live and public (verified: real signup via curl returned 201,
  zero console errors via Playwright, page title reads "CVRespire").
  The old `ai-job-application-builder.vercel.app` domain is still
  attached too and still resolves to the same deployment — left as-is,
  harmless to keep both.
- Updated the GitHub links that were still hardcoded to the old repo
  path (`SiteHeader`, `SiteFooter`, `Roadmap`'s FEATURES.md link) to
  `github.com/AbhishekKumar1709/CVRespire`, plus `DEVELOPMENT.md`'s
  `cd` instruction (a fresh clone now creates a `CVRespire` folder, not
  the old name) and `PROJECT_STATUS.md`'s current-URL reference. Left
  historical "we tested against `ai-job-application-builder.vercel.app`"
  narrative in `FEATURES.md`/`TESTING.md`/`docs/AI.md` alone — still
  factually accurate since that URL still resolves to the same site.

## 2026-08-24 (4)

### Changed
- Renamed the site again, this time to "CVRespire" — display name
  ("CVBreathe", chosen shortly before, only lived for a few hours)
  updated in the same places as the earlier rename. Also renamed the
  GitHub repo (`AbhishekKumar1709/CVRespire`, local git remote updated
  to match) and the Vercel project (`cvrespire`).
- Found and worked around a real constraint while renaming: Vercel's
  free `<project>.vercel.app` subdomains are global across all Vercel
  accounts, not scoped per-user. `cvbreathe.vercel.app` turned out to
  already be taken by someone else — Vercel silently fell back to a
  team-scoped domain (`cvbreathe-abhishekkumar1709s-projects.vercel.app`)
  which is blocked behind Vercel's SSO login wall and not usable as a
  public URL. Checked `cvrespire.vercel.app` was unclaimed (no active
  deployment responding there) before renaming to it this time.
- Updated `NEXTAUTH_URL` in Vercel production to
  `https://cvrespire.vercel.app` (auth/email links were still pointing
  at the pre-rename URL otherwise) and redeployed so the new domain
  actually gets aliased to a live deployment.

## 2026-08-24 (3)

### Changed
- Renamed the site's display name from "AI Job Application Builder" to
  "CVBreathe" (user's choice) — updated everywhere the name is shown
  to a visitor or reader: `SiteHeader`, `AppHeader`, `SiteFooter`, the
  page `<title>`/metadata, `README.md`'s title, and the top comment in
  `schema.prisma`. Deliberately left unchanged: the GitHub repo name,
  the Vercel deployment URL (still
  `ai-job-application-builder.vercel.app`), the local folder name, and
  `package.json`'s npm package name — renaming any of those is a
  separate, bigger operation (would break the current bookmarked URL)
  that wasn't asked for.

## 2026-08-24 (2)

### Added
- Landing-page color redesign: new brand gradient (violet → pink →
  orange) on the headline and primary CTA button, colorful gradient
  background blobs, and 5 distinct icon hues for the feature row —
  matching a reference image the user provided. The app-wide `accent`
  token also changed (indigo → violet) so the rest of the app (forms,
  buttons, links on profile/resumes/applications/etc.) feels
  consistent with the new brand color, but deliberately stayed a single
  color everywhere outside the landing page — a full multi-color reskin
  of every form control would hurt readability on dense pages.
- Rebuilt `HeroLaptop`: dark bezel with a camera dot, aluminum-shaded
  base, a sidebar nav on the screen mirroring the app's real pages, and
  a circular ATS-score gauge. Added a matching floating "ATS Score"
  card beside the laptop.

### Verified
- The `94` shown on both the laptop's gauge and the floating card is a
  real result, not invented: signed up a throwaway account, built a
  generic sample profile (fake person, real-shaped resume — "Example
  Tech Co", standard job titles/dates/skills) via the actual API, ran
  the real `POST /api/resumes/:id/ats-check` endpoint (our live Gemini
  integration) against it, and used that exact returned score. Test
  account deleted afterward. Labeled "example result" everywhere it
  appears — not an aggregate or per-visitor stat.
- Playwright: screenshotted the laptop frozen at 0/45/90/180/270/315°
  in light mode plus one dark-mode pass, zero console errors. Checked
  the new violet accent renders correctly on `/login` and `/signup`
  forms too. Lint, `tsc --noEmit`, and a full production build clean.

## 2026-08-24 (1)

### Added
- `HeroLaptop` — replaced the flat hero mockup card with a real 3D CSS
  laptop (screen + hinge + keyboard base, plain divs with
  `rotateX`/`rotateY`/`preserve-3d`, no images or 3D library) that
  continuously spins 360°, matching the "auto rotating laptop" element
  from the reference image the user pointed out was missing. Same
  honest skeleton-bar screen content as before — no invented numbers.
  Respects `prefers-reduced-motion`.

### Verified
- Iteratively checked the 3D geometry via Playwright: froze the
  rotation at 0/30/90/120/180/270° and screenshotted each — first
  attempt had the screen/base pivots backwards (base only, screen
  invisible), fixed the `transform-origin` and rotation direction on
  both parts, re-verified all angles read as a correct laptop shape.
  Confirmed the animation genuinely runs (two screenshots ~2s apart
  differ) and checked dark mode. Lint, `tsc --noEmit`, and a full
  production build all clean.

## 2026-08-23 (10)

### Added
- `AppHeader` — a consistent, clickable-logo header now present on
  every page that isn't the landing page (login, signup, forgot/reset
  password, verify-email, dashboard, profile, resume editor/preview,
  applications, account). Closes a real gap: several of these pages
  previously had no link back to the site's home page at all. Signed-out
  view shows Log in/Sign up; signed-in view shows Dashboard/Sign out
  (session-aware via `useSession()`), replacing the old page-local
  `SignOutButton` (deleted).
- Redesigned the landing page hero: gradient accent on the headline's
  last line, an illustrative resume-builder mockup card (skeleton bars
  only), and a 5-icon feature row (AI Resume Builder, ATS Checker, AI
  Cover Letters, Job Match, Application Tracker) using inline SVGs and
  the existing single `accent` color token — no new colors introduced.
  `SiteHeader`'s logo now links to `/` too.

### Explicitly not implemented
- A landing-page redesign reference image was provided with fabricated
  metrics (25K+ resumes built, 87% ATS success rate, 15K+ jobs matched,
  "trusted by 10,000+ job seekers," a 4.9/5 rating with fake avatars).
  None of that is real — this app has no meaningful user base yet — so
  none of it was added. Took the layout/style ideas (mockup card, icon
  row, gradient headline) without the fabricated numbers.

### Verified
- Lint and `tsc --noEmit` clean. Playwright: signed up a real test
  account, confirmed clicking the header logo from `/dashboard`
  navigates to `/`, confirmed sign-out via the header works, checked
  `/`, `/login`, `/profile` render with zero console errors. Test
  account deleted afterward via the real UI delete flow.

## 2026-08-23 (9)

### Investigated further
- Attempted the actual fix for the Preview/Production Neon-branch-sharing
  gap: backed up Production's `DATABASE_URL`/`DATABASE_URL_UNPOOLED`
  (safety net), then tried reconfiguring the existing Vercel↔Neon
  connection via "Connect to this project" with the Preview-branch
  checkbox and a `DATABASE` env var prefix. Submission failed: "This
  project is already connected to the target store in one of the chosen
  environments" — the dialog can only create new connections, not edit
  existing ones. Searched every other angle (env var "Manage
  Connection", the database's own Settings page) for a disconnect
  option; the only one that exists is "Delete Database", which is
  destructive (wipes both `main` and `development`).

### Conclusion
- There is no self-service, non-destructive way to enable per-preview
  branching on an already-connected Vercel Marketplace Neon database.
  Not pursuing a destructive fix for a non-blocking gap. Production's
  `DATABASE_URL` was never actually touched (the reconfigure attempt
  errored before submitting) — verified untouched, no action needed on
  the backup. Documented as a hard platform limitation in `DATABASE.md`.

## 2026-08-23 (8)

### Investigated
- Whether Neon's Vercel-managed integration auto-creates a branch per
  Preview deployment (the documented "Preview shares `main` with
  Production" gap). Tested empirically instead of assuming: pushed a
  throwaway commit to a test branch, let Vercel build the Preview
  deployment, and checked Neon's branch count before/after — stayed at
  2, confirming it's not automatic. Found via Neon's own docs that
  enabling it requires re-running the "Connect a Project" flow with a
  "Create Database Branch For Deployment → Preview" checkbox, but the
  project already shows as connected in that dialog — enabling it means
  disconnecting the current live connection first.

### Deferred
- Decided not to disconnect/reconnect the production database
  integration to close this gap: it's a real risk window for
  Production's `DATABASE_URL` (a working connection) to fix a
  non-blocking, already-documented issue. Left as-is; see `DATABASE.md`.
- Cleaned up: deleted the throwaway test branch and its remote copy
  after the experiment.

## 2026-08-23 (7)

### Fixed
- `DATABASE.md`'s "Models" section documented only `User` — rewrote it
  to cover all 15 current models (auth/token, profile, resume, cover
  letter, application tracking, rate limiting), grouped by area, plus a
  cascade-delete summary. Also dropped a stale "SQLite dev datasource"
  comment at the top of `schema.prisma` (this project has used Postgres
  everywhere since Phase 1).
- `docs/UI_DESIGN.md`'s `Roadmap` component description still described
  the old Live/Activating-soon two-status badge, which was simplified
  away when Gemini went live (`RoadmapItem.status` is now just
  `"Live"`). Fixed to match. Everything else in the file (colors,
  typography, form/button classes, components list) was checked against
  the actual code and found accurate — the checklist item marking this
  file unfilled in `PROJECT_STATUS.md` was itself stale; corrected.

## 2026-08-23 (6)

### Added
- `RESEND_API_KEY` added to Vercel production (Production + Preview
  environments), then redeployed.

### Verified
- Repeated the signup + forgot-password test directly against the live
  production URL (`ai-job-application-builder.vercel.app`). The
  forgot-password call returned 200, not the 502 that route returns on
  a real Resend send failure, confirming the key works in production.
  Test account deleted from production afterward via the authenticated
  account-deletion API.

## 2026-08-23 (5)

### Verified
- `RESEND_API_KEY` obtained (free Resend account, no domain
  verification) and added to local `.env`. Verified real delivery, not
  just the generic API response: signed up a test account (triggers a
  verification email) and called `/api/auth/forgot-password` for it,
  both against the live Resend API, and confirmed no error in the
  server log for either send — Resend would reject an unverified
  recipient with a visible error, so this also confirms the target
  address is the account's own Resend signup email. Test account
  deleted afterward.

### Known gap
- Resend's free tier has no verified sending domain, so delivery is
  currently restricted to the account owner's own email address.

## 2026-08-23 (4)

### Added
- Split local dev off the shared Neon database: created a `development`
  branch (full data+schema copy of `main`, no auto-expiry) and
  repointed local `.env`'s `DATABASE_URL`/`DATABASE_URL_UNPOOLED` at it.
  Vercel's Production/Preview environment variables are untouched — they
  still point at `main`, which is correct.

### Verified
- Confirmed real isolation, not just a config change: signed up a test
  account through the local dev server, then queried the `development`
  branch directly (found it) and queried `main` directly (did not find
  it) using two separate Prisma clients pointed at each branch's
  connection string. Test user deleted from `development` afterward.
- Along the way, observed and documented (not a bug, just a real Neon
  behavior worth knowing): the branch's compute suspends when idle, so
  the very first query after a period of inactivity can time out
  (`ETIMEDOUT`) while it wakes up — the immediate retry succeeds.

### Known gap
- Preview deployments still share `main` with Production — only local
  dev is isolated so far. See `DATABASE.md`.

## 2026-08-23 (3)

### Added
- `GEMINI_API_KEY` added to Vercel production (Production + Preview
  environments), via the dashboard. Deployed the 12 commits that had
  been sitting local-only since the last production deploy (3 days of
  work: password reset, master profile, resume builder, resume upload/
  parsing, all Phase 3 AI features, resume templates + PDF export, the
  application tracker, rate limiting, the 10-gap audit-closure batch,
  and the Gemini provider switch) — `git push origin master`, which
  triggered Vercel's auto-deploy from GitHub.
- Landing page (`Hero.tsx`, `Roadmap.tsx`) updated to mark every feature
  "Live" (previously the two AI-powered roadmap items said "Activating
  soon" pending this exact deployment). Removed the now-dead
  `"Activating soon"` branch from `RoadmapItem`'s status type and the
  conditional badge-color logic in `Roadmap.tsx`, since every item is
  unconditionally "Live" now.

### Verified
- Confirmed the production deployment actually shipped the current
  code (not a stale one) — the Vercel deployment's source commit matched
  the just-pushed `271054c`, and its own screenshot thumbnail showed the
  updated landing page copy.
- Re-verified signup and the AI `optimize` endpoint directly against the
  real production URL (`ai-job-application-builder.vercel.app`), not
  just localhost — real `201` on signup, real `200` with genuine
  Gemini-generated suggestions on `/api/resumes/:id/optimize`. Test
  account deleted from the (shared local/prod) database afterward.
- Landing page copy re-verified via Playwright screenshot against the
  local dev server after the copy change — all six roadmap items render
  "Live" in accent color, zero console errors.

## 2026-08-23 (2)

### Changed
- Switched the AI provider from Anthropic (Claude) to Google Gemini
  (`@google/genai`, `gemini-3-flash-preview` by default, overridable via
  `GEMINI_MODEL`). Reason: Anthropic's API has no ongoing free tier
  (pay-as-you-go only), Gemini's does (Google AI Studio, no credit card
  required) — the project has no budget for API costs.
- `lib/ai.ts` rewritten against `ai.models.generateContent` (confirmed
  via the installed SDK's own `.d.ts` JSDoc examples, not docs
  scraping, after an initial web-doc lookup turned out to describe a
  different/newer "Interactions" API surface that doesn't apply here).
  `askClaudeJSON`/`askClaudeText` renamed to `askAIJSON`/`askAIText` in
  `lib/ai.ts` and all four call sites, since keeping the old
  Claude-specific names while calling a different provider would be a
  misleading label on real code, not just a cosmetic rename.
- Removed the now-unused `@anthropic-ai/sdk` dependency; added
  `@google/genai`.
- `.env.example`: `ANTHROPIC_API_KEY`/`ANTHROPIC_MODEL` replaced with
  `GEMINI_API_KEY`/`GEMINI_MODEL`.
- Synced every doc that named the old provider (`FEATURES.md`,
  `PROJECT_STATUS.md`, `API.md`, `docs/AI.md`, `docs/ARCHITECTURE.md`,
  `docs/SECURITY.md`) to reflect Gemini.

### Verified
- One real bug caught during live testing: with a small
  `maxOutputTokens` (200, in an initial smoke test), the model — a
  "preview"/reasoning-capable model — spent its entire token budget on
  internal thinking and returned empty text (`finishReason:
  MAX_TOKENS`, confirmed via `response.usageMetadata.thoughtsTokenCount`
  = 191 of 200). The app's actual `maxOutputTokens: 4096` was then
  explicitly re-tested and confirmed sufficient (`finishReason: STOP`,
  valid JSON returned) rather than assumed.
- All four AI features called live end-to-end through the real HTTP API
  (not just the SDK directly) against a real account with real
  profile/resume data: optimize, ats-check, match, and cover-letters all
  returned real 200/201 responses with coherent, relevant, grounded
  content — including a job-match call that correctly distinguished
  keywords present vs. absent in the test resume, and a generated cover
  letter that referenced only facts actually present in the source
  resume. `GEMINI_API_KEY` set in local `.env`; not yet added to Vercel
  production. Test account and data deleted afterward.

## 2026-08-23 (1)

### Added
Ten gaps closed from a full-codebase audit, in one batch:

- Email verification on signup (`EmailVerificationToken`, `/verify-email`,
  resend from `/account`, dev-mode console fallback like password reset)
- Account lockout beyond the login rate limit (`User.failedLoginAttempts`
  / `lockedUntil` — 10 cumulative failures locks for 1 hour, independent
  of the 15-min rate-limit window)
- Account settings page (`/account`): change name, change password,
  export all account data as JSON, permanently delete account
  (password-confirmed, cascades via existing FK relations)
- Cover letters are now editable after generation
  (`PATCH .../cover-letters/:letterId`)
- Cover letters can be linked to a tracked Application
  (`Application.coverLetterId`, ownership-checked through the resume)
- A second resume template ("compact"), selectable per resume
  (`Resume.template`)
- Client-side search on the resume list (title) and applications list
  (company/role + status filter)
- Dashboard summary stats (resume/application/interviewing/offer counts)
- Manual reordering of experience/education entries, both master
  profile and per-resume, via up/down buttons backed by a new
  `sortOrder` column
- (Rate limiting and input length caps were already closed in the
  previous commit)

Schema: one migration (`big_feature_batch`) added
`EmailVerificationToken`, `User.emailVerified`/`failedLoginAttempts`/
`lockedUntil`, `CoverLetter.updatedAt`, `Application.coverLetterId`,
`Resume.template`, and `sortOrder` on `Experience`/`Education`/
`ResumeExperience`/`ResumeEducation`.

### Verified
- Every item tested via curl (auth, validation, cross-user ownership
  isolation) plus a combined Playwright browser session covering
  dashboard stats, profile/resume reordering (including a real button
  click), both resume templates (including switching via the UI),
  applications search actually filtering, account settings, and the
  full account-deletion flow (wrong password rejected, correct password
  deletes + signs out + redirects, confirmed gone from the database).
  Zero console/page errors across every screen touched. `npm run build`
  and `npm run lint` both pass. All test accounts and their data deleted
  afterward, along with the scratch Playwright installs.

## 2026-08-21 (7)

### Added
- Rate limiting (`lib/rateLimit.ts`, `RateLimitBucket` model, migration
  `20260821030331_add_rate_limit_bucket`) — a Postgres-backed fixed-window
  counter, not in-memory, since Vercel serverless functions don't share
  memory across invocations. Applied to the 4 AI routes (15/hour/user for
  optimize/ats-check/match, 10/hour for cover-letters — the routes with
  real per-call Anthropic cost once a key is live), signup (5/hour/IP),
  forgot-password (3/hour/email), and login (10 attempts/15min/email,
  inside the NextAuth `authorize` callback).
- Input length limits (`lib/textLimits.ts`) on every free-text field that
  reaches an AI prompt or the database — profile/resume experience and
  education, basic info, skill names, application fields — plus a
  dedicated `MAX_JOB_DESCRIPTION_LENGTH` (10,000 chars) in `lib/ai.ts`
  for `jobDescription` on `match`/`cover-letters`, which was previously
  completely unbounded before being forwarded into a Claude prompt.
- Brought `docs/SECURITY.md` current — it had been stale since before
  Phase 2, still describing "no user-owned resources exist yet."

### Fixed
- `/login` hardcoded "Incorrect email or password" over every `signIn()`
  error, which silently swallowed the new rate-limit message. Found via
  the rate-limit testing below; fixed to show the actual message when
  it's the rate-limit one.

### Verified
- Exceeded each of the five rate limits against the real dev server and
  confirmed 429 with a correct `Retry-After` header lands on exactly the
  request past the threshold; confirmed the four AI routes rate-limit
  independently (hitting one's limit doesn't affect the others);
  confirmed length caps reject over-limit input (400) and accept
  exactly-at-the-limit input. Verified the login-page fix visually via a
  Playwright screenshot showing the correct message. `npm run build` and
  `npm run lint` pass. All test accounts and `RateLimitBucket` rows
  created during testing deleted afterward.

This was prompted by a full-codebase review (`docs/` cross-checked
against the actual implementation) that flagged unbounded AI cost
exposure as the top risk once `ANTHROPIC_API_KEY` goes live. Remaining
flagged gaps — email verification, account deletion, the shared
dev/preview/production database, and refreshing the rest of `docs/` — are
tracked in `PROJECT_STATUS.md` but not addressed in this pass.

## 2026-08-21 (6)

### Added
- Phase 4 (Application tracking), both items — the last of the roadmap:
  `Application` model + `ApplicationStatus` enum (migration
  `20260821023404_add_applications`); `/applications` (linked from
  `/dashboard`) with full CRUD (`components/ApplicationsList.tsx`,
  `app/api/applications/route.ts`,
  `app/api/applications/[id]/route.ts`)
- Resume versioning per application: an application can optionally link
  to one of the user's resumes (picked via `GET /api/resumes`, already
  built). Since resumes are already independent, per-tailorable
  snapshots (Phase 2), that link *is* the per-application resume
  version — no extra snapshot layer needed. Deleting a linked resume
  sets the application's `resumeId` to `null` (`onDelete: SetNull`)
  instead of deleting the application.

### Verified
- API tested via curl with two real accounts: auth (401), validation
  (400 on missing company/role, invalid date, or a `resumeId` not owned
  by the caller), full CRUD, status transitions, unlinking a resume,
  cross-user ownership isolation, and confirmed deleting a linked resume
  preserves the application (resumeId → null) rather than deleting it.
- UI tested with a scratch Playwright browser session against the real
  dev server: screenshotted the list, filled and submitted the add form,
  confirmed the new entry appeared, edited its status through the UI,
  and confirmed it was removed after delete — zero console/page errors
  throughout.
- `npm run build` and `npm run lint` pass. Test accounts and data
  deleted afterward, along with the scratch Playwright install.

This completes every item across all four roadmap phases except the
Phase 1 design system, per-environment database separation, and
live-testing the Phase 3 AI features (needs `ANTHROPIC_API_KEY`).

## 2026-08-21 (5)

### Added
- Resume templates: `/resumes/:id/preview` — a single clean, formatted
  resume document (`components/ResumePreview.tsx`) rendering a resume's
  data as a real document (name/email from the account, headline,
  contact line, summary, experience, education, skills)
- PDF export: "Download / print PDF" button uses the browser's native
  `window.print()` against print-specific CSS rules added to
  `app/globals.css` (`.no-print`, `.resume-doc` print overrides, forced
  light background/text for print regardless of theme) — no new
  server-side PDF-generation dependency
- Linked from `/resumes/:id` ("Preview / Export PDF")

### Verified
- Used a scratch Playwright install (browsers were already cached
  locally) to actually drive the running dev server rather than just
  reading the code: screenshotted the preview page normally and under
  `emulateMedia({media: 'print'})` with a fully populated test resume,
  confirmed zero console/page errors, confirmed editor chrome is hidden
  in print output, confirmed unauthenticated visitors get redirected to
  `/login`.
- Generated a real PDF via Playwright's `page.pdf()` (the same Chromium
  print-to-PDF engine the browser's own "Save as PDF" uses), then parsed
  it back with this project's own `pdf-parse` integration and confirmed
  every field survived the round trip correctly.
- `npm run build` and `npm run lint` pass. Test account, its data, and
  all scratch Playwright/screenshot/PDF files deleted afterward.

## 2026-08-21 (4)

### Added
- Phase 3 (AI features), all five items: `lib/ai.ts` wraps the Anthropic
  SDK (`claude-opus-5` default, `ANTHROPIC_MODEL` override) with
  `askClaudeJSON`/`askClaudeText` helpers; `lib/resumeText.ts` formats a
  resume into prompt text.
- `POST /api/resumes/:id/optimize` — resume rewrite suggestions
- `POST /api/resumes/:id/ats-check` — ATS compatibility score + issues
- `POST /api/resumes/:id/match` — job description match score + gaps
- `POST/GET /api/resumes/:id/cover-letters`,
  `DELETE .../cover-letters/:letterId` — cover letter generation; the
  only one of the four that's persisted (`CoverLetter` model, migration
  `20260821021013_add_cover_letters`), since it's a deliverable rather
  than a disposable analysis
- All four surfaced on `/resumes/:id` under "AI tools"
  (`components/ResumeAITools.tsx`)
- `lib/resumeAccess.ts` (`getOwnedResume`) — extracted the
  ownership-checked resume-with-nested-items query used by all four new
  routes, and refactored `GET /api/resumes/:id` to use it too instead of
  duplicating the query

### Verified
- Auth (401), ownership including cross-user isolation (404 on another
  user's resume, for every route including cover-letter list/generate),
  and input validation (400 on missing job description / empty resume)
  tested end-to-end via curl for all five routes.
- Live AI output is **not** verified — no `ANTHROPIC_API_KEY` is set.
  Confirmed the missing-key failure surfaces as a real 502 (not
  swallowed or faked), proving each route actually reaches the Claude
  call rather than stopping short. `npm run build` and `npm run lint`
  both pass. Test accounts and resumes deleted afterward.

## 2026-08-21 (3)

### Added
- Resume upload/parsing (Phase 2): `/profile/import` uploads a PDF/DOCX
  resume, extracts text (`pdf-parse`, `mammoth`), and runs a heuristic
  parser (`lib/resumeParse.ts`) for contact info, summary, skills, and
  per-entry experience/education (title/institution, company, dates,
  description). `POST /api/profile/parse-resume` returns a draft only —
  nothing is saved until the user reviews and adds each item individually
  via the existing profile endpoints.
- `serverExternalPackages: ["pdf-parse", "pdfjs-dist"]` in
  `next.config.ts` — required for pdf-parse's worker module to resolve
  correctly under Turbopack's bundled server output; without it, PDF
  parsing fails in both dev and production.

### Fixed (caught during testing, before this shipped)
- pdf-parse's own "-- N of M --" page-separator text was leaking into
  the parsed skills list.
- The block-splitter originally used blank lines to separate resume
  entries, but PDF extraction usually drops blank lines and DOCX
  extraction adds one after every paragraph — both broke multi-entry
  splitting. Rewrote it to anchor on date-range line positions instead,
  with a per-section expected header length (job entries: 1 line;
  education entries: 2, to handle "institution" / "degree" on separate
  lines).

### Verified
- Tested end-to-end via curl against the real HTTP endpoint (not just
  the parsing function) using a hand-built minimal PDF and a hand-built
  minimal DOCX, each containing a realistic two-job, two-education,
  five-skill resume. Confirmed correct extraction of every field in both
  formats, error handling (401/400/422), and the full "add to profile"
  path landing correctly in the database. Re-verified PDF and DOCX
  parsing under a production `npm run build && npm start`, not just dev,
  since the worker-resolution bug above only surfaced under bundling.
  `npm run build` and `npm run lint` pass. Test account and all test
  files deleted afterward.

## 2026-08-21 (2)

### Added
- Resume builder (Phase 2): `Resume`, `ResumeExperience`,
  `ResumeEducation`, `ResumeSkill` models (migration
  `20260821012256_add_resumes`); `/resumes` list + create,
  `/resumes/:id` editor; full CRUD API under `/api/resumes` and its
  experience/education/skills sub-routes
- Creating a resume snapshots the current master profile into
  resume-owned rows (not a live reference), so a resume can be tailored
  per application without ever changing the profile or other resumes
- Refactored the profile-editing UI into shared, `apiBase`-parameterized
  components (`components/profile/ExperienceSection.tsx`,
  `EducationSection.tsx`, `SkillsSection.tsx` + their forms) so
  `/profile` and `/resumes/:id` reuse the same list/add/edit/delete UI
  instead of duplicating it; `ProfileEditor.tsx` now composes these
- Extracted `lib/experience.ts` / `lib/education.ts` shared
  validation, used by both the profile and resume API routes

### Verified
- Full lifecycle tested end-to-end via curl with two real accounts:
  built a profile, created a resume from it and confirmed every field
  copied, edited a resume's experience description and confirmed the
  master profile was unaffected (snapshot independence), added a
  resume-only skill and confirmed it stayed off the profile, deleted the
  resume and confirmed cascade cleanup, and confirmed a second user gets
  404 attempting to read/delete/mutate the first user's resume or any of
  its sub-resources. `npm run build` and `npm run lint` both pass. Test
  accounts and their data deleted afterward.
- UI (`/resumes` and `/resumes/:id` pages) not yet clicked through in a
  browser — only the API was exercised directly.

## 2026-08-21 (1)

### Added
- Master profile (Phase 2, first feature): `Profile`, `Experience`,
  `Education`, `Skill` models (migration
  `20260821005527_add_master_profile`); full CRUD API under
  `/api/profile`, `/api/profile/experience[/:id]`,
  `/api/profile/education[/:id]`, `/api/profile/skills[/:id]`; `/profile`
  page (`components/ProfileEditor.tsx`) linked from `/dashboard`
- Server-side ownership checks on every experience/education/skill
  mutation — a request for another user's record returns 404, never
  leaking whether it exists

### Verified
- Full CRUD tested end-to-end via curl with two real accounts: profile
  starts `null`, basic-info PUT creates it, validation on required
  fields (400), successful creates (201), edit (PATCH), 404 on a
  nonexistent/unowned id, duplicate-skill rejection (409), and
  cross-user isolation confirmed (user B cannot delete user A's
  experience). `npm run build` and `npm run lint` both pass. Test
  accounts and their cascaded profile data deleted afterward.
- UI (`/profile` page itself) not yet clicked through in a browser —
  only the API was exercised directly.

## 2026-08-20 (7)

### Added
- Password reset via email: `lib/email.ts` (Resend), `POST
  /api/auth/forgot-password`, `POST /api/auth/reset-password`,
  `/forgot-password` and `/reset-password` pages, "Forgot password?" link
  on `/login`
- `PasswordResetToken` model (migration
  `20260820034042_add_password_reset_token`) — single-use, 1-hour expiry,
  stored as a SHA-256 hash
- `RESEND_API_KEY` / `EMAIL_FROM` env vars

### Notes
- Chosen over further phone/OTP work: MSG91 SMS is blocked on DLT
  registration (regulatory, days of lead time), while Resend needs only a
  free self-serve signup and works immediately in sandbox mode for
  testing. Phone/OTP stays parked as-is.
- Added a dev-only fallback in `lib/email.ts`: without `RESEND_API_KEY`
  set and outside production, the reset link is logged to the server
  console instead of failing, so the flow is testable with no external
  account.

### Verified
- Full password reset lifecycle tested end-to-end against the dev server
  (via the console-logged link): invalid email (400), weak password
  (400), bogus token (400), valid token consumed (200), token reuse
  rejected (400), old password rejected post-reset (401), new password
  logs in with a valid session (200). Test account deleted afterward.
  Real Resend delivery not yet verified — needs an API key, no other
  blocker.

## 2026-08-20 (6)

### Added
- MSG91 SMS OTP integration code: `lib/msg91.ts`, `POST /api/otp/send`,
  `POST /api/otp/verify`, standalone test page at `/verify-phone`
- `MSG91_AUTH_KEY` / `MSG91_TEMPLATE_ID` env vars

### Blocked
- OTP sending doesn't actually work yet — MSG91 requires a DLT-registered
  Sender ID to send SMS to Indian numbers, which is a separate
  telecom-regulator process (no default/trial Sender ID is available).
  Paused until DLT registration is done. Not wired into signup/login.

## 2026-08-20 (5)

### Fixed
- Production build was failing (`@prisma/client` had no exported
  `PrismaClient`) because Vercel's build, like this machine, blocks
  dependency postinstall scripts, so Prisma's own client-generation hook
  never ran. Added an explicit `prisma generate` to the build script and a
  project-level `postinstall` script.

### Verified
- Live production deployment (`ai-job-application-builder.vercel.app`)
  confirmed working end-to-end: signup, credentials login, secure session
  cookie, protected dashboard access. Test account deleted afterward.

## 2026-08-20 (4)

### Added
- Hosted Postgres database on Neon, provisioned via Vercel's Marketplace
  integration and connected to Production/Preview/Development
- `NEXTAUTH_SECRET`/`NEXTAUTH_URL` set on Vercel so login actually works
  on the live deployment, not just locally

### Changed
- Switched Prisma from SQLite (`@prisma/adapter-libsql`) to Postgres
  (`@prisma/adapter-pg`) — same database now used for local dev and
  production instead of a local-only SQLite file
- Migrations now run against the direct/unpooled Neon connection
  (`DATABASE_URL_UNPOOLED`); the app uses the pooled `DATABASE_URL` at
  runtime
- Reset migration history (old SQLite-flavored SQL isn't valid Postgres)

### Known issues
- Production, Preview, and local Development all share the exact same
  Neon database — no environment isolation yet. See DATABASE.md.

## 2026-08-20 (3)

### Added
- Email+password authentication via NextAuth (Auth.js v4), Credentials
  provider, JWT sessions
- `/signup`, `/login`, protected `/dashboard` pages; sign-out button
- `POST /api/auth/signup` endpoint with email/password validation
- `User.passwordHash` and `User.name` fields (migration `add_password_auth`)
- Prisma 7 driver adapter setup (`@prisma/adapter-libsql`) — required by
  Prisma 7's client, chosen over `better-sqlite3` because that needs native
  compilation this machine isn't set up for
- `NEXTAUTH_URL` / `NEXTAUTH_SECRET` env vars

### Changed
- Landing page header/hero now link to real `/signup` and `/login` pages

## 2026-08-20 (2)

### Added
- Real landing page replacing the default Next.js starter page: header,
  hero, roadmap section, footer (`app/page.tsx`, `components/`)
- Design tokens (colors) in `app/globals.css`, documented in
  `docs/UI_DESIGN.md`

### Changed
- Dev/start scripts now run on port 1001 instead of the default 3000

## 2026-08-20

### Added
- Initial Next.js (App Router, TypeScript, Tailwind) project scaffold
- Project folder structure: `components/`, `lib/`, `prisma/`, `docs/`,
  `tests/`, `scripts/`, `uploads/`
- Prisma configured with SQLite datasource and a placeholder `User` model
- Baseline documentation set (README, PROJECT_STATUS, and files under `docs/`)
- New GitHub repository `AI-Job-Application-Builder`, replacing the old
  `resume-builder` repo (deleted by the user)
