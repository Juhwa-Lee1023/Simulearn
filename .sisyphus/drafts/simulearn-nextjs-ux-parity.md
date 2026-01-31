# Draft: Simulearn → Next.js 16 UX/Design Parity

## Core Objective (stated)
- Port simulearn (Vite+React) to Next.js 16 App Router while keeping **design and UX flow identical** to the original.

## Requirements (confirmed)
- UX flow must match simulearn:
  - `job-selection → difficulty-selection → intro → level-1-task → app-preview → completion`
- Current Next.js flow diverges and must be corrected:
  - Currently: `... → level-1-task → level-2-dev-inquiry → completion`
  - Missing: `app-preview` step (present in simulearn)
- Create missing Next.js artifacts:
  - `components/features/app-preview.tsx` (port from simulearn)
  - `app/app-preview/page.tsx` (route)
- Fix `closeSuccessPopup` behavior:
  - simulearn: `setStep('app-preview')`
  - Next.js port currently: `setStep('level-2-dev-inquiry')`
- Remove macOS frame from `MainLayout`:
  - Remove traffic-light buttons/titlebar/window frame styling
  - Keep only content area
- Keep LLM API handling via `/api/feedback` (intentional; do NOT revert to client heuristics)
- Step type must include `'app-preview'` (currently missing)

## Known Target Files (user-provided)
1. `lib/simulation-context.tsx` — add `'app-preview'` to Step type; fix `closeSuccessPopup`
2. `components/layout/main-layout.tsx` — remove macOS frame
3. `components/features/app-preview.tsx` — create
4. `app/app-preview/page.tsx` — create

## Scope Boundaries (initial)
- INCLUDE: App preview step + UI parity adjustments + step typing + flow fix
- EXCLUDE: Reverting LLM API behavior; changing UX beyond parity needs

## Open Questions
- Should `level-2-dev-inquiry` remain accessible as an optional/hidden route, or be removed entirely?
- Verification strategy: add automated tests (if infra exists) vs Playwright-only smoke checks?

## Plan Generated
- Plan saved to: `.sisyphus/plans/simulearn-nextjs-ux-parity.md`

## Research Findings
- **Test infrastructure**: none detected.
  - No `test` script in `package.json` (Next.js app) nor in `simulearn/package.json`.
  - No Jest/Vitest/Playwright/Cypress configs or existing `*.test.*` / `*.spec.*` / `__tests__`.
- **Next.js step machine location**: `lib/simulation-context.tsx`
  - Step stored in React state + persisted to `localStorage`.
  - Current Step union: `'job-selection' | 'difficulty-selection' | 'intro' | 'level-1-task' | 'level-2-dev-inquiry' | 'completion'`.
  - `closeSuccessPopup` currently routes to `level-2-dev-inquiry`.
  - `submitPrd` in `level-2-dev-inquiry` branch routes directly to `completion` today.
- **Where level-2-dev-inquiry is entered**: Workspace success modal uses `closeSuccessPopup`.
- **Simulearn AppPreview source of truth**:
  - `simulearn/src/components/features/AppPreview.tsx` (uses `setStep` from simulation context; no props)
  - Asset: `simulearn/public/ddujjonku.png`
  - Entry: `closeSuccessPopup()` sets step to `app-preview`
  - Exit CTA: button calls `setStep('completion')`
- **MainLayout macOS frame source**: `components/layout/main-layout.tsx`
  - Faux window shell: rounded white card + shadow + ring + 16:10 aspect
  - Titlebar: `h-8 bg-zinc-100 border-b` + traffic-light circles + “Simulearn v1.0”
  - Used by pages: `app/page.tsx`, `app/intro/page.tsx`, `app/workspace/page.tsx`, `app/difficulty/page.tsx`, `app/completion/page.tsx`, `app/admin/page.tsx`
