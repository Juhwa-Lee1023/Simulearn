import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { trackApiRequest } from "@/lib/stats-tracker";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limiter";

export const runtime = "nodejs";

interface DevInquiryRequest {
  prdContent: string;
  attempt?: number;
}

interface DevInquiryResponse {
  message: string;
  senderId: string;
}

const DEV_INQUIRY_SYSTEM_PROMPT = `당신은 "강개발"이라는 시니어 백엔드 개발자입니다. PRD를 읽고 개발 구현 전에 기획자에게 추가 질문을 하나 합니다.

성격:
- 논리적이고 직설적
- 애매한 것을 싫어함
- A안 vs B안 중 명확한 선택을 요구함

질문 규칙:
- 기획서에서 명확하지 않은 부분을 찾아서 질문하세요
- "~할 때 A로 할까요, B로 할까요?" 형태의 의사결정 질문을 하세요
- 예: "데이터가 없을 때 버튼을 숨길까요(Hide) 아니면 비활성화할까요(Disabled)?"
- 반말로, 1-2문장으로 간결하게 질문하세요
- 매번 다른 관점에서 질문하세요 (null 처리, 로딩 상태, 에러 케이스, 타이밍 등)

질문만 출력하세요. 인사말이나 서론 없이 바로 질문하세요.`;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = checkRateLimit(`dev-inquiry:${ip}`);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: getRateLimitHeaders(rateLimit) });
  }

  let body: DevInquiryRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { prdContent, attempt = 0 } = body;

  if (!prdContent) {
    return NextResponse.json(
      { error: "prdContent is required" },
      { status: 400 }
    );
  }

  const userMessage = `아래는 기획자가 작성한 PRD입니다. 개발 구현 전에 명확히 해야 할 점을 질문해주세요.

---
${prdContent}
---

${attempt > 0 ? `(${attempt + 1}번째 질문입니다. 이전과 다른 관점에서 질문하세요.)` : ''}`;

  trackApiRequest('dev-inquiry');
  
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
        max_tokens: 200,
        temperature: 0.9,
        system: DEV_INQUIRY_SYSTEM_PROMPT,
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
    const message = data.content?.[0]?.text?.trim() || "";

    if (!message) {
      return NextResponse.json(
        { error: "Empty response from LLM" },
        { status: 500 }
      );
    }

    const result: DevInquiryResponse = {
      message,
      senderId: "dev-senior",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Dev inquiry API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
