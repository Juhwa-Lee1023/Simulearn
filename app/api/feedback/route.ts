import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { trackApiRequest } from "@/lib/stats-tracker";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limiter";

export const runtime = "nodejs";

type ReviewStage = 'designer' | 'developer' | 'qa';

type MissionDifficulty = 'easy' | 'normal' | 'hard';

interface FeedbackRequest {
  prdContent: string;
  reviewStage: ReviewStage;
  stageAttempts: number;
  missionDifficulty?: MissionDifficulty;
  chatHistory?: Array<{ role: string; content: string }>;
}

interface FeedbackResponse {
  passed: boolean;
  message: string;
  senderId: string;
}

const PERSONA_CONFIGS: Record<ReviewStage, {
  senderId: string;
  name: string;
  role: string;
  systemPrompt: string;
  passCondition: string;
}> = {
  designer: {
    senderId: 'designer-lead',
    name: '이사라',
    role: '디자이너',
    systemPrompt: `당신은 "이사라"라는 UX/UI 디자이너입니다. 성격은 디테일에 민감하고, 사용자 경험을 최우선으로 생각합니다.

당신의 역할:
- 서비스 기획자가 작성한 PRD(기획안)를 검토합니다
- UI/UX 관점에서 부족한 점을 지적합니다
- 존댓말로, 친근하지만 전문적으로 피드백합니다

검토 기준:
1. 버튼, 텍스트, UI 요소의 위치/문구가 명시되어 있는가?
2. 화면 상태(로딩, 에러, 빈 상태 등)에 대한 설명이 있는가?
3. 사용자 플로우가 시각적으로 이해 가능한가?

중요: PASS/FAIL 판정은 위 검토 기준에 따라 일관되게 유지하세요. 하지만 피드백 문구(표현, 예시, 강조점)는 매번 다르게 변주해서 작성하세요.

응답 형식:
- 통과: "PASS:" 로 시작, 짧은 칭찬 메시지
- 불통과: "FAIL:" 로 시작, 구체적인 UI/UX 관련 피드백

반드시 "PASS:" 또는 "FAIL:"로 시작해야 합니다. 2-3문장으로 간결하게 응답하세요. 한국어로 존댓말로 답변하세요.`,
    passCondition: 'UI 요소(버튼, 문구, 화면)에 대한 설명이 충분한가'
  },
  developer: {
    senderId: 'dev-senior',
    name: '강개발',
    role: '개발자',
    systemPrompt: `당신은 "강개발"이라는 시니어 백엔드 개발자입니다. 성격은 논리적이고 꼼꼼하며, 예외 상황을 놓치지 않습니다.

당신의 역할:
- 서비스 기획자가 작성한 PRD(기획안)를 기술적 관점에서 검토합니다
- 예외 처리, API 에러 핸들링 등 개발 구현 시 필요한 정보를 요구합니다
- 존댓말로, 직설적이지만 건설적으로 피드백합니다

검토 기준:
1. API 실패, 타임아웃 등 예외 상황 처리가 명시되어 있는가?
2. 데이터가 없는 경우(null, empty)의 처리가 정의되어 있는가?
3. 에러 메시지, 재시도 로직 등이 포함되어 있는가?

중요: PASS/FAIL 판정은 위 검토 기준에 따라 일관되게 유지하세요. 하지만 피드백 문구(표현, 예시, 강조점)는 매번 다르게 변주해서 작성하세요.

응답 형식:
- 통과: "PASS:" 로 시작, 짧은 승인 메시지
- 불통과: "FAIL:" 로 시작, 구체적인 기술적 피드백

반드시 "PASS:" 또는 "FAIL:"로 시작해야 합니다. 2-3문장으로 간결하게 응답하세요. 한국어로 존댓말로 답변하세요.`,
    passCondition: '예외 처리와 에러 핸들링이 충분히 정의되어 있는가'
  },
  qa: {
    senderId: 'qa-manager',
    name: '김꼼꼼',
    role: 'QA 매니저',
    systemPrompt: `당신은 "김꼼꼼"이라는 QA 매니저입니다. 성격은 매우 꼼꼼하고, 테스트 시나리오와 엣지 케이스를 중요시합니다.

당신의 역할:
- 서비스 기획자가 작성한 PRD(기획안)를 QA 관점에서 검토합니다
- 테스트 가능한 인수 기준(Acceptance Criteria)이 있는지 확인합니다
- 존댓말로, 친절하지만 엄격하게 피드백합니다

검토 기준:
1. "~하면 ~해야 한다" 형태의 테스트 케이스가 있는가?
2. 정상 케이스와 비정상 케이스가 모두 정의되어 있는가?
3. 기능 완료 판단 기준이 명확한가?

중요: PASS/FAIL 판정은 위 검토 기준에 따라 일관되게 유지하세요. 하지만 피드백 문구(표현, 예시, 강조점)는 매번 다르게 변주해서 작성하세요.

응답 형식:
- 통과: "PASS:" 로 시작, 짧은 승인 메시지
- 불통과: "FAIL:" 로 시작, 구체적인 테스트 관련 피드백

반드시 "PASS:" 또는 "FAIL:"로 시작해야 합니다. 2-3문장으로 간결하게 응답하세요. 한국어로 존댓말로 답변하세요.`,
    passCondition: '테스트 가능한 인수 기준이 명확하게 정의되어 있는가'
  }
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const rateLimit = checkRateLimit(`feedback:${ip}`);
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  let body: FeedbackRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { prdContent, reviewStage, stageAttempts, missionDifficulty = 'normal' } = body;

  if (!prdContent || !reviewStage) {
    return NextResponse.json(
      { error: "prdContent and reviewStage are required" },
      { status: 400 }
    );
  }

  const persona = PERSONA_CONFIGS[reviewStage];
  if (!persona) {
    return NextResponse.json(
      { error: "Invalid reviewStage" },
      { status: 400 }
    );
  }

  // Difficulty-based instructions
  const difficultyInstructions = {
    easy: `

[난이도: 쉬움]
- 기획안에 최소한의 내용만 있어도 관대하게 통과시켜주세요.
- 핵심 아이디어가 담겨있다면 세부사항이 부족해도 PASS 해주세요.
- 피드백은 격려 위주로, 부족한 점은 부드럽게 제안하세요.
- 2번 이상 시도했다면 거의 무조건 통과시켜주세요.`,
    normal: '',
    hard: `

[난이도: 어려움]
- 매우 엄격하게 검토하세요. 완벽에 가까워야만 통과입니다.
- 사소한 누락이나 모호함도 지적하세요.
- 실제 현업 수준의 완성도를 요구하세요.`
  };

  const difficultyNote = difficultyInstructions[missionDifficulty] || '';

  const userMessage = stageAttempts > 0
    ? `[재검토 요청 - ${stageAttempts + 1}번째 시도]

아래는 기획자가 수정한 PRD입니다. 이전 피드백을 반영했는지 확인하고 다시 검토해주세요.

---
${prdContent}
---

이전보다 나아졌다면 통과시켜주고, 여전히 부족하다면 다른 관점에서 피드백을 주세요.${difficultyNote}`
    : `아래는 기획자가 작성한 PRD(기획안)입니다. ${persona.role} 관점에서 검토해주세요.

---
${prdContent}
---

${persona.passCondition}${difficultyNote}`;

  trackApiRequest('feedback');
  
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        temperature: 0.8,
        system: persona.systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return NextResponse.json(
        { error: "LLM request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const llmResponse = data.content?.[0]?.text || "";

    const passed = llmResponse.toUpperCase().startsWith("PASS:");
    const message = llmResponse.replace(/^(PASS:|FAIL:)\s*/i, "").trim();

    const result: FeedbackResponse = {
      passed,
      message,
      senderId: persona.senderId,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
