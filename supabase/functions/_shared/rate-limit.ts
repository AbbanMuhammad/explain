const ipRequests = new Map<string, number[]>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipRequests.get(ip) || []).filter(
    (t) => now - t < WINDOW_MS
  );

  if (timestamps.length >= MAX_REQUESTS) {
    ipRequests.set(ip, timestamps);
    return true;
  }

  timestamps.push(now);
  ipRequests.set(ip, timestamps);

  if (Math.random() < 0.01) {
    for (const [key, times] of ipRequests) {
      const fresh = times.filter((t) => now - t < WINDOW_MS);
      if (fresh.length === 0) ipRequests.delete(key);
      else ipRequests.set(key, fresh);
    }
  }

  return false;
}

export function rateLimitResponse(corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
    { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
