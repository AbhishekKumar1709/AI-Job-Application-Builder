# Changelog

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
