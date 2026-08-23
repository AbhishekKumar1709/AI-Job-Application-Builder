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
Production — only local dev is isolated so far. Neon's Vercel
integration supports automatic per-branch databases for Preview
deployments (a branch created and torn down per PR); not yet configured.
Worth doing before Preview deploys are used for anything beyond quick
visual checks.

Keep this file synchronized with the actual schema. Update it in the same
commit as any `schema.prisma` change.

## Models

### User

- **Purpose:** Account record used by NextAuth's Credentials provider for
  email+password login.
- **Fields:**
  - `id` (String, cuid, primary key)
  - `name` (String, optional)
  - `email` (String, unique)
  - `passwordHash` (String, bcrypt hash — never the plaintext password)
  - `createdAt` (DateTime, defaults to now)
- **Relations:** none yet
- **Constraints:** `email` is unique
- **Indexes:** primary key on `id`; unique index on `email`

No other models exist yet. Profile, Resume, Template, Application, etc. will
be added and documented here as they're built.

## Prisma 7 client setup

Prisma 7 requires a driver adapter to be passed to `new PrismaClient()` at
runtime (the old bare `url` on the client is gone). This project uses
`@prisma/adapter-pg` (pure JS, no native compilation needed) — see
[lib/prisma.ts](./lib/prisma.ts).
