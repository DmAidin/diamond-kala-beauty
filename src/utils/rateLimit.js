import { connectToDB } from "./database";
import RateLimit from "../models/rateLimit";

/**
 * Fixed-window rate limiter backed by MongoDB (no Redis/external service
 * needed). Call it at the top of a route with a key that identifies the
 * caller + action, e.g. `login:${ip}` or `register:${ip}`.
 *
 * This protects against in-app abuse (brute-forcing a password, spamming a
 * form, hammering an endpoint) — it does NOT stop a large-scale volumetric
 * DDoS flood, which has to be absorbed at the hosting/edge layer.
 *
 * Returns { ok: true } if the request is allowed, or
 * { ok: false, retryAfter } (seconds) if the limit was hit.
 */
export async function rateLimit(key, { limit = 10, windowSeconds = 60 } = {}) {
  await connectToDB();

  const windowId = Math.floor(Date.now() / (windowSeconds * 1000));
  const docKey = `${key}:${windowId}`;
  const expiresAt = new Date((windowId + 1) * windowSeconds * 1000);

  const result = await RateLimit.findOneAndUpdate(
    { key: docKey },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { upsert: true, new: true }
  );

  if (result.count > limit) {
    const retryAfter = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);
    return { ok: false, retryAfter: Math.max(retryAfter, 1) };
  }
  return { ok: true };
}

// Best-effort caller IP extraction behind Vercel's proxy
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
