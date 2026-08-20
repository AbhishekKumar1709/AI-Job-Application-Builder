# Testing

## Current status

No automated test suite is set up yet — `tests/` exists but is empty. The
following has been manually tested against the running dev server (via
curl, not just build/typecheck):

- Landing page renders, `npm run build`/`npm run lint` pass.
- `POST /api/auth/signup` — success (201), duplicate email (409), password
  under 8 characters (400).
- Unauthenticated request to `/dashboard` redirects to `/login` (307).
- Credentials sign-in issues a session cookie; that cookie grants access
  to `/dashboard`, which shows the signed-in user's email.
- **Also re-verified against the live production deployment**
  (`https://ai-job-application-builder.vercel.app`, not just local dev):
  signup, credentials login (`__Secure-` session cookie over HTTPS), and
  authenticated dashboard access all confirmed working there too.
- All test accounts created during this testing were deleted afterward
  (both from the local/dev database and, since Development currently
  shares the same Neon database as Production, from there too).

## Planned

- **Unit tests:** not set up (likely Vitest or Jest once added)
- **Integration tests:** not set up
- **E2E tests:** not set up (likely Playwright)
- **Manual testing:** none performed yet — no features exist to test
- **Mobile testing:** not applicable yet
- **Browser testing:** not applicable yet
- **Accessibility testing:** not applicable yet
- **Security testing:** not applicable yet

This file must be updated with real results whenever a feature is
implemented and actually tested — not before.
