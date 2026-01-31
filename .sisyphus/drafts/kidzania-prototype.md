# Draft: KidZania prototype (v0.1.0)

## Sources
- PROTOTYPE_SPEC: `PROTOTYPE_SPEC.md` (2026-01-31)

## Requirements (confirmed)
- Prototype surface: **Web app**
- Multi-agent persona behavior: **LLM-backed**
- Persistence: **Local persistence** (state/progress + artifacts)
- Verification expectation: **Manual QA only** (still include a test plan outline)
- Spec incompleteness handling: **Finalize spec first** (fill placeholders before building)

## Requirements (from PROTOTYPE_SPEC.md)
- Main layout:
  - Left main pane: messenger (Slack/Teams-like) + document editor
  - Right sidebar (LMS role): Quick Tips contextual guidance + progress tracker (기획→디자인→개발→QA→배포)
- Core feature priorities:
  - P0: Virtual collaboration dashboard (dual-pane UI)
  - P1: Multi-agent personas (senior dev reviewer, UI/UX designer, business stakeholder)
  - P2: Simulation flow: role+difficulty selection → mission trigger → interactive artifact creation + feedback loop
- User flow example (IT service planner): mission via manager message about "장바구니 쿠폰 자동 적용" PRD draft; dev AI asks edge-case questions; sidebar tips about happy/abnormal paths
- Differentiators (Witty add-ons): mental gauge + coffee break recovery; branching endings; final report analysis

## Open Questions
- LLM provider/runtime constraints (API choice, keys, offline/dev stub)
- Minimum set of roles + scenarios required for v0.1.0 demo
- Whether differentiators (mental gauge, branching endings, final report) are required in v0.1.0 or stretch
- Persistence storage mechanism constraints (localStorage vs indexedDB vs file-based) depending on stack
- Definition of Done for prototype demo (what must be clickable/functional vs mocked)

## Scope Boundaries (initial)
- INCLUDE: UI shell, mission simulation loop, persona-based interactions, contextual tips, progress tracking, local persistence
- EXCLUDE (until clarified): unspecified backends/APIs, real integrations, broad role library beyond minimum demo set
