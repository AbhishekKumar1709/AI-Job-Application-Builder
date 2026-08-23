# Features

This file tracks each feature as it's built. Statuses: Planned / In
Progress / Complete / Needs Testing / Blocked.

## Landing page

- **Description:** Static marketing/roadmap page shown at `/`. Explains
  what the product will do and links to the roadmap; no functional
  sign-up/login yet (none of its buttons/links are placeholders — the
  "See what's planned" link scrolls to the on-page roadmap section, and
  "View source on GitHub" links to the real repo).
- **Status:** Complete
- **Dependencies:** none
- **Related files:** `app/page.tsx`, `components/Hero.tsx`,
  `components/Roadmap.tsx`, `components/SiteHeader.tsx`,
  `components/SiteFooter.tsx`
- **API requirements:** none
- **Database requirements:** none
- **Testing status:** Manually verified — `npm run build` passes, page
  loads at localhost and on the Vercel deployment.

## Authentication (sign up / log in / log out)

- **Description:** Email+password accounts via NextAuth (Auth.js v4)
  Credentials provider, JWT sessions. `/signup` creates an account,
  `/login` signs in, `/dashboard` is a protected page that redirects
  unauthenticated visitors to `/login`, and the dashboard has a working
  sign-out button.
- **Status:** Complete
- **Dependencies:** Prisma/database
- **Related files:** `lib/auth.ts`, `lib/prisma.ts`,
  `app/api/auth/[...nextauth]/route.ts`, `app/api/auth/signup/route.ts`,
  `app/login/page.tsx`, `app/signup/page.tsx`, `app/dashboard/page.tsx`,
  `components/Providers.tsx`, `components/SignOutButton.tsx`
- **API requirements:** `POST /api/auth/signup`; NextAuth's built-in routes
  under `/api/auth/*`. See `API.md`.
- **Database requirements:** `User.passwordHash`, `User.name` (added in
  migration `20260820000014_add_password_auth`)
- **Testing status:** Manually tested end-to-end via curl against the dev
  server: signup (201), duplicate email (409), short password (400),
  unauthenticated `/dashboard` redirect (307 → `/login`), credentials
  login issuing a session cookie, and that cookie unlocking `/dashboard`.
  No automated test suite yet.

## Phone/OTP verification

- **Description:** Send and verify a one-time SMS code via MSG91.
  Currently a standalone test flow (`/verify-phone`), not wired into
  signup/login.
- **Status:** Blocked
- **Dependencies:** MSG91 account (done), a Send OTP template with a
  DLT-registered Sender ID — **blocked**: creating a Sender ID for SMS to
  Indian numbers requires DLT registration, a separate telecom-regulator
  process outside MSG91 (typically 1–3 days). No default/trial Sender ID
  is available.
- **Related files:** `lib/msg91.ts`, `app/api/otp/send/route.ts`,
  `app/api/otp/verify/route.ts`, `app/verify-phone/page.tsx`
- **API requirements:** `POST /api/otp/send`, `POST /api/otp/verify`. See
  `API.md`.
- **Database requirements:** none yet
- **Testing status:** Not tested — cannot send a real OTP until a
  template + Sender ID exist. Code builds and lints cleanly.

## Password reset via email

- **Description:** "Forgot password?" flow on `/login` → `/forgot-password`
  (enter email) → emailed link → `/reset-password?token=...` (set new
  password). Uses Resend to send the email. Tokens are single-use,
  expire after 1 hour, and are stored as a SHA-256 hash (not the raw
  token) in `PasswordResetToken`.
- **Status:** Complete (email delivery itself unverified — see testing status)
- **Dependencies:** Resend account + `RESEND_API_KEY` for real email
  delivery — unlike MSG91, no regulatory registration needed; free signup
  at resend.com, and sandbox mode (`onboarding@resend.dev` sender)
  delivers immediately to the account owner's own email with no domain
  verification. In development without `RESEND_API_KEY` set, the reset
  link is logged to the server console instead (see `lib/email.ts`) so
  the flow is testable with no external account at all.
- **Related files:** `lib/email.ts`, `app/api/auth/forgot-password/route.ts`,
  `app/api/auth/reset-password/route.ts`, `app/forgot-password/page.tsx`,
  `app/reset-password/page.tsx`
- **API requirements:** `POST /api/auth/forgot-password`,
  `POST /api/auth/reset-password`. See `API.md`.
- **Database requirements:** `PasswordResetToken` model (migration
  `20260820034042_add_password_reset_token`)
- **Testing status:** Manually tested end-to-end via curl against the dev
  server (using the console-logged link, since `RESEND_API_KEY` isn't
  set): invalid email (400), weak password (400), bogus token (400),
  valid token consumed (200), token reuse rejected (400), old password
  rejected after reset (401), new password logs in with a valid session
  (200). Real Resend delivery itself not yet verified — that only needs
  an API key, no other blocker. Test account deleted afterward.

## Master profile

- **Description:** Canonical store of a user's work history, education, and
  skills, reused across resumes/cover letters. `/profile` (linked from
  `/dashboard`) lets a signed-in user edit basic info (headline, phone,
  location, summary), and add/edit/delete experience, education, and
  skill entries. Each user has exactly one profile, auto-created on first
  save; all reads/writes are scoped to the signed-in user via the
  session, with ownership checked server-side on every experience/
  education/skill mutation.
- **Status:** Complete
- **Dependencies:** Auth
- **Related files:** `lib/profile.ts`, `app/api/profile/route.ts`,
  `app/api/profile/experience/route.ts`,
  `app/api/profile/experience/[id]/route.ts`,
  `app/api/profile/education/route.ts`,
  `app/api/profile/education/[id]/route.ts`,
  `app/api/profile/skills/route.ts`,
  `app/api/profile/skills/[id]/route.ts`, `app/profile/page.tsx`,
  `components/ProfileEditor.tsx`
- **API requirements:** `GET/PUT /api/profile`,
  `POST /api/profile/experience`,
  `PATCH/DELETE /api/profile/experience/:id`,
  `POST /api/profile/education`,
  `PATCH/DELETE /api/profile/education/:id`,
  `POST /api/profile/skills`, `DELETE /api/profile/skills/:id`. See
  `API.md`.
- **Database requirements:** `Profile`, `Experience`, `Education`, `Skill`
  models (migration `20260821005527_add_master_profile`)
- **Testing status:** Manually tested end-to-end via curl against the dev
  server with two real accounts: profile starts as `null`, basic-info PUT
  creates it, experience/education/skill POST validation (400 on missing
  required fields), successful creates (201), experience PATCH (edit),
  404 on editing/deleting a nonexistent id, duplicate-skill rejection
  (409), and — critically — a second user's session cannot PATCH/DELETE
  the first user's experience (404, ownership enforced, no data leak).
  `npm run build` and `npm run lint` both pass. Both test accounts and
  their cascaded profile data deleted afterward. UI itself (the
  `/profile` page and its forms) not yet clicked through in a browser —
  only the underlying API was exercised.

## Resume builder

- **Description:** `/resumes` (linked from `/dashboard`) lists a user's
  resumes and creates new ones; `/resumes/:id` edits one. Creating a
  resume copies the current master profile (headline, phone, location,
  summary, experience, education, skills) into resume-owned rows —
  a snapshot, not a live reference — so each resume can be tailored
  independently (e.g. reworded bullet points for one application)
  without ever changing the master profile or other resumes. The
  experience/education/skills editing UI (`components/profile/*`) is
  shared between `/profile` and `/resumes/:id` via an `apiBase` prop,
  rather than duplicated.
- **Status:** Complete
- **Dependencies:** Master profile
- **Related files:** `app/api/resumes/route.ts`,
  `app/api/resumes/[id]/route.ts`,
  `app/api/resumes/[id]/experience/route.ts`,
  `app/api/resumes/[id]/experience/[expId]/route.ts`,
  `app/api/resumes/[id]/education/route.ts`,
  `app/api/resumes/[id]/education/[eduId]/route.ts`,
  `app/api/resumes/[id]/skills/route.ts`,
  `app/api/resumes/[id]/skills/[skillId]/route.ts`,
  `app/resumes/page.tsx`, `app/resumes/[id]/page.tsx`,
  `components/ResumeList.tsx`, `components/ResumeEditor.tsx`,
  `components/profile/*` (shared with the master profile UI),
  `lib/experience.ts`, `lib/education.ts` (shared validation, also used
  by `/api/profile/*`)
- **API requirements:** `GET/POST /api/resumes`,
  `GET/PATCH/DELETE /api/resumes/:id`, plus per-resume
  experience/education/skills CRUD mirroring the profile API. See
  `API.md`.
- **Database requirements:** `Resume`, `ResumeExperience`,
  `ResumeEducation`, `ResumeSkill` models (migration
  `20260821012256_add_resumes`)
- **Testing status:** Manually tested end-to-end via curl with two real
  accounts: built a full profile, created a resume from it and verified
  every field/entry copied correctly, edited a resume's experience
  description and confirmed the master profile was unaffected (snapshot
  independence), added a resume-only skill and confirmed it didn't leak
  into the profile, deleted the resume and confirmed cascade cleanup —
  and confirmed a second user gets 404 (not 403) attempting to
  read/delete/mutate the first user's resume or its sub-resources.
  `npm run build` and `npm run lint` both pass. Test accounts and all
  their data deleted afterward. UI itself not yet clicked through in a
  browser — only the underlying API was exercised.

## Resume templates

- **Description:** `/resumes/:id/preview` renders a resume's data
  (name/email from the account, headline, contact line, summary,
  experience, education, skills) as a formatted document. Two templates
  — "classic" (spaced, traditional) and "compact" (dense, two-column
  header, accent-colored section headers) — selectable per resume via a
  dropdown on the resume editor (`Resume.template`, `PATCH
  /api/resumes/:id`). Doubles as the PDF export surface (see below).
- **Status:** Complete
- **Dependencies:** Resume builder
- **Related files:** `app/resumes/[id]/preview/page.tsx`,
  `components/ResumePreview.tsx` (both templates), `components/ResumeEditor.tsx`
  (template selector), print rules in `app/globals.css`
- **Testing status:** Verified visually with Playwright against the real
  dev server (screenshot of the rendered page, and again under
  `emulateMedia({ media: 'print' })`) using a fully populated test
  resume — confirmed no console/page errors, correct data rendering,
  and that the editor chrome (back link, download button) is hidden in
  print output via the `.no-print` / `.resume-doc` print rules. Also
  verified the page redirects unauthenticated visitors to `/login` and
  shows a not-found state for a nonexistent/unowned resume id. Both
  templates confirmed visually distinct, including switching between
  them through the real UI (select + Save) and re-rendering the
  preview. Invalid template value rejected (400). Test account deleted
  afterward.

## Resume upload / parsing (PDF, DOCX)

- **Description:** `/profile/import` (linked from `/profile`) uploads a
  `.pdf` or `.docx` resume, extracts its text (`pdf-parse` /
  `mammoth`), and runs a heuristic parser (`lib/resumeParse.ts`) that
  detects Summary/Experience/Education/Skills sections and splits
  experience/education into per-entry blocks anchored on date-range
  lines. Nothing is written to the database by the parse step — it
  returns a draft only. The UI shows every detected item pre-filled into
  the same editable form components used by the profile/resume editors,
  and each item is added to the real profile individually (via the
  existing `/api/profile/*` endpoints) only when the user clicks to add
  it, so a bad guess never silently becomes real profile data.
- **Status:** Complete
- **Dependencies:** Master profile
- **Related files:** `lib/resumeParse.ts`,
  `app/api/profile/parse-resume/route.ts`, `app/profile/import/page.tsx`,
  `components/ResumeImport.tsx`; reuses `components/profile/ExperienceForm.tsx`
  and `EducationForm.tsx` and the existing profile CRUD endpoints for
  adding confirmed items
- **API requirements:** `POST /api/profile/parse-resume`. See `API.md`.
- **Database requirements:** none (parsing is stateless; added items go
  through the existing `Profile`/`Experience`/`Education`/`Skill` tables)
- **Testing status:** Manually tested end-to-end against both a
  hand-built minimal PDF and a hand-built minimal DOCX (each with a
  realistic two-job, two-education, five-skill resume body), through the
  real HTTP endpoint (not just the parsing function directly), under
  both `npm run dev` and a production `npm run build && npm start`.
  Verified: unauthenticated request rejected (401), no file (400),
  unsupported file type (400), and correct extraction of email, phone,
  summary, all skills, and every experience/education entry (title,
  company/institution, dates, description) for both formats. Also
  verified the full "add parsed item to profile" path lands correctly in
  the real profile via the existing endpoints. Two real bugs were caught
  and fixed during testing: pdf-parse's own "-- N of M --" page-separator
  text was leaking into the skills list, and PDF/DOCX text extraction
  don't preserve blank lines the same way, which was breaking multi-entry
  splitting — the splitter now anchors on date-range lines instead of
  blank lines. A third bug (`pdf-parse`/`pdfjs-dist`'s worker module
  failing to resolve under Turbopack's bundled server output) was fixed
  by adding `serverExternalPackages: ["pdf-parse", "pdfjs-dist"]` to
  `next.config.ts` — this is a known Next.js/pdfjs-dist bundling
  interaction, not specific to this app's code. Test account and its
  profile data deleted afterward, along with the throwaway test files.
  Known limitation: this is heuristic, not ML-based, parsing — resumes
  with unusual section headers or formats will parse imperfectly, which
  is why every field is shown for review/edit before being added rather
  than being saved automatically.

## AI provider integration

- **Description:** `lib/ai.ts` wraps the Google Gemini SDK (`@google/genai`,
  `gemini-3-flash-preview` by default, overridable via `GEMINI_MODEL`).
  Two helpers: `askAIJSON` (system + user prompt → parsed JSON, throws
  on non-JSON responses) and `askAIText` (→ plain text), both used by
  the four features below. No custom fallback content is ever
  substituted on API failure — errors surface to the caller as a real
  error. Originally built against Anthropic's Claude API; switched to
  Gemini because Gemini has a genuine ongoing free tier (no credit
  card) and Anthropic's API doesn't.
- **Status:** Complete, verified live
- **Dependencies:** none
- **Related files:** `lib/ai.ts`, `lib/resumeText.ts` (formats a resume's
  data into prompt text, shared by all four AI routes)
- **Testing status:** Called live end-to-end through the real HTTP API
  (not just the SDK) against a real account, for all four features below
  — see each feature's testing status and [AI.md](../docs/AI.md) for
  full detail, including a real bug (empty output under a too-small
  token budget) caught and fixed during this testing. `GEMINI_API_KEY`
  is set locally; not yet in Vercel production.

## AI resume optimization

- **Description:** `POST /api/resumes/:id/optimize` sends the resume's
  content to Gemini and returns concrete rewrite suggestions per
  section. Stateless — not persisted, recomputed each time. Surfaced on
  `/resumes/:id` under "AI tools".
- **Status:** Complete, verified live
- **Dependencies:** AI provider integration, resume builder
- **Related files:** `app/api/resumes/[id]/optimize/route.ts`,
  `components/ResumeAITools.tsx`
- **Testing status:** 401 (unauthenticated), 404 (nonexistent/unowned
  resume, including cross-user isolation), 400 (empty resume) all
  verified via curl. Live call against a real resume returned a real
  200 with six coherent, specific suggestions referencing the actual
  resume content (e.g. flagging "Worked on APIs" as vague, suggesting
  quantifiable metrics).

## ATS compatibility analysis

- **Description:** `POST /api/resumes/:id/ats-check` asks Gemini to
  score the resume's ATS-friendliness (0-100) and list issues/strengths.
  Stateless, shown on `/resumes/:id`.
- **Status:** Complete, verified live
- **Dependencies:** AI provider integration, resume builder
- **Related files:** `app/api/resumes/[id]/ats-check/route.ts`,
  `components/ResumeAITools.tsx`
- **Testing status:** Same auth/ownership/validation coverage as resume
  optimization, verified via curl. Live call returned a real 200 with a
  plausible score (48/100 for a deliberately thin test resume) and
  specific, accurate issues (missing metrics, missing locations) and
  strengths (consistent date format).

## Job description matching

- **Description:** `POST /api/resumes/:id/match` compares the resume
  against a pasted job description and returns a match score, matched/
  missing keywords, and suggestions. Stateless, shown on `/resumes/:id`.
- **Status:** Complete, verified live
- **Dependencies:** AI provider integration, resume builder
- **Related files:** `app/api/resumes/[id]/match/route.ts`,
  `components/ResumeAITools.tsx`
- **Testing status:** Same auth/ownership/validation coverage, plus a
  missing-`jobDescription` 400 case, verified via curl. Live call
  against a real job description correctly identified matched keywords
  ("Go", "distributed systems") vs. missing ones ("Kubernetes",
  "PostgreSQL") that genuinely weren't in the test resume.

## Cover letter generation

- **Description:** `POST /api/resumes/:id/cover-letters` generates a
  cover letter from the resume + a pasted job description (+ optional
  company name) and saves it — this is the one AI output that's
  persisted, since it's a deliverable. `GET` lists a resume's saved
  letters; `DELETE /api/resumes/:id/cover-letters/:letterId` removes one.
  Shown on `/resumes/:id`.
- **Status:** Complete, verified live
- **Dependencies:** AI provider integration, resume builder
- **Related files:** `app/api/resumes/[id]/cover-letters/route.ts`,
  `app/api/resumes/[id]/cover-letters/[letterId]/route.ts`,
  `components/ResumeAITools.tsx`
- **Database requirements:** `CoverLetter` model (migration
  `20260821021013_add_cover_letters`)
- **Testing status:** Same auth/ownership/validation coverage, verified
  via curl, including that a second user cannot list or generate letters
  on another user's resume. Live call returned a real 201 with a
  coherent 3-paragraph letter grounded only in facts present in the
  source resume (correct company, correct dates, no invented skills or
  employers), correctly persisted and retrievable via `GET` afterward.

## Application tracker

- **Description:** `/applications` (linked from `/dashboard`) lists a
  user's job applications and lets them add/edit/delete entries:
  company, role, status (Saved/Applied/Interviewing/Offer/Rejected/
  Withdrawn), job posting URL, applied date, notes, and — this is the
  "resume versioning per application" piece — an optional link to one
  of the user's resumes, picked from a dropdown populated by the
  existing `GET /api/resumes`. Since each resume is already an
  independent, per-application-tailorable snapshot (see Resume builder
  above), pointing an application at a specific resume row *is* its
  resume version; no separate snapshot layer was needed on top. If the
  linked resume is later deleted, the application is preserved with the
  link cleared (`onDelete: SetNull`), never deleted along with it. An
  application can also optionally link to one of that resume's
  generated cover letters (`Application.coverLetterId`), picked from a
  dropdown scoped to the selected resume. The list has client-side
  search (company/role) and a status filter dropdown.
- **Status:** Complete
- **Dependencies:** Auth, resume builder
- **Related files:** `app/api/applications/route.ts`,
  `app/api/applications/[id]/route.ts`, `app/applications/page.tsx`,
  `components/ApplicationsList.tsx`
- **API requirements:** `GET/POST /api/applications`,
  `PATCH/DELETE /api/applications/:id`. See `API.md`.
- **Database requirements:** `Application` model + `ApplicationStatus`
  enum (migration `20260821023404_add_applications`);
  `Application.coverLetterId` added in migration `big_feature_batch`
- **Testing status:** Tested at both layers. API via curl with two real
  accounts: auth (401), validation (400 on missing company/role, and on
  a `resumeId`/`coverLetterId` that doesn't belong to the caller), full
  CRUD, status transitions, unlinking a resume, cross-user ownership
  isolation (404 on another user's application; can't link to another
  user's resume or cover letter), and confirmed deleting a linked resume
  preserves the application with `resumeId` set to `null` rather than
  deleting it. UI via Playwright browser sessions against the real dev
  server: screenshotted the list, the add form being filled (including
  the resume + cover-letter link), the new entry appearing after save,
  an edit changing its status, its removal after delete, and the search
  filter actually narrowing results (typed a non-matching string,
  confirmed the "no matches" empty state) — zero console/page errors
  throughout. Test accounts and data deleted afterward.

## PDF export

- **Description:** "Download / print PDF" on `/resumes/:id/preview`
  calls the browser's native `window.print()` against the print-styled
  document — the standard "print to PDF" path every browser already
  supports, rather than a server-side PDF-generation dependency
  (Puppeteer, etc.) that would add significant weight and Vercel
  serverless fragility for a personal project at this scale.
- **Status:** Complete
- **Dependencies:** Resume templates
- **Related files:** same as Resume templates above
- **Testing status:** Verified for real — used Playwright's `page.pdf()`
  (the same underlying Chromium print-to-PDF engine `window.print()`'s
  "Save as PDF" invokes) against the live preview page, producing an
  actual PDF file, then parsed that PDF back with this project's own
  `pdf-parse` integration and confirmed every field (name, contact info,
  summary, experience, education, skills) round-tripped correctly.

## Rate limiting & input length limits

- **Description:** Addresses two gaps flagged in a full-codebase
  security review: unbounded AI API cost exposure and unbounded
  brute-force/spam surface. `lib/rateLimit.ts` implements a fixed-window
  counter backed by Postgres (`RateLimitBucket` model) rather than
  in-memory, since Vercel serverless functions don't share memory
  between invocations — an in-memory counter would silently reset per
  request in production. Applied to:
  - The four AI routes (`optimize`, `ats-check`, `match`:
    15/hour/user/route; `cover-letters`: 10/hour/user) — worth keeping
    even on Gemini's free tier, since that tier has its own request
    limits a runaway client could otherwise exhaust
  - `POST /api/auth/signup` — 5/hour per IP
  - `POST /api/auth/forgot-password` — 3/hour per email (checked before
    the account-existence lookup, so it can't be used to probe which
    emails have accounts)
  - The credentials `authorize` callback in `lib/auth.ts` — 10 attempts
    per 15 minutes per email, thrown as an `Error` so NextAuth's
    credentials flow passes the message through to the client
  - All four AI routes are rate-limited independently (separate keys per
    route, not a shared budget)

  Separately, `lib/textLimits.ts` adds max-length validation
  (`SHORT_TEXT_MAX` = 200, `LONG_TEXT_MAX` = 2000 chars) to every
  free-text field that reaches an AI prompt or the database: profile/
  resume experience and education (shared `lib/experience.ts`/
  `lib/education.ts` validators), profile/resume basic info (headline,
  summary), skill names, and application fields. `jobDescription` on
  `match` and `cover-letters` gets its own explicit 10,000-character cap
  (`MAX_JOB_DESCRIPTION_LENGTH` in `lib/ai.ts`) since it was previously
  completely unbounded before being forwarded into a prompt.
- **Status:** Complete
- **Dependencies:** none
- **Related files:** `lib/rateLimit.ts`, `lib/textLimits.ts`,
  `prisma/schema.prisma` (`RateLimitBucket`), plus every route listed
  above
- **Testing status:** Tested end-to-end against the real dev server:
  exceeded each of the five rate limits and confirmed 429 with a
  correct `Retry-After` header on the request past the threshold (not
  before, not one-off); confirmed the four AI routes rate-limit
  independently of each other; confirmed length caps reject
  over-the-limit input (400) and accept exactly-at-the-limit input.
  Along the way, found and fixed a real bug this testing surfaced:
  `/login`'s error handling hardcoded "Incorrect email or password" for
  any `signIn()` error, so the rate-limit message was being silently
  replaced — fixed to show the actual message when it's the rate-limit
  one, verified visually via Playwright screenshot. Test accounts and
  all `RateLimitBucket` rows created during testing deleted afterward.

## Email verification

- **Description:** New accounts get a verification email on signup
  (dev-mode console fallback like password reset, same `lib/email.ts`
  send helper). `/verify-email?token=...` confirms it and sets
  `User.emailVerified`. `/account` shows a banner with a resend button
  while unverified (rate-limited to 3/hour).
- **Status:** Complete (code), untested live — needs `RESEND_API_KEY`,
  same as password reset
- **Dependencies:** none
- **Related files:** `lib/emailVerification.ts`, `lib/email.ts`
  (`sendVerificationEmail`), `app/api/auth/verify-email/route.ts`,
  `app/api/auth/resend-verification/route.ts`, `app/verify-email/page.tsx`
- **Database requirements:** `EmailVerificationToken` model,
  `User.emailVerified` (migration `big_feature_batch`)
- **Testing status:** Tested end-to-end via the dev-mode console
  fallback: signup issues a token and logs the link; bogus token
  rejected (400); valid token verifies (200) and sets `emailVerified`;
  reusing the same token rejected (400, single-use enforced); resending
  when already verified short-circuits with a message instead of
  sending another email. Test account deleted afterward.

## Account lockout

- **Description:** Independent of and outlasting the per-window login
  rate limit: `User.failedLoginAttempts` increments on each wrong
  password, and 10 cumulative failures sets `User.lockedUntil` 1 hour
  out (resetting the counter). A correct password resets both fields.
  The rate limit (10 requests/15 min) and the lockout (10 failures,
  1-hour lock) happen to share a threshold, so in practice the rate
  limit's 429 is usually what a client sees first within one window —
  the lockout's value is that it persists after that window rolls over,
  which the rate limit alone doesn't.
- **Status:** Complete
- **Dependencies:** none
- **Related files:** `lib/auth.ts` (`authorize` callback),
  `app/login/page.tsx` (surfaces the lockout message)
- **Database requirements:** `User.failedLoginAttempts`,
  `User.lockedUntil` (migration `big_feature_batch`)
- **Testing status:** Drove 10 failed logins against a fresh account via
  curl, then confirmed directly in the database that `lockedUntil` was
  set ~1 hour out and `failedLoginAttempts` reset to 0. Confirmed a
  same-window follow-up request (correct password) was still rejected
  (masked by the rate limiter in that specific window, as expected —
  see above). Test account deleted afterward.

## Account settings, deletion, and data export

- **Description:** `/account` (linked from `/dashboard`): view email and
  verification status, change display name, change password
  (current-password verified, new password ≥ 8 chars), export all
  account data as a JSON download, and permanently delete the account
  (password-confirmed, then signs out and redirects home). Deletion
  relies on the existing `onDelete: Cascade` relations from `User` to
  every owned table (profile, resumes and their nested data, cover
  letters, applications) — one `prisma.user.delete()` call, no manual
  cleanup code.
- **Status:** Complete
- **Dependencies:** Auth
- **Related files:** `app/account/page.tsx`,
  `components/AccountSettings.tsx`, `app/api/account/route.ts`
  (GET/PATCH/DELETE), `app/api/account/password/route.ts`,
  `app/api/account/export/route.ts`
- **API requirements:** `GET/PATCH/DELETE /api/account`,
  `PATCH /api/account/password`, `GET /api/account/export`. See `API.md`.
- **Testing status:** Tested via curl: name change, wrong-current-password
  rejected (401), weak new password rejected (400), correct password
  change confirmed by logging in with the new password afterward (old
  password then rejected), export returns real nested data. Deletion
  tested through a real browser session end to end: wrong password
  rejected with the form still visible ("Incorrect password."), correct
  password deletes the account, signs out, and redirects to `/`;
  confirmed the user row no longer exists in the database afterward.

## Dashboard summary stats

- **Description:** `/dashboard` shows resume count, application count,
  interviewing count, and offer count, computed with direct Prisma
  queries in the server component (no extra API route needed since the
  page already has the session server-side).
- **Status:** Complete
- **Dependencies:** Resume builder, application tracker
- **Related files:** `app/dashboard/page.tsx`
- **Testing status:** Verified visually via Playwright against a test
  account with a known 1 resume / 1 application (status Applied) —
  counts matched exactly (1 / 1 / 0 / 0).

## Search and manual reordering

- **Description:** Two independent additions to existing list UIs:
  (1) client-side search — resume list filters by title, applications
  list filters by company/role text plus a status dropdown; (2) manual
  reordering of experience/education entries (both master profile and
  per-resume) via up/down buttons, backed by a `sortOrder` column.
  New entries append at the end (`sortOrder = count of existing
  siblings`); reordering swaps `sortOrder` between the two affected
  entries via two `PATCH` calls. Ordering changed from `startDate desc`
  to `sortOrder asc` everywhere these lists are read, and resume
  creation now carries the profile's `sortOrder` into the new resume's
  snapshot so the order is preserved.
- **Status:** Complete
- **Dependencies:** Master profile, resume builder
- **Related files:** `components/ResumeList.tsx`,
  `components/ApplicationsList.tsx`, `components/profile/ExperienceSection.tsx`,
  `components/profile/EducationSection.tsx`, `lib/experience.ts`,
  `lib/education.ts` (accept `sortOrder` on update), the four
  experience/education creation routes (compute `sortOrder` on create)
- **Database requirements:** `sortOrder` on `Experience`, `Education`,
  `ResumeExperience`, `ResumeEducation` (migration `big_feature_batch`)
- **Testing status:** Search: typed a non-matching string and confirmed
  the empty state, typed a matching one and confirmed the entry
  reappeared (Playwright). Reordering: verified the default insertion
  order via curl, swapped two entries' `sortOrder` via curl and
  confirmed the new order, then clicked the actual up/down buttons in a
  real browser and confirmed the swap took effect — and confirmed a
  newly-created resume inherited the profile's already-reordered
  sequence.

## Cover letter editing

- **Description:** `PATCH /api/resumes/:id/cover-letters/:letterId`
  lets a saved cover letter's text be edited in place (max 8,000
  chars), rather than only delete-and-regenerate. Inline edit UI on
  `/resumes/:id`.
- **Status:** Complete
- **Dependencies:** Cover letter generation
- **Related files:** `app/api/resumes/[id]/cover-letters/[letterId]/route.ts`,
  `components/ResumeAITools.tsx`
- **Testing status:** Tested via curl against a manually-seeded cover
  letter (written before live AI generation was verified — see Cover
  letter generation above, which now works live): empty content rejected
  (400), valid edit saved and returned updated `content`; confirmed
  visually in the browser that the edited text displays correctly
  afterward.
