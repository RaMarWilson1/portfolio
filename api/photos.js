// api/photos.js
// Public read for the photography gallery (Vercel Blob, photography/).
//   GET /api/photos          → { photos, dimsVersion }
//   GET /api/photos?dims=<v> → { version, dims: { [id]: [width, height] } }
// Pixel dimensions come from reading each file's header once. The dims response
// is keyed by a hash of the photo set, so the CDN can cache it for a long time
// and probing only happens again when photos are added or removed.
import { createHash } from "node:crypto";
import { list } from "@vercel/blob";
import { allowRead } from "./_studio-auth.js";
import { probeImageSize } from "./_image-size.js";

const dimCache = new Map(); // `${pathname}|${size}` -> [w, h] | null (per warm instance)
const keyOf = (b) => `${b.pathname}|${b.size}`;

async function listPhotoBlobs() {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix: "photography/", limit: 1000, cursor, token: process.env.BLOB_READ_WRITE_TOKEN });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs.filter((b) => b.pathname !== "photography/" && !(b.pathname.split("/").pop() || "").startsWith("_"));
}

const versionOf = (blobs) =>
  createHash("sha1").update(blobs.map(keyOf).sort().join("\n")).digest("hex").slice(0, 12);

async function probeAll(blobs) {
  const todo = blobs.filter((b) => !dimCache.has(keyOf(b)));
  const deadline = Date.now() + 8000;
  let i = 0;
  const worker = async () => {
    while (i < todo.length && Date.now() < deadline) {
      const b = todo[i++];
      try {
        const s = await probeImageSize(b.url);
        dimCache.set(keyOf(b), s ? [s.width, s.height] : null);
      } catch {
        /* leave uncached; the gallery falls back to a placeholder ratio */
      }
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
}

function toPhoto(blob) {
  const filename = blob.pathname.split("/").pop();
  // "cars photo1.jpg" / "cars_photo1.jpg" → category "cars", title "photo1"
  const nameWithoutExt = filename.replace(/\.[^.]+$/, "").replace(/_/g, " ").trim();
  const parts = nameWithoutExt.split(" ").filter(Boolean);
  const dims = dimCache.get(keyOf(blob));
  return {
    id: blob.pathname,
    src: blob.url, // original; the client requests resized versions via /_vercel/image
    thumb: blob.url,
    category: parts.length > 1 ? parts[0].toLowerCase() : "misc",
    title: parts.length > 1 ? parts.slice(1).join(" ") : nameWithoutExt,
    location: "",
    publishedAt: new Date(blob.uploadedAt).toISOString(),
    ...(dims ? { width: dims[0], height: dims[1] } : {}),
  };
}

export default async function handler(req, res) {
  if (!allowRead(req, res)) return;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("photos: missing BLOB_READ_WRITE_TOKEN");
    return res.status(503).json({ error: "Photos are unavailable right now." });
  }

  try {
    const blobs = await listPhotoBlobs();
    const version = versionOf(blobs);
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (typeof req.query?.dims === "string") {
      await probeAll(blobs);
      const dims = {};
      for (const b of blobs) {
        const d = dimCache.get(keyOf(b));
        if (d) dims[b.pathname] = d;
      }
      const complete = Object.keys(dims).length === blobs.length;
      // Only cache long when the request matches the current set and nothing is missing.
      res.setHeader(
        "Cache-Control",
        req.query.dims === version && complete ? "public, s-maxage=31536000, max-age=86400, immutable" : "s-maxage=60"
      );
      return res.status(200).json({ version, dims });
    }

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");
    return res.status(200).json({ photos: blobs.map(toPhoto), dimsVersion: version });
  } catch (err) {
    console.error("photos: fetch failed:", err?.message || err);
    return res.status(502).json({ error: "Failed to fetch photos" });
  }
}
