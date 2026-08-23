# Security

## Authentication

Implemented via NextAuth (Auth.js v4) with a Credentials provider — email +
password, no OAuth. Passwords are hashed with bcrypt (`bcryptjs`, 10 salt
rounds) before being stored; the plaintext password is never persisted or
logged. Sessions use signed/encrypted JWTs (`NEXTAUTH_SECRET`), not
database-backed sessions. See [lib/auth.ts](../lib/auth.ts).

Password reset via email is implemented (see FEATURES.md), as is email
verification on signup (`EmailVerificationToken`, `/verify-email`, resend
from `/account`, rate-limited to 3/hour). Login attempts are rate-limited
(10/15min per email) inside the `authorize` callback, and separately
tracked for account lockout: `User.failedLoginAttempts` increments on
each wrong password, and 10 cumulative failures sets `User.lockedUntil`
1 hour out (resetting the counter) — this persists across, and outlasts,
the 15-minute rate-limit window, which is the rate limit's blind spot on
its own. A correct password resets both fields.

## Authorization

Every user-owned resource (profile, resumes, applications, cover letters,
and their nested experience/education/skill/etc. rows) is scoped to the
signed-in user's id from the session on every read and write. Mutating a
record that exists but belongs to another user returns `404`, not `403` —
deliberately, to avoid confirming the record exists. This extends to
cross-resource links: an `Application` can reference a `Resume` and a
`CoverLetter`, and both references are ownership-checked independently
(a user cannot link their application to another user's resume or cover
letter, even though the link itself is stored on their own row). Verified
via curl with two real accounts for every resource type as each was
built (see FEATURES.md's testing notes per feature).

## File security

Resume upload/parsing (`/profile/import`) never writes the uploaded file to
disk — it's read into memory, text is extracted, and the buffer is
discarded when the request completes. There is no stored-file/public-URL
surface to secure because no uploaded file is ever persisted.

## Input validation

Implemented at the API boundary on every route: type checks, required-field
checks, and explicit max-length caps on free-text fields via
`lib/textLimits.ts`, including a dedicated cap on AI prompt inputs
(`jobDescription`, `lib/ai.ts`) that was previously unbounded.

## API security

Every mutating route requires a session (`401` if absent). The AI routes,
the auth entry points (signup, login, forgot-password), and account
email-verification resend are rate-limited — see [API.md](../API.md) §
Rate limiting. No API versioning.

## User data isolation

Implemented — see Authorization above.

## API key handling

AI provider (`GEMINI_API_KEY`), email (`RESEND_API_KEY`), and SMS
(`MSG91_AUTH_KEY`) keys are read only from environment variables, never
committed, never sent to the client. See [.env.example](../.env.example).
`GEMINI_API_KEY` is set and verified live in both local dev and Vercel
production. `RESEND_API_KEY` is set and verified live in local dev only,
not yet in Vercel production — see [PROJECT_STATUS.md](../PROJECT_STATUS.md).
Resend's free tier has no verified sending domain, so real delivery is
currently restricted to the Resend account owner's own email address;
other recipients would need a verified domain.

## Privacy

Data export is implemented: `GET /api/account/export` returns a JSON
download of everything a user owns (profile, resumes, applications).
No separate privacy policy or consent-tracking system exists — out of
scope for a solo project at this stage, revisit if it gets real users.

## Data deletion

Implemented: `DELETE /api/account`, password-confirmed, permanently
deletes the user and everything owned by them (profile, resumes and
their nested data, cover letters, applications) via the existing
`onDelete: Cascade` foreign-key relations — one `prisma.user.delete()`
call, no manual per-table cleanup code to keep in sync. Tested end to
end through the real UI: wrong password rejected, correct password
deletes, signs out, and redirects home; confirmed the row is actually
gone from the database afterward.

## Upload security

N/A — see File security above; no file is ever persisted to storage.

## Known gaps (not yet addressed)

- Dev, Preview, and Production currently share one Neon database (see
  [DATABASE.md](../DATABASE.md)) — real user data, not just a placeholder
  table, now depends on this being split before it matters more.
- No CSRF protection beyond NextAuth's built-in cookie-based protections
  has been separately added (not needed for session-cookie-authenticated
  JSON APIs called from the same origin, but noted as a gap rather than
  silently assumed safe).
- No automated security testing (dependency scanning, SAST) wired into
  CI — there is no CI pipeline at all yet.
