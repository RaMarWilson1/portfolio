// api/_poetry.js
// Shared poetry storage logic for api/poems.js (public read) and
// api/poem-upload.js (Studio writes). Underscore = not a serverless function.
//
// Storage layout (Vercel Blob):
//   poetry/<slug>.json    one poem
//   poetry/_series.json   reserved: No Clean Version series settings
// Any file whose name starts with "_" is reserved metadata and never a poem.
import { list } from "@vercel/blob";
import { SITE } from "../src/content/site.js";

export const SERIES_PATH = "poetry/_series.json";
export const SERIES_DEFAULTS = SITE.noCleanVersion;
export const PLATFORMS = ["instagram", "tiktok", "youtube", "other"];

const token = () => process.env.BLOB_READ_WRITE_TOKEN;
export const isReserved = (pathname) => (pathname.split("/").pop() || "").startsWith("_");
export const slugOf = (pathname) => pathname.replace(/^poetry\//, "").replace(/\.json$/, "");

const validIso = (v) => (typeof v === "string" && !Number.isNaN(Date.parse(v)) ? new Date(v).toISOString() : null);
const timeOf = (iso) => Date.parse(iso) || 0;

export function inferPlatform(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (/(^|\.)instagram\.com$/.test(host)) return "instagram";
    if (/(^|\.)tiktok\.com$/.test(host)) return "tiktok";
    if (/(^|\.)(youtube\.com|youtu\.be)$/.test(host)) return "youtube";
  } catch {
    /* not a URL */
  }
  return url ? "other" : "";
}

/** All blobs under poetry/ (follows pagination). */
export async function listPoetryBlobs() {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix: "poetry/", limit: 1000, cursor, token: token() });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs.filter((b) => b.pathname.endsWith(".json"));
}

/** Fetch a blob's JSON. `fresh` adds a cache-buster for read-after-write checks. */
export async function readBlobJson(url, { fresh = false, timeout = 5000 } = {}) {
  const r = await fetch(fresh ? `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}` : url, {
    signal: AbortSignal.timeout(timeout),
  });
  if (!r.ok) throw new Error(`blob ${r.status}`);
  return r.json();
}

/**
 * Public poem shape. Legacy files may lack every field except title/body/date;
 * they still render as ordinary poems. publishedAt falls back to the Blob's own
 * upload time (a real storage timestamp); createdAt/updatedAt are never invented.
 */
export function normalizePoem(raw, blob) {
  const n = Number(raw.seriesNumber);
  const readingUrl = typeof raw.readingUrl === "string" && /^https?:\/\//.test(raw.readingUrl) ? raw.readingUrl : null;
  return {
    id: blob.pathname,
    slug: slugOf(blob.pathname),
    title: typeof raw.title === "string" && raw.title ? raw.title : "Untitled",
    body: typeof raw.body === "string" ? raw.body : "",
    date: typeof raw.date === "string" ? raw.date : "",
    featured: raw.featured === true,
    createdAt: validIso(raw.createdAt),
    updatedAt: validIso(raw.updatedAt),
    publishedAt: validIso(raw.publishedAt) || validIso(String(blob.uploadedAt)) || null,
    seriesNumber: Number.isInteger(n) && n > 0 ? n : null,
    readingUrl,
    readingPlatform: readingUrl ? (PLATFORMS.includes(raw.readingPlatform) ? raw.readingPlatform : inferPlatform(readingUrl)) : null,
    readingPublishedAt: validIso(raw.readingPublishedAt),
  };
}

export function normalizeSeries(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  const str = (v, max, fallback) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : fallback);
  return {
    title: str(r.title, 60, SERIES_DEFAULTS.title),
    subtitle: str(r.subtitle, 120, SERIES_DEFAULTS.subtitle),
    description: str(r.description, 400, SERIES_DEFAULTS.description),
    numberingEnabled: typeof r.numberingEnabled === "boolean" ? r.numberingEnabled : SERIES_DEFAULTS.numberingEnabled,
    links: (Array.isArray(r.links) ? r.links : [])
      .filter((l) => l && typeof l.url === "string" && /^https?:\/\//.test(l.url))
      .slice(0, 6)
      .map((l) => ({ label: str(l.label, 40, "Link"), url: l.url.slice(0, 500) })),
    updatedAt: validIso(r.updatedAt),
  };
}

/**
 * General poem chronology: featured first, then newest publishedAt, then title.
 * (The No Clean Version episode order — highest episode first — is a separate,
 * UI-level ordering; episode number is deliberately NOT the universal sort key.)
 */
export const generalOrder = (a, b) =>
  Number(b.featured) - Number(a.featured) || timeOf(b.publishedAt) - timeOf(a.publishedAt) || a.title.localeCompare(b.title);

/** Everything under poetry/: normalized poems (general order) + series settings. */
export async function loadPoetry({ fresh = false } = {}) {
  const blobs = await listPoetryBlobs();
  const seriesBlob = blobs.find((b) => b.pathname === SERIES_PATH);
  const [series, poems] = await Promise.all([
    seriesBlob ? readBlobJson(seriesBlob.url, { fresh }).then(normalizeSeries, () => normalizeSeries(null)) : normalizeSeries(null),
    Promise.all(
      blobs
        .filter((b) => !isReserved(b.pathname))
        .map((b) =>
          readBlobJson(b.url, { fresh }).then(
            (raw) => (raw && typeof raw === "object" && !Array.isArray(raw) ? normalizePoem(raw, b) : null),
            () => null // unreadable/malformed file: skip it rather than fail the page
          )
        )
    ),
  ]);
  return { series, poems: poems.filter(Boolean).sort(generalOrder) };
}
