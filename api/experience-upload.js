// api/experience-upload.js
// Studio-only experience publisher → JSON entries in Vercel Blob (experience/).
//   POST   { type, org, role?, loc?, period?, note?, points?, order? }         create (409 if taken)
//   POST   { slug, type, org, role?, loc?, period?, note?, points?, order? }   update in place
//   DELETE { slug }                                                          remove an entry
// Timestamps (ISO 8601): createdAt/publishedAt set once, updatedAt on every save.
import { put, head, del, BlobNotFoundError } from "@vercel/blob";
import { requireStudio, rateLimit, isAllowedPath, slugify, SLUG_RE, cleanString } from "./_studio-auth.js";

const token = () => process.env.BLOB_READ_WRITE_TOKEN;
const pathFor = (slug) => `experience/${slug}.json`;

async function findBlob(pathname) {
  try {
    return await head(pathname, { token: token() });
  } catch (err) {
    if (err instanceof BlobNotFoundError) return null;
    throw err;
  }
}

function parsePoints(points) {
  const list = Array.isArray(points) ? points : typeof points === "string" ? points.split("\n") : [];
  return list
    .map((p) => cleanString(p, 500))
    .filter(Boolean)
    .slice(0, 20);
}

// Keep original timestamps on edit. Older entries predate them; their Blob
// upload time is the only real timestamp available.
async function existingTimestamps(blob) {
  const stored = new Date(blob.uploadedAt).toISOString();
  try {
    const r = await fetch(`${blob.url}?v=${Date.now()}`, { signal: AbortSignal.timeout(5000) });
    const e = await r.json();
    const iso = (v) => (typeof v === "string" && !Number.isNaN(Date.parse(v)) ? new Date(v).toISOString() : null);
    const publishedAt = iso(e.publishedAt) || stored;
    return { createdAt: iso(e.createdAt) || publishedAt, publishedAt };
  } catch {
    return { createdAt: stored, publishedAt: stored };
  }
}

export default async function handler(req, res) {
  if (!requireStudio(req, res, { methods: ["POST", "DELETE"] })) return;
  if (!rateLimit(req, res, req.method === "DELETE" ? "delete" : "write")) return;
  const input = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};

  try {
    if (req.method === "DELETE") {
      const slug = String(input.slug || "");
      if (!SLUG_RE.test(slug)) return res.status(400).json({ error: "Invalid entry." });
      if (!isAllowedPath(pathFor(slug))) return res.status(400).json({ error: "Invalid entry." });
      const blob = await findBlob(pathFor(slug));
      if (!blob) return res.status(404).json({ error: "Entry not found." });
      await del(blob.url, { token: token() });
      return res.status(200).json({ ok: true, slug });
    }

    const org = cleanString(input.org, 120);
    if (!org) return res.status(400).json({ error: "Organization is required." });
    const role = cleanString(input.role, 160);

    const editing = input.slug !== undefined && input.slug !== null && input.slug !== "";
    const slug = editing ? String(input.slug) : slugify(`${org} ${role}`, 70) || "entry";
    if (!SLUG_RE.test(slug)) return res.status(400).json({ error: "Invalid entry." });

    const existing = await findBlob(pathFor(slug));
    if (editing && !existing) return res.status(404).json({ error: "Entry not found." });
    if (!editing && existing) {
      return res.status(409).json({ error: "An entry for this organization and role already exists — edit it from the list instead.", slug });
    }

    const order = Number(input.order);
    const now = new Date().toISOString();
    const stamps = existing ? await existingTimestamps(existing) : { createdAt: now, publishedAt: now };
    const entry = {
      type: input.type === "community" ? "community" : "role",
      role,
      org,
      loc: cleanString(input.loc, 120),
      period: cleanString(input.period, 80),
      note: cleanString(input.note, 1000),
      points: parsePoints(input.points),
      order: Number.isFinite(order) && order !== 0 ? Math.max(-1000, Math.min(1000, Math.round(order))) : 100,
      createdAt: stamps.createdAt,
      updatedAt: now,
      publishedAt: stamps.publishedAt,
    };
    if (!isAllowedPath(pathFor(slug))) return res.status(400).json({ error: "Invalid entry." });

    await put(pathFor(slug), JSON.stringify(entry), {
      access: "public",
      contentType: "application/json",
      token: token(),
      addRandomSuffix: false,
      allowOverwrite: editing,
      cacheControlMaxAge: 60,
    });
    return res.status(200).json({ ok: true, slug, entry });
  } catch (err) {
    console.error("experience-upload error:", err?.message || err);
    return res.status(500).json({ error: "Could not save the entry. Try again." });
  }
}
