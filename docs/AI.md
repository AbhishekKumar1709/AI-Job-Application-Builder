# AI

Implemented. Provider is Anthropic (Claude); no other provider is used or
planned. **Not yet verified live** — `ANTHROPIC_API_KEY` isn't set in
production, so every route below is code-complete and tested for every
error path, but no request has actually reached Claude outside local
testing with a real key. See [FEATURES.md](../FEATURES.md) for the
per-feature test evidence.

## AI provider architecture

`lib/ai.ts` wraps the official `@anthropic-ai/sdk`:

- Model: `claude-opus-5` by default, overridable via `ANTHROPIC_MODEL`
  (no code change needed to switch models).
- `client()` reads `ANTHROPIC_API_KEY` from the environment and throws a
  plain `Error` if it's unset — routes catch this and return `502`,
  never a fake/fallback response.
- Two thin helpers, both `max_tokens: 4096`, non-streaming:
  - `askClaudeJSON<T>(system, userPrompt)` — sends one message, strips a
    ```` ```json ``` ```` fence if the model wrapped its answer in one,
    `JSON.parse`s the result, and throws (→ `502`) if it isn't valid
    JSON. No retry, no silent fallback to empty/placeholder data.
  - `askClaudeText(system, userPrompt)` — same call, returns the raw
    trimmed text (used for cover letters, where the output is prose).
- No streaming, no tool use, no extended thinking — every feature here
  is a single non-agentic request/response call, which doesn't need
  them.

## Features (implemented)

All four live under `/resumes/:id` ("AI tools" section) and are
resume-scoped:

- **Resume optimization** — `POST /api/resumes/:id/optimize`
  (`app/api/resumes/[id]/optimize/route.ts`). Returns a JSON array of
  `{ section, issue, suggestion }`.
- **ATS compatibility check** — `POST /api/resumes/:id/ats-check`
  (`.../ats-check/route.ts`). Returns `{ score, issues, strengths }`.
- **Job description matching** — `POST /api/resumes/:id/match`
  (`.../match/route.ts`). Returns `{ matchScore, matchedKeywords,
  missingKeywords, suggestions }`.
- **Cover letter generation** — `POST /api/resumes/:id/cover-letters`
  (`.../cover-letters/route.ts`). Returns prose text; this is the one
  output that's persisted (`CoverLetter` model) rather than recomputed
  each time, since it's a deliverable. Editable afterward via
  `PATCH .../cover-letters/:letterId`.

Optimization, ATS check, and match are all stateless — nothing is saved,
they're recomputed on every call. See [API.md](../API.md) for full
request/response shapes.

`lib/resumeText.ts` formats a resume's headline/summary/experience/
education/skills into plain-text prompt content, shared by all four
routes so the "what does the AI see" logic exists in one place.

## Prompts

Each route has its own system prompt (inline in the route file, not
externalized to a separate prompt library — there are only four, and
each is small). All four explicitly instruct the model:

- Do not invent facts, employers, skills, or metrics not present in the
  resume/profile data it was given.
- Respond with **only** the requested format (JSON object/array, or for
  cover letters, plain letter text) — no preamble, no markdown fences
  requested (though `askClaudeJSON` tolerates one if the model adds it
  anyway).

## Hallucination prevention / truth rules

The rule from the original plan — *the AI must never invent work
history, dates, titles, or metrics that aren't in the user's master
profile or source resume* — is enforced via the system prompt instructions
above, not via a separate verification pass. There is no automated check
that the model's output stays grounded in the input; this relies on
prompting alone. If false/invented content in AI output becomes an
observed problem, the next step would be a validation pass (e.g.
checking that named companies/dates in a generated cover letter appear in
the source resume) rather than prompt changes alone.

## Token / cost considerations

- **Rate limiting**: each of the four routes is capped per signed-in
  user via `lib/rateLimit.ts` (Postgres-backed, since Vercel serverless
  functions don't share memory) — optimize/ats-check/match at
  15/hour, cover-letters at 10/hour. This is the primary cost-control
  measure, since AI calls are the only endpoints in this app with a
  real per-request dollar cost.
- **Input length caps**: `jobDescription` (used by `match` and
  `cover-letters`) is capped at `MAX_JOB_DESCRIPTION_LENGTH` (10,000
  characters, exported from `lib/ai.ts`) — previously unbounded, which
  meant an arbitrarily large paste would be forwarded straight into a
  Claude prompt. Resume/profile text fields that feed these prompts
  (summary, descriptions, etc.) are separately capped via
  `lib/textLimits.ts`.
- **`max_tokens: 4096`** on every call bounds worst-case output cost per
  request.
- No prompt caching, batching, or token counting is implemented — call
  volume is low enough (four low-frequency, user-initiated actions) that
  none of these are needed yet.

## API keys

`ANTHROPIC_API_KEY` is read from the environment only
(`process.env.ANTHROPIC_API_KEY` in `lib/ai.ts`), never hardcoded, never
sent to the client. Documented in [.env.example](../.env.example). Not
yet set in Vercel production — see the top of this file.
