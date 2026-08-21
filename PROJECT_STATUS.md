# Project Status

Last updated: 2026-08-21

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
- [x] Resume templates — `/resumes/:id/preview`, one clean formatted
      document (not multiple selectable designs); verified visually via
      Playwright screenshots against the live dev server, print media
      included
- [x] PDF export — "Download / print PDF" via `window.print()` against
      the print-styled preview; verified by generating a real PDF with
      Playwright and parsing it back with the project's own pdf-parse
      integration, confirming every field round-tripped correctly
- [x] Upload + parse existing resume (PDF/DOCX) — `/profile/import`;
      heuristic parse only, review-before-save into the real profile;
      tested end-to-end against real PDF and DOCX files, dev and
      production builds
- [~] Phone/OTP verification via MSG91 — code written (send/verify API +
      test page), **blocked** on DLT registration for a Sender ID; not
      wired into signup/login yet
- [~] Password reset via email (Resend) — code written (forgot/reset
      password API + pages, linked from `/login`), needs `RESEND_API_KEY`
      to test end-to-end

## Phase 3 — AI features

- [x] AI provider integration — `lib/ai.ts` wraps the Anthropic SDK
      (`claude-opus-5`, overridable via `ANTHROPIC_MODEL`)
- [x] Resume optimization suggestions — `POST /api/resumes/:id/optimize`
- [x] ATS compatibility analysis — `POST /api/resumes/:id/ats-check`
- [x] Job description matching — `POST /api/resumes/:id/match`
- [x] Cover letter generation — `POST/GET /api/resumes/:id/cover-letters`,
      `DELETE .../cover-letters/:letterId`; the one AI output that's
      persisted

  All five: auth, ownership (incl. cross-user isolation), and validation
  tested end-to-end via curl. Live AI output itself is untested —
  `ANTHROPIC_API_KEY` isn't set; the missing-key error was confirmed to
  surface correctly (502) rather than being swallowed.

## Phase 4 — Application tracking

- [x] Application tracker (companies, statuses, dates) — `/applications`,
      full CRUD, tested via curl (auth/validation/ownership) and via a
      real Playwright browser session (add/edit/delete through the UI,
      zero console errors)
- [x] Resume versioning per application — each application optionally
      links to one of the user's independently-editable resume
      snapshots (already the resume builder's design, see Phase 2);
      deleting a linked resume unlinks rather than deletes the
      application (verified)

## Notes

This file only records what has actually been built and verified running.
All four phases' checked items above exist in the codebase and have been
tested at least via curl against the real dev server; UI-level features
additionally via a real browser (Playwright) session. The two remaining
gaps are the Phase 1 design system and per-environment database
separation, and live-testing the Phase 3 AI features once
`ANTHROPIC_API_KEY` is set.
