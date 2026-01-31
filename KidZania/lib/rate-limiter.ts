type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 20;

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetIn: entry.resetTime - now };
}

export function getRateLimitHeaders(result: { remaining: number; resetIn: number }): Record<string, string> {
  return {
    'X-RateLimit-Limit': MAX_REQUESTS.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetIn / 1000).toString(),
  };
}
