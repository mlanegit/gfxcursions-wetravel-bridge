import { log } from "./_lib/log.js";
import { CreateBookingSchema } from "./_lib/validate.js";
import { fetchWithRetry } from "./_lib/http.js";
import { rateLimit } from "./_lib/rateLimit.js";

function getIp(req) {
  // Vercel / proxies
  const fwd = req.headers["x-forwarded-for"];
  return (Array.isArray(fwd) ? fwd[0] : (fwd?.split(",")[0]))?.trim()
    || req.socket?.remoteAddress
    || "unknown";
}

export default async function handler(req, res) {
  const requestId = req.headers["x-vercel-id"] || crypto?.randomUUID?.() || String(Date.now());
  const ip = getIp(req);

  // Basic CORS (adjust as needed)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Rate limit
  const limit = Number(process.env.RATE_LIMIT_PER_MIN || "30");
  const rl = rateLimit({ key: ip, limit, windowMs: 60_000 });
  res.setHeader("X-RateLimit-Limit", String(limit));
  res.setHeader("X-RateLimit-Remaining", String(rl.remaining));
  res.setHeader("X-RateLimit-Reset", String(rl.resetAt));

  if (!rl.allowed) {
    res.setHeader("Retry-After", String(rl.retryAfterSec));
    return res.status(429).json({ error: "Too many requests. Try again shortly." });
  }

  // Validate payload
  const parsed = CreateBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: parsed.error.flatten()
    });
  }

  const {
    tripId, packageId, firstName, lastName, email, phone, tshirtSize
  } = parsed.data;

  const base = process.env.WETRAVEL_API_BASE || "https://api.wetravel.com";
  const apiKey = process.env.WETRAVEL_API_KEY;

  if (!apiKey) {
    log.error({ requestId }, "Missing WETRAVEL_API_KEY env var");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };

  try {
    log.info({ requestId, ip, tripId, packageId, email }, "Create booking start");

    // Create checkout session (WeTravel hosted)
const checkoutRes = await fetchWithRetry(
  `${base}/checkout_sessions`,
  {
    method: "POST",
    headers,
    body: JSON.stringify({
      trip_id: tripId,
      package_id: packageId,
      participants: [
        {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          custom_answers: [
            { question: "T-Shirt Size", answer: tshirtSize }
          ]
        }
      ],
      success_url: "https://yourdomain.com/thank-you",
      cancel_url: "https://yourdomain.com/booking"
    })
  },
  { retries: 3 }
);

const checkoutText = await checkoutRes.text();
let checkout;
try { checkout = JSON.parse(checkoutText); }
catch { checkout = { raw: checkoutText }; }

if (!checkoutRes.ok) {
  log.error(
    { requestId, status: checkoutRes.status, checkout },
    "Create checkout session failed"
  );
  return res.status(502).json({
    error: "WeTravel checkout failed",
    status: checkoutRes.status
  });
}

const checkoutUrl = checkout?.url;
if (!checkoutUrl) {
  log.error({ requestId, checkout }, "Missing checkout url in WeTravel response");
  return res.status(502).json({
    error: "WeTravel checkout response missing url"
  });
}

log.info({ requestId }, "Checkout session created");

return res.status(200).json({
  payment_url: checkoutUrl
});
    
  } catch (err) {
    log.error({ requestId, err: String(err) }, "Unhandled error");
    return res.status(500).json({ error: "Internal server error" });
  }
}
