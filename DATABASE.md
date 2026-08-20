# Database

Schema source of truth: [prisma/schema.prisma](./prisma/schema.prisma).
Connection config lives in [prisma.config.ts](./prisma.config.ts) (Prisma 7
moved the datasource URL out of `schema.prisma`). Dev database: SQLite, file
at `dev.db` in the project root (gitignored, created by
`npx prisma migrate dev`). Production should switch the `provider` in
`schema.prisma` to `postgresql` and set `DATABASE_URL` accordingly before
shipping — not done yet.

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
`@prisma/adapter-libsql` (see [lib/prisma.ts](./lib/prisma.ts)) rather than
`@prisma/adapter-better-sqlite3`, because `better-sqlite3` requires native
compilation (node-gyp/Python) which isn't set up on this machine — libsql
ships prebuilt binaries and needs no compiler.
