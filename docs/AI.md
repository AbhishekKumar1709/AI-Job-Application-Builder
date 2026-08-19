# AI

**Not implemented yet.** No AI provider is integrated, no API key is
configured, and no AI-backed feature exists in the code. This document
records the plan so it can be built against later.

## AI provider architecture (planned)

No provider selected yet.

## AI prompts (planned)

None written yet.

## AI features (planned)

- Resume optimization suggestions
- Job description analysis
- ATS compatibility analysis
- Cover letter generation

## Hallucination prevention / truth rules (planned)

Principle to design against: the AI must never invent work history, dates,
titles, or metrics that aren't in the user's master profile or source
resume. Any AI-suggested addition to factual content should be flagged for
user review rather than inserted silently. Concrete rules will be written
once the feature is implemented.

## Token / cost considerations (planned)

Not evaluated yet — no provider or usage pattern chosen.

## API keys

Never commit API keys. When a provider is chosen, its key will be read from
an environment variable documented in `.env.example`, never hardcoded.
