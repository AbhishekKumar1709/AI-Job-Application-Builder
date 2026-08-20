# Changelog

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
