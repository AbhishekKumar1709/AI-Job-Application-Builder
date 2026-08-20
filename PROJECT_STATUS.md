# Project Status

Last updated: 2026-08-20

## Phase 1 — Foundation

- [x] Project scaffold (Next.js + TypeScript + Tailwind, App Router)
- [x] Folder structure (components, lib, prisma, docs, tests, scripts, uploads)
- [x] Prisma configured with SQLite (dev) and a placeholder `User` model
- [x] GitHub repo created (`AI-Job-Application-Builder`)
- [x] Baseline documentation set created
- [x] Landing page (roadmap-only, no functional CTAs yet)
- [ ] Design system / UI_DESIGN.md filled in with full component set
- [x] Authentication (email+password via NextAuth/Auth.js Credentials
      provider, JWT sessions; signup/login/dashboard/logout tested
      end-to-end)
- [x] Hosted database (Postgres on Neon, connected in Production/Preview/
      Development)
- [x] Live production deployment verified working end-to-end (signup,
      login, dashboard) at ai-job-application-builder.vercel.app, not
      just local dev
- [ ] Separate database branch/instance per environment (currently shared)

## Phase 2 — Core resume features

- [ ] Master profile (user's canonical work history/skills/education)
- [ ] Resume builder / editor
- [ ] Resume templates
- [ ] PDF export
- [ ] Upload + parse existing resume (PDF/DOCX)

## Phase 3 — AI features

- [ ] AI provider integration
- [ ] Resume optimization suggestions
- [ ] ATS compatibility analysis
- [ ] Job description matching
- [ ] Cover letter generation

## Phase 4 — Application tracking

- [ ] Application tracker (companies, statuses, dates)
- [ ] Resume versioning per application

## Notes

This file only records what has actually been built and verified running.
Nothing beyond "Phase 1" checked items above exists in the codebase yet.
