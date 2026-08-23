# File Processing

Implemented for resume import: `POST /api/profile/parse-resume`
(`app/api/profile/parse-resume/route.ts`). No file is ever written to
disk or the `uploads/` folder — the upload is read into memory, parsed,
and discarded; the endpoint returns a draft for the client to review, it
does not touch the database. See [FEATURES.md](../FEATURES.md) for full
test evidence (real hand-built PDF and DOCX test files, exercised through
the actual HTTP endpoint, under both dev and a production build).

## PDF upload

Implemented. Text extraction via `pdf-parse` (`lib/resumeParse.ts`,
`extractResumeText`). Requires `serverExternalPackages: ["pdf-parse",
"pdfjs-dist"]` in `next.config.ts` — without it, `pdf-parse`'s worker
module fails to resolve under Turbopack's bundled server output (a
known Next.js/pdfjs-dist interaction, not specific to this app's code).
`pdf-parse` also inserts `"-- N of M --"` page-separator text into the
extracted output; `extractResumeText` strips it before parsing so it
doesn't get picked up as resume content.

## DOCX upload

Implemented. Text extraction via `mammoth`
(`extractResumeText`/`extractRawText`).

## Image upload

**Not implemented.** No image upload path exists anywhere in the app
(no avatar/photo upload, no image-based resume import). Not planned
unless requested.

## OCR

**Not implemented.** A resume that's a scanned image (no extractable
text layer) returns `422` with an explicit "may be a scanned image"
message rather than silently failing or returning empty results — the
client surfaces this to the user instead of pretending it worked. No
OCR library is used or planned; adding OCR would be a real dependency
addition to evaluate if this becomes a common case.

## Text extraction

Implemented, `lib/resumeParse.ts`, `extractResumeText(buffer, filename)`
— branches on file extension (`.pdf` → `pdf-parse`, `.docx` →
`mammoth`), throws for anything else (the route layer rejects other
extensions before this is reached, so this is a defensive second check).

## Resume parsing

Implemented, `lib/resumeParse.ts`, `parseResumeText(text)`. Heuristic,
not ML-based:

- Detects section headers (Summary/Objective/Profile, Experience/Work
  Experience, Education, Skills) by exact line match against a known
  list, case-insensitive.
- Splits each section's lines into per-entry blocks anchored on
  date-range line positions (`title, date, description...` pattern),
  with a per-section expected header length — 1 line for experience
  ("Title — Company"), 2 for education (institution then degree often
  land on separate lines) — since neither PDF extraction (usually drops
  blank lines) nor DOCX extraction (adds one after every paragraph)
  reliably preserves blank lines as entry separators.
- Extracts email and phone via regex across the full text.
- Extracts a rough `startDate`/`endDate` guess (`YYYY-01`, month always
  defaulted to January since only years are reliably parseable from
  free text) from each detected date range, plus an `current`/`present`
  flag.
- Returns a **draft only** — the parse-resume endpoint never writes to
  the database. The `/profile/import` UI shows every detected field in
  the same editable form components used elsewhere in the app, and each
  item is added to the real profile individually, only when the user
  clicks to add it. This is deliberate: heuristic parsing is imperfect
  by nature (see the two real bugs it produced during testing, recorded
  in `CHANGELOG.md`), so nothing from it becomes real profile data
  without a human confirming it first.

## File validation

Implemented in the route handler (not delegated to the parsing library):
rejects requests with no file (`400`), files over 5MB (`400`), and any
extension other than `.pdf`/`.docx` (`400`) — checked before the file
contents are ever read.

## File size limits

5MB (`MAX_FILE_BYTES` in `app/api/profile/parse-resume/route.ts`).

## Secure storage

Not applicable in the way originally scoped — there is no persistent
file storage to secure, because uploaded files are never persisted.
The upload exists only for the duration of one request (in memory,
converted to a `Buffer`) and is discarded once parsed. This exceeds the
original "no public URLs to user files" requirement by not storing
files at all; `uploads/` remains an unused, gitignored placeholder
directory from the original scaffold.

## Processing flow

1. Authenticated `POST` with `multipart/form-data`, field name `file`.
2. Route validates presence, size, extension.
3. File read into a `Buffer` (no disk write).
4. `extractResumeText` → plain text (PDF or DOCX branch).
5. If no extractable text, `422` (likely a scanned image).
6. `parseResumeText` → structured draft (email, phone, summary, skills,
   experience[], education[]).
7. Draft returned as JSON; nothing persisted server-side.
8. Client (`components/ResumeImport.tsx`) renders the draft in editable
   form components; each item is saved to the real profile individually
   via the existing `/api/profile/*` endpoints when the user confirms it.
