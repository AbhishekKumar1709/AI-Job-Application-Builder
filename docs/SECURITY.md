# Security

**No authentication, authorization, or security hardening is implemented
yet.** This document records intended principles to build against.

## Authentication (planned)

Not implemented. No provider chosen.

## Authorization (planned)

Not implemented. Every user's data (resumes, uploads, profile) must be
scoped to that user once auth exists — no cross-user access.

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
