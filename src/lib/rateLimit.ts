type RateLimitRecord = { count: number; resetAt: number };

const store = new Map<string, RateLimitRecord>();

/**
 * Returns true if the request is allowed, false if rate limited.
 * @param key      Unique identifier (e.g. "auth:1.2.3.4")
 * @param maxAttempts  Max requests allowed in the window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): boolean {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) return false;

  record.count++;
  return true;
}
