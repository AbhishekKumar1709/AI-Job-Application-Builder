# Database

Schema source of truth: [prisma/schema.prisma](./prisma/schema.prisma).
Connection config lives in [prisma.config.ts](./prisma.config.ts) (Prisma 7
moved the datasource URL out of `schema.prisma`).

Database: Postgres, hosted on [Neon](https://neon.tech) via Vercel's
Marketplace integration (resource name `neon-cerulean-bridge`). One
database is shared by local dev and the production deployment — there is
no separate local database. Two connection strings are used:

- `DATABASE_URL` — pooled (via PgBouncer), used by the Prisma Client
  adapter at runtime ([lib/prisma.ts](./lib/prisma.ts))
- `DATABASE_URL_UNPOOLED` — direct connection, used only for running
  migrations ([prisma.config.ts](./prisma.config.ts)); Prisma Migrate
  doesn't work reliably through a transaction-mode pooler.

Both are auto-populated in Vercel's environment variables (Production,
Preview, Development) by the Neon integration; for local dev, copy them
into `.env` (see [.env.example](./.env.example)) or run `vercel env pull`.

**Known limitation:** Production, Preview, and local Development all point
at the exact same Neon database/branch right now (verified — the
connection strings are identical across all three). There's no isolation
between environments: testing locally or in a preview deploy writes to the
same data as production. Fine for now as a solo project with only a
placeholder `User` table, but worth splitting into separate Neon branches
per environment before there's real user data to protect.

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
