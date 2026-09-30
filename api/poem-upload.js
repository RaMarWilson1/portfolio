// api/poem-upload.js
// Studio-only poetry writes → Vercel Blob (poetry/). Requires a Studio session.
//   POST   { title, body, date?, featured?, seriesNumber?, readingUrl?,
//            readingPlatform?, readingPublishedAt? }            create (409 if the slug is taken)
//   POST   { slug, ...same }                                     update an existing poem in place
//   POST   { kind: "series", title, subtitle, description,
//            numberingEnabled, links: [{ label, url }] }         save No Clean Version settings
//   DELETE { slug }                                              remove a poem
//
// Timestamps (ISO 8601): createdAt and publishedAt are set once and preserved on
// edit; updatedAt changes on every save.
import { put, head, del, BlobNotFoundError } from "@vercel/blob";
import { cleanDate, cleanString, cleanUrl, isAllowedPath, rateLimit, requireStudio, slugify, SLUG_RE } from "./_studio-auth.js";
import { PLATFORMS, SERIES_PATH, inferPlatform, listPoetryBlobs, normalizeSeries, readBlobJson, isReserved, slugOf } from "./_poetry.js";

const token = () => process.env.BLOB_READ_WRITE_TOKEN;
const pathFor = (slug) => `poetry/${slug}.json`;

class BadInput extends Error {}

async function findBlob(pathname) {
  try {
    return await head(pathname, { token: token() });
  } catch (err) {
    if (err instanceof BlobNotFoundError) return null;
    throw err;
  }
}

async function writeJson(pathname, data, { overwrite }) {
  if (!isAllowedPath(pathname)) throw new BadInput("Invalid path.");
  await put(pathname, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    token: token(),
    addRandomSuffix: false,
    allowOverwrite: overwrite,
    cacheControlMaxAge: 60,
  });
}

// ---- No Clean Version settings ---------------------------------------------

async function saveSeries(input, res) {
  const links = Array.isArray(input.links) ? input.links.slice(0, 6) : [];
  const cleanLinks = [];
  for (const l of links) {
    const url = cleanUrl(l?.url);
    if (url === null) throw new BadInput("Each series link needs a valid http(s) URL.");
    if (url) cleanLinks.push({ label: cleanString(l.label, 40) || "Link", url });
  }
  const existing = await findBlob(SERIES_PATH);
  const now = new Date().toISOString();
  let createdAt = now;
  if (existing) {
    try {
      createdAt = (await readBlobJson(existing.url, { fresh: true })).createdAt || new Date(existing.uploadedAt).toISOString();
    } catch {
      createdAt = new Date(existing.uploadedAt).toISOString();
    }
  }
  const series = {
    ...normalizeSeries({
      title: cleanString(input.title, 60),
      subtitle: cleanString(input.subtitle, 120),
      description: cleanString(input.description, 400),
      numberingEnabled: input.numberingEnabled !== false,
      links: cleanLinks,
    }),
    createdAt,
    updatedAt: now,
  };
  await writeJson(SERIES_PATH, series, { overwrite: true });
  return res.status(200).json({ ok: true, series });
}

// ---- poems -----------------------------------------------------------------

function parseSeriesFields(input) {
  let seriesNumber = null;
  if (input.seriesNumber !== undefined && input.seriesNumber !== null && String(input.seriesNumber).trim() !== "") {
    const n = Number(input.seriesNumber);
    if (!Number.isInteger(n) || n < 1 || n > 9999) throw new BadInput("Episode number must be a whole number from 1 to 9999.");
    seriesNumber = n;
  }
  const readingUrl = cleanUrl(input.readingUrl);
  if (readingUrl === null) throw new BadInput("Reading URL must be a full http(s) link.");
  let readingPlatform = cleanString(input.readingPlatform, 20).toLowerCase();
  if (readingPlatform && !PLATFORMS.includes(readingPlatform)) throw new BadInput("Unknown platform.");
  if (!readingUrl) readingPlatform = "";
  else if (!readingPlatform) readingPlatform = inferPlatform(readingUrl);
  const readingPublishedAt = cleanDate(input.readingPublishedAt);
  if (readingPublishedAt === null) throw new BadInput("Reading date isn’t a valid date.");
  return { seriesNumber, readingUrl, readingPlatform, readingPublishedAt };
}

// Episode numbers should be unique across poems (best effort: read-then-write).
async function episodeTakenBy(seriesNumber, exceptSlug) {
  if (!seriesNumber) return null;
  const blobs = (await listPoetryBlobs()).filter((b) => !isReserved(b.pathname) && slugOf(b.pathname) !== exceptSlug);
  const hits = await Promise.all(
    blobs.map((b) => readBlobJson(b.url, { fresh: true }).then((p) => (Number(p?.seriesNumber) === seriesNumber ? p.title || slugOf(b.pathname) : null), () => null))
  );
  return hits.find(Boolean) || null;
}

async function existingTimestamps(blob) {
  const stored = new Date(blob.uploadedAt).toISOString();
  try {
    const p = await readBlobJson(blob.url, { fresh: true });
    const iso = (v) => (typeof v === "string" && !Number.isNaN(Date.parse(v)) ? new Date(v).toISOString() : null);
    // Legacy poems predate these fields; their Blob upload time is the only real timestamp.
    const publishedAt = iso(p.publishedAt) || stored;
    return { createdAt: iso(p.createdAt) || publishedAt, publishedAt };
  } catch {
    return { createdAt: stored, publishedAt: stored };
  }
}

async function savePoem(input, res) {
  const title = cleanString(input.title, 200);
  const body = typeof input.body === "string" ? input.body.replace(/\r\n/g, "\n").trim().slice(0, 20000) : "";
  if (!title || !body) throw new BadInput("Title and body are required.");

  const editing = input.slug !== undefined && input.slug !== null && input.slug !== "";
  const slug = editing ? String(input.slug) : slugify(title, 60) || "poem";
  if (!SLUG_RE.test(slug)) throw new BadInput("Invalid poem.");
  const series = parseSeriesFields(input);

  const existing = await findBlob(pathFor(slug));
  if (editing && !existing) return res.status(404).json({ error: "Poem not found." });
  if (!editing && existing) {
    return res.status(409).json({ error: "A poem with this title already exists — edit it from the list instead.", slug });
  }
  const clash = await episodeTakenBy(series.seriesNumber, slug);
  if (clash) {
    return res.status(409).json({ error: `Episode ${String(series.seriesNumber).padStart(3, "0")} is already used by “${clash}”.` });
  }

  const now = new Date().toISOString();
  const stamps = existing ? await existingTimestamps(existing) : { createdAt: now, publishedAt: now };
  const poem = {
    title,
    body,
    date: cleanString(input.date, 40) || String(new Date().getFullYear()),
    featured: input.featured === true,
    createdAt: stamps.createdAt,
    updatedAt: now,
    publishedAt: stamps.publishedAt,
    seriesNumber: series.seriesNumber,
    readingUrl: series.readingUrl || null,
    readingPlatform: series.readingPlatform || null,
    readingPublishedAt: series.readingPublishedAt || null,
  };
  await writeJson(pathFor(slug), poem, { overwrite: editing });
  return res.status(200).json({ ok: true, slug, poem });
}

export default async function handler(req, res) {
  if (!requireStudio(req, res, { methods: ["POST", "DELETE"] })) return;
  if (!rateLimit(req, res, req.method === "DELETE" ? "delete" : "write")) return;
  const input = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};

  try {
    if (req.method === "DELETE") {
      const slug = String(input.slug || "");
      if (!SLUG_RE.test(slug)) return res.status(400).json({ error: "Invalid poem." });
      const blob = await findBlob(pathFor(slug));
      if (!blob) return res.status(404).json({ error: "Poem not found." });
      await del(blob.url, { token: token() });
      return res.status(200).json({ ok: true, slug });
    }
    if (input.kind === "series") return await saveSeries(input, res);
    return await savePoem(input, res);
  } catch (err) {
    if (err instanceof BadInput) return res.status(400).json({ error: err.message });
    console.error("poem-upload error:", err?.message || err);
    return res.status(500).json({ error: "Could not save. Try again." });
  }
}
