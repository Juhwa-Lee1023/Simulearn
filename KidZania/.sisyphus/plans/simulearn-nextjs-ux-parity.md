# Simulearn → Next.js 16 App Router: UX/Design Parity Plan

## TL;DR

> **Quick Summary**: Restore simulearn’s original UX flow by reintroducing the missing `app-preview` step + route, fixing step transitions/persistence, and removing the macOS-style window chrome from `MainLayout`, while **explicitly preserving** the Next.js `/api/feedback` LLM API behavior.
>
> **Deliverables**:
> - New `AppPreview` feature component and `/app-preview` route
> - Simulation step machine updated to include `app-preview` and correct transition(s)
> - `MainLayout` updated to remove macOS window frame (traffic lights/title bar/chrome)
> - Automated verification commands (build + curl-based sanity + `/api/feedback` non-regression)
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES (2 waves)
> **Critical Path**: Step machine changes → `/app-preview` screen → wiring transitions → verify

---

## Context

### Original Request
Korean user request (summarized): simulearn과 현재 Next.js UX Flow가 다르다. LLM API를 통해 결과를 확인하는 부분은 유지하면서, 디자인을 완전 똑같이 구현하고 macOS 특유의 테두리(윈도우 프레임)는 지워달라.

### Known Flow Difference
- **Simulearn (source of truth)**: `job-selection → difficulty-selection → intro → level-1-task → app-preview → completion`
- **Current Next.js port**: `job-selection → difficulty-selection → intro → level-1-task → level-2-dev-inquiry → completion`

### Non-negotiable constraint
- Keep LLM API handling via `/api/feedback` as-is (do **not** revert to client heuristics).

### Repo Findings (evidence)
- Step machine + persistence is in: `lib/simulation-context.tsx`
  - Step is React state + persisted to `localStorage`.
  - `closeSuccessPopup` currently routes to `level-2-dev-inquiry`.
- Simulearn AppPreview reference implementation:
  - `simulearn/src/components/features/AppPreview.tsx`
  - Asset used: `simulearn/public/ddujjonku.png`
  - Entry: `closeSuccessPopup()` sets step to `app-preview`
  - Exit CTA: `setStep('completion')`
- MainLayout chrome source: `components/layout/main-layout.tsx`
  - Used by: `app/page.tsx`, `app/intro/page.tsx`, `app/workspace/page.tsx`, `app/difficulty/page.tsx`, `app/completion/page.tsx`, `app/admin/page.tsx`
- Testing infra: none present (no test scripts/configs/tests; no Playwright).

---

## Work Objectives

### Core Objective
Make the Next.js 16 App Router port’s **UX flow and screen visuals match simulearn**, with the explicit exception that we also remove the macOS window chrome per user request.

### Concrete Deliverables
- `components/features/app-preview.tsx` (new, ported)
- `app/app-preview/page.tsx` (new route)
- `lib/simulation-context.tsx` updated:
  - Step union includes `app-preview`
  - `closeSuccessPopup` targets `app-preview`
  - persistence migration handles old values safely
- `components/layout/main-layout.tsx` updated to remove macOS window frame

### Definition of Done
- [ ] The primary flow matches: `job-selection → difficulty-selection → intro → level-1-task → app-preview → completion`
- [ ] `/app-preview` route is reachable and renders the expected UI
- [ ] macOS-style title bar/traffic lights are removed from MainLayout (as agreed)
- [ ] `/api/feedback` still responds successfully (non-regression)
- [ ] `npm run build` exits 0

### Must NOT Have (guardrails)
- Must NOT revert to client-side heuristic feedback checking.
- Must NOT introduce new steps/features beyond parity (no “extra” UX additions).
- Must NOT create a two-way route↔step sync loop causing back-button traps.

---

## Verification Strategy (no existing test infra)

### Decision
- **Infrastructure exists**: NO
- **User wants tests**: [DECISION NEEDED]
  - Option A (recommended): Add Playwright smoke checks for flow-critical pages.
  - Option B: No test infra changes; use build + curl-based route/HTML sanity checks.

### Minimum automated checks (required even if no tests)

1) **Build**
```bash
npm run build
# Expect: exit 0
```

2) **/api/feedback non-regression (status + JSON object)**
```bash
# with dev server running on :3000
curl -s -X POST http://localhost:3000/api/feedback \
  -H "content-type: application/json" \
  -d '{"prompt":"ping","context":{}}' \
  | jq -e 'type=="object"'
# Expect: jq exit 0
```
> Note: If `/api/feedback` requires a different payload shape, update this command in the plan during implementation.

3) **Route availability**
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/app-preview
# Expect: 200
```

4) **Deprecation check (no primary flow reference to removed steps)**
```bash
grep -R "level-2-dev-inquiry" -n app lib components
# Expect: either 0 matches, OR matches only in explicitly approved legacy/debug sections
```

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (foundation, can run in parallel):
- Task 1: Step model + persistence migration plan + transition updates (context)
- Task 2: Port AppPreview feature UI (component + asset)
- Task 3: MainLayout chrome removal (layout)

Wave 2 (integration):
- Task 4: Add `/app-preview` route page and wire routing/step sync
- Task 5: Remove/contain `level-2-dev-inquiry` from primary flow (as decided)
- Task 6: Automated verification commands (build + curl + grep; optional Playwright)

Critical Path: Task 1 → Task 4 → Task 6

---

## TODOs

> Notes:
> - References below are the primary “map” for the executor.
> - All verification steps must be agent-executable.

### 1) Add `app-preview` to Step model + migrate persisted state

**What to do**:
- Update `Step` union in `lib/simulation-context.tsx` to include `'app-preview'`.
- Add a persistence migration/validation layer so old localStorage values can’t crash the app:
  - If stored step is unknown: coerce to `'job-selection'` (or another safe start).
  - If stored step is `'level-2-dev-inquiry'` and we remove it: coerce to `'app-preview'` (or `'level-1-task'`) — depends on decision.
- Update `closeSuccessPopup` to set step to `'app-preview'` (and close modal).

**Must NOT do**:
- Don’t introduce complex state machines or new abstractions; keep changes minimal.
- Don’t change `/api/feedback` logic.

**References (why they matter)**:
- `lib/simulation-context.tsx` — defines `Step`, persistence, `closeSuccessPopup`, and `submitPrd` branching.
- `components/features/workspace.tsx` — invokes `closeSuccessPopup` and contains step-specific effects.
- Simulearn reference: `simulearn/src/lib/simulation-context.tsx` — expected semantics of `closeSuccessPopup → app-preview`.

**Acceptance Criteria**:
- [ ] App compiles (TypeScript) with new Step value.
- [ ] If localStorage contains an unknown step value, app loads and defaults safely.
- [ ] `closeSuccessPopup` no longer routes to `level-2-dev-inquiry`; it transitions to `app-preview`.

---

### 2) Port AppPreview UI into Next.js component

**What to do**:
- Create `components/features/app-preview.tsx` by porting from `simulearn/src/components/features/AppPreview.tsx`.
- Ensure styling/animations match as closely as possible:
  - Copy any mock data constants (e.g., store list) as-is.
  - Keep copy/labels identical.
- Add/port the referenced image asset:
  - Copy `simulearn/public/ddujjonku.png` into Next.js `public/` (path preserved or adapted).
- Ensure the CTA transitions to completion:
  - Simulearn behavior: button calls `setStep('completion')`.
  - In Next.js, also ensure route navigation to `/completion` is handled (either here or in the page wrapper).

**Must NOT do**:
- Don’t introduce new visual styles; match simulearn.
- Don’t refactor unrelated CSS or design system.

**References (why they matter)**:
- `simulearn/src/components/features/AppPreview.tsx` — exact UI structure and behavior.
- `simulearn/public/ddujjonku.png` — exact visual asset.
- `components/features/*` (existing Next feature components) — patterns for client components and Tailwind usage.

**Acceptance Criteria**:
- [ ] Component renders without runtime errors.
- [ ] Asset loads correctly from Next `/public`.
- [ ] CTA triggers transition toward completion (step and route).

---

### 3) Remove macOS window chrome from MainLayout

**What to do**:
- Update `components/layout/main-layout.tsx` to remove the macOS title bar:
  - Remove traffic-light circles.
  - Remove “Simulearn v1.0” title bar area.
- Keep the “content area” sizing/centering consistent:
  - Preserve outer centering + background if those are still desired.
  - Ensure children still get a stable container (avoid unexpected scrollbars).

**Decision needed**:
- Should we also remove (or reduce) the window-like **shadow/ring/rounded shell**, or only the title bar/traffic lights?
  - Default (minimal): remove title bar + traffic lights only.

**References (why they matter)**:
- `components/layout/main-layout.tsx` — contains all chrome markup.
- Usage sites: `app/page.tsx`, `app/intro/page.tsx`, `app/workspace/page.tsx`, `app/difficulty/page.tsx`, `app/completion/page.tsx`, `app/admin/page.tsx` — ensures blast radius is understood.

**Acceptance Criteria**:
- [ ] No traffic-light circles/title bar visible anywhere MainLayout is used.
- [ ] Pages still render with correct sizing; no broken overflow.

---

### 4) Add `/app-preview` route and wire step↔route behavior

**What to do**:
- Create `app/app-preview/page.tsx`.
- Render the AppPreview feature component within the same providers/layout approach used by other steps.
- Ensure navigation into `/app-preview` is triggered when step becomes `app-preview`.
  - Recommended minimal approach (consistent with current code):
    - Keep step as the “state”; when setting step to `app-preview` from `/workspace`, perform `router.push('/app-preview')` in the caller site (likely `components/features/workspace.tsx`), or via a guarded effect that observes step changes.
- Ensure exit from AppPreview goes to completion:
  - `setStep('completion')` and `router.push('/completion')`.

**Guardrail**:
- Avoid two-way sync loops. Pick one direction:
  - **Option A**: Step changes drive routing (preferred given current pattern).
  - **Option B**: Route is canonical and sets step on load.

**References (why they matter)**:
- Existing navigation patterns:
  - `components/features/difficulty-selection.tsx` — `setStep('intro')` + `router.push('/intro')`.
  - `components/features/intro.tsx` — `setStep('level-1-task')` + `router.push('/workspace')`.
- `components/features/workspace.tsx` — already contains step-driven effects; best place to add a guarded `app-preview` transition.

**Acceptance Criteria**:
- [ ] `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/app-preview` outputs `200` with dev server running.
- [ ] Setting step to `app-preview` actually navigates user to `/app-preview`.

---

### 5) Remove `level-2-dev-inquiry` from the primary flow (parity fix)

**What to do**:
- Ensure the primary sim flow never transitions to `level-2-dev-inquiry`.
  - Update `closeSuccessPopup` as per Task 1.
- Decide what to do with the existing step/route:
  - **Option 1 (recommended for parity)**: Remove the step value and any UI/effects for it.
  - **Option 2**: Keep route/step for future but ensure it is not reachable from normal flow.

**References (why they matter)**:
- `lib/simulation-context.tsx` — currently defines the step and direct transitions.
- `components/features/workspace.tsx` — currently reacts to `step === 'level-2-dev-inquiry'`.

**Acceptance Criteria**:
- [ ] `grep -R "level-2-dev-inquiry" -n app lib components` is either empty, or restricted to explicitly approved legacy/debug code.

---

### 6) Verification pass (agent-executable)

**What to do**:
- Run:
  - `npm run lint` (if configured)
  - `npm run build`
- Start dev server and run:
  - `/app-preview` 200 check
  - `/api/feedback` non-regression curl + jq check

**Optional (recommended if “tests yes”)**:
- Add Playwright smoke checks verifying:
  - `/intro`, `/workspace`, `/app-preview`, `/completion` render and have stable selectors
  - flow-critical CTA buttons exist
> Note: This repo currently has no Playwright; installing it is a scope increase and requires confirmation.

**Acceptance Criteria**:
- [ ] `npm run build` exits 0.
- [ ] `/api/feedback` returns JSON object for the agreed payload.
- [ ] `/app-preview` returns HTTP 200.

---

## Decisions Needed (to finalize behavior)

1) **What happens to `level-2-dev-inquiry`?**
   - Remove entirely vs keep but unreachable vs keep for admin/debug.

2) **Route vs Step canonical source of truth?**
   - Default in this plan: step drives route (matches current pattern).

3) **MainLayout chrome removal depth**
   - Default in this plan: remove title bar/traffic lights only; keep container sizing.

4) **Do we add Playwright smoke checks?**
   - Default in this plan: no (unless you want stronger automated UX verification).
