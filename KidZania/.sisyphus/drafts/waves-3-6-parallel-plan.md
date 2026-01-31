# Draft: Remaining Waves 3–6 Execution Plan (Parallel Task Graph)

## Requirements (confirmed)
- Remaining work to plan: Wave 3 (persistence strategy), Wave 4 (env validation, rate limiting, /admin, eslint/a11y), Wave 5 (Playwright + E2E + CI), Wave 6 (Vercel deploy + ops checks)
- Priority order: core functionality first (localStorage/session restore, env vars, rate limiting) → Admin → E2E → deployment
- Target total estimate: ~35h
- Stack: Next.js 16 App Router, Vercel deploy, Vercel KV (rate limiting + admin storage), Playwright (E2E)

## User Decisions (captured)
- /admin 접근 제어: Basic Auth (middleware + ENV)
- Rate limiting: IP 기준 + 3개 API(/api/claude, /api/feedback, /api/dev-inquiry)
- Persistence 범위: 최소(권장) — Job 선택 + Workspace 에디터 텍스트 + 현재 단계 저장/복원
- E2E 실행 대상: CI에서 로컬 웹서버(localhost) 대상으로 실행

## Known Current Structure (user-provided)
- app/api: claude, dev-inquiry, feedback route handlers
- app/(simulearn): layout + pages (job selection, intro, workspace, completion)
- components/features: job-selection, intro, workspace, completion, workspace subcomponents
- lib/simulation-context.tsx

## Technical Decisions (pending)
- /admin access control approach (no auth vs basic auth vs password gate vs real auth)
- Rate limiting algorithm + scope (per-IP vs per-user/session; per-route budgets)
- Persistence scope (which fields/parts of PRD autosave; how to version/migrate stored data)
- E2E runtime environment (local only vs CI headless; baseURL; seed data)

## Research Findings (pending)
- Explore agent (codebase):
  - `app/page.tsx`에 localStorage 기반 autosave/restore 선례 존재(단일 페이지)
  - API routes(`app/api/{claude,feedback,dev-inquiry}/route.ts`)는 현재 `process.env.ANTHROPIC_API_KEY`만 단순 if-guard
  - rate limiting / admin / Playwright / CI는 코드에 부재, `IMPROVEMENTS.md`에 계획만 존재
- Librarian agent (external):
  - env validation: zod 기반(@t3-oss/env-nextjs 또는 next-safe-env) 권장
  - rate limiting: Upstash/Vercel KV 기반 token bucket/sliding window, middleware 또는 route handler에서 적용
  - /admin 보호: middleware Basic Auth 패턴 가능(Edge runtime 제약 유의)
  - Playwright+CI: webServer로 next dev/start 띄우고 BASE_URL로 테스트, report artifact 업로드 권장

## Scope Boundaries (initial)
- INCLUDE: reliability + guardrails (env validation, rate limiting), admin dashboard, E2E coverage, CI wiring, deploy config
- EXCLUDE (unless user requests): full auth system (OAuth), multi-tenant admin, complex analytics pipeline

## Open Questions
1. Rate limiting 수치: 각 API별 한도(RPM/RPD)와 초과 시 UX(429/리트라이 안내)
2. Persistence 키/마이그레이션: localStorage key 버전 전략(예: v0.1→v0.2)
3. 운영 환경 변수 목록: ANTHROPIC + Vercel KV + Admin 계정(유저/패스) + (선택) salt/secret
