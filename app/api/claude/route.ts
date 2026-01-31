import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { trackApiRequest } from "@/lib/stats-tracker";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limiter";

export const runtime = "nodejs";

type ClientMessage = {
  role: "assistant" | "user";
  content: string;
};

type RequestBody = {
  messages?: ClientMessage[];
  model?: string;
  temperature?: number;
  system?: string;
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = checkRateLimit(`claude:${ip}`);
  if (!rateLimit.allowed) {
    return new NextResponse("Too many requests", { status: 429, headers: getRateLimitHeaders(rateLimit) });
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  if (!body?.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return new NextResponse(
      "Request body must include messages: ClientMessage[]",
      { status: 400 },
    );
  }

  const model = body.model ?? "claude-3-7-sonnet-latest";
  const temperature = body.temperature ?? 0.2;
  const messages = body.messages.map((message) => ({
    role: message.role === "assistant" ? "assistant" : "user",
    content: message.content,
  }));

  trackApiRequest('claude');
  
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        temperature,
        stream: true,
        system: body.system,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(errorText || "Anthropic request failed", {
        status: response.status,
      });
    }

    if (!response.body) {
      return new NextResponse("Anthropic response body missing", { status: 500 });
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Anthropic request failed";
    return new NextResponse(message, { status: 500 });
  }
}
