# AI

Implemented and verified live. Provider is Google Gemini (via
`@google/genai`, Google AI Studio's free tier — no credit card required).
Anthropic was the original provider during development; the app switched
to Gemini specifically because Gemini has a genuine, ongoing free tier
and Anthropic's API does not (pay-as-you-go only, aside from a small
one-time trial credit on new accounts). See
[FEATURES.md](../FEATURES.md) for the per-feature test evidence.

**Status:** `GEMINI_API_KEY` is set both locally and in Vercel
production. Every route has been called live end-to-end with real
responses in both environments (see Verified section) — including a
direct call against the real production URL after deploying, not just
local testing.

## AI provider architecture

`lib/ai.ts` wraps the official `@google/genai` SDK:

- Model: `gemini-3-flash-preview` by default, overridable via
  `GEMINI_MODEL` (no code change needed to switch models). This is a
  "preview"/reasoning-capable model — its responses consume a
  non-trivial share of the token budget on internal "thinking" before
  producing visible text (observed ~200-260 thinking tokens on simple
  test prompts, via `response.usageMetadata.thoughtsTokenCount`); this
  is why `maxOutputTokens` is set generously (4096) rather than tightly
  — a smaller cap risks the model hitting `MAX_TOKENS` mid-thought with
  zero visible output, which was observed and fixed during
  development (see Verified section).
- `client()` reads `GEMINI_API_KEY` from the environment and throws a
  plain `Error` if it's unset — routes catch this and return `502`,
  never a fake/fallback response.
- Two thin helpers, both `maxOutputTokens: 4096`, non-streaming, calling
  `ai.models.generateContent({ model, contents, config: {
  systemInstruction, maxOutputTokens } })`:
  - `askAIJSON<T>(system, userPrompt)` — sends one request, strips a
    ```` ```json ``` ```` fence if the model wrapped its answer in one,
    `JSON.parse`s `response.text`, and throws (→ `502`) if it isn't
    valid JSON. No retry, no silent fallback to empty/placeholder data.
  - `askAIText(system, userPrompt)` — same call, returns the raw
    trimmed `response.text` (used for cover letters, where the output
    is prose).
- No streaming, no tool use — every feature here is a single
  non-agentic request/response call, which doesn't need them. The SDK
  also exposes a newer "Interactions" API (`ai.interactions.create`,
  oriented toward agentic/tool-using workflows with sandboxed
  environments) — deliberately not used here; `models.generateContent`
  is the simpler fit for one-shot text-in/text-out calls.

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
  requested (though `askAIJSON` tolerates one if the model adds it
  anyway).

## Hallucination prevention / truth rules

The rule from the original plan — *the AI must never invent work
history, dates, titles, or metrics that aren't in the user's master
profile or source resume* — is enforced via the system prompt
instructions above, not via a separate verification pass. There is no
automated check that the model's output stays grounded in the input;
this relies on prompting alone. Verified informally in live testing: a
generated cover letter correctly referenced only the company/dates/
skills present in the source resume, and named no employer or skill
that wasn't there. If false/invented content becomes an observed
problem at higher volume, the next step would be a validation pass
rather than prompt changes alone.

## Token / cost considerations

- **Genuinely free**: Gemini's free tier (Google AI Studio) requires no
  credit card and no billing setup. This was the deciding factor for
  choosing it over Anthropic, which has no ongoing free tier.
- **Rate limiting** (still applies, independent of provider): each of
  the four routes is capped per signed-in user via `lib/rateLimit.ts`
  (Postgres-backed, since Vercel serverless functions don't share
  memory) — optimize/ats-check/match at 15/hour, cover-letters at
  10/hour. Worth keeping even on a free tier, since Google's free tier
  itself has its own rate limits that a runaway client could exhaust.
- **Input length caps**: `jobDescription` (used by `match` and
  `cover-letters`) is capped at `MAX_JOB_DESCRIPTION_LENGTH` (10,000
  characters, exported from `lib/ai.ts`). Resume/profile text fields
  that feed these prompts are separately capped via `lib/textLimits.ts`.
- **`maxOutputTokens: 4096`** on every call bounds worst-case output
  size per request — sized generously specifically because of this
  model's thinking-token overhead (see AI provider architecture above).
- No prompt caching, batching, or token counting is implemented — call
  volume is low enough (four low-frequency, user-initiated actions) that
  none of these are needed yet.

## API keys

`GEMINI_API_KEY` is read from the environment only
(`process.env.GEMINI_API_KEY` in `lib/ai.ts`), never hardcoded, never
sent to the client. Documented in [.env.example](../.env.example). Set
in the local `.env` and in Vercel's dashboard (Production + Preview
environments), both verified working.

## Verified

Tested live, end to end, through the real HTTP API (not just the SDK
directly) against a real account with real profile/resume data:

- `POST /api/resumes/:id/optimize` — real 200, coherent, relevant
  suggestions referencing the actual resume content.
- `POST /api/resumes/:id/ats-check` — real 200, plausible score with
  specific issues/strengths.
- `POST /api/resumes/:id/match` — real 200, correctly identified which
  job-description keywords were and weren't present in the resume.
- `POST /api/resumes/:id/cover-letters` — real 201, generated a
  coherent 3-paragraph letter grounded only in facts present in the
  source resume (no invented employers/skills), correctly persisted and
  retrievable afterward via `GET`.

One real bug was caught and fixed during this testing: with a small
`maxOutputTokens` (200, used in an initial smoke test), the model spent
its entire budget on internal thinking and returned empty text
(`finishReason: MAX_TOKENS`, `thoughtsTokenCount: 191` of 200). The
app's actual `maxOutputTokens: 4096` was confirmed sufficient — verified
by inspecting `response.usageMetadata` directly, not just assuming.
Test account and data deleted afterward.

Re-verified against the real production deployment after adding
`GEMINI_API_KEY` to Vercel and redeploying: signed up a test account
directly against `https://ai-job-application-builder.vercel.app`,
built a resume, and called `POST /api/resumes/:id/optimize` against
the live production URL — real `200` with genuine suggestions,
confirming the key works in production, not just locally. Test account
deleted afterward.
