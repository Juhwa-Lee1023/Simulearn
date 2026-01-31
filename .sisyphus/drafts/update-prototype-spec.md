# Draft: Update PROTOTYPE_SPEC.md to reflect current implementation

## User Request (verbatim)
- Produce a precise plan to update `PROTOTYPE_SPEC.md` to reflect implemented changes.
- Expected: step-by-step edit plan, list of sections to change, exact data to insert.
- Must base on current implementation: step flow, AI personas, Claude API, mental gauge, persistence, QA.
- Must not edit files (plan only).

## Working Assumptions (to validate)
- `PROTOTYPE_SPEC.md` exists and is the canonical spec to update.
- “Implemented changes” are represented in the current codebase (not only in PR discussions).
- “Claude API” refers to Anthropic Messages API usage (model name(s), request/response shape, streaming or not, retries).

## What I’m Investigating (via background agents)
- Step flow: screens/states/transitions as implemented.
- AI personas: where defined, how selected, prompt templates.
- Claude API integration details: auth, endpoints, model(s), streaming/tool use, error handling.
- Mental gauge: computation logic, thresholds, persistence, UI.
- Persistence: storage mechanism, schema, migrations if any.
- QA: test framework presence, manual QA scripts, smoke checks.

## Open Questions
- Which audience should the updated `PROTOTYPE_SPEC.md` serve (developers only vs stakeholders too)?
- Should the spec describe only current behavior, or also keep “future work / not implemented” sections?
- Any required formatting style (e.g., keep existing headings, add “Implemented as of <date>” notes)?

## Scope Boundaries
- INCLUDE: updating spec content (structure, headings, tables, sequences) to match current implementation.
- EXCLUDE: code changes, refactors, behavior changes.
