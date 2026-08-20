# API

## POST /api/auth/signup

- **Method:** POST
- **Endpoint:** `/api/auth/signup`
- **Purpose:** Create a new user account (email + password).
- **Authentication:** None required.
- **Request format:** JSON — `{ "email": string, "password": string, "name"?: string }`
- **Response format:** `201` → `{ "user": { "id": string, "email": string } }`
- **Error responses:**
  - `400` — invalid email or password under 8 characters
  - `409` — an account with that email already exists

## /api/auth/[...nextauth]

NextAuth's (Auth.js v4) built-in routes — `signin`, `callback/credentials`,
`signout`, `session`, `csrf`, etc. Configured in
[lib/auth.ts](./lib/auth.ts) with a Credentials provider (email+password
against the `User` table) and JWT sessions. Not hand-documented per-route
since it's library-owned surface; see the
[NextAuth v4 REST API docs](https://next-auth.js.org/getting-started/rest-api)
for the full route list.

No other API routes exist yet.

## Format for future entries

```text
POST /api/resumes
```

- **Method:**
- **Endpoint:**
- **Purpose:**
- **Authentication:**
- **Request format:**
- **Response format:**
- **Error responses:**
