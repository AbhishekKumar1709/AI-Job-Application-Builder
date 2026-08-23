# Database

Schema source of truth: [prisma/schema.prisma](./prisma/schema.prisma).
Connection config lives in [prisma.config.ts](./prisma.config.ts) (Prisma 7
moved the datasource URL out of `schema.prisma`).

Database: Postgres, hosted on [Neon](https://neon.tech) via Vercel's
Marketplace integration (resource name `neon-cerulean-bridge`, project
`lingering-glitter-80314464`). Two Neon branches exist:

- `main` — production data. Used by Vercel's Production (and currently
  Preview) environments.
- `development` — created as a full data+schema copy of `main` at
  branch-creation time (2026-08-23), no auto-expiry. Used by local dev
  only (`.env`, gitignored — not committed, not in Vercel).

Two connection strings per branch:

- `DATABASE_URL` — pooled (via PgBouncer), used by the Prisma Client
  adapter at runtime ([lib/prisma.ts](./lib/prisma.ts))
- `DATABASE_URL_UNPOOLED` — direct connection, used only for running
  migrations ([prisma.config.ts](./prisma.config.ts)); Prisma Migrate
  doesn't work reliably through a transaction-mode pooler.

Vercel's Production/Preview environment variables (auto-populated by the
Neon integration) still point at `main` — only the local `.env` was
repointed to `development`. Verified isolated: created a test user
through the local dev server, confirmed it exists when queried directly
against the `development` branch and does *not* exist when queried
directly against `main`.

**Note:** a Neon branch's compute suspends when idle and can take several
seconds to wake on the first connection after a period of inactivity —
manifests as a Prisma `ETIMEDOUT` on the very first query after the dev
server (re)starts or after leaving it idle; the retry immediately after
succeeds. Not a bug, just cold-start latency.

**Remaining gap:** Preview deployments still share `main` with
Production — only local dev is isolated so far. Confirmed empirically
(2026-08-23): pushed a throwaway commit to a test branch, let Vercel
build the Preview deployment, and checked the Neon project's branch
count before and after — it stayed at 2 (`main`, `development`), so
Neon's per-preview branching is **not** on by default with this
integration. Per Neon's own docs
(neon.com/docs/guides/vercel-managed-integration), turning it on
requires re-running the "Connect a Project" flow with the
"Create Database Branch For Deployment → Preview" checkbox — but the
project already shows as "Connected" in that dialog, so doing this means
disconnecting the current (working) connection first and reconnecting.
Deferred: that's a real risk window for Production's live `DATABASE_URL`
to fix a non-blocking gap. Worth doing if Preview deploys start being
used for anything beyond quick visual checks.

Keep this file synchronized with the actual schema. Update it in the same
commit as any `schema.prisma` change.

## Models

15 models total. Grouped by area below; see `schema.prisma` for the
authoritative field list.

### Auth & account

**User** — the account record used by NextAuth's Credentials provider.
`email` (unique), `passwordHash` (bcrypt, never plaintext), `emailVerified`
(null until confirmed via `EmailVerificationToken`), `failedLoginAttempts`
+ `lockedUntil` (account lockout, see SECURITY.md). Owns one `Profile`,
many `Resume`, many `Application`.

**EmailVerificationToken** — one-time token for confirming a signup email.
`tokenHash` (SHA-256 of the raw token, unique), `expiresAt`, `usedAt`
(null until consumed). Cascade-deletes with its `User`.

**PasswordResetToken** — same shape as `EmailVerificationToken`, for the
forgot-password flow. `tokenHash` unique, `expiresAt`, `usedAt`.
Cascade-deletes with its `User`.

### Master profile

**Profile** — one per `User` (`userId` unique), the canonical work
history/skills/education reused when snapshotting new resumes.
`headline`, `phone`, `location`, `summary`. Cascade-deletes with its
`User`.

**Experience**, **Education**, **Skill** — child records of `Profile`
(cascade-deletes with it). `Experience`/`Education` carry `sortOrder`
(manual reordering, see FEATURES.md) plus the usual date/description
fields. `Skill` is just a `name`, unique per `(profileId, name)`.

### Resumes

**Resume** — one editable, independently-versioned document per
`title`, owned by a `User`. Snapshots `headline`/`phone`/`location`/
`summary` from `Profile` at creation, then diverges. `template`
(`"classic"` or `"compact"`, default `"classic"`) picks the render in
`ResumePreview.tsx`. Owns `ResumeExperience`, `ResumeEducation`,
`ResumeSkill`, `CoverLetter`, and is optionally linked from
`Application`.

**ResumeExperience**, **ResumeEducation**, **ResumeSkill** — the
resume-scoped counterparts of `Experience`/`Education`/`Skill`, same
shape (including `sortOrder`), cascade-deleting with their `Resume`.
Independent of the profile's copies once created.

**CoverLetter** — AI-generated (and then editable) cover letter text,
scoped to a `Resume` (cascade-deletes with it). `jobDescription` (the
input) and `content` (the generated/edited output) are both stored.
Optionally linked from `Application` via `coverLetterId`.

### Application tracking

**Application** — a tracked job application: `company`, `role`,
`status` (`ApplicationStatus` enum: `SAVED`, `APPLIED`, `INTERVIEWING`,
`OFFER`, `REJECTED`, `WITHDRAWN`), `jobUrl`, `notes`, `appliedAt`. Owned
by a `User`; optionally references a `Resume` and/or a `CoverLetter` —
both via `onDelete: SetNull`, so deleting the resume/letter unlinks the
application instead of deleting it.

### Infrastructure

**RateLimitBucket** — fixed-window counter for `lib/rateLimit.ts`
(Postgres-backed since Vercel serverless functions don't share memory).
Composite primary key `(key, windowStart)`; `count` increments per
request in that window. Not tied to a `User` — `key` is an arbitrary
string like `auth:login:<email>` or `ai:optimize:<userId>`.

### Cascade summary

Deleting a `User` cascades through everything it owns: `Profile` (and
its `Experience`/`Education`/`Skill`), every `Resume` (and its
`ResumeExperience`/`ResumeEducation`/`ResumeSkill`/`CoverLetter`), every
`Application`, and both token types. This is what powers account
deletion (`DELETE /api/account`) — no manual cleanup needed beyond the
one `prisma.user.delete()` call.

## Prisma 7 client setup

Prisma 7 requires a driver adapter to be passed to `new PrismaClient()` at
runtime (the old bare `url` on the client is gone). This project uses
`@prisma/adapter-pg` (pure JS, no native compilation needed) — see
[lib/prisma.ts](./lib/prisma.ts).
