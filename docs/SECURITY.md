# Security

*This file was stale for a long stretch of development (still described the
pre-profile/resume/AI app) — updated 2026-08-21 to match reality.*

## Authentication

Implemented via NextAuth (Auth.js v4) with a Credentials provider — email +
password, no OAuth. Passwords are hashed with bcrypt (`bcryptjs`, 10 salt
rounds) before being stored; the plaintext password is never persisted or
logged. Sessions use signed/encrypted JWTs (`NEXTAUTH_SECRET`), not
database-backed sessions. See [lib/auth.ts](../lib/auth.ts).

Password reset via email is implemented (see FEATURES.md). Login attempts
are rate-limited (10/15min per email) inside the `authorize` callback. Not
yet implemented: email verification on signup, account lockout beyond the
rate limit, account deletion.

## Authorization

Every user-owned resource (profile, resumes, applications, cover letters,
and their nested experience/education/skill/etc. rows) is scoped to the
signed-in user's id from the session on every read and write. Mutating a
record that exists but belongs to another user returns `404`, not `403` —
deliberately, to avoid confirming the record exists. Verified via curl with
two real accounts for every resource type as each was built (see
FEATURES.md's testing notes per feature).

## File security

Resume upload/parsing (`/profile/import`) never writes the uploaded file to
disk — it's read into memory, text is extracted, and the buffer is
discarded when the request completes. There is no stored-file/public-URL
surface to secure because no uploaded file is ever persisted.

## Input validation

Implemented at the API boundary on every route: type checks, required-field
checks, and (as of the 2026-08-21 rate-limiting pass) explicit max-length
caps on free-text fields via `lib/textLimits.ts`, including a dedicated cap
on AI prompt inputs (`jobDescription`, `lib/ai.ts`) that was previously
unbounded.

## API security

Every mutating route requires a session (`401` if absent). The AI routes
and the auth entry points (signup, login, forgot-password) are
rate-limited — see [API.md](../API.md) § Rate limiting. No API versioning.

## User data isolation

Implemented — see Authorization above.

## API key handling

AI provider (`ANTHROPIC_API_KEY`), email (`RESEND_API_KEY`), and SMS
(`MSG91_AUTH_KEY`) keys are read only from environment variables, never
committed, never sent to the client. See [.env.example](../.env.example).

## Privacy (planned)

Not designed yet.

## Data deletion (planned)

Not implemented — users should eventually be able to delete their account
and all associated data. Flagged as a known gap, not yet built.

## Upload security

N/A — see File security above; no file is ever persisted to storage.

## Known gaps (not yet addressed)

- No email verification on signup
- No account deletion / data export
- No account lockout beyond the login rate limit
- Dev, Preview, and Production currently share one Neon database (see
  [DATABASE.md](../DATABASE.md)) — real user data, not just a placeholder
  table, now depends on this being split before it matters more.
