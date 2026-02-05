import { log } from "./log.js";

const buckets = new Map();

/**
 * Simple token bucket: N requests per windowMs per key
 * key suggestion: ip address
 */
export function rateLimit({ key, limit = 30, windowMs = 60_000 }) {
  const now = Date.now();
  const entry = buckets.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  buckets.set(key, entry);

  const remaining = Math.max(0, limit - entry.count);
  const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);

  const allowed = entry.count <= limit;

  if (!allowed) {
    log.warn({ key, limit, windowMs }, "Rate limit exceeded");
  }

  return {
    allowed,
    remaining,
    retryAfterSec,
    resetAt: entry.resetAt
  };
}
