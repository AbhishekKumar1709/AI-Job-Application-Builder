# Security

## Authentication

Implemented via NextAuth (Auth.js v4) with a Credentials provider — email +
password, no OAuth. Passwords are hashed with bcrypt (`bcryptjs`, 10 salt
rounds) before being stored; the plaintext password is never persisted or
logged. Sessions use signed/encrypted JWTs (`NEXTAUTH_SECRET`), not
database-backed sessions. See [lib/auth.ts](../lib/auth.ts).

Not yet implemented: password reset, email verification, rate limiting on
login/signup attempts.

## Authorization (planned)

No user-owned resources exist yet (profile, resumes, uploads) — once they
do, every query must be scoped to the signed-in user's id from the session.
No cross-user access.

## File security (planned)

Uploaded files must not be publicly accessible by guessable URL. See
[FILE_PROCESSING.md](./FILE_PROCESSING.md).

## Input validation (planned)

Not implemented. All user input (including AI prompt inputs) must be
validated/sanitized at the API boundary once endpoints exist.

## API security (planned)

No API routes exist yet.

## User data isolation (planned)

Not implemented — depends on auth.

## API key handling

AI provider keys (once added) must live only in environment variables, never
committed, never sent to the client. See [.env.example](../.env.example).

## Privacy (planned)

Not designed yet.

## Data deletion (planned)

Not implemented — users should eventually be able to delete their account
and all associated data.

## Upload security (planned)

Not implemented. See [FILE_PROCESSING.md](./FILE_PROCESSING.md).
