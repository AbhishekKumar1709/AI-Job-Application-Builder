# Changelog

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
