// api/_studio-auth.js
// Shared Studio auth helpers. The leading underscore keeps Vercel from deploying
// this file as its own serverless function.
//
// Sessions are stateless: an HMAC-signed token in an HttpOnly cookie. The signing
// key is STUDIO_SESSION_SECRET when set, otherwise derived from ADMIN_UPLOAD_SECRET,
// so rotating either one invalidates every outstanding session.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const COOKIE = "studio_session";
const SESSION_TTL_S = 12 * 60 * 60; // 12 hours

// ---- signing ---------------------------------------------------------------

function signingKey() {
  const admin = process.env.ADMIN_UPLOAD_SECRET;
  if (!admin) return null;
  const base = process.env.STUDIO_SESSION_SECRET || admin;
  return createHmac("sha256", base).update("studio-session-v1").digest();
}

const hmac = (key, data) => createHmac("sha256", key).update(data).digest();
const b64url = (buf) => Buffer.from(buf).toString("base64url");

export function isConfigured() {
  return !!process.env.ADMIN_UPLOAD_SECRET;
}

// Constant-time password check (both sides are hashed first so lengths match).
export function checkPassword(candidate) {
  const secret = process.env.ADMIN_UPLOAD_SECRET;
  if (!secret || typeof candidate !== "string" || !candidate) return false;
  const key = randomBytes(32);
  return timingSafeEqual(hmac(key, candidate), hmac(key, secret));
}

function createToken() {
  const key = signingKey();
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url(JSON.stringify({ iat: now, exp: now + SESSION_TTL_S, n: b64url(randomBytes(12)) }));
  return { token: `${payload}.${b64url(hmac(key, payload))}`, exp: now + SESSION_TTL_S };
}

function verifyToken(token) {
  const key = signingKey();
  if (!key || typeof token !== "string") return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = hmac(key, payload);
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.exp !== "number" || data.exp <= Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

// ---- cookies ---------------------------------------------------------------

function readCookie(req, name) {
  const header = req.headers.cookie || "";
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

// Secure everywhere except local development over plain http.
function isSecureContext(req) {
  const env = process.env.VERCEL_ENV;
  if (env && env !== "development") return true;
  return String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim() === "https";
}

function cookieHeader(req, value, maxAge) {
  const parts = [`${COOKIE}=${value}`, "Path=/api", "HttpOnly", "SameSite=Strict", `Max-Age=${maxAge}`];
  if (isSecureContext(req)) parts.push("Secure");
  return parts.join("; ");
}

export function startSession(req, res) {
  const { token, exp } = createToken();
  res.setHeader("Set-Cookie", cookieHeader(req, token, SESSION_TTL_S));
  return exp;
}

export function endSession(req, res) {
  res.setHeader("Set-Cookie", cookieHeader(req, "", 0));
}

export function getSession(req) {
  return verifyToken(readCookie(req, COOKIE));
}

// ---- request guards --------------------------------------------------------

// Browsers always send Origin on POST/DELETE; reject cross-site writes outright.
export function isSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function noStore(res) {
  res.setHeader("Cache-Control", "no-store");
}

/**
 * Guard for admin mutation endpoints. Sends the error response and returns false
 * when the request must not proceed.
 */
export function requireStudio(req, res, { methods, json = true } = {}) {
  noStore(res);
  if (methods && !methods.includes(req.method)) {
    res.setHeader("Allow", methods.join(", "));
    res.status(405).json({ error: "Method not allowed" });
    return false;
  }
  if (!isSameOrigin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  if (!getSession(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  if (json && !String(req.headers["content-type"] || "").includes("application/json")) {
    res.status(415).json({ error: "Expected application/json" });
    return false;
  }
  return true;
}

// ---- login rate limiting ---------------------------------------------------
// Best-effort and per-instance (serverless memory is not shared), but it still
// makes online guessing slow without adding a datastore dependency.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const failures = new Map(); // ip -> { count, first }

export function clientIp(req) {
  return String(req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
}

export function loginBlockedFor(ip) {
  const rec = failures.get(ip);
  if (!rec) return 0;
  const age = Date.now() - rec.first;
  if (age > WINDOW_MS) {
    failures.delete(ip);
    return 0;
  }
  return rec.count >= MAX_FAILURES ? Math.ceil((WINDOW_MS - age) / 1000) : 0;
}

export function recordLoginFailure(ip) {
  const rec = failures.get(ip);
  if (!rec || Date.now() - rec.first > WINDOW_MS) failures.set(ip, { count: 1, first: Date.now() });
  else rec.count += 1;
  if (failures.size > 5000) failures.clear(); // bound memory
}

export function clearLoginFailures(ip) {
  failures.delete(ip);
}

// ---- content-mutation rate limiting -----------------------------------------
// Looser than login (a signed-in owner uploading a batch of photos must not be
// blocked) but still caps runaway loops or a stolen cookie. Same caveat: this is
// per serverless instance, i.e. best-effort rather than distributed enforcement.

const buckets = new Map(); // `${scope}:${ip}` -> { count, first }
export const WRITE_LIMITS = {
  photoToken: { limit: 300, windowMs: 10 * 60 * 1000 }, // one per uploaded file
  write: { limit: 60, windowMs: 10 * 60 * 1000 }, // create / edit / settings
  delete: { limit: 40, windowMs: 10 * 60 * 1000 },
};

/** Returns true if allowed; otherwise sends 429 and returns false. */
export function rateLimit(req, res, scope) {
  const { limit, windowMs } = WRITE_LIMITS[scope];
  const key = `${scope}:${clientIp(req)}`;
  const now = Date.now();
  let rec = buckets.get(key);
  if (!rec || now - rec.first > windowMs) {
    rec = { count: 0, first: now };
    buckets.set(key, rec);
  }
  rec.count += 1;
  if (buckets.size > 5000) buckets.clear();
  if (rec.count > limit) {
    const wait = Math.ceil((windowMs - (now - rec.first)) / 1000);
    res.setHeader("Retry-After", String(wait));
    res.status(429).json({ error: "Too many requests. Slow down and try again shortly.", retryAfter: wait });
    return false;
  }
  return true;
}

// ---- storage paths ---------------------------------------------------------
// The only Blob locations Studio may ever write to or delete from.
const ALLOWED_PREFIXES = ["poetry/", "photography/", "experience/"];

export function isAllowedPath(pathname) {
  return (
    typeof pathname === "string" &&
    pathname.length <= 250 &&
    ALLOWED_PREFIXES.some((p) => pathname.startsWith(p)) &&
    !pathname.includes("..") &&
    !pathname.includes("\\") &&
    ![...pathname].some((ch) => ch.charCodeAt(0) < 0x20) && // no control characters
    pathname.split("/").length === 2 && // exactly "<prefix>/<name>", no nesting
    pathname.split("/")[1].length > 0
  );
}

// ---- public read APIs --------------------------------------------------------

/** GET/HEAD only. Sends 405 and returns false otherwise. */
export function allowRead(req, res) {
  if (req.method === "GET" || req.method === "HEAD") return true;
  res.setHeader("Allow", "GET, HEAD");
  res.status(405).json({ error: "Method not allowed" });
  return false;
}

// ---- small shared helpers for the upload endpoints -------------------------

export const slugify = (s, max) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max);

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

export function cleanString(v, max) {
  if (v === undefined || v === null) return "";
  return String(v).trim().slice(0, max);
}

/** http(s) URL or "" — anything else (javascript:, data:, relative) is rejected. */
export function cleanUrl(v) {
  const s = cleanString(v, 500);
  if (!s) return "";
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** ISO timestamp from a date/datetime string, or null. */
export function cleanDate(v) {
  const s = cleanString(v, 40);
  if (!s) return "";
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}
