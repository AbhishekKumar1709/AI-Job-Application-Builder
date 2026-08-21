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

- **Status:** Planned

## Resume upload / parsing (PDF, DOCX)

- **Status:** Planned

## AI resume optimization

- **Status:** Planned
- **Dependencies:** AI provider integration

## ATS compatibility analysis

- **Status:** Planned
- **Dependencies:** AI provider integration

## Job description matching

- **Status:** Planned
- **Dependencies:** AI provider integration

## Cover letter generation

- **Status:** Planned
- **Dependencies:** AI provider integration

## Application tracker

- **Status:** Planned
- **Dependencies:** Auth, database schema

## PDF export

- **Status:** Planned
