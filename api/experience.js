// api/experience.js
// Vercel serverless function — fetches experience entries from Vercel Blob (experience/).

import { allowRead } from "./_studio-auth.js";

export default async function handler(req, res) {
  if (!allowRead(req, res)) return;
  const { BLOB_READ_WRITE_TOKEN } = process.env;
  if (!BLOB_READ_WRITE_TOKEN) {
    console.error("experience: missing BLOB_READ_WRITE_TOKEN");
    return res.status(503).json({ error: "Experience is unavailable right now." });
  }

  try {
    const listResponse = await fetch(
      "https://blob.vercel-storage.com?prefix=experience/&limit=100",
      { headers: { Authorization: `Bearer ${BLOB_READ_WRITE_TOKEN}` }, signal: AbortSignal.timeout(6000) }
    );
    if (!listResponse.ok) {
      console.error("experience list error:", listResponse.status, await listResponse.text());
      return res.status(502).json({ error: "Failed to fetch experience" });
    }

    const listData = await listResponse.json();
    const jsonBlobs = listData.blobs.filter(
      (blob) => blob.pathname.endsWith(".json") && !(blob.pathname.split("/").pop() || "").startsWith("_")
    );

    const experience = (
      await Promise.all(
        jsonBlobs.map(async (blob) => {
          try {
            const r = await fetch(blob.url, { signal: AbortSignal.timeout(5000) });
            const e = await r.json();
            return { ...e, slug: blob.pathname };
          } catch {
            return null;
          }
        })
      )
    ).filter(Boolean);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    return res.status(200).json({ experience });
  } catch (err) {
    console.error("experience: fetch failed:", err?.message || err);
    return res.status(500).json({ error: "Failed to fetch experience" });
  }
}
