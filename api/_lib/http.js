import { log } from "./log.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * fetchWithRetry:
 * - Retries on network errors + 429 + 5xx
 * - Exponential backoff with jitter
 */
export async function fetchWithRetry(url, options, cfg = {}) {
  const {
    retries = 3,
    minDelayMs = 250,
    maxDelayMs = 2000
  } = cfg;

  let lastErr;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);

      // If success, return
      if (res.ok) return res;

      const retryable = res.status === 429 || (res.status >= 500 && res.status <= 599);

      if (!retryable || attempt === retries) return res;

      // Respect Retry-After if present
      const ra = res.headers.get("retry-after");
      const retryAfterMs = ra ? Number(ra) * 1000 : null;

      const backoff = Math.min(maxDelayMs, minDelayMs * (2 ** attempt));
      const jitter = Math.floor(Math.random() * 150);
      const delay = retryAfterMs ?? (backoff + jitter);

      log.warn({ status: res.status, attempt, delay }, "Upstream retryable response");
      await sleep(delay);
      continue;
    } catch (err) {
      lastErr = err;

      if (attempt === retries) throw err;

      const backoff = Math.min(maxDelayMs, minDelayMs * (2 ** attempt));
      const jitter = Math.floor(Math.random() * 150);
      const delay = backoff + jitter;

      log.warn({ err: String(err), attempt, delay }, "Network error, retrying");
      await sleep(delay);
    }
  }

  // Should never hit, but just in case:
  throw lastErr ?? new Error("Unknown error");
}
