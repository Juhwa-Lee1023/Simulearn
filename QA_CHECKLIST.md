# KidZania v0.1.0 Manual QA Checklist

## Objective
Verify the end-to-end prototype flow (Step 1 -> Step 2 -> Step 3) including Claude streaming feedback, mental gauge, endings, and local persistence.

## Prerequisites
- `ANTHROPIC_API_KEY` set in your environment
- `npm install` completed
- Run dev server: `npm run dev`

## Test Cases
1. Landing UI
   - Open http://localhost:3000
   - Expect split layout: messenger + editor (left), LMS sidebar (right)
   - Background shows subtle gradient; typography is non-default

2. Step 1 selection
   - Default job: IT 서비스 기획자
   - Select difficulty: 신입 사원 온보딩 or 장애 대응 상황
   - Click "확인하고 미션 대기" -> Step 2 indicator appears

3. Step 2 mission trigger
   - Mission message appears in messenger
   - Sidebar shows Step 2 tips
   - Click "Step 3 피드백 루프 시작" -> Step 3 indicator appears

4. Step 3 feedback loop (Claude streaming)
   - Click "피드백 요청"
   - Expect 3 persona responses in sequence (시니어 개발자, 디자이너, 사업 리더)
   - Text streams into each persona card
   - Active persona status updates in the feedback panel

5. Mental gauge + coffee time
   - Gauge decreases after feedback loop
   - Click "커피 타임으로 회복하기" once -> gauge +20 and button disables

6. Ending + final report
   - Click "시뮬레이션 종료"
   - Final report card appears
   - Shows ending (성과급 or 야근), rubric score, strengths/weaknesses, persona feedback

7. Local persistence
   - Refresh the page
   - Expect step, draft, messages, gauge, and report to persist
   - Click "새로 시작" -> resets to Step 1 and clears stored state

## Success Criteria
- All test cases pass without errors in console
- Claude responses stream correctly
- No secret key exposure in client code
