# Waves 3–6 Parallel Task Graph (Core → Admin → E2E → Deploy)

## TL;DR

> **Quick Summary**: Finish persistence + env guardrails + rate limiting first, then build a Basic-Auth protected /admin for ops/statistics, then lock quality with Playwright E2E in CI, and finally prepare Vercel deployment + ops checks.
>
> **Deliverables**:
> - Autosave/restore for minimal PRD state across (simulearn) pages
> - Schema-validated env layer (Anthropic + KV + Admin creds)
> - IP-based rate limiting for 3 API routes
> - `/admin` dashboard (stats + settings) protected by Basic Auth
> - Playwright E2E suite + CI workflow
> - Vercel deploy configuration + operational checklist
>
> **Estimated Effort**: ~35h
> **Parallel Execution**: YES (4 waves)
> **Critical Path**: Persistence → Env validation → Rate limiting → Admin → E2E → Deploy

---

## Context

### Original Request (User)
Remaining Waves 3–6 tasks should be reorganized into a parallel-executable task graph, with per-task agent recommendations (category + skills). Priorities: core features (localStorage, env validation, rate limiting) → Admin → E2E → deploy. Total ~35h.

### Interview Summary (Decisions)
- `/admin` protection: **Basic Auth** (middleware + ENV)
- Rate limiting: **IP-based** for **/api/claude**, **/api/feedback**, **/api/dev-inquiry**
- Persistence scope: **minimal** — **Job 선택 + Workspace 에디터 텍스트 + 현재 단계** autosave/restore
- E2E: CI에서 **로컬 웹서버(localhost)** 대상으로 실행

### Codebase Findings (Explore)
- Persistence 선례: `app/page.tsx`에 localStorage 기반 autosave/restore 구현이 존재 (단일 페이지)
- Env 사용 패턴: `app/api/{claude,feedback,dev-inquiry}/route.ts`에서 `process.env.ANTHROPIC_API_KEY`를 단순 if-guard
- Rate limiting / /admin / Playwright / CI 구현은 **현재 없음**
- 계획 문서: `IMPROVEMENTS.md`에 Wave 4–6 요구사항이 정리되어 있음

### External Best Practices (Librarian)
- env validation: zod 기반 env 레이어(@t3-oss/env-nextjs 또는 next-safe-env)로 서버/클라이언트 변수 구분
- rate limiting: KV/Redis 기반 sliding-window 또는 token-bucket; headers/429 처리; IP 추출 정확도(x-forwarded-for)
- /admin: middleware Basic Auth 가능(Edge runtime 제약 유의)
- Playwright: `webServer`로 next 실행 + `baseURL` 설정 + report artifact 업로드

---

## Work Objectives

### Core Objective
운영/품질을 위한 **상태 복원 + 구성 검증 + API 보호(레이트리밋)**를 먼저 완성하고, 이를 기반으로 **관리자 화면 + E2E + 배포**까지 연결한다.

### Must Have
- 최소 PRD 상태의 자동 저장/복원
- 필수 환경변수 누락 시 “즉시/명확한” 실패(개발/빌드/런타임 중 적절한 지점)
- IP 기반 rate limiting + 429 표준 응답
- Basic Auth로 보호되는 /admin
- CI에서 재현 가능한 Playwright E2E

### Must NOT Have (Guardrails)
- (범위 증가) OAuth/정식 인증 시스템 도입
- (범위 증가) 전체 상태(대화 전체/대용량) 무제한 localStorage 저장
- (품질 저하) 엔드포인트마다 제각각인 rate limit 정책(문서화 없이)

---

## Verification Strategy

이 프로젝트는 E2E(Playwright) 도입이 목표이므로, 핵심 기능은 **자동화 검증(Playwright + curl)** 중심으로 정의한다.

### Automated Verification Principles
- API: `curl`로 429/정상 응답 확인
- UI: Playwright로 “저장→리로드→복원” 및 기본 사용자 플로우 확인
- CI: GitHub Actions(또는 동일 CI)에서 웹서버 띄워 E2E 실행 및 리포트 업로드

---

## Execution Strategy (Parallel Waves)

### Wave 1 — Core Foundations (start immediately)
1) Persistence(autosave/restore) 설계+구현
2) Env validation 레이어 도입

### Wave 2 — API Guardrails (after Wave 1)
3) Rate limiting (3 API routes)

### Wave 3 — Admin (after Wave 2)
4) /admin UI + KV storage + Basic Auth middleware

### Wave 4 — Quality & Ops (after Wave 3)
5) ESLint/a11y 마무리
6) Playwright 설정 + E2E 3종 + CI 연동
7) Vercel 배포 설정 + 운영 체크

Critical Path: 1 → 2 → 3 → 4 → 6 → 7

---

## TODOs (Task Graph + Category/Skills)

> Notes:
> - 각 task는 “완료 기준(자동 검증)”을 포함.
> - category는 실행 에이전트의 작업 스타일, skills는 필요한 도구/영역.

### 1) Wave 3: Minimal autosave/restore (localStorage) 정리 및 적용 (≈3h)

**What to do**:
- `app/page.tsx`의 autosave/restore 패턴을 **(simulearn)** 흐름( JobSelection/Intro/Workspace/Completion )에 맞게 일반화
- 저장 키 버전(예: `kidzania-prototype-v0.1`) 유지/갱신 규칙 수립
- 최소 저장 범위: **job 선택 + workspace editor text + current step**
- 복원 UX: 첫 진입 시 자동 복원(또는 “복원하기” 배너) 중 하나로 통일
- reset/완료 시 clear 동작 정의

**Recommended Agent Profile**:
- Category: `visual-engineering` (UI state + hydration + UX 안정성)
- Skills: `playwright` (자동 복원 시나리오 검증용)

**Parallelization**: Wave 1 (병렬 가능: Task 2와 동시 진행 가능)

**References**:
- `app/page.tsx` — 현재 존재하는 localStorage autosave/restore 선례
- `lib/simulation-context.tsx` — 시뮬레이션 상태의 단일 소스(저장 대상 선정에 핵심)
- `components/features/workspace/*` — editor text를 어디서 관리하는지 확인

**Acceptance Criteria (agent-executable)**:
- Playwright 시나리오(로컬):
  1. Job 선택 → Workspace 진입
  2. 에디터에 텍스트 입력
  3. 페이지 reload
  4. job/step/editor text가 복원됨을 DOM으로 assert

---

### 2) Wave 4: Environment variables validation schema (≈2h)

**What to do**:
- zod 기반 env 레이어 추가(권장: `@t3-oss/env-nextjs` 또는 `next-safe-env`)
- 서버 필수: `ANTHROPIC_API_KEY`, KV 연결값(선정), `ADMIN_USER`, `ADMIN_PASS`
- API routes에서 `process.env.X` 직접 접근 대신 env 레이어 사용(일관된 에러)

**Recommended Agent Profile**:
- Category: `quick` (스키마/리팩터 위주)
- Skills: (none) 또는 필요 시 `git-master`는 “커밋” 요청 시에만

**Parallelization**: Wave 1 (Task 1과 병렬 가능)

**References**:
- `app/api/claude/route.ts`
- `app/api/feedback/route.ts`
- `app/api/dev-inquiry/route.ts`

**Acceptance Criteria (agent-executable)**:
- 환경변수 미설정 상태에서 해당 API 호출 시 명확한 에러(500 또는 부팅 실패)로 동작이 일관적임
- 설정 후에는 200/stream 응답 정상

---

### 3) Wave 4: Rate limiting (IP-based) for 3 API routes (≈3h)

**What to do**:
- Vercel KV(또는 Upstash 호환) 기반 rate limiter 구현
- IP 추출 규칙: `x-forwarded-for` 우선 + fallback
- 대상: `/api/claude`, `/api/feedback`, `/api/dev-inquiry`
- 초과 시: 429 + rate limit headers(+ 메시지)

**Recommended Agent Profile**:
- Category: `unspecified-high` (엣지/런타임 제약 + 분산 상태 설계)
- Skills: (none)

**Parallelization**: Wave 2 (Task 1–2 완료 이후 권장: env/KV 연결 확정 필요)

**References**:
- `IMPROVEMENTS.md` — rate limiting 요구사항/정책 힌트
- `app/api/*/route.ts` — 적용 대상

**Acceptance Criteria (agent-executable)**:
- `curl`로 동일 IP에서 제한 횟수 초과 시 429 발생
- 429 응답에 limit/remaining/reset(또는 유사) 헤더 포함

---

### 4) Wave 4: /admin 구현 (KV 기반 설정/통계) + Basic Auth 보호 (≈6h)

**What to do**:
- `/admin` App Router 페이지/레이아웃 구성
- Basic Auth middleware로 `/admin/:path*` 보호(ENV: ADMIN_USER/ADMIN_PASS)
- Admin 기능(최소):
  - 사용 통계(예: 요청 수/최근 호출)
  - 설정 관리(예: 프롬프트/모델 파라미터 등 “운영 설정”)
- 저장소: Vercel KV

**Recommended Agent Profile**:
- Category: `visual-engineering` (대시보드 UI + 데이터 로딩 + 보호)
- Skills: `playwright` (admin smoke test 자동화)

**Parallelization**: Wave 3 (Task 3 이후)

**References**:
- `IMPROVEMENTS.md` — admin 요구사항
- `app/(simulearn)/layout.tsx` — 레이아웃/스타일링 패턴

**Acceptance Criteria (agent-executable)**:
- 인증 없이 `/admin` 접근 시 401/Basic Auth challenge
- 올바른 Basic Auth로 접근 시 대시보드 로드
- KV에 설정 저장/조회가 동작

---

### 5) Wave 4: ESLint/접근성 마무리 (≈2h)

**What to do**:
- 남은 lint 에러 해결
- a11y: label/aria, button semantics, focus states 등 개선

**Recommended Agent Profile**:
- Category: `quick`
- Skills: (none)

**Parallelization**: Wave 4 (Admin 완료 후 또는 E2E와 병렬 가능)

**Acceptance Criteria (agent-executable)**:
- lint 명령이 0 error

---

### 6) Wave 5: Playwright 설정 확정 + E2E 3종 + CI 실행 설정 (≈12h)

**What to do**:
- Playwright 초기 설정 및 `webServer` 기반 로컬 서버 기동 구성
- E2E #1: 직무선택→인트로→Workspace
- E2E #2: Workspace 피드백 검증(LLM 호출이 포함되면 모킹/테스트키 전략 필요)
- E2E #3: 완료+Admin smoke test
- CI에서 headless 실행 + report artifact 업로드

**Recommended Agent Profile**:
- Category: `visual-engineering`
- Skills: `playwright` (필수)

**Parallelization**: Wave 4 (Task 4 이후)

**References**:
- `app/(simulearn)/*` pages
- `components/features/*`
- `app/api/*/route.ts` (E2E가 실 API를 치면 rate limiting/ENV 영향 받음)

**Acceptance Criteria (agent-executable)**:
- CI에서 `playwright test`가 통과
- 실패 시 trace/screenshot/report가 업로드됨

---

### 7) Wave 6: Vercel 배포 설정 + 운영 체크 (≈4h)

**What to do**:
- Vercel 프로젝트 설정(ENV 등록, KV 연결)
- 운영 체크리스트(429/ENV/admin 접근/핵심 플로우)

**Recommended Agent Profile**:
- Category: `unspecified-low` (설정/체크리스트)
- Skills: (none) — 브라우저 자동화가 필요하면 `playwright`

**Parallelization**: Wave 4 마지막 (E2E/CI가 안정화된 뒤)

**Acceptance Criteria (agent-executable)**:
- (가능하면) Preview/Prod URL에 대해 smoke test 자동화

---

## Decisions Needed (to finalize the plan precisely)

> 아래 2가지는 “숫자/정책”이라 가정하면 위험합니다.

1) Rate limiting 수치: 각 endpoint별 제한(RPM/RPD)과 429 응답 메시지/리트라이 가이드
2) localStorage key/versioning: 기존 `kidzania-prototype-v0.1`를 유지할지, Wave 3 적용과 함께 bump할지
