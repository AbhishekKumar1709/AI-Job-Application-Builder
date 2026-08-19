# Features

This file tracks each feature as it's built. Statuses: Planned / In
Progress / Complete / Needs Testing / Blocked.

## Landing page

- **Description:** Static marketing/roadmap page shown at `/`. Explains
  what the product will do and links to the roadmap; no functional
  sign-up/login yet (none of its buttons/links are placeholders — the
  "See what's planned" link scrolls to the on-page roadmap section, and
  "View source on GitHub" links to the real repo).
- **Status:** Complete
- **Dependencies:** none
- **Related files:** `app/page.tsx`, `components/Hero.tsx`,
  `components/Roadmap.tsx`, `components/SiteHeader.tsx`,
  `components/SiteFooter.tsx`
- **API requirements:** none
- **Database requirements:** none
- **Testing status:** Manually verified — `npm run build` passes, page
  loads at localhost and on the Vercel deployment.

## Master profile

- **Description:** Canonical store of a user's work history, education, and
  skills, reused across resumes/cover letters.
- **Status:** Planned
- **Dependencies:** Auth, database schema
- **Related files:** —
- **API requirements:** —
- **Database requirements:** New `Profile`/`Experience`/`Education` models
- **Testing status:** —

## Resume builder

- **Description:** Create and edit a resume from the master profile or from
  scratch.
- **Status:** Planned
- **Dependencies:** Master profile, templates
- **Related files:** —
- **API requirements:** —
- **Database requirements:** `Resume` model
- **Testing status:** —

## Resume templates

- **Status:** Planned

## Resume upload / parsing (PDF, DOCX)

- **Status:** Planned

## AI resume optimization

- **Status:** Planned
- **Dependencies:** AI provider integration

## ATS compatibility analysis

- **Status:** Planned
- **Dependencies:** AI provider integration

## Job description matching

- **Status:** Planned
- **Dependencies:** AI provider integration

## Cover letter generation

- **Status:** Planned
- **Dependencies:** AI provider integration

## Application tracker

- **Status:** Planned
- **Dependencies:** Auth, database schema

## PDF export

- **Status:** Planned
