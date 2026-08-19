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

- **Purpose:** Placeholder account record. Not yet wired to any
  authentication flow.
- **Fields:**
  - `id` (String, cuid, primary key)
  - `email` (String, unique)
  - `createdAt` (DateTime, defaults to now)
- **Relations:** none yet
- **Constraints:** `email` is unique
- **Indexes:** primary key on `id`; unique index on `email`

No other models exist yet. Profile, Resume, Template, Application, etc. will
be added and documented here as they're built.
