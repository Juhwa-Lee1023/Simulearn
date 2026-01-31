# KidZania v0.2 개선 사항 (Spec + Improvements)

# 서비스명 Simulearn 으로 변경

## Page 1. 직무 선택 화면 (Role Selection)

### 목적

- 사용자의 **직무 컨텍스트 고정**
- 이후 모든 시뮬레이션/피드백의 기준점 설정

### 화면 구성

- 카드형 좌우 배치
  1. **서비스 기획자** (활성)
  2. 마케터 (비활성, *Coming Soon*)
  3. 디자이너 (비활성, *Coming Soon*)

### UX 포인트

- 선택 가능한 직무는 하나 → **결정 피로 최소화**
- 비활성 직무는 서비스 확장성 암시

---

## Page 2. 인트로 화면 (Mission Intro)

### 목적

- 사용자를 **시뮬레이션 세계관에 몰입**시키기
- "학습"이 아닌 "업무 시작" 느낌 제공

### 화면 구성

- **타이틀**: *서비스 기획자*
- **서브타이틀**: "지금부터 실제 업무와 유사한 미션을 수행하게 됩니다"
- **동료 소개 영역**: 개발자, 디자이너, 사업 리더 (프로필 이미지 + 역할 태그)

### UX 포인트

- AI 동료들의 **페르소나를 미리 각인**
- "혼자 하는 과제"가 아니라 "팀 프로젝트" 느낌

---

## Page 3. 1단계 과제 화면 (Core Task)

### 목적

- **실제 산출물 작성 + 즉각적인 피드백 루프** 경험
- 서비스의 핵심 가치 구간

### 화면 구성

1. **메시지 영역 (좌측 상단)**: 사업 리더 메시지 도착
2. **기획서 작성 영역 (메인)**: Markdown 기반 기획서 작성
3. **피드백 버튼**: 클릭 시 동료들 피드백 등장 (1단계 → 2단계 → 3단계)
4. **우측 사이드바 – Tip 영역**: 기본 팁 + Help 버튼 (마이크로 학습 모듈)

### 완료 조건

- 피드백 반영 후 **추가 피드백이 더 이상 발생하지 않으면** 성공

---

## Page 4. 2단계 과제 (Advanced Scenario)

### 목적

- 기획자의 **실전 난이도 포인트** 체험
- 예외 처리 & 커뮤니케이션 역량 검증

### 화면 구성

- 개발자 메시지 도착: "이 기능에서 순서는?" "데이터가 없을 때는?" "예외 케이스는?"
- 사용자는 **기존 기획서를 수정/보완**하며 대응

---

## Page 5. 완료 화면 (Wrap-up)

### 목적

- 학습 종료에 대한 **명확한 마침표**
- 다음 행동으로 자연스럽게 연결

### 화면 구성

- 학습 완료 메시지 + 성취감 강조
- CTA: 강의 / 실무자 만남 / 채용 공고

---

# 최종 TODO 리스트

> **총 예상 소요 시간: 80h**  
> **Admin 저장소: Vercel KV SDK (@vercel/kv)**

---

## Wave 1 - Foundation (병렬 실행: YES)

| ID | 작업 | 시간 | Category | Skills |
|----|------|------|----------|--------|
| 1A | Next App Router 라우팅/폴더 뼈대 정리 (단일 page.tsx 분해 준비) | 3h | ultrabrain | - |
| 1B | simulearn UI 컴포넌트(shadcn/ui) 이식 경로 확정 + Next용 베이스 세팅 | 4h | visual-engineering | frontend-ui-ux |
| 1C | Tailwind/CSS 변수(토큰) 정합: simulearn 디자인 "그대로" 재현 | 3h | visual-engineering | frontend-ui-ux |
| 1D | simulation-context 상태관리 포팅 (라우트 전환/리로드 유지) | 4h | ultrabrain | - |
| 1E | ESLint blocker 최소 제거 (라벨 연결, useEffect deps) | 1h | quick | - |
| 1F | 서비스명 KidZania → Simulearn 반영 (메타/타이틀/문구) | 1h | quick | - |

---

## Wave 2 - Page Porting (병렬 실행: YES)

| ID | 작업 | 시간 | Category | Skills | 의존성 |
|----|------|------|----------|--------|--------|
| 2A | Page 1 직무 선택 화면 포팅 | 3h | visual-engineering | frontend-ui-ux | 1A,1B,1C,1D |
| 2B | Page 2 인트로 화면 포팅 | 2h | visual-engineering | frontend-ui-ux | 1A,1B,1C,1D |
| 2C | Page 3 Workspace 레이아웃 포팅 (Editor/Messenger/Sidebar) | 6h | visual-engineering | frontend-ui-ux | 1A,1B,1C,1D |
| 2D | Page 4 2단계 과제 UI 포팅 | 3h | visual-engineering | frontend-ui-ux | 1A,1B,1C,1D |
| 2E | Page 5 완료 화면 포팅 | 2h | visual-engineering | frontend-ui-ux | 1A,1B,1C,1D |

---

## Wave 3 - Core Logic (병렬 실행: PARTIAL)

| ID | 작업 | 시간 | Category | 의존성 |
|----|------|------|----------|--------|
| 3A | Page 3 피드백 루프 구현 (작성→제출→피드백→반영) | 7h | ultrabrain | 2C, 3B |
| 3B | Next API Route LLM 호출 파이프라인 구성 | 5h | ultrabrain | 1A |
| 3C | localStorage/세션 저장 전략 정리 (레거시 제거) | 3h | ultrabrain | 1D, Wave2 |
| 3D | Page 4 시나리오 로직 연결 (예외/커뮤니케이션 분기) | 4h | ultrabrain | 2D, 3B |

---

## Wave 4 - Hardening + Admin (병렬 실행: YES)

| ID | 작업 | 시간 | Category | 의존성 |
|----|------|------|----------|--------|
| 4A | 환경변수 검증 스키마 (LLM 키 + Vercel KV 연결 정보) | 2h | ultrabrain | 3B |
| 4B | Rate limiting 적용 (Vercel KV 기반 카운터) | 3h | ultrabrain | 3B, 4A |
| 4C | /admin 구현: 프롬프트/키 수정 UI + Vercel KV 저장/조회 | 6h | ultrabrain | 4A, 3B |
| 4D | ESLint/접근성 마무리 + 프로덕션 빌드 안정화 | 2h | quick | Wave2-3 |

---

## Wave 5 - E2E Tests (병렬 실행: PARTIAL)

| ID | 작업 | 시간 | Category | Skills |
|----|------|------|----------|--------|
| 5A | Playwright 설정 확정 (baseURL/테스트 데이터/LLM mock) | 1h | visual-engineering | playwright |
| 5B | E2E #1: 직무선택 → 인트로 → Workspace 진입 | 3h | visual-engineering | playwright |
| 5C | E2E #2: Workspace 제출 → 피드백 렌더링 검증 | 4h | visual-engineering | playwright |
| 5D | E2E #3: 완료 화면 + Admin smoke test | 2h | visual-engineering | playwright |
| 5E | CI E2E 실행 + 리포트/스크린샷 저장 | 2h | quick | - |

---

## Wave 6 - Vercel Deploy (순차 실행)

| ID | 작업 | 시간 | Category | 의존성 |
|----|------|------|----------|--------|
| 6A | Vercel 배포 설정 (Env 주입: LLM + KV, Preview/Prod 분리) | 2h | quick | 4A, 4D |
| 6B | 운영 체크 (레이트리밋, Admin 보호, KV 반영, 쿼터 확인) | 2h | ultrabrain | 6A, 4B, 4C |

---

## 기술 스택 결정 사항

| 항목 | 선택 |
|------|------|
| Admin 저장소 | **Vercel KV** (@vercel/kv SDK) |
| Rate Limiting | Vercel KV 기반 (Upstash 호환) |
| E2E 테스트 | Playwright (이미 설치됨) |
| 배포 | Vercel |

---

## 참고 자료

- [PROTOTYPE_SPEC.md](./PROTOTYPE_SPEC.md) - 프로토타입 기획서
- [QA_CHECKLIST.md](./QA_CHECKLIST.md) - QA 체크리스트
- [simulearn/](./simulearn/) - 디자인 참고 소스 (Vite + React)
