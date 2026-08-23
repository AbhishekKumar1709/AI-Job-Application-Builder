# API

## Rate limiting

The following routes enforce a request limit and return `429` (with a
`Retry-After` header, seconds) once exceeded — see `lib/rateLimit.ts`:

- `POST /api/auth/signup` — 5/hour per IP
- `POST /api/auth/forgot-password` — 3/hour per email
- Credentials login (`/api/auth/callback/credentials`) — 10 attempts/15min per email
- `POST /api/resumes/:id/optimize` / `ats-check` / `match` — 15/hour per user, per route
- `POST /api/resumes/:id/cover-letters` — 10/hour per user

No other routes are currently rate-limited.

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

## POST /api/auth/forgot-password

- **Method:** POST
- **Endpoint:** `/api/auth/forgot-password`
- **Purpose:** Request a password reset email. Always returns a generic
  success message, whether or not the email is registered, to avoid
  leaking which emails have accounts.
- **Authentication:** None required.
- **Request format:** JSON — `{ "email": string }`
- **Response format:** `200` → `{ "message": string }`
- **Error responses:**
  - `400` — invalid email
  - `502` — the account exists but the reset email failed to send (e.g.
    `RESEND_API_KEY` not configured)
- **Status:** Code-complete, not yet tested end-to-end — needs a
  `RESEND_API_KEY`. See FEATURES.md.

## POST /api/auth/reset-password

- **Method:** POST
- **Endpoint:** `/api/auth/reset-password`
- **Purpose:** Consume a reset token (from the emailed link) and set a new
  password. Single-use; expires 1 hour after being requested.
- **Authentication:** None required (token in body is the credential).
- **Request format:** JSON — `{ "token": string, "password": string }`
- **Response format:** `200` → `{ "message": string }`
- **Error responses:**
  - `400` — password under 8 characters, or token missing/invalid/expired/used

## GET /api/profile

- **Method:** GET
- **Endpoint:** `/api/profile`
- **Purpose:** Fetch the signed-in user's master profile, including
  experience, education, and skills.
- **Authentication:** Required (session cookie).
- **Response format:** `200` → `{ "profile": Profile | null }`, where
  `Profile` includes `experiences[]` (newest `startDate` first),
  `education[]` (newest `startDate` first), and `skills[]` (alphabetical).
  `null` if the user hasn't saved anything yet.
- **Error responses:**
  - `401` — not authenticated

## PUT /api/profile

- **Method:** PUT
- **Endpoint:** `/api/profile`
- **Purpose:** Create or update the signed-in user's basic profile info.
- **Authentication:** Required (session cookie).
- **Request format:** JSON — `{ "headline"?: string, "phone"?: string, "location"?: string, "summary"?: string }`
- **Response format:** `200` → `{ "profile": Profile }`
- **Error responses:**
  - `401` — not authenticated

## POST /api/profile/experience

- **Method:** POST
- **Endpoint:** `/api/profile/experience`
- **Purpose:** Add an experience entry to the signed-in user's profile
  (creates the profile if it doesn't exist yet).
- **Authentication:** Required (session cookie).
- **Request format:** JSON — `{ "company": string, "title": string, "location"?: string, "startDate": string (ISO date), "endDate"?: string, "current"?: boolean, "description"?: string }`
- **Response format:** `201` → `{ "experience": Experience }`
- **Error responses:**
  - `400` — missing company/title, or invalid start/end date
  - `401` — not authenticated

## PATCH /api/profile/experience/:id / DELETE /api/profile/experience/:id

- **Purpose:** Update or delete one experience entry. Ownership is
  checked server-side — an id belonging to another user's profile
  returns `404`, never `403`, to avoid confirming it exists.
- **Authentication:** Required (session cookie).
- **Request format (PATCH):** JSON, all fields optional — same shape as
  the POST body.
- **Response format:** PATCH `200` → `{ "experience": Experience }`;
  DELETE `200` → `{ "ok": true }`
- **Error responses:**
  - `400` — invalid date (PATCH) or company/title emptied out
  - `401` — not authenticated
  - `404` — entry not found or not owned by the caller

## POST /api/profile/education

- **Method:** POST
- **Endpoint:** `/api/profile/education`
- **Purpose:** Add an education entry to the signed-in user's profile
  (creates the profile if it doesn't exist yet).
- **Authentication:** Required (session cookie).
- **Request format:** JSON — `{ "institution": string, "degree"?: string, "fieldOfStudy"?: string, "startDate"?: string, "endDate"?: string, "description"?: string }`
- **Response format:** `201` → `{ "education": Education }`
- **Error responses:**
  - `400` — missing institution, or invalid start/end date
  - `401` — not authenticated

## PATCH /api/profile/education/:id / DELETE /api/profile/education/:id

- **Purpose:** Update or delete one education entry. Same ownership
  behavior as the experience routes above (`404` if not owned).
- **Authentication:** Required (session cookie).
- **Response format:** PATCH `200` → `{ "education": Education }`;
  DELETE `200` → `{ "ok": true }`
- **Error responses:**
  - `400` — invalid date (PATCH) or institution emptied out
  - `401` — not authenticated
  - `404` — entry not found or not owned by the caller

## POST /api/profile/skills

- **Method:** POST
- **Endpoint:** `/api/profile/skills`
- **Purpose:** Add a skill to the signed-in user's profile (creates the
  profile if it doesn't exist yet).
- **Authentication:** Required (session cookie).
- **Request format:** JSON — `{ "name": string }`
- **Response format:** `201` → `{ "skill": Skill }`
- **Error responses:**
  - `400` — empty name
  - `401` — not authenticated
  - `409` — that skill name is already on the profile

## DELETE /api/profile/skills/:id

- **Purpose:** Remove a skill. Same ownership behavior as above (`404`
  if not owned).
- **Authentication:** Required (session cookie).
- **Response format:** `200` → `{ "ok": true }`
- **Error responses:**
  - `401` — not authenticated
  - `404` — skill not found or not owned by the caller

## GET /api/resumes

- **Method:** GET
- **Endpoint:** `/api/resumes`
- **Purpose:** List the signed-in user's resumes (summary only, no nested items).
- **Authentication:** Required (session cookie).
- **Response format:** `200` → `{ "resumes": Array<{ id, title, createdAt, updatedAt }> }`, newest-updated first.
- **Error responses:**
  - `401` — not authenticated

## POST /api/resumes

- **Method:** POST
- **Endpoint:** `/api/resumes`
- **Purpose:** Create a new resume. Copies the signed-in user's current
  master profile (basic info, experience, education, skills) into the
  new resume as an independent snapshot — editing the resume afterward
  never changes the profile. If no profile exists yet, the resume is
  created empty.
- **Authentication:** Required (session cookie).
- **Request format:** JSON — `{ "title": string }`
- **Response format:** `201` → `{ "resume": Resume }` (full nested shape, same as `GET /api/resumes/:id`)
- **Error responses:**
  - `400` — missing title
  - `401` — not authenticated

## GET /api/resumes/:id

- **Purpose:** Fetch one resume with its experience, education, and skills.
- **Authentication:** Required (session cookie).
- **Response format:** `200` → `{ "resume": Resume }`
- **Error responses:**
  - `401` — not authenticated
  - `404` — resume not found or not owned by the caller

## PATCH /api/resumes/:id

- **Purpose:** Update a resume's basic info.
- **Authentication:** Required (session cookie).
- **Request format:** JSON, all fields optional — `{ "title"?: string, "headline"?: string, "phone"?: string, "location"?: string, "summary"?: string }`
- **Response format:** `200` → `{ "resume": Resume }`
- **Error responses:**
  - `400` — title emptied out
  - `401` — not authenticated
  - `404` — resume not found or not owned by the caller

## DELETE /api/resumes/:id

- **Purpose:** Delete a resume and all its experience/education/skill entries.
- **Authentication:** Required (session cookie).
- **Response format:** `200` → `{ "ok": true }`
- **Error responses:**
  - `401` — not authenticated
  - `404` — resume not found or not owned by the caller

## Resume experience / education / skills

- **Endpoints:** `POST /api/resumes/:id/experience`,
  `PATCH|DELETE /api/resumes/:id/experience/:expId`,
  `POST /api/resumes/:id/education`,
  `PATCH|DELETE /api/resumes/:id/education/:eduId`,
  `POST /api/resumes/:id/skills`,
  `DELETE /api/resumes/:id/skills/:skillId`
- **Purpose:** Same request/response shapes and validation as the
  equivalent `/api/profile/*` routes above, but scoped to one resume
  instead of the master profile. Ownership is checked on both the
  resume (`:id`) and the sub-entry — a mismatched combination, or a
  resume/entry belonging to another user, returns `404`.
- **Authentication:** Required (session cookie).
- **Error responses:**
  - `400` — same validation as the profile routes (missing required
    fields, invalid dates, duplicate skill name → `409`)
  - `401` — not authenticated
  - `404` — resume or entry not found / not owned by the caller

## POST /api/profile/parse-resume

- **Method:** POST
- **Endpoint:** `/api/profile/parse-resume`
- **Purpose:** Extract text from an uploaded `.pdf` or `.docx` resume and
  run a best-effort heuristic parse. Does not write to the database —
  returns a draft for the client to review and selectively add via the
  existing `/api/profile/*` endpoints.
- **Authentication:** Required (session cookie).
- **Request format:** `multipart/form-data` with a `file` field (max 5MB, `.pdf` or `.docx`)
- **Response format:** `200` → `{ "parsed": { email, phone, summary, skills: string[], experiences: [...], education: [...] } }`
- **Error responses:**
  - `400` — no file, file too large, or unsupported file type
  - `401` — not authenticated
  - `422` — file couldn't be parsed (e.g. no extractable text, scanned image, corrupt file)

## POST /api/resumes/:id/optimize

- **Purpose:** Get AI resume-optimization suggestions for one resume.
  Stateless — nothing is saved.
- **Authentication:** Required (session cookie).
- **Response format:** `200` → `{ "suggestions": Array<{ section, issue, suggestion }> }`
- **Error responses:**
  - `400` — resume has no content yet
  - `401` — not authenticated
  - `404` — resume not found or not owned by the caller
  - `502` — the AI provider call failed (e.g. `ANTHROPIC_API_KEY` not set, or Claude's response wasn't valid JSON)

## POST /api/resumes/:id/ats-check

- **Purpose:** Get an AI ATS-compatibility score and issues/strengths for one resume. Stateless.
- **Authentication:** Required (session cookie).
- **Response format:** `200` → `{ "result": { score, issues: string[], strengths: string[] } }`
- **Error responses:** same as `optimize` above.

## POST /api/resumes/:id/match

- **Purpose:** Compare a resume against a pasted job description. Stateless.
- **Authentication:** Required (session cookie).
- **Request format:** JSON — `{ "jobDescription": string }`
- **Response format:** `200` → `{ "result": { matchScore, matchedKeywords: string[], missingKeywords: string[], suggestions: string[] } }`
- **Error responses:**
  - `400` — missing job description, or resume has no content
  - `401` / `404` / `502` — same as `optimize` above

## GET /api/resumes/:id/cover-letters

- **Purpose:** List cover letters previously generated for a resume, newest first.
- **Authentication:** Required (session cookie).
- **Response format:** `200` → `{ "coverLetters": CoverLetter[] }`
- **Error responses:** `401` / `404` (resume not found or not owned)

## POST /api/resumes/:id/cover-letters

- **Purpose:** Generate a cover letter from the resume + a job description, and save it.
- **Authentication:** Required (session cookie).
- **Request format:** JSON — `{ "jobDescription": string, "companyName"?: string }`
- **Response format:** `201` → `{ "coverLetter": CoverLetter }`
- **Error responses:**
  - `400` — missing job description, or resume has no content
  - `401` / `404` / `502` — same as `optimize` above

## PATCH /api/resumes/:id/cover-letters/:letterId

- **Purpose:** Edit a saved cover letter's text.
- **Authentication:** Required (session cookie).
- **Request format:** JSON — `{ "content": string }` (max 8,000 characters)
- **Response format:** `200` → `{ "coverLetter": CoverLetter }`
- **Error responses:**
  - `400` — empty or over-length content
  - `401` — not authenticated
  - `404` — letter not found or not owned by the caller

## DELETE /api/resumes/:id/cover-letters/:letterId

- **Purpose:** Delete a saved cover letter. Ownership checked on both the resume and the letter.
- **Authentication:** Required (session cookie).
- **Response format:** `200` → `{ "ok": true }`
- **Error responses:** `401` / `404` (letter not found or not owned)

## GET /api/applications

- **Purpose:** List the signed-in user's job applications, newest
  applied-date first, each including its linked resume's `id`/`title`
  (or `null` if unlinked).
- **Authentication:** Required (session cookie).
- **Response format:** `200` → `{ "applications": Application[] }`
- **Error responses:** `401` — not authenticated

## POST /api/applications

- **Purpose:** Create a job application entry.
- **Authentication:** Required (session cookie).
- **Request format:** JSON — `{ "company": string, "role": string, "status"?: "SAVED"|"APPLIED"|"INTERVIEWING"|"OFFER"|"REJECTED"|"WITHDRAWN" (default "APPLIED"), "jobUrl"?: string, "notes"?: string, "appliedAt"?: string, "resumeId"?: string }`
- **Response format:** `201` → `{ "application": Application }`
- **Error responses:**
  - `400` — missing company/role, invalid applied date, or `resumeId` not owned by the caller
  - `401` — not authenticated

## PATCH /api/applications/:id

- **Purpose:** Update any field of an application, including status transitions and (un)linking a resume.
- **Authentication:** Required (session cookie).
- **Request format:** JSON, all fields optional — same shape as `POST` above; pass `resumeId: null` to unlink.
- **Response format:** `200` → `{ "application": Application }`
- **Error responses:**
  - `400` — company/role emptied out, invalid status, invalid date, or `resumeId` not owned by the caller
  - `401` — not authenticated
  - `404` — application not found or not owned by the caller

## DELETE /api/applications/:id

- **Purpose:** Delete an application.
- **Authentication:** Required (session cookie).
- **Response format:** `200` → `{ "ok": true }`
- **Error responses:** `401` / `404` (not found or not owned)

## POST /api/auth/verify-email

- **Purpose:** Consume an email-verification token from the emailed link.
- **Authentication:** None required (token in body is the credential).
- **Request format:** JSON — `{ "token": string }`
- **Response format:** `200` → `{ "message": string }`
- **Error responses:** `400` — missing/invalid/expired/already-used token

## POST /api/auth/resend-verification

- **Purpose:** Resend the verification email for the signed-in user.
- **Authentication:** Required (session cookie).
- **Response format:** `200` → `{ "message": string }`
- **Error responses:**
  - `401` — not authenticated
  - `404` — account not found
  - `429` — rate limited (3/hour)
  - `502` — email send failed

## GET /api/account

- **Purpose:** Fetch the signed-in user's account info (name, email, verification status, created date).
- **Authentication:** Required (session cookie).
- **Response format:** `200` → `{ "user": { id, name, email, emailVerified, createdAt } }`

## PATCH /api/account

- **Purpose:** Update the signed-in user's display name.
- **Authentication:** Required (session cookie).
- **Request format:** JSON — `{ "name"?: string }`
- **Response format:** `200` → `{ "user": { id, name, email } }`
- **Error responses:** `400` — name too long

## DELETE /api/account

- **Purpose:** Permanently delete the signed-in user's account and everything owned by it.
- **Authentication:** Required (session cookie); password required in body.
- **Request format:** JSON — `{ "password": string }`
- **Response format:** `200` → `{ "ok": true }`
- **Error responses:** `400` — missing password; `401` — incorrect password

## PATCH /api/account/password

- **Purpose:** Change the signed-in user's password.
- **Authentication:** Required (session cookie).
- **Request format:** JSON — `{ "currentPassword": string, "newPassword": string }`
- **Response format:** `200` → `{ "message": string }`
- **Error responses:** `400` — new password under 8 characters; `401` — current password incorrect

## GET /api/account/export

- **Purpose:** Download all data owned by the signed-in user (profile, resumes, applications) as JSON.
- **Authentication:** Required (session cookie).
- **Response format:** `200` → JSON file, `Content-Disposition: attachment`

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
