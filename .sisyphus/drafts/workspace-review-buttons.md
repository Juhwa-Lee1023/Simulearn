# Draft: Workspace page review buttons too small

## Requirements (confirmed)
- On the workspace page, buttons with labels like `디자인 리뷰` / `개발자 리뷰` / `QA 리뷰` are too small.
- Increase their size.
- Provide a precise work plan with exact files to edit once identified.
- Include a test/verification checklist.
- Include category + skills delegation recommendations for implementation.

## Technical Decisions
- (TBD) How to increase size: padding/height/font-size/token override vs component variant.
- (TBD) Scope: only these review buttons vs all similar buttons on workspace page.

## Decisions (from user)
- Target app: **Next.js app (repo root)**.
- Target button: Workspace Editor review-request CTA with labels `디자이너 리뷰 요청` / `개발자 리뷰 요청` / `QA 검증 요청`.
- Sizing intent: **Increase typography + padding** (more prominent CTA).
- Scope strategy: **Local-only change** (avoid global Button variant side effects).

## Research Findings
- Codebase appears to contain **two UI implementations**:
  - Next.js app under repo root: `components/` + `package.json` (Next 16)
  - Vite bundle under `simulearn/`: `simulearn/src/...` + `simulearn/package.json` (Vite 6)

- **Next.js Workspace page**:
  - `components/features/workspace.tsx` renders `<Editor />`, `<Messenger />`, `<Sidebar />` and a success popup.
  - The “review request” button text appears in `components/features/workspace/editor.tsx` via `getButtonText()`:
    - `'디자이너 리뷰 요청'` / `'개발자 리뷰 요청'` / `'QA 검증 요청'`
  - The button is implemented at `components/features/workspace/editor.tsx` lines ~117–136 as:
    - `<Button ... size="md"> ... {getButtonText()} ... </Button>`

- **Shared Button component (Next.js)**:
  - `components/ui/button.tsx` defines `buttonVariants` with a base `text-sm` and `size` variants.
  - `size="md"` maps to `min-h-10 py-3 px-6 ...` (approx 40px min height).

- **Vite implementation appears parallel**:
  - Workspace file: `simulearn/src/components/features/Workspace.tsx`
  - Review request button text appears in `simulearn/src/components/features/workspace/Editor.tsx`.

- UX/accessibility sizing guidance:
  - WCAG 2.5.8 target size minimum: 24×24 CSS px (with spacing exceptions).
  - Common recommended touch target on touch devices: 44–48px.

## Open Questions
- Which app is the target for this change?
  - Next.js app (repo root `components/...`) vs Vite app (`simulearn/src/...`).
- Is the issue primarily:
  - touch target (height/padding),
  - font size,
  - both,
  - or layout constraints (container too tight)?
- Should the change apply only on workspace page, or globally for this button variant?
- Any design constraints: exact pixel target, density, or alignment with design system?

## Scope Boundaries
- INCLUDE: Adjust size of review-labeled buttons on workspace page; keep styling consistent; update tests/verification steps.
- EXCLUDE: Redesign of workspace layout; adding new features; broad typography overhaul (unless required for button size consistency).
