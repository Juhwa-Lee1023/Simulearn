# Draft: '답변 보내기' click does not reach final page

## Requirements (from user)
- Bug: After all issues are resolved, clicking **"답변 보내기"** does not navigate to the final page.
- Need: A **precise, step-by-step plan** to diagnose and fix.
- Need: Explore codebase patterns, locate button/action, identify step/navigation transitions to completion/final screen.
- Need: Provide a **parallel task graph** with dependencies.
- Need: List which **category + skills** to delegate each implementation task to.
- Need: Include a **test plan** with success criteria.

## Codebase Findings (explore results)

### Where the button lives
- `components/features/workspace/editor.tsx`
  - The **"답변 보내기"** button is defined here.
  - It pulls `submitPrd`, `step`, `reviewStage`, `isReviewing` from `useSimulation()`.
  - `onClick={submitPrd}` is the single handler.
  - Button UI/disabled behavior is tied to `isReviewing` and `step/reviewStage`.

### What the click triggers
- `lib/simulation-context.tsx`
  - Implements `submitPrd` (gating + async call + stage progression + persistence).
  - Gating highlights:
    - Ignores if `isReviewing` is true.
    - Runs for `step === 'level-1-task'` and `reviewStage !== 'done'` (per explore summary).
  - Async workflow:
    - `fetchFeedbackWithRetry(prdContent, reviewStage, stageAttempts)` calls `/api/feedback`.
    - On success, advances `reviewStage`: designer → developer → qa → done.
    - On failure, increments feedbackRound, reduces mentalGauge, increments stageAttempts, may trigger hint/help.
  - When QA passes and stage reaches `done`, it shows a success popup and restores mental gauge.
  - Closing success popup: `closeSuccessPopup` → `setStep('app-preview')`.
  - State persistence: changes saved to localStorage via `savePersistedState`.

### How “navigation” works (important)
- Later-stage transitions **do not use Next.js router**; they are **driven by context state** (`step`).
  - Preview screen: `components/features/app-preview.tsx`
    - “시뮬레이션 완료하기” button calls `setStep('completion')`.
  - Completion screen: `components/features/completion.tsx` rendered by `app/completion/page.tsx`.
  - Final route: `/completion`, but the UI shows it only when `step === 'completion'`.

### Other flow patterns
- Early steps keep route and state in sync via router.push:
  - `components/features/job-selection.tsx` → push `/difficulty`
  - `components/features/difficulty-selection.tsx` → push `/intro`
  - `components/features/intro.tsx` → push `/workspace`
  - Workspace is the staged review stepper (designer/developer/QA) bound to `reviewStage`.

## Likely Root-Cause Hypotheses (to validate)
- State mismatch: issues “resolved” in UI, but `reviewStage`/`step` not at expected values so `submitPrd` is gated (no-op).
- Button click fires, but `isReviewing` stuck true so handler returns early.
- Async feedback request never reaches “QA pass” or sets `reviewStage='done'`, so success popup never appears and `step` never transitions.
- Success popup appears but user expects direct navigation to `/completion` from “답변 보내기”; current intended flow is popup → app-preview → completion.
- localStorage persistence restores old state (e.g., `reviewStage='done'`) so clicking “답변 보내기” does nothing.
- Route/state desync: user is on `/completion` route but `step` is not `completion` so UI does not render completion component.

## Scope Boundaries (initial)
- INCLUDE: Fixing the navigation/flow from “답변 보내기” through success → preview → completion (or direct completion if product decision).
- EXCLUDE (unless user asks): Redesigning the entire simulation flow, changing feedback scoring logic, major UI rewrite.

## Open Questions (critical)
1. Expected behavior: Should **"답변 보내기"** go directly to `/completion`, or is **popup → app-preview → completion** intended?
2. Repro specifics: On which route and step does user click the button when it fails?
3. Observability: Are there console errors / failing network requests to `/api/feedback`?
4. Definition of “all issues resolved”: is it purely UI state, or tied to `reviewStage` becoming `done`?
