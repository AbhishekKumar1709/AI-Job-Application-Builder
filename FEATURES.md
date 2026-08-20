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

## Master profile

- **Description:** Canonical store of a user's work history, education, and
  skills, reused across resumes/cover letters.
- **Status:** Planned
- **Dependencies:** Auth, database schema
- **Related files:** —
- **API requirements:** —
- **Database requirements:** New `Profile`/`Experience`/`Education` models
- **Testing status:** —

## Resume builder

- **Description:** Create and edit a resume from the master profile or from
  scratch.
- **Status:** Planned
- **Dependencies:** Master profile, templates
- **Related files:** —
- **API requirements:** —
- **Database requirements:** `Resume` model
- **Testing status:** —

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
