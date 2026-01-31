# Draft: Mission completion → app-preview navigation

## Requirements (confirmed)
- After completing all missions, the app should navigate to `app-preview` but currently does not.
- Need a precise plan to identify the missing transition and implement it.
- Plan must include: files to touch, investigation/implementation steps, and a test plan.

## Current Observations (from repo scan)
- Next.js App Router routes exist:
  - `app/workspace/page.tsx` → renders `components/features/workspace.tsx`
  - `app/app-preview/page.tsx` → renders `components/features/app-preview`
- In `lib/simulation-context.tsx`:
  - There is a `Step` union that includes `'app-preview'`.
  - Mission completion path (PRD review stages) sets `reviewStage` to `'done'` and shows a success popup.
  - `closeSuccessPopup()` currently does `setShowSuccessPopup(false); setStep('app-preview');` (no router navigation).
- Existing navigation elsewhere uses `next/navigation` router pushes (e.g. `components/features/intro.tsx` pushes `/workspace`).

## Likely Root Cause (hypothesis)
- The app uses *both* internal state (`step`) and URL routes. Setting `step` to `'app-preview'` does not change the URL, so the UI remains on `/workspace`.
- There is likely a missing `router.push('/app-preview')` or a missing global “sync step → route” effect.

## Scope Boundaries
- INCLUDE: Fix the missing transition so mission completion reliably ends up on `/app-preview`.
- EXCLUDE (unless user asks): redesigning completion UX, adding new missions, changing mission evaluation logic.

## Open Questions
- Should navigation to `/app-preview` be automatic immediately after final mission completion, or only after user clicks the success popup CTA?
- Is `app-preview` expected to be accessible by direct URL even if missions aren’t completed (route guard or not)?
- Which app is the source of truth: Next.js app (root) vs the legacy `simulearn/src` app (appears to be a separate build)?

## Research Findings
- Pending: explore agent (codebase patterns) and librarian agent (best practices).
