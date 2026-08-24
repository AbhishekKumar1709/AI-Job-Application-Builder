# Development Guide

How to pick up and continue this project.

## Setup

```bash
git clone <repo-url>
cd CVRespire
npm install
cp .env.example .env
```

## Dependencies

- Node.js (developed on v24.x)
- npm

## Environment variables

See [.env.example](./.env.example). Currently just `DATABASE_URL`.

## Database

Prisma + SQLite for local dev.

```bash
npx prisma migrate dev --name <migration-name>   # apply schema changes
npx prisma studio                                  # browse data
```

Update [DATABASE.md](./DATABASE.md) whenever `prisma/schema.prisma` changes.

## Running locally

```bash
npm run dev
```

Visit http://localhost:3000.

## Building

```bash
npm run build
npm run start
```

Not yet verified against a production environment.

## Testing

No test suite exists yet. See [TESTING.md](./TESTING.md).

## Debugging

Standard Next.js dev server output in the terminal; browser devtools for
client-side issues. No additional tooling configured yet.

## Adding features

1. Implement the feature.
2. Test it (manually at minimum, until a test suite exists).
3. Update [FEATURES.md](./FEATURES.md) and [PROJECT_STATUS.md](./PROJECT_STATUS.md).
4. Add a [CHANGELOG.md](./CHANGELOG.md) entry.
5. Update any other doc the feature touches (DATABASE.md, API.md,
   docs/AI.md, docs/TEMPLATES.md, etc).

## Adding templates

Not applicable yet — no template system exists. See
[docs/TEMPLATES.md](./docs/TEMPLATES.md) for the plan once one is built.

## Adding AI providers

Not applicable yet — no AI integration exists. See
[docs/AI.md](./docs/AI.md) for the plan.
