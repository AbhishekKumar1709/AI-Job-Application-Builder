# Project Status

Last updated: 2026-08-23

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
- [x] Password reset via email (Resend) — forgot/reset password API +
      pages, linked from `/login`; email verification on signup uses the
      same sender. `RESEND_API_KEY` set and verified live in local dev:
      both the signup verification email and a forgot-password email sent
      successfully with no errors (checked the server log directly, not
      just the generic API response). Free tier, no verified domain, so
      delivery is currently limited to the Resend account owner's own
      email address — documented in SECURITY.md.

## Phase 3 — AI features

- [x] AI provider integration — `lib/ai.ts` wraps the Google Gemini SDK
      (`gemini-3-flash-preview`, overridable via `GEMINI_MODEL`); switched
      from Anthropic to Gemini for its genuine free tier (no credit card)
- [x] Resume optimization suggestions — `POST /api/resumes/:id/optimize`
- [x] ATS compatibility analysis — `POST /api/resumes/:id/ats-check`
- [x] Job description matching — `POST /api/resumes/:id/match`
- [x] Cover letter generation — `POST/GET /api/resumes/:id/cover-letters`,
      `DELETE .../cover-letters/:letterId`; the one AI output that's
      persisted

  All five: auth, ownership (incl. cross-user isolation), and validation
  tested end-to-end via curl, **and** live AI output verified — real
  calls through the actual HTTP API returned real, coherent, grounded
  responses for all four features (see AI.md and FEATURES.md for
  specifics). `GEMINI_API_KEY` is set and verified live in both local
  dev and Vercel production — including a live call against the real
  production URL after deploying.

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

## Post-roadmap hardening

- [x] Rate limiting — Postgres-backed (`RateLimitBucket`), applied to the
      4 AI routes (cost exposure), signup, login, and forgot-password;
      tested by exceeding each limit and confirming 429 + `Retry-After`
- [x] Input length caps — every free-text field that reaches an AI
      prompt or the database, including a dedicated 10,000-char cap on
      `jobDescription` (previously unbounded)
- [x] Fixed a real bug the above testing surfaced: `/login` was
      hardcoding "Incorrect email or password" over every `signIn()`
      error, silently hiding the new rate-limit message from the user

## Post-audit gap closure

Ten gaps identified in a full-codebase review were closed in one batch:

- [x] Email verification on signup — `EmailVerificationToken` model,
      `/verify-email`, resend from `/account`; dev-mode console fallback
      like password reset. Tested: bogus token (400), valid token (200),
      reuse rejected (400), resend-when-verified short-circuits.
- [x] Account deletion — `DELETE /api/account`, password-confirmed;
      cascades to all owned data via existing FK cascades. Tested via a
      real browser session: wrong password rejected, correct password
      deletes the account, signs out, and redirects to `/`; confirmed
      gone from the database afterward.
- [x] Data export — `GET /api/account/export`, JSON download of profile
      + resumes + applications.
- [x] Account lockout beyond the login rate limit — `failedLoginAttempts`
      / `lockedUntil` on `User`; 10 cumulative failures locks for 1 hour,
      independent of and outlasting the 15-minute rate-limit window.
      Tested by driving 10 failed logins and confirming `lockedUntil` was
      set in the database.
- [x] Account settings page — `/account`: change name, change password
      (current-password verified), export, delete.
- [x] Cover letters are now editable after generation —
      `PATCH .../cover-letters/:letterId`.
- [x] Cover letters can be linked to a tracked Application —
      `Application.coverLetterId`, ownership-checked through the resume
      chain; confirmed a second user cannot link to another user's letter.
- [x] A second resume template ("compact" — dense, two-column header),
      selectable per resume; both templates verified visually distinct
      via Playwright, including switching between them through the real
      UI.
- [x] Search/filter on resumes (title) and applications (company/role
      text + status dropdown), client-side.
- [x] Dashboard summary stats (resume count, application count,
      interviewing, offers) computed directly in the server component.
- [x] Manual reordering of experience/education (both profile and
      resume) via up/down buttons — `sortOrder` column, swap-based
      reorder; new entries append at `sortOrder = count of siblings`,
      and the order carries over correctly when a resume snapshots the
      profile. Verified via curl (swap) and a real button click in the
      browser.

All ten: lint and build clean, tested via curl plus a combined Playwright
browser session (zero console errors across all screens touched).

## Known gaps (not yet built)

- Local dev is now isolated on its own Neon branch (`development`),
  verified by data isolation testing — but Preview deployments still
  share `main` with Production (see `DATABASE.md`); Neon's per-branch
  Preview integration would close this but isn't set up yet
- Phase 1 design system (`UI_DESIGN.md`) not filled in beyond the
  landing page
- `RESEND_API_KEY` is set and verified in local dev only — not yet added
  to Vercel production, so password reset/email verification don't work
  on the live site yet
- Resend free tier has no verified sending domain, so email delivery is
  restricted to the Resend account owner's own address until a domain is
  verified

## Notes

This file only records what has actually been built and verified running.
All four roadmap phases' checked items above exist in the codebase and
have been tested at least via curl against the real dev server; UI-level
features additionally via a real browser (Playwright) session.
