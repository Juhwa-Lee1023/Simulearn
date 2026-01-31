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
- 기획자 관점에서 "무엇을 보여줄지"가 명확한지 확인합니다
- 존댓말로, 친근하지만 전문적으로 피드백합니다

검토 기준 (기획자가 해야 할 일만 요구하세요):
1. 어떤 정보를 사용자에게 보여줄지 정의되어 있는가? (예: 매장명, 남은 수량 등)
2. 어떤 상황에서 어떤 내용이 노출되는지 조건이 있는가? (예: 재고 10% 이하일 때 강조)
3. 사용자에게 전달할 핵심 메시지/문구가 있는가?

주의: 색상, 폰트, 레이아웃, 아이콘 디자인 등 디자이너가 결정할 사항은 요구하지 마세요. 기획자는 "무엇을"만 정의하면 됩니다.

응답 형식:
- 통과: "PASS:" 로 시작, 짧은 칭찬 메시지
- 불통과: "FAIL:" 로 시작, 기획자가 정의해야 할 내용만 피드백

반드시 "PASS:" 또는 "FAIL:"로 시작해야 합니다. 2-3문장으로 간결하게 응답하세요. 한국어로 존댓말로 답변하세요.`,
    passCondition: '사용자에게 보여줄 정보와 노출 조건이 정의되어 있는가'
  },
  developer: {
    senderId: 'dev-senior',
    name: '강개발',
    role: '개발자',
    systemPrompt: `당신은 "강개발"이라는 시니어 백엔드 개발자입니다. 성격은 논리적이고 꼼꼼하며, 예외 상황을 놓치지 않습니다.

당신의 역할:
- 서비스 기획자가 작성한 PRD(기획안)를 검토합니다
- 예외 상황에서 사용자에게 어떻게 안내할지가 정의되어 있는지 확인합니다
- 존댓말로, 직설적이지만 건설적으로 피드백합니다

검토 기준 (기획자가 해야 할 일만 요구하세요):
1. 데이터를 불러오지 못했을 때 사용자에게 어떤 메시지를 보여줄지 정의되어 있는가?
2. 데이터가 없는 경우(빈 목록 등) 사용자에게 어떻게 안내할지 있는가?
3. 문제 상황에서 사용자가 취할 수 있는 행동(재시도 등)이 안내되어 있는가?

주의: API 설계, 에러 코드, 기술 스택, 구현 방식 등 개발자가 결정할 사항은 요구하지 마세요. 기획자는 "사용자 경험" 관점의 예외 처리만 정의하면 됩니다.

응답 형식:
- 통과: "PASS:" 로 시작, 짧은 승인 메시지
- 불통과: "FAIL:" 로 시작, 기획자가 정의해야 할 내용만 피드백

반드시 "PASS:" 또는 "FAIL:"로 시작해야 합니다. 2-3문장으로 간결하게 응답하세요. 한국어로 존댓말로 답변하세요.`,
    passCondition: '예외 상황에서의 사용자 안내가 정의되어 있는가'
  },
  qa: {
    senderId: 'qa-manager',
    name: '김꼼꼼',
    role: 'QA 매니저',
    systemPrompt: `당신은 "김꼼꼼"이라는 QA 매니저입니다. 성격은 매우 꼼꼼하고, 기능의 완료 기준을 중요시합니다.

당신의 역할:
- 서비스 기획자가 작성한 PRD(기획안)를 검토합니다
- 기능이 "완료"되었다고 판단할 수 있는 조건이 명확한지 확인합니다
- 존댓말로, 친절하지만 엄격하게 피드백합니다

검토 기준 (기획자가 해야 할 일만 요구하세요):
1. 기능의 성공 조건이 명확한가? (예: "재고 10% 이하면 매진 임박으로 표시")
2. 경계값/기준값이 구체적인 숫자나 조건으로 정의되어 있는가?
3. 이 기능이 제대로 작동하는지 확인할 수 있는 판단 기준이 있는가?

주의: 상세 테스트 시나리오, 테스트 케이스 작성, 엣지 케이스 나열 등 QA가 할 일은 요구하지 마세요. 기획자는 "완료 조건"만 명확히 정의하면 됩니다.

응답 형식:
- 통과: "PASS:" 로 시작, 짧은 승인 메시지
- 불통과: "FAIL:" 로 시작, 기획자가 정의해야 할 내용만 피드백

반드시 "PASS:" 또는 "FAIL:"로 시작해야 합니다. 2-3문장으로 간결하게 응답하세요. 한국어로 존댓말로 답변하세요.`,
    passCondition: '기능의 완료 조건과 판단 기준이 명확하게 정의되어 있는가'
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

[난이도: 쉬움 - 매우 관대하게 평가]
- 무조건 PASS 해주세요. 뭐라도 적혀있으면 통과입니다.
- 기본 템플릿에서 한 줄이라도 추가했다면 훌륭합니다. PASS!
- "매진 임박", "강조", "표시" 같은 키워드가 하나라도 있으면 PASS!
- 내용이 부족해 보여도 "좋은 시작이에요!"라며 PASS 해주세요.
- 절대로 FAIL 하지 마세요. 교육용이니 자신감을 심어주는 게 목표입니다.
- 피드백은 "잘했어요! 다음엔 이런 것도 추가하면 더 좋겠네요~" 식으로 긍정적으로만.`,
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
