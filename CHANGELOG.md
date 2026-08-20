# Changelog

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
