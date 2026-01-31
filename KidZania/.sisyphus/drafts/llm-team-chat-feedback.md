# Draft: Team chat feedback calls LLM every submission

## Requirements (confirmed)
- Goal: Team chat feedback should call an LLM API *every time* so that even the same PRD submission yields different feedback text.
- Context: Working on simulearn porting project, Wave 3 (Core Logic).
- Existing flow: `submitPrd` in `lib/simulation-context.tsx` controls reviewing state and stage transitions (designer → developer → qa → done) and includes a `level-2-dev-inquiry` step.
- Existing UI must remain: progress bar, mental gauge, and the overall review-stage flow.
- Existing API available: `app/api/feedback/route.ts` accepts `{ prdContent, reviewStage, stageAttempts }` and returns `{ passed, message, senderId }` (parsed from LLM response) using persona system prompts.
- Changes requested:
  - `submitPrd` becomes async and calls `/api/feedback`.
  - Replace hardcoded pass/fail logic with LLM response.
  - Replace hardcoded messages with LLM-generated messages.
  - In `level-2-dev-inquiry`, developer follow-up question should also be LLM-generated.
  - Optional: `triggerHelp` hints become dynamically generated.
- Constraints:
  - Next.js App Router
  - Keep React Context pattern
  - Keep existing type definitions (Message, ReviewStage, etc.)
  - Use higher temperature to encourage variation
- Success criteria:
  - Same PRD submitted multiple times → different feedback messages each time.
  - Persona characteristics reflected in feedback.
  - Build succeeds.

## Scope Boundaries
- INCLUDE: Wiring `submitPrd` to `/api/feedback`, stage transition logic driven by API response, LLM-generated messages for feedback and dev inquiry.
- OPTIONAL: Dynamic `triggerHelp` hints.
- EXCLUDE (not specified yet): Any UI redesign, new personas, new stages, database persistence.

## Technical Decisions (pending)
- How to ensure variation: temperature only vs. temperature + nonce prompt strategy.
- Whether pass/fail must remain stable across retries (wording varies) or can fluctuate.
- Client fetch caching strategy and error fallback behavior.

## Research Findings
- (pending) Await librarian agent.

## Open Questions
- Should pass/fail decisions be deterministic for the same PRD (only message varies), or is varying pass/fail acceptable?
- What should happen on LLM/API failure (retry? fallback message? freeze stage?)
- Should `triggerHelp` dynamic generation be included now, or deferred?
