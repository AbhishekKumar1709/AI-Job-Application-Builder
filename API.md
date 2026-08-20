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

## POST /api/otp/send

- **Method:** POST
- **Endpoint:** `/api/otp/send`
- **Purpose:** Send an SMS OTP to a mobile number via MSG91.
- **Authentication:** None required.
- **Request format:** JSON — `{ "mobile": string }` (digits only, with country code, e.g. `91XXXXXXXXXX`)
- **Response format:** `200` → `{ "ok": true }`
- **Error responses:**
  - `400` — invalid mobile number format
  - `502` — MSG91 request failed (e.g. `MSG91_TEMPLATE_ID` not configured)
- **Status:** Blocked — see FEATURES.md. Sending fails until a Sender
  ID/template exist on the MSG91 side (needs DLT registration for India).

## POST /api/otp/verify

- **Method:** POST
- **Endpoint:** `/api/otp/verify`
- **Purpose:** Verify an OTP previously sent to a mobile number.
- **Authentication:** None required.
- **Request format:** JSON — `{ "mobile": string, "otp": string }`
- **Response format:** `200` → `{ "ok": true }`
- **Error responses:**
  - `400` — missing/invalid mobile or otp
  - `401` — incorrect or expired OTP

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
