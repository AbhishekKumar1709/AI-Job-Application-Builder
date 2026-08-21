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

- [x] Master profile (user's canonical work history/skills/education) —
      `/profile` page, full CRUD API, ownership-checked per user; tested
      end-to-end via curl with two accounts, UI not yet clicked through
      in a browser
- [x] Resume builder / editor — `/resumes` list + `/resumes/:id` editor;
      each resume snapshots the master profile at creation, then edits
      independently; tested end-to-end via curl with two accounts, UI
      not yet clicked through in a browser
- [ ] Resume templates
- [ ] PDF export
- [ ] Upload + parse existing resume (PDF/DOCX)
- [~] Phone/OTP verification via MSG91 — code written (send/verify API +
      test page), **blocked** on DLT registration for a Sender ID; not
      wired into signup/login yet
- [~] Password reset via email (Resend) — code written (forgot/reset
      password API + pages, linked from `/login`), needs `RESEND_API_KEY`
      to test end-to-end

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
