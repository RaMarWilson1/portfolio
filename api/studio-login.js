// api/studio-login.js
// Validates the Studio password server-side and issues a signed session cookie.
import {
  checkPassword,
  clearLoginFailures,
  clientIp,
  isConfigured,
  isSameOrigin,
  loginBlockedFor,
  noStore,
  recordLoginFailure,
  startSession,
} from "./_studio-auth.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!isSameOrigin(req)) return res.status(403).json({ error: "Forbidden" });
  if (!isConfigured()) return res.status(503).json({ error: "Studio is not configured." });

  const ip = clientIp(req);
  const wait = loginBlockedFor(ip);
  if (wait) {
    res.setHeader("Retry-After", String(wait));
    return res.status(429).json({ error: "Too many attempts. Try again later.", retryAfter: wait });
  }

  const password = req.body && typeof req.body === "object" ? req.body.password : undefined;
  if (typeof password !== "string" || !password || password.length > 512 || !checkPassword(password)) {
    recordLoginFailure(ip);
    await sleep(400); // flatten timing + slow down guessing
    return res.status(401).json({ error: "Incorrect password." });
  }

  clearLoginFailures(ip);
  const exp = startSession(req, res);
  return res.status(200).json({ authenticated: true, expiresAt: new Date(exp * 1000).toISOString() });
}
