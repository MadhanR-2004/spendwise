type RateLimitEntry = { count: number; resetAt: number };

const store = new Map<string, RateLimitEntry>();

// Periodically clean expired entries
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 60_000);
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count };
}

export function rateLimitByIp(
  req: Request,
  endpoint: string,
  limit = 10,
  windowMs = 60_000
) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  const key = `${endpoint}:${ip}`;
  return rateLimit(key, limit, windowMs);
}

/** Per-email OTP attempt limiter to prevent brute-force guessing */
export function rateLimitOtpAttempt(
  email: string,
  type: string,
  limit = 5,
  windowMs = 15 * 60_000 // 15 minutes
) {
  const key = `otp_attempt:${email}:${type}`;
  return rateLimit(key, limit, windowMs);
}
