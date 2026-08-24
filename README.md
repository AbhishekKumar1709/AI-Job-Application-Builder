# CVRespire

An AI-assisted tool for building resumes and cover letters, checking ATS
compatibility, matching resumes to job descriptions, and tracking job
applications.

> **Status: early scaffold.** The project structure, tooling, and database
> are set up. No product features are implemented yet. See
> [PROJECT_STATUS.md](./PROJECT_STATUS.md) for what's actually done.

## What works today

- Landing page
- Account creation and login (email + password), protected dashboard route

## Planned features

- Resume builder with multiple templates
- Upload/parse an existing resume (PDF/DOCX)
- AI-powered resume optimization and ATS analysis
- Cover letter generation
- Job description matching
- Application tracking

None of the above are implemented yet — this section describes intent, not
current capability.

## Technology stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Database:** Postgres (hosted on [Neon](https://neon.tech)) via Prisma
  ORM — same database for local dev and production
- **AI provider:** not yet integrated

## Installation

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL / DATABASE_URL_UNPOOLED / NEXTAUTH_SECRET
npx prisma generate
npm run dev
```

There's no local-only database — `DATABASE_URL` points at the same hosted
Neon Postgres instance used in production. Get the connection strings from
the Vercel dashboard (Storage tab) or `vercel env pull`. Only run
`npx prisma migrate dev` when you're actually changing the schema.

The app runs at http://localhost:1001.

## Environment variables

See [.env.example](./.env.example): `DATABASE_URL`, `NEXTAUTH_URL`, and
`NEXTAUTH_SECRET` (generate one with
`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`).
An AI provider key will be added once AI features are built (see
[AI.md](./docs/AI.md)).

## Development commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # run production build
npm run lint      # lint
```

## Database setup

Prisma schema lives at [prisma/schema.prisma](./prisma/schema.prisma).
Currently contains a single placeholder `User` model. Run
`npx prisma migrate dev` after any schema change, and update
[docs/DATABASE.md](./docs/DATABASE.md) to match.

## AI provider setup

Not yet implemented. See [docs/AI.md](./docs/AI.md) for the plan.

## File upload setup

Not yet implemented. See [docs/FILE_PROCESSING.md](./docs/FILE_PROCESSING.md).

## PDF/DOCX processing setup

Not yet implemented. See [docs/FILE_PROCESSING.md](./docs/FILE_PROCESSING.md).

## Folder structure

```text
AI-Job-Application-Builder/
├── app/            # Next.js App Router pages/routes
├── components/      # React components (empty so far)
├── lib/             # Shared utilities (empty so far)
├── prisma/          # Prisma schema and migrations
├── public/          # Static assets
├── docs/            # Project documentation
│   ├── user-guide/  # End-user guides
│   └── docx/        # DOCX-formatted documentation
├── tests/           # Tests (empty so far)
├── scripts/         # Dev/build scripts (empty so far)
└── uploads/         # User-uploaded files (gitignored)
```

## Documentation

Full docs are in [docs/](./docs/). Start with
[PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md) and
[PROJECT_STATUS.md](./PROJECT_STATUS.md).
